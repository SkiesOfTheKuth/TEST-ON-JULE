# Operations Runbook

## Service Overview
- **Name:** python-starter-project
- **Owner:** Platform Engineering
- **Description:** Reference microservice template providing arithmetic helpers and scaffolding for production-ready Python services.

## Deployments
- Managed through CI/CD pipeline (see `.github/workflows/ci.yml`).
- Docker images published to registry (e.g., `ghcr.io/<org>/python-starter-project`).
- Promote images via Git tags; staging uses `main`, production uses semantic release tags.

## Health Checks
- Container healthcheck invokes `python -m python_starter_project.healthcheck` returning JSON payload.
- HTTP `/healthz` endpoint planned for production service layer (stub).

## Common Tasks
| Task | Command |
| ---- | ------- |
| Install dependencies | `make install` |
| Run linters | `make lint` |
| Run formatter | `make format` |
| Run unit tests | `make test` |
| Generate coverage report | `make coverage` |
| Run type checks | `make typecheck` |
| Build Docker image | `make docker-build` |

## Incident Response
1. Identify alert (PagerDuty/On-call) and classify severity (SEV1-SEV4).
2. Create incident channel (Slack `#inc-<date>-<summary>`).
3. Assign Incident Commander (IC) and Communications Lead (CL).
4. Capture timeline in shared doc and update every 15 minutes for SEV1/2.
5. Mitigate and verify using healthcheck + smoke tests.
6. Conduct post-incident review within 72 hours.

### Escalation Path
- Primary On-call Engineer → Secondary On-call → Engineering Manager → Director of Platform.

## Runbooks
- **CI failure:** Check GitHub Actions logs, run `make lint test` locally, fix, push.
- **Deployment rollback:** Redeploy previous tagged Docker image from registry, confirm healthcheck success.
- **Configuration drift:** Compare `.env` with secrets manager entries, reconcile differences, redeploy.

## Metrics & Observability
- Structured JSON logs emitted via stdlib formatter and forwarded to log aggregation pipelines.
- Future integrations: OpenTelemetry traces + Prometheus metrics (exporter TODO).

## Compliance & Auditing
- Retain logs for 30 days in central logging solution.
- Access reviews for deployment credentials quarterly.
