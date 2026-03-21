from pydantic import BaseModel
from typing import Literal


class Appliance(BaseModel):
    id: str
    name: str
    shiftable: bool
    duration_minutes: int
    deadline: str | None = None
    power_kw: float
    dependencies: list[str] = []


class OptimizeRequest(BaseModel):
    region: str
    points: list["ForecastPointInput"]
    appliances: list[Appliance]


class ForecastPointInput(BaseModel):
    start: str
    end: str
    moer_lbs_per_mwh: float
    health_score: float


class ScheduleEntry(BaseModel):
    appliance_id: str
    start: str
    end: str
    avg_moer_lbs_per_mwh: float
    avg_health_score: float


class AggregateMetrics(BaseModel):
    total_co2_lbs: float
    total_health_score: float


class DeltaMetrics(BaseModel):
    co2_lbs: float
    co2_percent: float
    health_score_delta: float


class DRReadiness(BaseModel):
    program: str = "CAISO_ELRP_signal"
    qualified_windows: int
    total_windows: int
    estimated_bill_credit_usd: float
    eligibility_note: str = "Potentially eligible, utility enrollment required"


class OptimizeResponse(BaseModel):
    region: str
    baseline: AggregateMetrics
    optimized: AggregateMetrics
    delta: DeltaMetrics
    schedule: list[ScheduleEntry]
    dr_readiness: DRReadiness
    source: Literal["optimizer_v1"] = "optimizer_v1"
