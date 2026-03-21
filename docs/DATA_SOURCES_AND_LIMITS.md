# Data Sources and Limits

## WattTime v3

Base URL: https://api.watttime.org/v3

Used endpoints:
1. GET /login
2. GET /forecast
3. GET /signal-index
4. GET /ba-from-loc
5. GET /my-access

Key constraints:
1. Token expiry about 30 minutes.
2. Free-tier raw MOER scoped to CAISO_NORTH.
3. Rate limit about 3000 requests per 5-minute rolling window.

Mitigations:
1. Auto-refresh token in backend.
2. Cache recent forecast responses.
3. Fallback to fixture for demo continuity.

## Open-Meteo

Base URL: https://api.open-meteo.com/v1/forecast

Key params:
- latitude
- longitude
- hourly=temperature_2m

Constraints:
1. No auth key required.
2. Free tier intended for non-commercial use.
3. Shared-host IP rate limit risk.

Mitigations:
1. Call through backend proxy only.
2. Cache hourly temperature series.
3. Hide overlay on failure while preserving timeline.

## EIA Open Data API

Base URL: https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/

Required notes:
1. API key required.
2. Must include /data/ suffix to get values.
3. Respondent for CAISO mix: CISO.
4. Data has about 1-hour lag.

Mitigations:
1. Validate URL shape in backend client.
2. Refresh hourly, not per minute.
3. Gracefully degrade analytics tab when unavailable.

## Gemini 2.5 Flash

Usage:
1. Generate structured carbon brief JSON.
2. Keep prompt tightly scoped to optimization metrics.

Constraints:
1. Free-tier request and token limits.
2. Variable response latency.
3. Occasional malformed JSON without strict settings.

Mitigations:
1. response_mime_type set to application/json.
2. Server-side schema validation.
3. Deterministic fallback brief.

## Data Integrity Rules

1. Use ISO8601 timestamps end-to-end.
2. Normalize all forecast intervals to 5 minutes.
3. Preserve source metadata per payload (live/cache/fixture).
4. Log provider failures with request IDs.

## Policy Signal Configuration (CAISO DR Readiness)

1. Maintain DR threshold rules as backend configuration, not hardcoded in UI.
2. Store source metadata for threshold version and effective date.
3. Treat DR readiness as a policy signal derived from forecast stress windows, not enrollment confirmation.
4. Revalidate threshold assumptions before demos if program rules are updated.
