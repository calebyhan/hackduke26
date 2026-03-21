from fastapi import APIRouter, Query

from app.services import weather_client

router = APIRouter()


@router.get("/weather")
async def get_weather(
    latitude: float = Query(..., description="Latitude of the location"),
    longitude: float = Query(..., description="Longitude of the location"),
) -> dict:
    return await weather_client.get_weather(latitude, longitude)
