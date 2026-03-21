# Decision Log

## ADR-001: Use Marginal Emissions (MOER)

Status: Accepted

Decision:
Use MOER as primary optimization signal rather than average emissions.

Rationale:
MOER better represents impact of incremental load and highlights timing value.

Tradeoff:
Raw MOER availability is region-limited on free tier.

## ADR-002: Use WattTime Native Forecast

Status: Accepted

Decision:
Use /v3/forecast directly instead of training custom ML model.

Rationale:
Faster delivery, lower risk, production-grade signal source.

Tradeoff:
Dependency on external API uptime and limits.

## ADR-003: Keep Optimization Algorithm Greedy

Status: Accepted

Decision:
Use constrained greedy scheduler for demo implementation.

Rationale:
Deterministic, explainable, and fast enough for small household device sets.

Tradeoff:
May not be globally optimal for dense, highly constrained schedules.

## ADR-004: Surface Dual Signals Side by Side

Status: Accepted

Decision:
Display CO2 and health scores independently in UI.

Rationale:
Preserves real tradeoffs and avoids opaque weighting.

Tradeoff:
No single scalar objective for user simplicity.

## ADR-005: Backend-Only API Access

Status: Accepted

Decision:
Proxy all provider calls through FastAPI backend.

Rationale:
Protect credentials, normalize responses, centralize retries/caching.

Tradeoff:
Backend handles additional latency and failure paths.

## ADR-006: Strict Structured AI Output

Status: Accepted

Decision:
Require JSON schema output from Gemini with server-side validation.

Rationale:
Deterministic UI mapping and reduced parsing fragility.

Tradeoff:
Need fallback logic when model response violates schema.

## ADR-007: Add DR Readiness Policy Layer

Status: Accepted

Decision:
Add a Demand-Response Readiness score to the AI brief card in the format `qualified_windows/total_windows` with an estimated bill-credit signal.

Rationale:
This reframes GridGhost from personal dashboard to interface layer for regulated utility demand-response behavior while using existing forecast and optimization data.

Tradeoff:
Score is a readiness signal, not enrollment confirmation; UI and API must include eligibility disclaimer language.
