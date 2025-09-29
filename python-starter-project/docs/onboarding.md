# Developer Onboarding

## Prerequisites
- Python 3.12
- Poetry 1.8+
- Docker (optional, for container workflows)

## Setup Steps
1. Clone the repository and check out the desired branch.
2. Copy `.env.example` to `.env` and customize values.
3. Run `make install` to install dependencies.
4. Execute `make lint typecheck test` to validate the environment.
5. Optionally enable Git hooks (requires `pre-commit` to be installed via pipx or pip) with `pre-commit install`.

## Daily Workflow
- Create feature branches off `main`.
- Run `make lint test` before pushing.
- Open pull requests with descriptive titles, referencing issues.
- Ensure CI is green before requesting review.

## Release Checklist
- Update `CHANGELOG.md` and bump version in `pyproject.toml`.
- Tag release (`git tag vX.Y.Z`), push tags.
- Publish Docker image via CI/CD pipeline.
- Announce release in engineering channel with key changes and rollback plan.

## Red-Team Box
- **Risk:** Local environment drift from CI. Mitigation: rely on Poetry lockfile and `make install`.
- **Risk:** Missing secrets. Mitigation: integrate with secrets manager; document fallback for local development.
- **Risk:** Skipping reviews. Mitigation: enforce protected branches requiring approvals.
