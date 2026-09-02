#!/bin/bash

set -e

# Copy .env.example to .env if .env doesn't exist
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one from .env.example..."
    cp .env.example .env
    echo "✅  .env file created."
fi

echo "🚀 Starting AutoDeploy Taskflow..."
# Build and start the containers in detached mode
docker compose up -d --build

echo ""
echo "✅ Application successfully started!"
echo "👉 Frontend UI: http://localhost:8000"
echo "👉 API Docs:    http://localhost:8000/docs"
echo ""
echo "Use 'docker compose logs -f api' to view live logs."
echo "Use 'docker compose down' to stop the application."
