from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    anthropic_api_key: str = Field(..., env="ANTHROPIC_API_KEY")
    max_file_size_mb: int = Field(10, env="MAX_FILE_SIZE_MB")
    # In .env, set as JSON array: ["http://localhost:5173","http://localhost:3000"]
    allowed_origins: list[str] = Field(
        default=["http://localhost:5173", "http://localhost:3000"],
        env="ALLOWED_ORIGINS",
    )
    temp_dir: str = Field("/tmp/piano-app", env="TEMP_DIR")
    environment: str = Field("development", env="ENVIRONMENT")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()
