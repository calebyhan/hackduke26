from app.config import settings
from app.models.optimize import Appliance, DRReadiness, ForecastPointInput


def compute_dr_readiness(
    points: list[ForecastPointInput],
    scheduled: dict[str, tuple[int, int]],
    appliances: list[Appliance],
) -> DRReadiness:
    """
    Compute demand-response readiness from forecast stress windows and optimized schedule.

    Peak-stress windows = points with MOER above the configured percentile threshold.
    Qualified windows = stress windows where optimized schedule has no load running.
    """
    if not points:
        return DRReadiness(
            qualified_windows=0,
            total_windows=0,
            estimated_bill_credit_usd=0.0,
        )

    # Determine MOER threshold for peak-stress
    sorted_moer = sorted(p.moer_lbs_per_mwh for p in points)
    threshold_idx = int(len(sorted_moer) * settings.DR_MOER_PERCENTILE_THRESHOLD)
    threshold_idx = min(threshold_idx, len(sorted_moer) - 1)
    moer_threshold = sorted_moer[threshold_idx]

    # Identify stress windows (contiguous blocks above threshold, grouped by hour)
    stress_hours: set[int] = set()
    for i, p in enumerate(points):
        if p.moer_lbs_per_mwh >= moer_threshold:
            # Group by hour index (each hour = 12 five-minute intervals)
            stress_hours.add(i // 12)

    total_windows = len(stress_hours)

    # Build set of occupied point indices from optimized schedule
    occupied: set[int] = set()
    for a in appliances:
        if a.id in scheduled:
            s, e = scheduled[a.id]
            for idx in range(s, e):
                occupied.add(idx)

    # Count qualified windows: stress hours where no appliance is running
    qualified = 0
    for hour in stress_hours:
        hour_start = hour * 12
        hour_end = min(hour_start + 12, len(points))
        has_load = any(idx in occupied for idx in range(hour_start, hour_end))
        if not has_load:
            qualified += 1

    credit = round(qualified * settings.DR_BILL_CREDIT_PER_WINDOW_USD, 2)

    return DRReadiness(
        qualified_windows=qualified,
        total_windows=total_windows,
        estimated_bill_credit_usd=credit,
    )
