from fastapi import APIRouter

from app.services import eia_client

router = APIRouter()


@router.get("/generation-mix")
async def get_generation_mix() -> dict:
    return await eia_client.get_generation_mix()
