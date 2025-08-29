# IoT2 Cardano Smart Lock System - Docker Management
.PHONY: help build start stop restart logs clean dev prod nginx

# Default target
help: ## Show this help message
	@echo "IoT2 Cardano Smart Lock System - Docker Commands"
	@echo "================================================"
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  %-15s %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# Development commands
dev: ## Start development environment with hot reload
	docker-compose -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Backend API: http://localhost:3000"
	@echo "Frontend: http://localhost:3003"

dev-build: ## Build and start development environment
	docker-compose -f docker-compose.dev.yml up -d --build

dev-logs: ## Show development logs
	docker-compose -f docker-compose.dev.yml logs -f

dev-stop: ## Stop development environment
	docker-compose -f docker-compose.dev.yml down

# Production commands
prod: ## Start production environment
	docker-compose up -d
	@echo "Production environment started!"
	@echo "Backend API: http://localhost:3000"
	@echo "Frontend: http://localhost:3003"

prod-build: ## Build and start production environment
	docker-compose up -d --build

prod-logs: ## Show production logs
	docker-compose logs -f

prod-stop: ## Stop production environment
	docker-compose down

# Nginx proxy commands
nginx: ## Start production with Nginx reverse proxy
	docker-compose --profile production up -d
	@echo "Production with Nginx started!"
	@echo "Application: http://localhost"

nginx-stop: ## Stop Nginx and all services
	docker-compose --profile production down

# General commands
build: ## Build all services
	docker-compose build

start: ## Start all services
	docker-compose up -d

stop: ## Stop all services
	docker-compose down

restart: ## Restart all services
	docker-compose restart

logs: ## Show logs for all services
	docker-compose logs -f

# Individual service commands
backend: ## Start only backend service
	docker-compose up backend -d

frontend: ## Start only frontend service
	docker-compose up frontend -d

backend-logs: ## Show backend logs
	docker-compose logs -f backend

frontend-logs: ## Show frontend logs
	docker-compose logs -f frontend

# Cleanup commands
clean: ## Remove all containers, networks, and volumes
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Remove everything including images
	docker-compose down -v --remove-orphans --rmi all
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans --rmi all
	docker system prune -af

# Health check
health: ## Check service health
	@echo "Checking service health..."
	@curl -f http://localhost:3000/api || echo "Backend API not responding"
	@curl -f http://localhost:3003 || echo "Frontend not responding"

# Setup commands
setup: ## Setup environment files
	@echo "Setting up environment files..."
	@if [ ! -f back-end/.env ]; then cp back-end/.env.example back-end/.env; echo "Created back-end/.env"; fi
	@if [ ! -f front-end/.env ]; then cp front-end/.env.example front-end/.env; echo "Created front-end/.env"; fi
	@echo "Please configure the .env files with your settings"

# Quick development setup
quick-dev: setup dev ## Quick development setup (create .env files and start dev environment)

# Quick production setup  
quick-prod: setup prod ## Quick production setup (create .env files and start prod environment)
