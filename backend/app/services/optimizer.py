from datetime import datetime, timezone
from app.models.optimize import (
    Appliance,
    ForecastPointInput,
    ScheduleEntry,
    AggregateMetrics,
    DeltaMetrics,
    OptimizeRequest,
    OptimizeResponse,
)
from app.services.dr_scorer import compute_dr_readiness


def _parse_iso(s: str) -> datetime:
    return datetime.fromisoformat(s.replace("Z", "+00:00"))


def _iso(dt: datetime) -> str:
    return dt.isoformat().replace("+00:00", "Z")


def _sort_key_priority(a: Appliance) -> tuple:
    """Priority: longest duration first, earliest deadline first, then by id."""
    deadline_val = _parse_iso(a.deadline).timestamp() if a.deadline else float("inf")
    return (-a.duration_minutes, deadline_val, a.id)


def _score_window(
    points: list[ForecastPointInput], start_idx: int, length: int
) -> tuple[float, float]:
    """Return (avg_moer, avg_health) for a window."""
    window = points[start_idx : start_idx + length]
    avg_moer = sum(p.moer_lbs_per_mwh for p in window) / len(window)
    avg_health = sum(p.health_score for p in window) / len(window)
    return avg_moer, avg_health


def _compute_co2(
    points: list[ForecastPointInput],
    start_idx: int,
    length: int,
    power_kw: float,
    interval_minutes: int,
) -> float:
    """Compute total CO2 lbs for an appliance running in a given window."""
    window = points[start_idx : start_idx + length]
    total = 0.0
    hours_per_interval = interval_minutes / 60
    for p in window:
        # kWh * (lbs/MWh) / 1000 = lbs
        total += power_kw * hours_per_interval * p.moer_lbs_per_mwh / 1000
    return total


def optimize(request: OptimizeRequest) -> OptimizeResponse:
    points = request.points
    appliances = request.appliances
    interval_minutes = 5  # per contract

    if not points:
        raise ValueError("No forecast points provided")

    points_per_slot = 1  # each point is 5 minutes
    point_starts = {p.start: i for i, p in enumerate(points)}

    # Resolve dependency graph: parent must be scheduled before child
    scheduled: dict[str, tuple[int, int]] = {}  # appliance_id -> (start_idx, end_idx)

    # Build baseline from original appliance order (assume first available slot)
    baseline_schedule: dict[str, tuple[int, int]] = {}

    # Sort by priority
    sorted_appliances = sorted(appliances, key=_sort_key_priority)

    # Assign baseline slots (sequential placement for shiftable, preserving order)
    next_baseline_start = 0
    for a in sorted_appliances:
        duration_points = a.duration_minutes // interval_minutes
        # Baseline: place at next available slot
        start_idx = next_baseline_start
        if start_idx + duration_points > len(points):
            start_idx = max(0, len(points) - duration_points)
        baseline_schedule[a.id] = (start_idx, start_idx + duration_points)
        if a.shiftable:
            next_baseline_start = start_idx + duration_points
        else:
            next_baseline_start = start_idx + duration_points

    # Optimize: greedy assignment
    reserved: list[bool] = [False] * len(points)

    for a in sorted_appliances:
        duration_points = a.duration_minutes // interval_minutes

        if not a.shiftable:
            # Keep baseline slot
            b_start, b_end = baseline_schedule[a.id]
            scheduled[a.id] = (b_start, b_end)
            for i in range(b_start, min(b_end, len(points))):
                reserved[i] = True
            continue

        deadline_idx = len(points)
        if a.deadline:
            deadline_dt = _parse_iso(a.deadline)
            # Find the latest start index that finishes by deadline
            for i, p in enumerate(points):
                if _parse_iso(p.end) > deadline_dt:
                    deadline_idx = i
                    break

        # Dependency constraint: must start after all dependencies finish
        min_start = 0
        for dep_id in a.dependencies:
            if dep_id in scheduled:
                _, dep_end = scheduled[dep_id]
                min_start = max(min_start, dep_end)

        # Enumerate feasible windows
        feasible: list[tuple[float, float, int, int, int]] = []
        for start_idx in range(min_start, len(points) - duration_points + 1):
            end_idx = start_idx + duration_points
            if end_idx > deadline_idx:
                break

            # Check no overlap with reserved slots
            conflict = False
            for i in range(start_idx, end_idx):
                if reserved[i]:
                    conflict = True
                    break
            if conflict:
                continue

            avg_moer, avg_health = _score_window(points, start_idx, duration_points)
            # Ranking tuple: (carbon, health, end_time, start_time)
            feasible.append((avg_moer, avg_health, end_idx, start_idx, start_idx))

        if not feasible:
            # No feasible window: keep baseline
            b_start, b_end = baseline_schedule[a.id]
            scheduled[a.id] = (b_start, b_end)
            for i in range(b_start, min(b_end, len(points))):
                reserved[i] = True
            continue

        # Select best window
        feasible.sort()
        best = feasible[0]
        best_start = best[3]
        best_end = best_start + duration_points
        scheduled[a.id] = (best_start, best_end)
        for i in range(best_start, best_end):
            reserved[i] = True

    # Build response
    schedule_entries: list[ScheduleEntry] = []
    optimized_co2 = 0.0
    optimized_health = 0.0
    baseline_co2 = 0.0
    baseline_health = 0.0

    for a in appliances:
        duration_points = a.duration_minutes // interval_minutes

        # Baseline metrics
        b_start, b_end = baseline_schedule[a.id]
        baseline_co2 += _compute_co2(points, b_start, duration_points, a.power_kw, interval_minutes)
        b_moer, b_health = _score_window(points, b_start, duration_points)
        baseline_health += b_health * duration_points

        # Optimized metrics
        o_start, o_end = scheduled[a.id]
        opt_co2 = _compute_co2(points, o_start, duration_points, a.power_kw, interval_minutes)
        optimized_co2 += opt_co2
        o_moer, o_health = _score_window(points, o_start, duration_points)
        optimized_health += o_health * duration_points

        schedule_entries.append(
            ScheduleEntry(
                appliance_id=a.id,
                start=points[o_start].start,
                end=points[min(o_end, len(points)) - 1].end,
                avg_moer_lbs_per_mwh=round(o_moer, 1),
                avg_health_score=round(o_health, 2),
            )
        )

    baseline_co2 = round(baseline_co2, 1)
    optimized_co2 = round(optimized_co2, 1)
    baseline_health = round(baseline_health, 1)
    optimized_health = round(optimized_health, 1)

    co2_delta = round(optimized_co2 - baseline_co2, 1)
    co2_percent = round((co2_delta / baseline_co2) * 100, 1) if baseline_co2 else 0.0
    health_delta = round(optimized_health - baseline_health, 1)

    # DR readiness
    dr = compute_dr_readiness(points, scheduled, appliances)

    return OptimizeResponse(
        region=request.region,
        baseline=AggregateMetrics(
            total_co2_lbs=baseline_co2,
            total_health_score=baseline_health,
        ),
        optimized=AggregateMetrics(
            total_co2_lbs=optimized_co2,
            total_health_score=optimized_health,
        ),
        delta=DeltaMetrics(
            co2_lbs=co2_delta,
            co2_percent=co2_percent,
            health_score_delta=health_delta,
        ),
        schedule=schedule_entries,
        dr_readiness=dr,
    )
