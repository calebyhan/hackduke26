import json
import logging
import time
from pathlib import Path
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

_EIA_URL = "https://api.eia.gov/v2/electricity/rto/fuel-type-data/data/"
_FIXTURE_PATH = Path(__file__).parent.parent / "fixtures" / "generation_mix.json"
_CACHE_TTL_SECONDS = 3600

# Single-entry cache: (timestamp, data)
_cache: tuple[float, Any] | None = None


def _load_fixture() -> dict:
    data = json.loads(_FIXTURE_PATH.read_text())
    data["source"] = "fixture"
    return data


async def get_generation_mix() -> dict:
    global _cache
    now = time.monotonic()

    if _cache is not None:
        ts, cached = _cache
        if now - ts < _CACHE_TTL_SECONDS:
            return cached

    try:
        params = {
            "api_key": settings.EIA_API_KEY,
            "frequency": "hourly",
            "data[0]": "value",
            "facets[respondent][]": "CISO",
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            "length": 20,
        }
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(_EIA_URL, params=params)
            resp.raise_for_status()
            payload = resp.json()

        rows = payload.get("response", {}).get("data", [])
        if not rows:
            logger.warning("eia_client: empty data from API, using fixture")
            return _load_fixture()

        # Determine the most recent period
        as_of = rows[0].get("period", "")

        # Aggregate MW by fuel type across the most-recent period rows
        fuel_mw: dict[str, float] = {}
        for row in rows:
            fuel = (row.get("fueltype") or row.get("fuel-type") or "other").lower().replace(" ", "_")
            try:
                mw = float(row.get("value") or 0)
            except (TypeError, ValueError):
                mw = 0.0
            fuel_mw[fuel] = fuel_mw.get(fuel, 0.0) + mw

        total_mw = sum(fuel_mw.values()) or 1.0
        fuel_mix = [
            {
                "fuel": fuel,
                "mw": round(mw, 1),
                "percent": round(mw / total_mw * 100, 1),
            }
            for fuel, mw in sorted(fuel_mw.items(), key=lambda x: x[1], reverse=True)
        ]

        result = {
            "respondent": "CISO",
            "as_of": as_of,
            "fuel_mix": fuel_mix,
            "source": "eia",
        }
        _cache = (now, result)
        return result

    except Exception as exc:
        logger.warning("eia_client: request failed (%s), using fixture", exc)
        return _load_fixture()
