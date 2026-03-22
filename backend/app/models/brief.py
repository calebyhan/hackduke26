from pydantic import BaseModel, field_validator
from typing import Literal


class BriefDRReadiness(BaseModel):
    label: str
    qualified_windows: int
    total_windows: int
    estimated_bill_credit_usd: float
    program: str
    eligibility_note: str


class ScheduleChange(BaseModel):
    appliance_name: str
    from_time: str
    to_time: str
    co2_saved_lbs: float


class BriefRequest(BaseModel):
    region: str
    baseline_total_co2_lbs: float
    optimized_total_co2_lbs: float
    co2_percent_reduction: float
    miles_equivalent: float
    dr_readiness: "BriefDRReadinessInput"
    schedule_changes: list[ScheduleChange]
    grid_trend: str
    peak_temp_f: float | None = None
    peak_temp_hour: str | None = None


class BriefDRReadinessInput(BaseModel):
    program: str
    qualified_windows: int
    total_windows: int
    estimated_bill_credit_usd: float
    eligibility_note: str


class BriefResponse(BaseModel):
    headline: str
    weekly_co2_lbs: float
    savings_vs_unoptimized: float
    miles_equivalent: float
    dr_readiness: BriefDRReadiness
    nudges: list[str]
    grid_trend: str
    source: Literal["gemini", "fallback"]

    @field_validator("nudges")
    @classmethod
    def validate_nudges(cls, v: list[str]) -> list[str]:
        if not 1 <= len(v) <= 3:
            raise ValueError("nudges must contain 1-3 items")
        return v
