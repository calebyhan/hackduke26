from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException

from app.models.forecast import ForecastPoint, ForecastResponse
from app.services.watttime import watttime_client

router = APIRouter()


def _normalize_forecast(raw: dict) -> ForecastResponse:
    """Normalize WattTime forecast response to 5-minute intervals."""
    source = raw.get("source", "live")

    # If it's already in our fixture format, pass through
    if "points" in raw:
        return ForecastResponse(
            region=raw.get("region", "CAISO_NORTH"),
            generated_at=raw.get("generated_at", datetime.now(timezone.utc).isoformat()),
            interval_minutes=5,
            points=[ForecastPoint(**p) for p in raw["points"]],
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
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Forecast normalization failed: {e}")


@router.get("/signal-index")
async def get_signal_index():
    return await watttime_client.get_signal_index("CAISO_NORTH")
