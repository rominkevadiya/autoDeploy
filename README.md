# AutoDeploy

AutoDeploy is a containerized FastAPI application built as a DevOps-focused project.

The project demonstrates how to build, test, migrate, containerize, and run a Python API with PostgreSQL using Docker and Docker Compose.

## Project Status

| Component | Status |
|---|---|
| FastAPI application | Complete |
| PostgreSQL integration | Complete |
| CRUD API | Complete |
| Automated tests | Complete |
| Alembic migrations | Complete |
| Dockerfile | Complete |
| Docker Compose | Complete |
| PostgreSQL 18 container | Complete |
| Docker healthcheck | Complete |
| Persistent Docker volume | Complete |
| CI/CD | Complete |
| Container registry | Complete |
| Production deployment | Complete |
| Monitoring | Complete |

---

## Architecture

```text
                         Client
                           |
                           | HTTP
                           v
                  +-------------------+
                  |   FastAPI API     |
                  |   api container   |
                  |                   |
                  |   Uvicorn         |
                  |   SQLAlchemy      |
                  +---------+---------+
                            |
                            | Docker Network
                            |
                            v
                  +-------------------+
                  |   PostgreSQL 18   |
                  |   db container    |
                  |                   |
                  |   autodeploy DB   |
                  +---------+---------+
                            |
                            |
                            v
                  +-------------------+
                  | postgres_data     |
                  | Docker Volume     |
                  +-------------------+

                  Alembic
                     |
                     v
             Database Migrations
```

The API and PostgreSQL containers communicate through the Docker Compose network.

The PostgreSQL database uses a named Docker volume so that database data survives container restarts.

---

# Technology Stack

## Application

* Python 3.12
* FastAPI
* Uvicorn
* SQLAlchemy
* Pydantic
* Pydantic Settings
* psycopg

## Database

* PostgreSQL 18

## Testing

* Pytest
* HTTPX
* SQLite in-memory database for isolated API tests

## DevOps

* Docker
* Docker Compose
* Dockerfile
* Alembic
* Docker healthchecks
* Docker named volumes
* Docker bridge network

---

# Project Structure

```text
autoDeploy/
│
├── app/
│   ├── __init__.py
│   ├── config.py
│   ├── database.py
│   ├── main.py
│   │
│   └── models/
│       ├── __init__.py
│       └── task.py
│
├── tests/
│   ├── __init__.py
│   └── test_main.py
│
├── alembic/
│   ├── versions/
│   │   └── 48f1ef94ba56_initial_migration.py
│   ├── env.py
│   └── script.py.mako
│
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── alembic.ini
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

# Application

AutoDeploy currently provides a Task API.

Each task contains:

```text
id
title
description
completed
```

Example:

```json
{
  "id": 1,
  "title": "Docker Deployment",
  "description": "Run AutoDeploy inside Docker",
  "completed": false
}
```

---

# API Endpoints

## Health Check

```http
GET /health
```

Example:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "ok",
  "database": "healthy"
}
```

---

## Get Tasks

```http
GET /tasks/
```

Example:

```bash
curl http://127.0.0.1:8000/tasks/
```

Example response:

```json
[
  {
    "id": 1,
    "title": "Docker Deployment",
    "description": "Run AutoDeploy inside Docker",
    "completed": false
  }
]
```

---

## Create Task

```http
POST /tasks/
```

Example:

```bash
curl -X POST http://127.0.0.1:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Deployment",
    "description": "Run AutoDeploy inside Docker"
  }'
```

---

## Get Single Task

```http
GET /tasks/{task_id}
```

Example:

```bash
curl http://127.0.0.1:8000/tasks/1
```

---

## Update Task

```http
PUT /tasks/{task_id}
```

Example:

```bash
curl -X PUT http://127.0.0.1:8000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Deployment",
    "description": "Containerized AutoDeploy",
    "completed": true
  }'
```

---

