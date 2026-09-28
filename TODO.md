# Project modules and TODOs

## 1. Git and planning
- [x] Clone the GitHub repository and inspect the initial commit.
- [x] Create `feat/task-api` branch.
- [x] Define modules and acceptance criteria.

## 2. API and persistence
- [x] Implement task creation, listing, retrieval, updates, and deletion.
- [x] Validate input and return useful HTTP errors.
- [x] Persist tasks with SQLAlchemy and PostgreSQL.
- [x] Provide liveness and database readiness endpoints.

## 3. Automated tests
- [x] Test the complete CRUD lifecycle, validation, and missing resources.
- [x] Run the same tests against PostgreSQL.

## 4. Containers
- [x] Build a non-root API image.
- [x] Configure PostgreSQL health checks and persistent storage in Compose.
- [x] Verify startup and persistence through an API restart.

## 5. CI and documentation
- [x] Add GitHub Actions tests with PostgreSQL and a container build.
- [x] Document setup, API usage, architecture, limitations, and Git workflow.
- [x] Commit each module and push the feature branch.
- [x] Open a pull request and verify GitHub checks.
- [x] Merge the validated pull request and pull main locally.

The workflow validates and builds the image. Deployment to a hosted environment
is future work; this project does not claim a live production deployment.

## 6. Task dashboard
- [x] Serve a responsive frontend from the FastAPI container.
- [x] Connect the dashboard to task creation, listing, completion, editing, and deletion.
- [x] Add search, status filters, loading and error states, and accessible controls.
- [x] Check desktop and mobile layouts with the running API.
- [ ] Commit and push the dashboard branch, then open a pull request.
