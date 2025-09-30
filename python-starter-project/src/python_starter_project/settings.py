"""Environment-aware configuration management using stdlib only."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import ClassVar, Literal, cast

Environment = Literal["local", "test", "staging", "production"]


@dataclass(slots=True)
class Settings:
    """Application settings loaded from environment variables."""

    allowed_environments: ClassVar[tuple[Environment, ...]] = (
        "local",
        "test",
        "staging",
        "production",
    )
    environment: Environment = "local"
    log_level: str = "INFO"
    app_name: str = "python-starter-project"
    database_url: str | None = None

    @classmethod
    def _validate_environment(cls, value: str) -> Environment:
        if value not in cls.allowed_environments:
            allowed = ", ".join(cls.allowed_environments)
            raise ValueError(f"APP_ENVIRONMENT must be one of {allowed}, got '{value}'")
        return cast(Environment, value)

    @staticmethod
    def _normalize_log_level(value: str) -> str:
        candidate = value.upper()
        valid_levels_map = logging.getLevelNamesMapping()
        if candidate not in valid_levels_map:
            valid_levels = ", ".join(
                sorted(name for name in valid_levels_map if isinstance(name, str))
            )
            raise ValueError(f"APP_LOG_LEVEL must be one of {valid_levels}, got '{value}'")
        return candidate

    @classmethod
    def from_env(cls) -> "Settings":
        env_value = os.getenv("APP_ENVIRONMENT", "local")
        environment = cls._validate_environment(env_value)
        log_level = cls._normalize_log_level(os.getenv("APP_LOG_LEVEL", "INFO"))
        return cls(
            environment=environment,
            log_level=log_level,
            app_name=os.getenv("APP_NAME", "python-starter-project"),
            database_url=os.getenv("APP_DATABASE_URL"),
        )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings instance to avoid repeated parsing."""

    return Settings.from_env()


def reset_settings_cache() -> None:
    """Clear the cached settings instance (primarily for testing)."""

    get_settings.cache_clear()


__all__ = ["Environment", "Settings", "get_settings", "reset_settings_cache"]