## Delete Task

```http
DELETE /tasks/{task_id}
```

Example:

```bash
curl -X DELETE http://127.0.0.1:8000/tasks/1
```

---

# API Documentation

FastAPI automatically provides interactive API documentation.

After starting the application:

```text
http://127.0.0.1:8000/docs
```

Alternative documentation:

```text
http://127.0.0.1:8000/redoc
```

---

# Environment Configuration

The application uses environment variables instead of hardcoded database configuration.

Create the local environment file:

```bash
cp .env.example .env
```

Example:

```env
POSTGRES_DB=autodeploy
POSTGRES_USER=autodeploy
POSTGRES_PASSWORD=your_secure_password

DATABASE_URL=postgresql+psycopg://autodeploy:your_secure_password@db:5432/autodeploy
```

The `.env` file should not be committed to Git.

It is included in `.gitignore`.

---

# Local Development

## Clone the Repository

```bash
git clone <repository-url>
cd autoDeploy
```

## Create Virtual Environment

```bash
python3.12 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

Verify Python:

```bash
python --version
```

Expected:

```text
Python 3.12.x
```

---

# Install Dependencies

```bash
pip install -r requirements.txt
```

---

# PostgreSQL for Local Development

The application can use PostgreSQL running directly on the host.

Check PostgreSQL:

```bash
sudo systemctl status postgresql
```

Example local database configuration:

```env
DATABASE_URL=postgresql+psycopg://autodeploy:password@127.0.0.1:5432/autodeploy
```

---

# Alembic

Alembic is used for database schema management.

The application does not use:

```python
Base.metadata.create_all()
```

for database schema management.

Database changes are managed through Alembic migrations.

## Check Migration Status

```bash
alembic current
```

## Apply Migrations

```bash
alembic upgrade head
```

## Create a Migration

After changing SQLAlchemy models:

```bash
alembic revision --autogenerate -m "describe change"
```

Review the generated migration before applying it.

Then:

```bash
alembic upgrade head
```

## Roll Back a Migration

```bash
alembic downgrade -1
```

---

# Run the Application Locally

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive documentation:

```text
http://127.0.0.1:8000/docs
```

---

# Testing

The project uses Pytest.

Run:

```bash
pytest
```

The test suite covers:

* Health endpoint
* Task creation
* Task retrieval
* Task operations

Tests use an isolated SQLite in-memory database so they do not modify the local PostgreSQL database.

Example:

```text
4 passed
```

---

# Docker

The application can be run without installing Python dependencies or PostgreSQL directly on the host.

Docker Compose manages two services:

```text
api
db
```

---

# Dockerfile

The API image is based on:

```text
python:3.12-slim
```

The Docker image:

1. Installs required system packages.
2. Copies Python dependencies.
3. Installs application dependencies.
4. Copies the application.
5. Creates a non-root `appuser`.
6. Runs the application as the non-root user.
7. Runs Alembic migrations before starting Uvicorn.

Container startup command:

```bash
alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

# Docker Compose

Docker Compose manages:

```text
api
db
```

The PostgreSQL service uses:

```yaml
image: postgres:18
```

The API uses the locally built Docker image.

---

# PostgreSQL Docker Configuration

The PostgreSQL container uses:

```text
Database: autodeploy
User: autodeploy
```

The password is loaded from `.env`.

The Docker PostgreSQL database is separate from the PostgreSQL installation running directly on the host.

The API connects to PostgreSQL using:

```text
db:5432
```

not:

```text
localhost:5432
```

Inside Docker Compose, `db` resolves to the PostgreSQL container through Docker's internal DNS.

---

# PostgreSQL 18 Volume

PostgreSQL 18 uses:

```yaml
volumes:
  - postgres_data:/var/lib/postgresql
```

The named Docker volume is:

```text
autodeploy_postgres_data
```

The volume keeps PostgreSQL data persistent across container restarts.

