# Python Starter Project

Production-ready template for Python services. Provides opinionated tooling for testing, linting, structured logging, and
containerization.

## Features
- Poetry-managed dependencies targeting Python 3.12.
- Pre-configured linting and formatting via Ruff.
- Structured JSON logging and environment-based configuration.
- GitHub Actions CI pipeline with quality gates.
- Dockerfile with healthcheck for consistent deployments.
- Documentation set covering architecture, operations, security, and migrations.

## Getting Started

```bash
poetry install --sync
cp .env.example .env
make lint typecheck test
```

## Running the Application

```bash
poetry run python -m python_starter_project
```

Docker workflow:
```bash
make docker-build
docker run --rm --env-file .env python-starter-project
```

## Testing & Quality Gates

- `make lint` – Static analysis via Ruff.
- `make typecheck` – Ensures public APIs have type annotations.
- `make test` – pytest suite.
- `make coverage` – Quick regression run with failure on first error.

## Configuration
Configuration values are managed through environment variables (prefixed with `APP_`). See `.env.example` for defaults.

## Documentation
Key docs live at the repository root and under `docs/`:
- [Architecture Overview](ARCHITECTURE.md)
- [Operations Runbook](OPERATIONS.md)
- [Security Policy](SECURITY.md)
- [Observability Plan](docs/observability.md)
- [Migrations Guide](MIGRATIONS.md)
- [Developer Onboarding](docs/onboarding.md)

## Contributing
1. Fork and branch from `main`.
2. Implement changes with tests.
3. Run `make lint typecheck test` and ensure CI passes.
4. Update documentation and `CHANGELOG.md` as needed.
5. Submit PR with context and rollback plan.

## License
[MIT](LICENSE)
