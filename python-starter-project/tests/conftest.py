from __future__ import annotations

import importlib
import sys
from pathlib import Path
from typing import Iterator

import pytest

SRC_PATH = Path(__file__).resolve().parent.parent / "src"
if str(SRC_PATH) not in sys.path:
    sys.path.insert(0, str(SRC_PATH))

SETTINGS_MODULE = importlib.import_module("python_starter_project.settings")


@pytest.fixture(autouse=True)
def settings_cache_guard() -> Iterator[None]:
    SETTINGS_MODULE.reset_settings_cache()
    yield
    SETTINGS_MODULE.reset_settings_cache()
