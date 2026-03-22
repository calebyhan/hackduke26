from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Query

from app.services.watttime import watttime_client

router = APIRouter()


def _rebase_history_points(points: list[dict]) -> list[dict]:
    """Shift fixture history timestamps so the window ends at today UTC midnight."""
    if not points:
        return points
    last_dt = datetime.fromisoformat(points[-1]["time"].replace("Z", "+00:00"))
    fixture_end = last_dt.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
    today_utc = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    delta = today_utc - fixture_end
    return [
        {**p, "time": (datetime.fromisoformat(p["time"].replace("Z", "+00:00")) + delta).strftime("%Y-%m-%dT%H:%M:%SZ")}
        for p in points
    ]


@router.get("/moer-history")
async def get_moer_history(region: str = Query("CAISO_NORTH")) -> dict:
    raw = await watttime_client.get_moer_history(region)
    source = raw.get("source", "live")

    # WattTime v3 historical returns {"data": [{"point_time": ..., "value": ...}]}
    # Fixture format: {"points": [{"time": ..., "moer_lbs_per_mwh": ...}]}
    if "points" in raw:
        points = _rebase_history_points(raw["points"]) if source == "fixture" else raw["points"]
        return {"region": region, "points": points, "source": source}

    data = raw.get("data", [])
    points = [
        {
            "time": entry.get("point_time", entry.get("time", "")),
            "moer_lbs_per_mwh": round(float(entry.get("value", 0)), 1),
        }
        for entry in data
        if entry.get("point_time") or entry.get("time")
    ]
    return {"region": region, "points": points, "source": source}
