from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, forecast, optimize, brief, weather, generation_mix

app = FastAPI(title="GridGhost API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(forecast.router, prefix="/api")
app.include_router(optimize.router, prefix="/api")
app.include_router(brief.router, prefix="/api")
app.include_router(weather.router, prefix="/api")
app.include_router(generation_mix.router, prefix="/api")
