import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from sqlalchemy.orm import Session


@pytest.fixture
def client(monkeypatch):
    # TEST_DATABASE_URL must point to a disposable database: tables are reset.
    url = os.getenv("TEST_DATABASE_URL", "sqlite://")
    options = {"poolclass": StaticPool, "connect_args": {"check_same_thread": False}} if url == "sqlite://" else {}
    engine = create_engine(url, **options)
    monkeypatch.setattr("app.main.engine", engine)
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)

    def override_db():
        with Session(engine) as session:
            yield session

    app.dependency_overrides[get_db] = override_db
    # Run the real lifespan against the disposable test engine.
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(engine)
    engine.dispose()


def test_crud_lifecycle(client):
    response = client.post("/tasks", json={"title": " Learn Docker "})
    assert response.status_code == 201
    task = response.json()
    assert task == {"id": task["id"], "title": "Learn Docker", "completed": False}
    path = f"/tasks/{task['id']}"
    assert client.get(path).json() == task
    assert client.get("/tasks").json() == [task]
    updated = client.put(path, json={"title": "Docker learned", "completed": True})
    assert updated.status_code == 200
    assert updated.json()["completed"] is True
    assert client.get(path).json()["title"] == "Docker learned"
    assert client.delete(path).status_code == 204
    assert client.get(path).status_code == 404
    assert client.get("/tasks").json() == []


@pytest.mark.parametrize("payload", [{}, {"title": ""}, {"title": "   "}, {"title": "x" * 201}, {"title": "ok", "unknown": 1}])
def test_invalid_input(client, payload):
    assert client.post("/tasks", json=payload).status_code == 422


def test_missing_resources(client):
    assert client.get("/tasks/99999").status_code == 404
    assert client.put("/tasks/99999", json={"title": "missing"}).status_code == 404
    assert client.delete("/tasks/99999").status_code == 404


def test_pagination(client):
    for title in ["first", "second", "third"]:
        assert client.post("/tasks", json={"title": title}).status_code == 201
    assert [task["title"] for task in client.get("/tasks?offset=1&limit=1").json()] == ["second"]
    assert client.get("/tasks?limit=101").status_code == 422
    assert client.get("/tasks?offset=-1").status_code == 422


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}
    assert client.get("/ready").json() == {"status": "ready"}