---

# Docker Network

The services communicate through:

```text
autodeploy_network
```

The API connects to PostgreSQL using:

```text
db
```

Docker's internal DNS resolves `db` to the PostgreSQL container.

---

# PostgreSQL Healthcheck

Docker Compose checks whether PostgreSQL is ready before starting the API.

The healthcheck uses:

```bash
pg_isready
```

The API depends on the database being healthy:

```yaml
depends_on:
  db:
    condition: service_healthy
```

This prevents the API from starting before PostgreSQL is ready.

---

# Docker Compose Commands

## Validate Configuration

```bash
docker compose config
```

## Build the API Image

```bash
docker compose build
```

## Start the Application

```bash
docker compose up
```

Run in detached mode:

```bash
docker compose up -d
```

## Check Container Status

```bash
docker compose ps
```

Expected:

```text
api    Up
db     Up (healthy)
```

## View Logs

All services:

```bash
docker compose logs
```

API:

```bash
docker compose logs api
```

Database:

```bash
docker compose logs db
```

Follow logs:

```bash
docker compose logs -f
```

## Stop the Application

```bash
docker compose down
```

This removes containers and the network while keeping the named PostgreSQL volume.

## Start Again

```bash
docker compose up -d
```

---

# Verify Docker Deployment

After starting:

```bash
docker compose ps
```

Then:

```bash
curl http://127.0.0.1:8000/health
```

Expected:

```json
{
  "status": "ok",
  "database": "healthy"
}
```

---

# Test Task Creation

Create a task:

```bash
curl -X POST http://127.0.0.1:8000/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Deployment",
    "description": "Run AutoDeploy inside Docker"
  }'
```

Get tasks:

```bash
curl http://127.0.0.1:8000/tasks/
```

---

# Access PostgreSQL Inside Docker

Open PostgreSQL:

```bash
docker compose exec db psql -U autodeploy -d autodeploy
```

Check tasks:

```sql
SELECT * FROM tasks;
```

Check Alembic migration:

```sql
SELECT * FROM alembic_version;
```

Expected:

```text
48f1ef94ba56
```

Exit:

```sql
\q
```

---

# Test Database Persistence

Stop the containers:

```bash
docker compose down
```

Start them again:

```bash
docker compose up -d
```

Then:

```bash
curl http://127.0.0.1:8000/tasks/
```

Previously created tasks should still exist.

This verifies that PostgreSQL is using persistent Docker storage.

---

# Database Separation

The project uses two separate PostgreSQL environments during development.

## Host PostgreSQL

PostgreSQL running directly on Fedora:

```text
127.0.0.1:5432
```

## Docker PostgreSQL

PostgreSQL running inside Docker:

```text
db:5432
```

These databases are separate.

The Docker database uses:

```text
autodeploy_postgres_data
```

as its persistent volume.

The host PostgreSQL database is not modified by the Docker PostgreSQL container.

---

# Alembic in Docker

When the API container starts, it executes:

```bash
alembic upgrade head
```

before starting Uvicorn.

Startup sequence:

```text
Docker Compose
      |
      v
PostgreSQL starts
      |
      v
Healthcheck passes
      |
      v
API container starts
      |
      v
alembic upgrade head
      |
      v
Uvicorn starts
```

---

# Security Considerations

The project currently follows these practices:

* Database credentials are stored in `.env`.
* `.env` is excluded from Git.
* `.env` is excluded from the Docker build context.
* The API container runs as a non-root user.
* PostgreSQL is not published directly to the host.
* The API communicates with PostgreSQL through the internal Docker network.

Production deployment will require additional security controls.

---

# .dockerignore

The Docker build context excludes:

```text
.env
venv/
.venv/
__pycache__/
.pytest_cache/
.git/
```

This prevents local secrets and development artifacts from being copied into the Docker image.

---

# Current Deployment Flow

