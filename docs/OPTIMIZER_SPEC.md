# Optimizer Specification

## Objective

Minimize total carbon impact of shiftable appliance load while satisfying schedule constraints.

Secondary objective: surface health signal tradeoffs per selected window.

## Inputs

1. Forecast points in fixed 5-minute intervals:
- moer_lbs_per_mwh
- health_score

2. Appliance definitions:
- id
- duration_minutes
- deadline
- shiftable boolean
- power_kw
- dependencies

3. Baseline schedule for comparison.

## Outputs

1. Optimized schedule with start/end per shiftable appliance.
2. Device-level average MOER (`avg_moer_lbs_per_mwh`) and health score (`avg_health_score`).
3. Aggregate baseline and optimized totals.
4. Percent reduction and absolute deltas, including `health_score_delta`.

## Constraints

1. Device must run contiguous for full duration.
2. Device must complete by deadline.
3. Non-shiftable devices retain original schedule.
4. Dependency constraints must hold (example: dryer starts after washer completes and within allowed window).

## Scoring

For candidate start time s and duration d:

- Window points: forecast[s : s + d]
- Carbon score: average(moer over window)
- Health score: average(health over window)

Primary ranking key: carbon score ascending.
Tie-breakers in order:
1. lower health score
2. earlier finish time
3. earlier start time

## Algorithm

Constrained greedy by appliance priority:

Priority order:
1. longest duration first
2. earliest deadline first
3. dependency parents before children

For each appliance:
1. Enumerate feasible start windows.
2. Filter out windows violating deadlines/dependencies.
3. Score each window.
4. Select lowest-ranked feasible window.
5. Reserve chosen interval.

## Pseudocode

```text
sort appliances by priority
for appliance in appliances:
  if not shiftable:
    keep baseline slot
    continue

  feasible = []
  for each candidate_start in forecast_grid:
    candidate_end = candidate_start + duration
    if violates_deadline(candidate_end):
      continue
    if violates_dependencies(candidate_start, candidate_end):
      continue
    score = score_window(candidate_start, candidate_end)
    feasible.append((candidate_start, candidate_end, score))

  choose min(feasible) by (carbon, health, end, start)
  assign schedule
return schedule
```

## Complexity

Let n be appliances and t be forecast points.

Worst-case runtime: O(n * t * w), where w is average window length in points.
For demo scale (small n), this is fast and deterministic.

## Edge Cases

1. No feasible window: preserve baseline slot and flag unscheduled reason.
2. Missing health signal: optimize carbon only, set health as null.
3. Partial forecast gaps: reject request with validation error or fill from cache.
4. Equal scores across many windows: apply deterministic tie-breakers.

## Validation Cases

1. EV charger shifted from evening peak to overnight low.
2. Dishwasher and washer both meet morning deadlines.
3. Dryer follows washer dependency.
4. Non-shiftable HVAC remains unchanged.
