# Risks and Mitigations

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R1 | WattTime auth/token failures | Medium | High | Auto-refresh token, cache latest forecast, fixture fallback | Backend |
| R2 | Upstream API rate limits | Medium | High | Polling discipline, caching, retry with backoff, stale-data banner | Backend |
| R3 | Gemini malformed output | Medium | Medium | Strict JSON mode, schema validator, deterministic fallback brief | Backend |
| R4 | Frontend animation bugs reduce demo clarity | Medium | Medium | Lock animation scope early, fallback to instant swap mode | Frontend |
| R5 | Data mismatch between FE and BE contracts | Medium | High | Contract-first development and shared schema examples | Full team |
| R6 | Timeline rendering performance issues | Low | Medium | Memoized data transforms, capped point density for view layer | Frontend |
| R7 | EIA data lag or endpoint quirks | Medium | Low | Treat as contextual chart only, show last-updated timestamp | Backend |
| R8 | Timezone handling errors | Medium | Medium | Normalize UTC in APIs, convert only at display layer | Full team |
| R9 | Policy framing appears generic or unsubstantiated | Medium | Medium | Tie policy module directly to computed metrics and explicit assumptions | Full team |
| R10 | Mock automation misread as production capability | Medium | High | Add clear demo-only labeling and no-backend disclaimer in UI and pitch | Frontend |
| R11 | DR threshold assumptions drift from current program guidance | Low | Medium | Version threshold config, record source date, and revalidate before demo | Backend |

## Contingency Modes

1. Live mode: all providers available.
2. Partial mode: analytics widgets degrade independently.
3. Demo-safe mode: forecast and brief from fixtures with explicit source labels.

## Trigger Thresholds

1. If WattTime unavailable for over 2 minutes, switch to cache/fixture.
2. If Gemini fails twice consecutively, use fallback brief until manual reset.
3. If optimize latency exceeds 2 seconds, disable non-critical post-processing.
4. If policy or projection assumptions are uncertain, show assumptions inline rather than hiding values.
