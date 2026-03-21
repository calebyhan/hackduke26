from fastapi import APIRouter, HTTPException

from app.models.optimize import OptimizeRequest, OptimizeResponse
from app.services.optimizer import optimize

router = APIRouter()


@router.post("/optimize")
async def optimize_schedule(request: OptimizeRequest) -> OptimizeResponse:
    try:
        return optimize(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {e}")
