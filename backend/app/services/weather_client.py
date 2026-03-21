import logging
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_BASE_URL = "https://api.open-meteo.com/v1/forecast"
_CACHE_TTL_SECONDS = 3600

# {cache_key: (timestamp, data)}
_cache: dict[str, tuple[float, Any]] = {}


def _cache_key(lat: float, lon: float) -> str:
    # Round to 2 decimal places to improve cache hit rate for nearby coords
    return f"{round(lat, 2)},{round(lon, 2)}"


async def get_weather(lat: float, lon: float) -> dict:
    key = _cache_key(lat, lon)
    now = time.monotonic()
    if key in _cache:
        ts, cached = _cache[key]
        if now - ts < _CACHE_TTL_SECONDS:
            return cached

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(
                _BASE_URL,
                params={
                    "latitude": lat,
                    "longitude": lon,
                    "hourly": "temperature_2m",
                    "timezone": "auto",
                },
            )
            resp.raise_for_status()
            payload = resp.json()

        times = payload.get("hourly", {}).get("time", [])
        temps = payload.get("hourly", {}).get("temperature_2m", [])
        hourly = [
            {"time": t, "temperature_c": temp}
            for t, temp in zip(times, temps)
        ]
        result = {
            "latitude": lat,
            "longitude": lon,
            "hourly": hourly,
            "source": "open-meteo",
        }
        _cache[key] = (now, result)
        return result

    except Exception as exc:
        logger.warning("weather_client: request failed: %s", exc)
        return {
            "latitude": lat,
            "longitude": lon,
            "hourly": [],
            "source": "open-meteo",
        }
