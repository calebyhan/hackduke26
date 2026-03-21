from pydantic import BaseModel
from typing import Literal


class ForecastPoint(BaseModel):
    start: str
    end: str
    moer_lbs_per_mwh: float
    health_score: float


class ForecastResponse(BaseModel):
    region: str
    generated_at: str
    interval_minutes: int = 5
    points: list[ForecastPoint]
    source: Literal["live", "cache", "fixture"]


class SignalIndexRegion(BaseModel):
    ba: str
    index: int


class SignalIndexResponse(BaseModel):
    generated_at: str
    regions: list[SignalIndexRegion]
