from sqlalchemy.orm import Session

from app.database import get_db
from app.main import app


def test_liveness(client):
    response = client.get("/live")
    assert response.status_code == 200
    assert response.json()["status"] == "live"


def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={"username": "newuser", "email": "newuser@example.com", "password": "password"}
    )
    assert response.status_code == 201
    assert response.json()["username"] == "newuser"


def test_login_user(client):
    client.post(
        "/auth/register",
        json={"username": "loginuser", "email": "loginuser@example.com", "password": "password"}
    )
    response = client.post(
        "/auth/login",
        data={"username": "loginuser", "password": "password"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_rate_limit_auth(client):
    # Auth endpoints are limited to 5/minute
    # Since other tests might have consumed some of the limit for the test client's IP,
    # we just send up to 10 requests and ensure at least one returns 429.
    rate_limited = False
    for _ in range(10):
        response = client.post("/auth/login", data={"username": "user", "password": "pwd"})
        if response.status_code == 429:
            rate_limited = True
            break
    
    assert rate_limited, "Rate limiter did not block excessive requests"


def test_readiness_and_health(client):
    ready = client.get("/ready")
    assert ready.status_code == 200
    assert ready.json()["database"] == "healthy"

    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ready"


def test_readiness_unhealthy(client):
    class UnhealthySession:
        def execute(self, *args, **kwargs):
            raise RuntimeError("database down")

        def close(self):
            pass

    def override_unhealthy():
        yield UnhealthySession()

    app.dependency_overrides[get_db] = override_unhealthy
    try:
        response = client.get("/ready")
        assert response.status_code == 503
        health = client.get("/health")
        assert health.status_code == 503
    finally:
        app.dependency_overrides.pop(get_db, None)


def test_create_task(client):
    response = client.post(
        "/tasks/",
        json={
            "title": "Test Task", 
            "description": "This is a test task",
            "category": "Work",
            "due_date": "2026-12-31T23:59:59Z"
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["category"] == "Work"
    assert data["due_date"].startswith("2026-12-31T23:59:59")
    assert data["id"] is not None


def test_create_task_rejects_empty_title(client):
    response = client.post("/tasks/", json={"title": "   "})
    assert response.status_code == 422


def test_create_task_rejects_long_title(client):
    response = client.post("/tasks/", json={"title": "x" * 201})
    assert response.status_code == 422


def test_read_tasks_isolated(client):
    response = client.get("/tasks/")
    assert response.status_code == 200
    assert response.json()["items"] == []
    assert response.json()["total"] == 0


def test_read_task(client):
    create_response = client.post("/tasks/", json={"title": "Test Task 2"})
    task_id = create_response.json()["id"]

    read_response = client.get(f"/tasks/{task_id}")
    assert read_response.status_code == 200
    assert read_response.json()["title"] == "Test Task 2"


def test_update_task(client):
    create_response = client.post("/tasks/", json={"title": "Task to update"})
    task_id = create_response.json()["id"]

    update_response = client.put(
        f"/tasks/{task_id}",
        json={
            "title": "Updated Task",
            "description": "Updated description",
            "completed": True,
            "category": "Personal",
            "due_date": "2027-01-01T00:00:00Z"
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated Task"
    assert update_response.json()["description"] == "Updated description"
    assert update_response.json()["completed"] is True
    assert update_response.json()["category"] == "Personal"
    assert update_response.json()["due_date"].startswith("2027-01-01T00:00:00")


def test_delete_task(client):
    create_response = client.post("/tasks/", json={"title": "Task to delete"})
    task_id = create_response.json()["id"]

    delete_response = client.delete(f"/tasks/{task_id}")
    assert delete_response.status_code == 200

    read_response = client.get(f"/tasks/{task_id}")
    assert read_response.status_code == 404


def test_toggle_task(client):
    create_response = client.post("/tasks/", json={"title": "Task to toggle"})
    task_id = create_response.json()["id"]
    assert create_response.json()["completed"] is False

    toggle_response = client.patch(f"/tasks/{task_id}/toggle")
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True

    toggle_response_2 = client.patch(f"/tasks/{task_id}/toggle")
    assert toggle_response_2.status_code == 200
    assert toggle_response_2.json()["completed"] is False


def test_read_nonexistent_task(client):
    response = client.get("/tasks/999999")
    assert response.status_code == 404


def test_pagination_limit(client, db_session: Session):
    for index in range(3):
        client.post("/tasks/", json={"title": f"Task {index}"})

    response = client.get("/tasks/?skip=0&limit=2")
    assert response.status_code == 200
    assert len(response.json()["items"]) == 2
    assert response.json()["total"] == 3

    over_max = client.get("/tasks/?limit=51")
    assert over_max.status_code == 422