```text
Developer
    |
    | docker compose build
    v
Docker BuildKit
    |
    v
AutoDeploy API Image
    |
    | docker compose up
    v
+-----------------------+
| Docker Compose        |
+-----------------------+
       |
       +------------------+
       |                  |
       v                  v
   PostgreSQL 18       FastAPI
       |                  |
       |                  |
       +---- Docker ------+
             Network
```

---

# Current DevOps Workflow

```text
Code
 |
 v
Run Tests
 |
 v
Build Docker Image
 |
 v
Start PostgreSQL
 |
 v
Database Healthcheck
 |
 v
Run Alembic Migration
 |
 v
Start FastAPI
 |
 v
Verify API
```

---

# Future CI/CD Pipeline

CI/CD is planned for a future phase.

The intended pipeline:

```text
Developer
    |
    | git push
    v
GitHub
    |
    v
GitHub Actions
    |
    +--------------------+
    |                    |
    v                    v
Run Tests           Build Docker Image
    |                    |
    +---------+----------+
              |
              v
        Push Image
        to Registry
              |
              v
          Deployment
```

Planned technologies:

* GitHub Actions
* Docker Hub or another container registry
* Automated testing
* Docker image builds
* Deployment automation

---

# Future Improvements

## CI/CD

* GitHub Actions workflow
* Automated Pytest execution
* Docker image build
* Container image publishing
* Deployment automation

## Deployment

Potential deployment targets:

* AWS EC2
* AWS ECS
* Cloud VM
* Linux server

## Infrastructure

Potential additions:

* Terraform
* Production Docker configuration
* Nginx
* HTTPS
* Domain configuration

## Observability

Potential additions:

* Application logging
* Container logging
* Prometheus
* Grafana
* Metrics
* Alerting

---

# Useful Commands

## Docker

```bash
docker ps
docker images
docker volume ls
docker network ls
docker compose ps
docker compose logs
docker compose down
docker compose up -d
```

## Application

```bash
uvicorn app.main:app --reload
pytest
```

## Alembic

```bash
alembic current
alembic history
alembic upgrade head
alembic downgrade -1
```

## PostgreSQL

```bash
docker compose exec db psql -U autodeploy -d autodeploy
```

---

# Troubleshooting

## Docker daemon is not running

Check:

```bash
systemctl status docker
```

Start:

```bash
sudo systemctl start docker
```

Verify:

```bash
docker info
```

---

## Wrong Docker Context

Check:

```bash
docker context ls
```

For native Docker Engine on Fedora:

```bash
docker context use default
```

Verify:

```bash
docker info
```

The expected operating system should be:

```text
Fedora Linux
```

---

## PostgreSQL Container Is Unhealthy

Check:

```bash
docker compose ps
```

Then:

```bash
docker compose logs db
```

---

## API Container Fails

Check:

```bash
docker compose logs api
```

Common causes:

* Incorrect `DATABASE_URL`
* PostgreSQL not ready
* Failed Alembic migration
* Missing Python dependency

---

## API Returns 307 for `/tasks`

The task routes use a trailing slash.

Use:

```text
/tasks/
```

instead of:

```text
/tasks
```

Example:

```bash
curl http://127.0.0.1:8000/tasks/
```

---

# Verified Docker Deployment

The current Docker deployment has been tested successfully.

```text
Native Docker Engine          ✓
Docker Compose                ✓
PostgreSQL 18.6               ✓
PostgreSQL healthcheck        ✓
Docker network                ✓
Docker named volume           ✓
FastAPI container             ✓
FastAPI → PostgreSQL          ✓
Alembic migration             ✓
API health endpoint           ✓
Task creation                 ✓
Task retrieval                ✓
Database persistence          ✓
```

Example database verification:

```text
autodeploy=# SELECT * FROM tasks;

 id |       title       |         description          | completed
----+-------------------+------------------------------+-----------
  1 | Docker Deployment | Run AutoDeploy inside Docker | f
```

