# Task Board

Status values: Todo, In Progress, Blocked, Done

## Workstreams

### Backend and Data

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| B1 | Implement WattTime auth wrapper with auto-refresh | Unassigned | Todo | Include token expiry guard |
| B2 | Build /api/forecast endpoint with normalization | Unassigned | Todo | 5-minute interval contract |
| B3 | Build /api/optimize endpoint | Unassigned | Todo | Use OPTIMIZER_SPEC.md |
| B4 | Build /api/brief endpoint with schema validation | Unassigned | Todo | Gemini + fallback path |
| B5 | Add Open-Meteo proxy endpoint | Unassigned | Todo | Hourly cache |
| B6 | Add EIA generation mix endpoint | Unassigned | Todo | Confirm CISO query shape |
| B7 | Implement DR readiness scorer | Unassigned | Todo | Count qualified/total CAISO stress windows and estimate credit |

### Frontend

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| F1 | Build top navbar with region and live counter | Unassigned | Todo | Include tab switcher |
| F2 | Build 24-hour timeline gradient renderer | Unassigned | Todo | Color-scale mapping |
| F3 | Build appliance chips on timeline | Unassigned | Todo | Position by start and duration |
| F4 | Build appliance cards with dual scores | Unassigned | Todo | Shiftable and fixed states |
| F5 | Implement optimize animation sequence | Unassigned | Todo | 1.5s synchronized motion |
| F6 | Build AI brief panel | Unassigned | Todo | Render strict schema |
| F6a | Render DR readiness lines in brief | Unassigned | Todo | Show x/y windows and estimated bill credit + disclaimer |
| F7 | Build Grid Analytics tab | Unassigned | Todo | Mix + dual chart + history |
| F8 | Build policy impact module | Unassigned | Todo | Demand-response relevance + avoided peak windows |
| F9 | Build scaled impact projection module | Unassigned | Todo | Annual household plus 1k and 10k home scenarios |
| F10 | Build automation CTA module mock | Unassigned | Todo | Demo-only, local state, no backend integration |
| F11 | Add source badges across key widgets | Unassigned | Todo | Show live/cache/fixture reliability state |

### Integration and Quality

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| I1 | Wire frontend to backend contracts | Unassigned | Todo | No ad-hoc field names |
| I2 | Add error and fallback UI states | Unassigned | Todo | Live/cache/fixture badges |
| I3 | End-to-end optimize flow verification | Unassigned | Todo | Baseline to optimized path |
| I4 | Performance pass on timeline rendering | Unassigned | Todo | Target smooth interaction |
| I5 | Final documentation sync | Unassigned | Todo | Keep docs aligned with code |
| I6 | Verify mock automation is clearly labeled | Unassigned | Todo | Prevent judges from assuming implemented control path |
