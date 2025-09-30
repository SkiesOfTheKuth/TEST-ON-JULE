.PHONY: install format lint typecheck test coverage security docker-build docker-run

install:
poetry install --sync

format:
poetry run ruff format src tests

lint:
poetry run ruff check .

lint-fix:
poetry run ruff check --fix .

isort:
poetry run ruff check --select I --fix .

typecheck:
poetry run python -c "import importlib.util, shutil, sys;\nif shutil.which('mypy') is None and importlib.util.find_spec('mypy') is None:\n    sys.stderr.write('mypy is not installed. Install with `pip install mypy` or add it to the dev group.\n');\n    sys.exit(1)"
poetry run mypy .

test:
poetry run pytest

coverage:
poetry run python -c "import importlib.util, sys;\nif importlib.util.find_spec('pytest_cov') is None:\n    sys.stderr.write('pytest-cov plugin not installed. Install with `poetry add pytest-cov --group dev` to enable coverage.\n');\n    sys.exit(1)"
poetry run pytest --cov=python_starter_project --cov-report=term-missing --cov-report=xml

security:
poetry check

docker-build:
docker build -t python-starter-project .

docker-run:
docker run --rm -it --env-file .env python-starter-project
