# Architecture Overview

```
+-------------------+       +-----------------------+
| CLI / API Layer   | ----> | Application Services  |
| (future FastAPI)  |       | (math utils, logging) |
+-------------------+       +-----------+-----------+
                                            |
                                            v
                                    +---------------+
                                    | Infrastructure|
                                    |  (Postgres*,  |
                                    |  Redis*, S3*) |
                                    +---------------+
```
*Future optional components once business logic requires persistence or caching.

## Module Boundaries
- `python_starter_project.math`: pure functions; deterministic and fully tested.
- `python_starter_project.settings`: configuration management via environment variables using dataclass-based parsing.
- `python_starter_project.logging`: structured logging wrappers.
- `python_starter_project.healthcheck`: lightweight diagnostics for container and load balancers.
- `python_starter_project.__main__`: orchestrates bootstrap logging/settings; extend with CLI or API entrypoints.

## Dependency Direction
- Core modules (`math`) do not depend on infrastructure modules.
- Settings and logging are infrastructure primitives and should not import business logic.
- Entry points may depend on all modules but should remain thin orchestrators.

## Configuration Strategy
- Managed through standard-library dataclass parsing; values loaded from environment with optional `.env` support.
- Sensitive configuration (API keys, database credentials) must be injected via secrets manager at deploy time.
- Default `.env.example` documents required values.

## Error Handling
- Use explicit exceptions for recoverable errors.
- Leverage logging wrappers to emit structured errors (`logger.exception`).
- Future HTTP layer should translate exceptions into standardized problem+json responses.

## Internationalization & Timezones
- All timestamps must be emitted in UTC ISO-8601 format.
- User-visible strings should flow through an i18n layer once UI/API responses are added.
- Settings include `environment` marker to support localization defaults per region.

## Observability Hooks
- Logging uses JSON for compatibility with Elastic, Datadog, or OpenTelemetry collectors.
- Metrics/tracing to be added via OpenTelemetry SDK; instrumentation plan documented in `docs/observability.md`.

## Red-Team Box
- Over-engineering: For very small scripts this architecture may seem heavy—ensure templates are applied when service longevity warrants.
- Vendor lock-in: Avoid coupling to provider-specific services; abstract infrastructure in Terraform modules.
- Config sprawl: Enforce schema review for new settings to prevent growth without validation.
