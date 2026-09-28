# Project modules and TODOs

## 1. Git and planning
- [x] Clone the GitHub repository and inspect the initial commit.
- [x] Create `feat/task-api` branch.
- [x] Define modules and acceptance criteria.

## 2. API and persistence
- [ ] Implement task creation, listing, retrieval, updates, and deletion.
- [ ] Validate input and return useful HTTP errors.
- [ ] Persist tasks with SQLAlchemy and PostgreSQL.
- [ ] Provide liveness and database readiness endpoints.

## 3. Automated tests
- [ ] Test the complete CRUD lifecycle, validation, and missing resources.
- [ ] Run the same tests against PostgreSQL.

## 4. Containers
- [ ] Build a non-root API image.
- [ ] Configure PostgreSQL health checks and persistent storage in Compose.
- [ ] Verify startup and persistence through an API restart.

## 5. CI and documentation
- [ ] Add GitHub Actions tests with PostgreSQL and a container build.
- [ ] Document setup, API usage, architecture, limitations, and Git workflow.
- [ ] Commit each module and push the feature branch.
- [ ] Open a pull request and verify GitHub checks.
- [ ] Merge the reviewed pull request and pull main locally.

The workflow validates and builds the image. Deployment to a hosted environment
is future work; this project does not claim a live production deployment.
