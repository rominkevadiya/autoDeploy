# Stop on errors
$ErrorActionPreference = "Stop"

# Fix emoji rendering in PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
# Copy .env.example to .env if .env doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating one from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅  .env file created." -ForegroundColor Green
}

Write-Host "🚀 Starting AutoDeploy Taskflow..." -ForegroundColor Cyan
# Build and start the containers in detached mode
docker compose up -d --build

Write-Host ""
Write-Host "✅ Application successfully started!" -ForegroundColor Green
Write-Host "👉 Frontend UI: http://localhost:8000"
Write-Host "👉 API Docs:    http://localhost:8000/docs"
Write-Host ""
Write-Host "Use 'docker compose logs -f api' to view live logs." -ForegroundColor DarkGray
Write-Host "Use 'docker compose down' to stop the application." -ForegroundColor DarkGray
