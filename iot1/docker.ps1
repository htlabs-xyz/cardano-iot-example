# Cardano IoT Docker Management Script for Windows PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$Service = ""
)

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Status {
    param([string]$Message)
    Write-ColorOutput "[INFO] $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "[SUCCESS] $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "[WARNING] $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "[ERROR] $Message" "Red"
}

# Check if Docker is installed
function Test-Docker {
    try {
        $dockerVersion = docker --version 2>$null
        $composeVersion = docker-compose --version 2>$null
        
        if (-not $dockerVersion) {
            Write-Error "Docker is not installed. Please install Docker Desktop first."
            exit 1
        }
        
        if (-not $composeVersion) {
            Write-Error "Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        }
        
        Write-Success "Docker and Docker Compose are installed"
    }
    catch {
        Write-Error "Error checking Docker installation: $_"
        exit 1
    }
}

# Setup environment files
function Initialize-Environment {
    Write-Status "Setting up environment files..."
    
    # Backend environment
    if (-not (Test-Path "back-end\.env")) {
        if (Test-Path "back-end\.env.example") {
            Copy-Item "back-end\.env.example" "back-end\.env"
            Write-Warning "Created back-end\.env from example. Please configure your settings."
        }
        else {
            Write-Error "back-end\.env.example not found"
            exit 1
        }
    }
    else {
        Write-Success "back-end\.env already exists"
    }
    
    # Frontend environment
    if (-not (Test-Path "front-end\.env")) {
        if (Test-Path "front-end\.env.example") {
            Copy-Item "front-end\.env.example" "front-end\.env"
            Write-Success "Created front-end\.env from example"
        }
        else {
            Write-Error "front-end\.env.example not found"
            exit 1
        }
    }
    else {
        Write-Success "front-end\.env already exists"
    }
}

# Start development environment
function Start-Development {
    Write-Status "Starting development environment..."
    Initialize-Environment
    
    try {
        docker-compose up -d
        Write-Success "Development environment started!"
        Write-Host ""
        Write-Status "Services are available at:"
        Write-Host "  Frontend: http://localhost:3001"
        Write-Host "  Backend:  http://localhost:3000"
        Write-Host "  Redis:    localhost:6379"
        Write-Host ""
        Write-Status "To view logs: .\docker.ps1 logs"
        Write-Status "To stop: .\docker.ps1 stop"
    }
    catch {
        Write-Error "Failed to start development environment: $_"
        exit 1
    }
}

# Start production environment
function Start-Production {
    Write-Status "Starting production environment..."
    Initialize-Environment
    
    try {
        docker-compose -f docker-compose.prod.yml up -d
        Write-Success "Production environment started!"
        Write-Host ""
        Write-Status "Application is available at:"
        Write-Host "  Main App: http://localhost"
        Write-Host "  Backend:  http://localhost:3000"
        Write-Host "  Frontend: http://localhost:3001"
        Write-Host ""
        Write-Status "To view logs: .\docker.ps1 logs"
        Write-Status "To stop: .\docker.ps1 stop"
    }
    catch {
        Write-Error "Failed to start production environment: $_"
        exit 1
    }
}

# Stop services
function Stop-Services {
    Write-Status "Stopping services..."
    
    try {
        docker-compose down 2>$null
        docker-compose -f docker-compose.prod.yml down 2>$null
        Write-Success "Services stopped"
    }
    catch {
        Write-Warning "Some services may not have been running"
    }
}

# View logs
function Show-Logs {
    param([string]$ServiceName = "")
    
    if ($ServiceName) {
        Write-Status "Showing logs for $ServiceName..."
        docker-compose logs -f $ServiceName
    }
    else {
        Write-Status "Showing logs for all services..."
        docker-compose logs -f
    }
}

# Build images
function Build-Images {
    param([string]$Environment = "dev")
    
    if ($Environment -eq "prod") {
        Write-Status "Building production images..."
        docker-compose -f docker-compose.prod.yml build
    }
    else {
        Write-Status "Building development images..."
        docker-compose build
    }
    Write-Success "Images built successfully"
}

# Clean up Docker resources
function Invoke-Cleanup {
    Write-Status "Cleaning up Docker resources..."
    
    try {
        docker-compose down -v --remove-orphans 2>$null
        docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>$null
        docker system prune -f
        Write-Success "Cleanup completed"
    }
    catch {
        Write-Error "Error during cleanup: $_"
    }
}

# Show status
function Show-Status {
    Write-Status "Docker services status:"
    docker-compose ps
    Write-Host ""
    docker-compose -f docker-compose.prod.yml ps 2>$null
}

# Show help
function Show-Help {
    Write-Host "Cardano IoT Docker Management Script for Windows PowerShell"
    Write-Host ""
    Write-Host "Usage: .\docker.ps1 [COMMAND] [SERVICE]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  dev          Start development environment"
    Write-Host "  prod         Start production environment"
    Write-Host "  stop         Stop all services"
    Write-Host "  restart      Restart services"
    Write-Host "  logs [service]  Show logs (optionally for specific service)"
    Write-Host "  build [env]  Build images (dev/prod)"
    Write-Host "  status       Show services status"
    Write-Host "  cleanup      Clean up Docker resources"
    Write-Host "  setup        Setup environment files only"
    Write-Host "  help         Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\docker.ps1 dev              # Start development environment"
    Write-Host "  .\docker.ps1 logs backend     # Show backend logs"
    Write-Host "  .\docker.ps1 build prod       # Build production images"
}

# Main script logic
Test-Docker

switch ($Command.ToLower()) {
    { $_ -in @("dev", "development") } {
        Start-Development
    }
    { $_ -in @("prod", "production") } {
        Start-Production
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Stop-Services
        Start-Sleep -Seconds 2
        Start-Development
    }
    "logs" {
        Show-Logs $Service
    }
    "build" {
        Build-Images $Service
    }
    "status" {
        Show-Status
    }
    "cleanup" {
        Invoke-Cleanup
    }
    "setup" {
        Initialize-Environment
    }
    { $_ -in @("help", "--help", "-h") } {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Help
        exit 1
    }
}
