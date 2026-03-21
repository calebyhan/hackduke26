from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    WATTTIME_USERNAME: str = ""
    WATTTIME_PASSWORD: str = ""
    GEMINI_API_KEY: str = ""
    EIA_API_KEY: str = ""

    # CAISO DR readiness config
    DR_MOER_PERCENTILE_THRESHOLD: float = 0.85  # top 15% = peak-stress
    DR_BILL_CREDIT_PER_WINDOW_USD: float = 1.05


settings = Settings()
