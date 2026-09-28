# Dockerized Task API with CI/CD

A personal backend project demonstrating FastAPI, PostgreSQL, Docker Compose,
automated API tests, and a GitHub Actions test-and-build pipeline.

## Architecture and modules

`HTTP client → FastAPI → SQLAlchemy → PostgreSQL`

| Module | Files | Responsibility |
| --- | --- | --- |
| API | `app/main.py` | HTTP routes, status codes, health checks |
| Contracts | `app/schemas.py` | Request validation and response types |
| Persistence | `app/database.py`, `app/models.py` | Sessions and task table |
| Tests | `tests/test_api.py` | CRUD, validation, pagination, health |
| Containers | `Dockerfile`, `compose.yaml` | API image, database, isolated tests |
| CI | `.github/workflows/ci.yml` | PostgreSQL tests followed by image build |

See [TODO.md](TODO.md) for progress and [docs/git-workflow.md](docs/git-workflow.md)
for the development workflow.

## Run with Docker

Install Docker Desktop with Linux containers enabled. From the repository root:

```bash
docker compose up --build -d --wait
```

Open http://localhost:18000/docs to use the interactive API documentation.
Compose includes demo database credentials and binds the API to localhost.
Optionally copy `.env.example` to `.env` to customize the database settings.
Use URL-safe credential values or URL-encode credentials in `DATABASE_URL`.

```bash
curl -X POST http://localhost:18000/tasks -H "Content-Type: application/json" -d '{"title":"Learn Docker"}'
curl http://localhost:18000/tasks
```

In Windows PowerShell, create a task with:

```powershell
Invoke-RestMethod http://localhost:18000/tasks -Method Post -ContentType application/json -Body '{"title":"Learn Docker"}'
```

| Method | Route | Result |
| --- | --- | --- |
| GET | `/health` | Process liveness |
| GET | `/ready` | Database readiness; 503 if unavailable |
| POST | `/tasks` | Create a task; 201 |
| GET | `/tasks?offset=0&limit=20` | Ordered page of tasks; maximum limit 100 |
| GET | `/tasks/{id}` | Retrieve task or 404 |
| PUT | `/tasks/{id}` | Replace title and completion status or 404 |
| DELETE | `/tasks/{id}` | Delete task; 204 or 404 |

Titles are trimmed and must contain 1–200 characters. New tasks default to
`completed: false`. PUT requires a title and resets omitted `completed` to false.

## Run tests

```bash
docker compose --profile test run --build --rm tests
```

Tests reset tables in a separate disposable PostgreSQL service. Never point
`TEST_DATABASE_URL` at a database containing data you want to keep.

For a fast local SQLite test run with Python 3.13:

```bash
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# Linux/macOS: source .venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest -q
uvicorn app.main:app --reload --port 18000
```

Without `DATABASE_URL`, local development uses SQLite. Docker and CI use PostgreSQL.

## Storage and operations

```bash
docker compose logs api
docker compose restart api
docker compose --profile test down
```

The `postgres_data` named volume preserves tasks when containers restart or are
removed. `docker compose down -v` deletes database storage; use only for a reset.

## CI scope and next steps

Pushes to `main` and `feat/**`, and pull requests to `main`, run the test suite
against PostgreSQL. The image build runs only after tests succeed. Images are
built for validation; they are not pushed to a registry or deployed.

This demo has no authentication and should not be exposed as a public write API.
It creates its initial schema on startup; schema evolution needs migrations
(for example Alembic). Future modules: authentication, migrations, image publishing,
and deployment with managed secrets.

Suggested CV wording after verifying the GitHub checks:

> Built a FastAPI task API with PostgreSQL using Docker Compose; implemented
> automated CRUD and validation tests and a GitHub Actions pipeline to test
> changes and build a non-root container image.
