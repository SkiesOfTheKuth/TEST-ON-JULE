"""Top-level package for python-starter-project."""

from .logging import get_logger
from .math import add
from .settings import Settings, get_settings

__all__ = [
    "Settings",
    "add",
    "get_logger",
    "get_settings",
]
