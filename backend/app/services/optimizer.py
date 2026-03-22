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


def _find_nearest_slot(points: list[ForecastPointInput], time_str: str) -> int:
    """Return the index of the forecast point whose start is closest to time_str."""
    target = _parse_iso(time_str).timestamp()
    best_i, best_diff = 0, float("inf")
    for i, p in enumerate(points):
        diff = abs(_parse_iso(p.start).timestamp() - target)
        if diff < best_diff:
            best_diff = diff
            best_i = i
    return best_i


def _topo_sort_shiftable(appliances: list[Appliance]) -> list[Appliance]:
    """Sort shiftable appliances so dependencies are scheduled before dependents."""
    shiftable_ids = {a.id for a in appliances}
    result: list[Appliance] = []
    remaining = list(appliances)
    done: set[str] = set()
    while remaining:
        progress = False
        next_remaining = []
        for a in sorted(remaining, key=_sort_key_priority):
            unmet = [d for d in a.dependencies if d in shiftable_ids and d not in done]
            if not unmet:
                result.append(a)
                done.add(a.id)
                progress = True
            else:
                next_remaining.append(a)
        if not progress:
            result.extend(next_remaining)
            break
        remaining = next_remaining
    return result


def optimize(request: OptimizeRequest) -> OptimizeResponse:
    points = request.points
    appliances = request.appliances
    interval_minutes = 5  # per contract

    if not points:
        raise ValueError("No forecast points provided")

    # --- Build baseline: each appliance's unoptimized position ---
    # preferred_start pins the exact baseline slot; shiftable without one defaults to end of window.
    baseline_schedule: dict[str, tuple[int, int]] = {}
    for a in appliances:
        n = a.duration_minutes // interval_minutes
        if a.preferred_start:
            start = min(_find_nearest_slot(points, a.preferred_start), len(points) - n)
        elif a.shiftable:
            # No hint: assume lazy end-of-window scheduling (worst case)
            start = max(0, len(points) - n)
        else:
            start = 0
        baseline_schedule[a.id] = (start, start + n)

    # --- Phase 1: lock fixed appliances ---
    scheduled: dict[str, tuple[int, int]] = {}

    for a in appliances:
        if not a.shiftable:
            b_start, b_end = baseline_schedule[a.id]
            scheduled[a.id] = (b_start, b_end)

    # --- Phase 2: greedy optimize shiftables in dependency order ---
    # Shiftable appliances are NOT mutually exclusive — multiple can run simultaneously.
    # Only hard constraints are dependencies (dryer after washer, etc.) and deadlines.
    shiftables = _topo_sort_shiftable([a for a in appliances if a.shiftable])

    for a in shiftables:
        n = a.duration_minutes // interval_minutes

        # Deadline window — ignore if already expired (idx too small for any window)
        deadline_idx = len(points)
        if a.deadline:
            deadline_dt = _parse_iso(a.deadline)
            for i, p in enumerate(points):
                if _parse_iso(p.end) > deadline_dt:
                    deadline_idx = i
                    break
            if deadline_idx < n:
                deadline_idx = len(points)  # deadline passed; use full window

        # Earliest-start window constraint
        min_start = 0
        if a.earliest_start:
            earliest_dt = _parse_iso(a.earliest_start)
            found = False
            for i, p in enumerate(points):
                if _parse_iso(p.start) >= earliest_dt:
                    min_start = i
                    found = True
                    break
            if not found:
                # earliest_start is past the end of the forecast window —
                # treat as no constraint so the optimizer can still find the
                # lowest-MOER slot rather than falling back to an unoptimized baseline.
                min_start = 0

        # Dependency constraint: must start after all deps finish
        for dep_id in a.dependencies:
            if dep_id in scheduled:
                _, dep_end = scheduled[dep_id]
                min_start = max(min_start, dep_end)

        # Enumerate all feasible windows and pick lowest MOER
        feasible: list[tuple[float, float, int, int]] = []
        for start_idx in range(min_start, len(points) - n + 1):
            end_idx = start_idx + n
            if end_idx > deadline_idx:
                break
            avg_moer, avg_health = _score_window(points, start_idx, n)
            feasible.append((avg_moer, avg_health, end_idx, start_idx))

        if not feasible:
            b_start, b_end = baseline_schedule[a.id]
            scheduled[a.id] = (b_start, b_end)
            continue

        feasible.sort()
        best_start = feasible[0][3]
        best_end = best_start + n
        scheduled[a.id] = (best_start, best_end)

    # --- Build response ---
    schedule_entries: list[ScheduleEntry] = []
    optimized_co2 = 0.0
    optimized_health = 0.0
    baseline_co2 = 0.0
    baseline_health = 0.0

    for a in appliances:
        n = a.duration_minutes // interval_minutes

        b_start, _ = baseline_schedule[a.id]
        baseline_co2 += _compute_co2(points, b_start, n, a.power_kw, interval_minutes)
        _, b_health = _score_window(points, b_start, n)
        baseline_health += b_health * n

        o_start, o_end = scheduled[a.id]
        opt_co2 = _compute_co2(points, o_start, n, a.power_kw, interval_minutes)
        optimized_co2 += opt_co2
        o_moer, o_health = _score_window(points, o_start, n)
        optimized_health += o_health * n

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
