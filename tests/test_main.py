import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os

# Set dummy environment variable for tests
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from app.main import app
from app.database import Base, get_db

# Setup SQLite in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the test database
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "healthy"

def test_create_task():
    response = client.post(
        "/tasks/",
        json={"title": "Test Task", "description": "This is a test task"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["id"] is not None

def test_read_tasks():
    response = client.get("/tasks/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_read_task():
    # First create a task
    create_response = client.post(
        "/tasks/",
        json={"title": "Test Task 2"}
    )
    task_id = create_response.json()["id"]

    # Read the created task
    read_response = client.get(f"/tasks/{task_id}")
    assert read_response.status_code == 200
    assert read_response.json()["title"] == "Test Task 2"

def test_update_task():
    create_response = client.post(
        "/tasks/",
        json={"title": "Task to update"}
    )
    task_id = create_response.json()["id"]

    update_response = client.put(
        f"/tasks/{task_id}",
        json={"title": "Updated Task", "description": "Updated description"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Task"
    assert update_response.json()["description"] == "Updated description"

def test_delete_task():
    create_response = client.post(
        "/tasks/",
        json={"title": "Task to delete"}
    )
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 200

    read_response = client.get(f"/tasks/{task_id}")
    assert read_response.status_code == 404

def test_toggle_task():
    create_response = client.post(
        "/tasks/",
        json={"title": "Task to toggle"}
    )
    task_id = create_response.json()["id"]
    assert create_response.json()["completed"] is False

    toggle_response = client.patch(f"/tasks/{task_id}/toggle")
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True

    toggle_response_2 = client.patch(f"/tasks/{task_id}/toggle")
    assert toggle_response_2.status_code == 200
    assert toggle_response_2.json()["completed"] is False

def test_read_nonexistent_task():
    response = client.get("/tasks/999999")
    assert response.status_code == 404

