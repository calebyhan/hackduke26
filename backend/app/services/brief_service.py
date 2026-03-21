import json
import logging
from pathlib import Path

from google import genai
from google.genai import types

from app.config import settings
from app.models.brief import BriefRequest, BriefResponse

logger = logging.getLogger(__name__)

_FALLBACK_PATH = Path(__file__).parent.parent / "fixtures" / "brief_fallback.json"

_SYSTEM_PROMPT = (
    "You are an energy advisor. Return JSON only. "
    "Use concise non-technical language. Do not use markdown."
)


def _build_user_prompt(req: BriefRequest) -> str:
    return (
        f"Region: {req.region}\n"
        f"Baseline CO2: {req.baseline_total_co2_lbs} lbs\n"
        f"Optimized CO2: {req.optimized_total_co2_lbs} lbs\n"
        f"CO2 percent reduction: {req.co2_percent_reduction}%\n"
        f"Miles equivalent savings: {req.miles_equivalent}\n"
        f"Top device changes: {', '.join(req.top_device_changes)}\n"
        f"Grid trend: {req.grid_trend}\n"
        f"DR program: {req.dr_readiness.program}\n"
        f"DR qualified windows: {req.dr_readiness.qualified_windows} of {req.dr_readiness.total_windows}\n"
        f"DR estimated bill credit: ${req.dr_readiness.estimated_bill_credit_usd}\n"
        f"DR eligibility note: {req.dr_readiness.eligibility_note}\n\n"
        "Return a JSON object with these exact keys: "
        "headline (string), weekly_co2_lbs (float), savings_vs_unoptimized (float), "
        "miles_equivalent (float), "
        "dr_readiness (object with keys: label, qualified_windows, total_windows, "
        "estimated_bill_credit_usd, program, eligibility_note), "
        "nudges (list of 1-3 strings), grid_trend (string), source (must be \"gemini\")."
    )


def _load_fallback() -> BriefResponse:
    data = json.loads(_FALLBACK_PATH.read_text())
    data["source"] = "fallback"
    return BriefResponse(**data)


async def generate_brief(req: BriefRequest) -> BriefResponse:
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=_build_user_prompt(req),
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                response_mime_type="application/json",
                max_output_tokens=1000,
                temperature=0.3,
            ),
        )
        raw = response.text
        data = json.loads(raw)
        data["source"] = "gemini"
        return BriefResponse(**data)
    except Exception as exc:
        logger.warning("brief_service: falling back due to error: %s", exc)
        return _load_fallback()
