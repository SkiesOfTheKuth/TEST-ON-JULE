FROM python:3.12-slim AS base
ENV POETRY_VERSION=1.8.3 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN pip install --no-cache-dir "poetry==${POETRY_VERSION}"

COPY pyproject.toml poetry.lock* /app/

RUN poetry config virtualenvs.create false \
    && poetry install --without dev --no-interaction --no-ansi

COPY src /app/src

HEALTHCHECK CMD ["python", "-m", "python_starter_project.healthcheck"]

ENTRYPOINT ["python", "-m", "python_starter_project"]
