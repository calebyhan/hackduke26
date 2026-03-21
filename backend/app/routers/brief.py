from fastapi import APIRouter

from app.models.brief import BriefRequest, BriefResponse
from app.services import brief_service

router = APIRouter()


@router.post("/brief", response_model=BriefResponse)
async def generate_brief(body: BriefRequest) -> BriefResponse:
    return await brief_service.generate_brief(body)
