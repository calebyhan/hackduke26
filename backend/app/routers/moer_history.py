from fastapi import APIRouter, Query

from app.services.watttime import watttime_client

router = APIRouter()


@router.get("/moer-history")
async def get_moer_history(region: str = Query("CAISO_NORTH")) -> dict:
    raw = await watttime_client.get_moer_history(region)
    source = raw.get("source", "live")

    # WattTime v3 historical returns {"data": [{"point_time": ..., "value": ...}]}
    # Fixture format: {"points": [{"time": ..., "moer_lbs_per_mwh": ...}]}
    if "points" in raw:
        return {"region": region, "points": raw["points"], "source": source}

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