Migration verification:

```text
autodeploy=# SELECT * FROM alembic_version;

 version_num
--------------
 48f1ef94ba56
```

---

# Development Principles

1. Keep configuration outside application code.
2. Do not hardcode database credentials.
3. Manage database schema through migrations.
4. Keep database data persistent using Docker volumes.
5. Isolate services through Docker networks.
6. Run the application container as a non-root user.
7. Test the application before deployment.
8. Keep the Docker image separate from the host development environment.
9. Use healthchecks to control service startup order.
10. Automate repetitive deployment tasks.

---

# License

This project is currently intended as a personal DevOps learning and portfolio project.

---

# CI/CD and Container Registry

This project includes fully automated Continuous Integration and Continuous Deployment (CI/CD) pipelines powered by GitHub Actions.

## Automated Testing (CI)
On every push and pull request to the `main` branch, the `CI Test` workflow (`.github/workflows/ci-test.yml`) is triggered.
It automatically sets up a Python environment, installs all dependencies, and runs the `pytest` suite against an isolated in-memory database to ensure the application works perfectly.

## Automated Docker Publishing (CD)
When code is merged to `main` or a new version tag is created, the `Docker Publish` workflow (`.github/workflows/docker-publish.yml`) triggers.
It securely logs into the GitHub Container Registry (GHCR), builds a fresh Docker image containing the application, and publishes it automatically.

You can pull the latest built Docker image from the registry directly.

## Production Deployment (100% Free Stack)
The API is configured to be automatically deployed to **Google Cloud Run** using a completely free PostgreSQL database hosted on **Neon.tech**.

### Step 1: Create the Free Database (Neon)
1. Go to [Neon.tech](https://neon.tech/) and sign up for a free account.
2. Create a new project and select PostgreSQL 16 (or higher).
3. Once created, copy the **Connection String** from the dashboard. It will look like this: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`.

### Step 2: Prepare Google Cloud (API Hosting)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create a new project. Note your **Project ID**.
2. Search for **Cloud Run API** and click **Enable**.
3. Open the **Google Cloud Shell** (the `>_` terminal icon in the top right corner of the Google Cloud console).
4. Run the following command in the Cloud Shell, replacing `YOUR_PROJECT_ID` with your actual project ID, and `rominkevadiya/autoDeploy` with your GitHub repo:
   ```bash
   # Set your variables
   export PROJECT_ID="YOUR_PROJECT_ID"
   export REPO="rominkevadiya/autoDeploy"
   
   # Run the automated setup script
   curl -fsSL https://raw.githubusercontent.com/google-github-actions/auth/main/setup.sh | bash -s -- \
     --project_id="${PROJECT_ID}" \
     --service_account_id="github-actions-deployer" \
     --service_account_roles="roles/run.admin,roles/iam.serviceAccountUser" \
     --repo="${REPO}"
   ```
5. When the script finishes, it will print out two values in green text: your **Service Account Email** and your **Workload Identity Provider**. Copy both of these.

### Step 3: Configure GitHub Secrets
Go to your GitHub repository **Settings -> Secrets and variables -> Actions**, and add the following three secrets:
- `GCP_SERVICE_ACCOUNT`: Paste the Service Account Email the script outputted.
- `GCP_WORKLOAD_IDENTITY_PROVIDER`: Paste the Workload Identity Provider string the script outputted.
- `DATABASE_URL`: Paste the Connection String you copied from Neon.tech in Step 1.

Once configured, the `Deploy to Google Cloud Run` workflow (`.github/workflows/deploy-cloudrun.yml`) will automatically trigger on pushes to `main` and deploy your API live to the internet!

## Monitoring
Since the application runs on Google Cloud Run, logging, metrics, and uptime monitoring are automatically handled by the built-in **Google Cloud Operations Suite** (formerly Stackdriver) out of the box. No external agents or sidecars are required.
