# System Architecture

## Overview

GridGhost is a frontend-backend system with external data dependencies.

- Frontend renders timeline, cards, analytics, and AI brief.
- Backend handles data ingestion, optimization, prompt orchestration, and normalization.
- External APIs provide emissions, weather, generation mix, and narrative generation.

## Components

### Frontend (React + Vite)

1. Command view
- Timeline gradient
- Temperature overlay
- Appliance timeline chips
- Appliance cards
- Carbon counter
- Optimize trigger
- AI brief panel
- Policy impact module
- Impact projection module
- Automation CTA module (mock only)

2. Grid analytics view
- Generation mix chart
- Dual signal chart
- MOER history chart

3. State model
- forecast
- schedule_before
- schedule_after
- optimization_summary
- brief
- impact_projection
- policy_metrics
- automation_mock_state
- loading/error states

### Backend (FastAPI)

1. WattTime client
- login token management
- forecast fetch
- signal-index fetch

2. Data clients
- Open-Meteo proxy
- EIA proxy

3. Optimization service
- constrained greedy scheduler
- device-level scoring
- aggregate metrics

4. Policy insights service
- DR window identification from CAISO peak-stress threshold configuration
- DR readiness scoring (`qualified_windows` / `total_windows`)
- estimated bill-credit heuristic calculation with eligibility disclaimer

5. Brief service
- Gemini prompt builder
- schema validation
- fallback brief generation

### External Services

1. WattTime v3
2. Open-Meteo
3. EIA Open Data
4. Gemini 2.5 Flash

## Data Flow

### Initial Load

1. Frontend requests forecast from backend.
2. Backend fetches WattTime forecast and returns normalized 5-minute array.
3. Frontend requests weather and generation mix via backend proxies.
4. Frontend renders timeline and initial schedule.

### Optimization Flow

1. User triggers optimize.
2. Frontend sends appliance list + constraints + forecast snapshot to backend.
3. Backend computes optimized schedule and aggregate delta.
4. Backend computes DR readiness metrics from forecast + optimized schedule.
5. Backend includes DR readiness metrics in optimization summary.
6. Frontend animates timeline blocks and counter.
7. Backend requests AI brief using optimization summary and DR readiness metrics.
8. Frontend renders brief response.
9. Frontend derives policy metrics and scaled impact projections from optimization summary.
10. Frontend updates automation mock state locally if user interacts with mock CTA module.

## Polling Strategy

1. Forecast and signal-index: every 5 minutes.
2. Weather: hourly refresh.
3. EIA generation mix: hourly refresh.

## Failure Handling

1. If WattTime fails, use cached or fixture forecast and flag stale data.
2. If Gemini fails, render deterministic template brief.
3. If EIA or Open-Meteo fail, preserve command view and hide affected widgets.
4. If any key upstream dependency degrades, show source badges (live/cache/fixture) on affected modules.

## Security and Secrets

1. Keep API keys and credentials in environment variables only.
2. Do not expose provider keys to frontend.
3. Backend-only external API calls.

## Observability

1. Structured logs for each external API call.
2. Request IDs propagated from frontend to backend.
3. Error counters by provider for fast demo troubleshooting.
