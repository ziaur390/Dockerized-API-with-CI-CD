# Git workflow, one step at a time

## 1. Clone

```bash
git clone git@github.com:ziaur390/Dockerized-API-with-CI-CD.git .
```

Cloning downloads history and sets `origin` to the GitHub repository.
The repository started at `f18f11e` with a LICENSE file.

## 2. Branch

```bash
git switch -c feat/task-api
```

A feature branch groups the implementation for review before merging into main.

## 3. Inspect and commit each module

```bash
git status
git diff
git add <specific-files>
git diff --staged
git commit -m "feat: describe the completed change"
git log --oneline --graph --all
```

`add` selects the content for the next snapshot. `commit` records that snapshot
locally. Commit messages explain the purpose of the change. See the actual Git
history for the planning, API, testing/container, and CI/documentation commits.

## 4. Push

```bash
git push -u origin feat/task-api
```

Push publishes local commits to GitHub. `-u` sets the branch's upstream so later
pushes can use `git push`. Check the Actions tab for tests and the image build.

## 5. Review and merge

Open a pull request from `feat/task-api` into `main`. Read the file changes,
check the test results, and merge once the checks pass. A personal project can
use self-review; do not describe it as a team review unless someone participates.

## 6. Pull the merged result

After merging on GitHub:

```bash
git switch main
git pull --ff-only origin main
```

Pull fetches remote history and updates the current branch. `--ff-only` refuses
to invent a merge commit if local and remote histories have diverged.
PR #1 was merged after all four GitHub checks passed. The commands above were
then run locally to fast-forward main to merge commit `56afd76`.

For your next feature, start a new branch from the updated main and repeat.

## Completed project evidence

- [Merged pull request #1](https://github.com/ziaur390/Dockerized-API-with-CI-CD/pull/1)
- [Passing pull request workflow](https://github.com/ziaur390/Dockerized-API-with-CI-CD/actions/runs/36436970824)
- Local verification: 9 tests passed on PostgreSQL and SQLite; API restart
  preserved the demo task; container ran as UID 1000.
- A final documentation-only commit on main records checklist completion after
  the merge and pull. The implementation was delivered through the feature PR.

## Dashboard follow-up

The task dashboard was developed on `feat/task-dashboard` and delivered through
[pull request #2](https://github.com/ziaur390/Dockerized-API-with-CI-CD/pull/2).
All four GitHub test and build checks passed before it was merged into main.
Local main was then fast-forwarded with `git pull --ff-only origin main`.
