# API Contracts

Base path: /api
Content type: application/json

## Common Response Envelope

Success responses return endpoint-specific JSON body.
Error responses use:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {}
  }
}
```

## GET /api/health

Purpose: backend health check.

Response 200:

```json
{
  "status": "ok",
  "timestamp": "2026-03-21T12:00:00Z"
}
```

## GET /api/forecast

Purpose: normalized 24-hour 5-minute forecast for CAISO_NORTH.

Response 200:

```json
{
  "region": "CAISO_NORTH",
  "generated_at": "2026-03-21T12:00:00Z",
  "interval_minutes": 5,
  "points": [
    {
      "start": "2026-03-21T12:00:00Z",
      "end": "2026-03-21T12:05:00Z",
      "moer_lbs_per_mwh": 812.1,
      "health_score": 0.44
    }
  ],
  "source": "live|cache|fixture"
}
```

## GET /api/signal-index

Purpose: map percentile signal by region.

Response 200:

```json
{
  "generated_at": "2026-03-21T12:00:00Z",
  "regions": [
    {
      "ba": "CAISO_NORTH",
      "index": 27
    }
  ]
}
```

## GET /api/weather

Query params:
- latitude (required)
- longitude (required)

Response 200:

```json
{
  "latitude": 37.77,
  "longitude": -122.42,
  "hourly": [
    {
      "time": "2026-03-21T13:00:00Z",
      "temperature_c": 19.3
    }
  ],
  "source": "open-meteo"
}
```

## GET /api/generation-mix

Purpose: EIA generation mix for respondent CISO.

Response 200:

```json
{
  "respondent": "CISO",
  "as_of": "2026-03-21T11:00:00Z",
  "fuel_mix": [
    { "fuel": "natural_gas", "mw": 8231, "percent": 41.2 },
    { "fuel": "solar", "mw": 5210, "percent": 26.1 }
  ],
  "source": "eia"
}
```

## POST /api/optimize

Purpose: optimize appliance schedule against forecast.

Request:

```json
{
  "region": "CAISO_NORTH",
  "points": [
    {
      "start": "2026-03-21T12:00:00Z",
      "end": "2026-03-21T12:05:00Z",
      "moer_lbs_per_mwh": 812.1,
      "health_score": 0.44
    }
  ],
  "appliances": [
    {
      "id": "ev",
      "name": "EV Charger",
      "shiftable": true,
      "duration_minutes": 240,
      "deadline": "2026-03-22T14:00:00Z",
      "power_kw": 7.2,
      "dependencies": []
    }
  ]
}
```

Response 200:

```json
{
  "region": "CAISO_NORTH",
  "baseline": {
    "total_co2_lbs": 41.8,
    "total_health_score": 17.1
  },
  "optimized": {
    "total_co2_lbs": 28.9,
    "total_health_score": 13.8
  },
  "delta": {
    "co2_lbs": -12.9,
    "co2_percent": -30.9,
    "health_score_delta": -3.3
  },
  "schedule": [
    {
      "appliance_id": "ev",
      "start": "2026-03-22T07:00:00Z",
      "end": "2026-03-22T11:00:00Z",
      "avg_moer_lbs_per_mwh": 502.3,
      "avg_health_score": 0.31
    }
  ],
  "dr_readiness": {
    "program": "CAISO_ELRP_signal",
    "qualified_windows": 4,
    "total_windows": 6,
    "estimated_bill_credit_usd": 4.2,
    "eligibility_note": "Potentially eligible, utility enrollment required"
  },
  "source": "optimizer_v1"
}
```

## GET /api/moer-history

Purpose: historical MOER values for analytics chart.

Query params:
- region (optional, default "CAISO_NORTH")

Response 200:

```json
{
  "region": "CAISO_NORTH",
  "points": [
    {
      "time": "2026-03-21T00:00:00Z",
      "moer_lbs_per_mwh": 874.3
    }
  ],
  "source": "live|fixture"
}
```

## POST /api/brief

Purpose: generate narrative brief from optimization summary.

Request:

```json
{
  "region": "CAISO_NORTH",
  "baseline_total_co2_lbs": 41.8,
  "optimized_total_co2_lbs": 28.9,
  "co2_percent_reduction": 30.9,
  "miles_equivalent": 16,
  "dr_readiness": {
    "program": "CAISO_ELRP_signal",
    "qualified_windows": 4,
    "total_windows": 6,
    "estimated_bill_credit_usd": 4.2,
    "eligibility_note": "Potentially eligible, utility enrollment required"
  },
  "schedule_changes": [
    {
      "appliance_name": "EV Charger",
      "from_time": "9:00 PM",
      "to_time": "2:00 AM",
      "co2_saved_lbs": 8.4
    }
  ],
  "grid_trend": "Afternoon peak correlated with heat",
  "peak_temp_f": 91,
  "peak_temp_hour": "3 PM"
}
```

Notes:
- `schedule_changes` replaces the previous `top_device_changes` string array. Each entry is a structured object with appliance name, from/to times (formatted in local time), and per-appliance CO₂ saved.
- `peak_temp_f` and `peak_temp_hour` are optional. When provided, the AI prompt includes weather-aware advice (pre-cooling/pre-heating strategies).
- `miles_equivalent` is computed by the frontend as `abs(delta.co2_lbs) / 0.89`.

Response 200:

```json
{
  "headline": "34% lower carbon than your unoptimized schedule",
  "weekly_co2_lbs": 28.9,
  "savings_vs_unoptimized": 12.9,
  "miles_equivalent": 16,
  "dr_readiness": {
    "label": "Demand-Response Readiness",
    "qualified_windows": 4,
    "total_windows": 6,
    "estimated_bill_credit_usd": 4.2,
    "program": "CAISO_ELRP_signal",
    "eligibility_note": "Potentially eligible, utility enrollment required"
  },
  "nudges": [
    "Keep EV charging after midnight.",
    "Run dishwasher before 6:00am."
  ],
  "grid_trend": "Tomorrow afternoon likely trends dirtier due to heat-driven demand.",
  "source": "gemini|fallback"
}
```

## Status Codes

- 200 success
- 400 invalid request
- 401 authentication failure
- 429 upstream rate limit
- 502 upstream dependency failure
- 503 temporary service unavailable

## DR Readiness Calculation Notes

1. Define candidate DR windows from CAISO peak-stress windows using documented threshold configuration in backend.
2. Count `total_windows` for the target week from forecast-derived or fixture-derived stress windows.
3. Count `qualified_windows` where optimized schedule avoids or shifts load from those windows.
4. Compute `estimated_bill_credit_usd` from configured per-window or per-kWh heuristic for demo purposes.
5. Always include `eligibility_note` clarifying this is a readiness signal, not enrollment confirmation.
