#!/bin/bash

# Cardano IoT Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed"
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "back-end/.env" ]; then
        if [ -f "back-end/.env.example" ]; then
            cp "back-end/.env.example" "back-end/.env"
            print_warning "Created back-end/.env from example. Please configure your settings."
        else
            print_error "back-end/.env.example not found"
            exit 1
        fi
    else
        print_success "back-end/.env already exists"
    fi
    
    # Frontend environment
    if [ ! -f "front-end/.env" ]; then
        if [ -f "front-end/.env.example" ]; then
            cp "front-end/.env.example" "front-end/.env"
            print_success "Created front-end/.env from example"
        else
            print_error "front-end/.env.example not found"
            exit 1
        fi
    else
        print_success "front-end/.env already exists"
    fi
}

# Start development environment
start_dev() {
    print_status "Starting development environment..."
    setup_env
    docker-compose up -d
    print_success "Development environment started!"
    echo
    print_status "Services are available at:"
    echo "  Frontend: http://localhost:3001"
    echo "  Backend:  http://localhost:3000"
    echo "  Redis:    localhost:6379"
    echo
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Start production environment
start_prod() {
    print_status "Starting production environment..."
    setup_env
    docker-compose -f docker-compose.prod.yml up -d
    print_success "Production environment started!"
    echo
    print_status "Application is available at:"
    echo "  Main App: http://localhost"
    echo "  Backend:  http://localhost:3000"
    echo "  Frontend: http://localhost:3001"
    echo
    print_status "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
    print_status "To stop: docker-compose -f docker-compose.prod.yml down"
}

# Stop services
stop_services() {
    print_status "Stopping services..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_success "Services stopped"
}

# View logs
show_logs() {
    local service=${1:-""}
    if [ -n "$service" ]; then
        print_status "Showing logs for $service..."
        docker-compose logs -f "$service"
    else
        print_status "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Build images
build_images() {
    local env=${1:-"dev"}
    if [ "$env" = "prod" ]; then
        print_status "Building production images..."
        docker-compose -f docker-compose.prod.yml build
    else
        print_status "Building development images..."
        docker-compose build
    fi
    print_success "Images built successfully"
}

# Clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v --remove-orphans
    docker-compose -f docker-compose.prod.yml down -v --remove-orphans 2>/dev/null || true
    docker system prune -f
    print_success "Cleanup completed"
}

# Show status
show_status() {
    print_status "Docker services status:"
    docker-compose ps
    echo
    docker-compose -f docker-compose.prod.yml ps 2>/dev/null || true
}

# Show help
show_help() {
    echo "Cardano IoT Docker Management Script"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  dev          Start development environment"
    echo "  prod         Start production environment"
    echo "  stop         Stop all services"
    echo "  restart      Restart services"
    echo "  logs [service]  Show logs (optionally for specific service)"
    echo "  build [env]  Build images (dev/prod)"
    echo "  status       Show services status"
    echo "  cleanup      Clean up Docker resources"
    echo "  setup        Setup environment files only"
    echo "  help         Show this help message"
    echo
    echo "Examples:"
    echo "  $0 dev              # Start development environment"
    echo "  $0 logs backend     # Show backend logs"
    echo "  $0 build prod       # Build production images"
}

# Main script logic
main() {
    check_docker
    
    case "${1:-help}" in
        "dev"|"development")
            start_dev
            ;;
        "prod"|"production")
            start_prod
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 2
            start_dev
            ;;
        "logs")
            show_logs "$2"
            ;;
        "build")
            build_images "$2"
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "setup")
            setup_env
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_help
            exit 1
            ;;
    esac
}

main "$@"
