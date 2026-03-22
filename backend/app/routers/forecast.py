from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app.models.forecast import ForecastPoint, ForecastResponse
from app.services.watttime import watttime_client

router = APIRouter()


def _rebase_fixture_points(points: list[dict]) -> list[dict]:
    """Shift fixture timestamps so the day window starts at today UTC midnight."""
    if not points:
        return points
    first_dt = datetime.fromisoformat(points[0]["start"].replace("Z", "+00:00"))
    fixture_day = first_dt.replace(hour=0, minute=0, second=0, microsecond=0)
    today_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    delta = today_utc - fixture_day
    rebased = []
    for p in points:
        start_dt = datetime.fromisoformat(p["start"].replace("Z", "+00:00")) + delta
        end_dt = datetime.fromisoformat(p["end"].replace("Z", "+00:00")) + delta
        rebased.append({
            **p,
            "start": start_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "end": end_dt.strftime("%Y-%m-%dT%H:%M:%SZ"),
        })
    return rebased


def _normalize_forecast(raw: dict) -> ForecastResponse:
    """Normalize WattTime forecast response to 5-minute intervals."""
    source = raw.get("source", "live")

    # If it's already in our fixture format, pass through
    if "points" in raw:
        points = raw["points"]
        if source == "fixture":
            points = _rebase_fixture_points(points)
        return ForecastResponse(
            region=raw.get("region", "CAISO_NORTH"),
            generated_at=datetime.now(timezone.utc).isoformat(),
            interval_minutes=5,
            points=[ForecastPoint(**p) for p in points],
            source=source,
        )

    # WattTime v3 forecast format: {"data": [{"point_time": ..., "value": ...}]}
    data = raw.get("data", [])
    if not data:
        raise ValueError("Empty forecast data from WattTime")

    points: list[ForecastPoint] = []
    for entry in data:
        start = entry.get("point_time", "")
        # WattTime provides 5-min intervals, compute end
        start_dt = datetime.fromisoformat(start.replace("Z", "+00:00"))
        end_dt = start_dt + timedelta(minutes=5)
        moer = float(entry.get("value", 0))
        # Health score from WattTime or derive from MOER
        health = float(entry.get("health_score", moer / 1000))

        points.append(
            ForecastPoint(
                start=start,
                end=end_dt.isoformat().replace("+00:00", "Z"),
                moer_lbs_per_mwh=round(moer, 1),
                health_score=round(min(health, 1.0), 2),
            )
        )

    # If all values are zero, WattTime account lacks forecast access — treat as invalid
    if points and all(p.moer_lbs_per_mwh == 0.0 for p in points):
        raise ValueError("WattTime returned all-zero MOER values (insufficient account access)")

    return ForecastResponse(
        region=raw.get("region", "CAISO_NORTH"),
        generated_at=datetime.now(timezone.utc).isoformat(),
        interval_minutes=5,
        points=points,
        source=source,
    )


@router.get("/forecast")
async def get_forecast() -> ForecastResponse:
    raw = await watttime_client.get_forecast("CAISO_NORTH")
    try:
        return _normalize_forecast(raw)
    except ValueError:
        # Fall back to fixture when live data is unavailable or invalid
        fixture_raw = watttime_client._load_fixture("forecast.json")
        return _normalize_forecast(fixture_raw)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Forecast normalization failed: {e}")


@router.get("/signal-index")
async def get_signal_index():
    return await watttime_client.get_signal_index("CAISO_NORTH")
