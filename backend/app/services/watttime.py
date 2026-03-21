import json
import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

import httpx

from app.config import settings

logger = logging.getLogger(__name__)

BASE_URL = "https://api.watttime.org"
API_V3 = "/v3"
FIXTURES_DIR = Path(__file__).parent.parent / "fixtures"


class WattTimeClient:
    def __init__(self) -> None:
        self._token: str | None = None
        self._token_expires: datetime | None = None
        self._client = httpx.AsyncClient(base_url=BASE_URL, timeout=15.0)
        self._forecast_cache: dict[str, tuple[datetime, dict]] = {}
        self._cache_ttl = timedelta(minutes=5)

    async def _login(self) -> None:
        if not settings.WATTTIME_USERNAME or not settings.WATTTIME_PASSWORD:
            raise RuntimeError("WattTime credentials not configured")
        resp = await self._client.get(
            "/login",
            auth=(settings.WATTTIME_USERNAME, settings.WATTTIME_PASSWORD),
        )
        resp.raise_for_status()
        data = resp.json()
        self._token = data["token"]
        # Refresh 5 minutes before actual ~30min expiry
        self._token_expires = datetime.now(timezone.utc) + timedelta(minutes=25)
        logger.info("WattTime token refreshed")

    async def _ensure_token(self) -> str:
        if (
            self._token is None
            or self._token_expires is None
            or datetime.now(timezone.utc) >= self._token_expires
        ):
            await self._login()
        return self._token  # type: ignore[return-value]

    def _auth_headers(self, token: str) -> dict[str, str]:
        return {"Authorization": f"Bearer {token}"}

    async def get_forecast(self, region: str = "CAISO_NORTH") -> dict:
        # Check cache
        cached = self._forecast_cache.get(region)
        if cached:
            cached_at, cached_data = cached
            if datetime.now(timezone.utc) - cached_at < self._cache_ttl:
                return {**cached_data, "source": "cache"}

        try:
            token = await self._ensure_token()
            resp = await self._client.get(
                f"{API_V3}/forecast",
                params={"region": region, "signal_type": "co2_moer", "horizon_hours": 24},
                headers=self._auth_headers(token),
            )
            resp.raise_for_status()
            data = resp.json()

            # Cache successful response
            self._forecast_cache[region] = (datetime.now(timezone.utc), data)
            return {**data, "source": "live"}

        except Exception as e:
            logger.warning("WattTime forecast failed: %s — using fallback", e)

            # Return cache if available (even stale)
            if cached:
                return {**cached[1], "source": "cache"}

            # Fall back to fixture
            return self._load_fixture("forecast.json")

    async def get_signal_index(self, region: str = "CAISO_NORTH") -> dict:
        try:
            token = await self._ensure_token()
            resp = await self._client.get(
                f"{API_V3}/signal-index",
                params={"region": region},
                headers=self._auth_headers(token),
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.warning("WattTime signal-index failed: %s", e)
            return {
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "regions": [{"ba": region, "index": 50}],
            }

    def _load_fixture(self, filename: str) -> dict:
        path = FIXTURES_DIR / filename
        with open(path) as f:
            data = json.load(f)
        data["source"] = "fixture"
        return data


# Singleton
watttime_client = WattTimeClient()
