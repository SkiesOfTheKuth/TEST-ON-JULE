"""Environment-aware configuration management using stdlib only."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from typing import Literal

Environment = Literal["local", "test", "staging", "production"]


@dataclass(slots=True)
class Settings:
    """Application settings loaded from environment variables."""

    environment: Environment = "local"
    log_level: str = "INFO"
    app_name: str = "python-starter-project"
    database_url: str | None = None

    @classmethod
    def from_env(cls) -> "Settings":
        env_value = os.getenv("APP_ENVIRONMENT", "local")
        environment: Environment = env_value if env_value in {"local", "test", "staging", "production"} else "local"
        return cls(
            environment=environment,
            log_level=os.getenv("APP_LOG_LEVEL", "INFO"),
            app_name=os.getenv("APP_NAME", "python-starter-project"),
            database_url=os.getenv("APP_DATABASE_URL"),
        )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance to avoid repeated parsing."""

    return Settings.from_env()


__all__ = ["Environment", "Settings", "get_settings"]
