# System Architecture

## Overview

GridGhost is a frontend-backend system with external data dependencies.

- Frontend renders timeline, cards, analytics, community simulator, and AI brief.
- Backend handles data ingestion, optimization, prompt orchestration, and normalization.
- External APIs provide emissions, weather, air quality, generation mix, and narrative generation.

## Components

### Frontend (React + Vite)

Routes: `/` (landing), `/technology`, `/dashboard`.

The dashboard uses a tab switcher (`Tab = "command" | "analytics" | "community"`).

1. Command view (`components/command/`)
- Timeline gradient with temperature overlay
- Appliance chips positioned by start time and duration
- Appliance cards with CRUD (add/edit/remove)
- Carbon counter with tween animation
- Optimize trigger with cycling status messages
- AI brief panel
- Policy impact module
- Impact projection module
- Automation CTA module (mock only)

2. Grid analytics view (`components/analytics/`)
- Generation mix chart
- Dual signal chart
- MOER history chart

3. Community view (`components/community/`)
- Neighborhood map visualization
- Adoption slider (household count)
- Duck curve chart showing anti-synchronization effect
- Community metrics

4. State model
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

Endpoints registered in `app/main.py`:
- `/api/health`
- `/api/forecast`
- `/api/signal-index` (via WattTime router)
- `/api/optimize`
- `/api/brief`
- `/api/weather`
- `/api/generation-mix`
- `/api/moer-history`

1. WattTime client (`services/watttime.py`)
- login token management with auto-refresh
- forecast fetch
- signal-index fetch
- MOER history fetch

2. Data clients
- Open-Meteo weather proxy (`services/weather_client.py`)
- Open-Meteo air quality client (`services/air_quality_client.py`) — PM2.5 and NO₂, combined into hourly health scores
- EIA proxy (`services/eia_client.py`)

3. Optimization service (`services/optimizer.py`)
- constrained greedy scheduler
- device-level scoring by MOER and health score
- aggregate baseline/optimized metrics
- DR readiness scoring

4. DR Scorer (`services/dr_scorer.py`)
- DR window identification from CAISO peak-stress threshold configuration
- DR readiness scoring (`qualified_windows` / `total_windows`)
- estimated bill-credit heuristic with eligibility disclaimer

5. Brief service (`services/brief_service.py`)
- Gemini 2.5 Flash prompt builder with structured `schedule_changes` and optional temperature context
- JSON schema validation
- deterministic fallback brief generation

### External Services

1. WattTime v3 (MOER forecast, signal index, historical data)
2. Open-Meteo (weather — temperature)
3. Open-Meteo Air Quality API (PM2.5, NO₂ → health score)
4. EIA Open Data (generation mix)
5. Gemini 2.5 Flash (AI narrative)

## Data Flow

### Initial Load

1. Frontend requests forecast from backend.
2. Backend fetches WattTime forecast and returns normalized 5-minute array.
3. Backend incorporates air quality scores into `health_score` per forecast point.
4. Frontend requests weather and generation mix via backend proxies.
5. Frontend renders timeline and initial schedule from fixture appliance data.

### Optimization Flow

1. User triggers optimize.
2. Frontend sends appliance list + constraints + forecast snapshot to backend.
3. Backend computes optimized schedule and aggregate delta.
4. Backend computes DR readiness metrics from forecast + optimized schedule.
5. Backend includes DR readiness metrics in optimization summary.
6. Frontend animates timeline chips and CO₂ counter tween.
7. Frontend calls `/api/brief` with structured `schedule_changes`, DR readiness, and optional peak temperature.
8. Backend generates AI brief via Gemini or falls back to deterministic template.
9. Frontend renders brief response.
10. Frontend derives policy metrics and scaled impact projections from optimization summary.
11. Frontend updates automation mock state locally if user interacts with mock CTA module.

## Polling Strategy

1. Forecast and signal-index: every 5 minutes.
2. Weather: hourly refresh.
3. EIA generation mix: hourly refresh.
4. Air quality: hourly cache (TTL 3600s, cache per region).

## Failure Handling

1. If WattTime fails, use cached or fixture forecast and flag stale data.
2. If air quality fetch fails, health score falls back to MOER-only calculation.
3. If Gemini fails, render deterministic template brief.
4. If EIA or Open-Meteo fail, preserve command view and hide affected widgets.
5. If any key upstream dependency degrades, show source badges (live/cache/fixture) on affected modules.

## Security and Secrets

1. Keep API keys and credentials in environment variables only.
2. Do not expose provider keys to frontend.
3. Backend-only external API calls.

## Observability

1. Structured logs for each external API call.
2. Request IDs propagated from frontend to backend.
3. Error counters by provider for fast demo troubleshooting.
