import logging
import time
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

_BASE_URL = "https://air-quality-api.open-meteo.com/v1/air-quality"
_CACHE_TTL_SECONDS = 3600

_cache: dict[str, tuple[float, dict[str, float]]] = {}

# Representative lat/lon for each WattTime region
_REGION_COORDS: dict[str, tuple[float, float]] = {
    "CAISO_NORTH": (37.35, -121.95),  # San Jose, CA
    "CAISO_SOUTH": (34.05, -118.25),  # Los Angeles, CA
    "PJM_DOM":     (38.90, -77.04),   # Washington, DC
    "MISO_MIDW":   (41.88, -87.63),   # Chicago, IL
    "NYISO_NYC":   (40.71, -74.01),   # New York, NY
}
_DEFAULT_COORDS = (37.35, -121.95)


def _pm25_score(value: float | None) -> float:
    """PM2.5 (µg/m³) → 0–1 pollution score. 0=clean, 1=hazardous. EPA Good ceiling=12, Hazardous=150+."""
    if value is None:
        return 0.0
    return max(0.0, min(1.0, value / 150.0))


def _no2_score(value: float | None) -> float:
    """NO₂ (µg/m³) → 0–1 pollution score. WHO hourly limit = 200 µg/m³."""
    if value is None:
        return 0.0
    return max(0.0, min(1.0, value / 200.0))


async def get_hourly_scores(region: str = "CAISO_NORTH") -> dict[str, float]:
    """
    Fetch hourly air quality data and return a dict mapping
    ISO hour strings ("2025-03-22T14:00") to combined pollution scores [0, 1].
    0 = clean air, 1 = heavily polluted.
    Returns an empty dict on failure (caller falls back to MOER-only health score).
    """
    now = time.monotonic()
    if region in _cache:
        ts, cached = _cache[region]
        if now - ts < _CACHE_TTL_SECONDS:
            return cached

    lat, lon = _REGION_COORDS.get(region, _DEFAULT_COORDS)

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                _BASE_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "hourly": "pm2_5,nitrogen_dioxide",
                    "timezone": "UTC",
                    "forecast_days": 2,
                },
            )
            resp.raise_for_status()
            payload = resp.json()

        hourly = payload.get("hourly", {})
        times = hourly.get("time", [])
        pm25_vals = hourly.get("pm2_5", [])
        no2_vals = hourly.get("nitrogen_dioxide", [])

        scores: dict[str, float] = {}
        for t, pm25, no2 in zip(times, pm25_vals, no2_vals):
            scores[t] = round(0.5 * _pm25_score(pm25) + 0.5 * _no2_score(no2), 3)

        _cache[region] = (now, scores)
        logger.info("air_quality_client: fetched %d hourly scores for %s", len(scores), region)
        return scores

    except Exception as exc:
        logger.warning("air_quality_client: request failed for %s: %s", region, exc)
        return {}
