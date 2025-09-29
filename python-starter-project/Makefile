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
poetry run ruff check --select ANN src tests

test:
poetry run pytest

coverage:
poetry run pytest --maxfail=1 --disable-warnings

security:
poetry check

docker-build:
docker build -t python-starter-project .

docker-run:
docker run --rm -it --env-file .env python-starter-project
