# Docker Setup for Cardano IoT Temperature Monitoring System

This directory contains Docker configurations to run the entire Cardano IoT Temperature Monitoring System using containers.

## 📋 Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository

## 🏗️ Architecture

The Docker setup includes:
- **Backend**: NestJS API server with Cardano blockchain integration
- **Frontend**: Next.js web application for monitoring dashboard
- **Redis**: In-memory cache for temporary data storage
- **Nginx**: Reverse proxy for production deployment (prod only)

## 🚀 Quick Start

### Development Environment

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd cardano-iot-example/iot1
   ```

2. **Configure Environment Variables**
   ```bash
   # Backend configuration
   cp back-end/.env.example back-end/.env
   # Edit back-end/.env with your settings:
   # - BLOCKFROST_API_KEY: Your Blockfrost API key
   # - APP_WALLET: Your wallet mnemonic phrase
   
   # Frontend configuration
   cp front-end/.env.example front-end/.env
   # Edit front-end/.env with your settings (optional for development)
   ```

3. **Start Development Environment**
   ```bash
   docker-compose up -d
   ```

4. **Access the Application**
   - **Frontend**: http://localhost:3001
   - **Backend API**: http://localhost:3000
   - **Redis**: localhost:6379

### Production Environment

1. **Build and Deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

2. **Access the Application**
   - **Application**: http://localhost (via Nginx)
   - **Direct Backend**: http://localhost:3000
   - **Direct Frontend**: http://localhost:3001

## 📁 File Structure

```
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── nginx.conf                   # Nginx configuration
├── back-end/
│   ├── Dockerfile              # Development Dockerfile
│   └── Dockerfile.prod         # Production Dockerfile
└── front-end/
    ├── Dockerfile              # Development Dockerfile
    └── Dockerfile.prod         # Production Dockerfile
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Required
BLOCKFROST_API_KEY=your_blockfrost_api_key
APP_WALLET=your_mnemonic_phrase_words

# Optional
APP_CACHE_KEY=temperature_cache
ALLOWED_TIME_OFFSET=3000
CRON_EXPRESSION=0 */5 * * * *
```

#### Frontend (.env)
```env
# Development (auto-configured in Docker)
NEXT_PUBLIC_API_ENDPOINT=http://localhost:3000
NEXT_PUBLIC_WEBSOCKET=http://localhost:3000

# Production (customize as needed)
NEXT_PUBLIC_API_ENDPOINT=http://your-domain.com/api
NEXT_PUBLIC_WEBSOCKET=http://your-domain.com
```

### Docker Compose Services

#### Development (`docker-compose.yml`)
- **Hot reload**: Code changes reflect immediately
- **Volume mounts**: Source code mounted for development
- **Debug friendly**: All logs visible

#### Production (`docker-compose.prod.yml`)
- **Optimized builds**: Multi-stage builds for smaller images
- **Nginx proxy**: Single entry point with load balancing
- **Security**: Non-root users, minimal attack surface

## 🛠️ Development Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d backend
docker-compose up -d frontend

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Development Tasks
```bash
# Install dependencies (if package.json changes)
docker-compose exec backend bun install
docker-compose exec frontend bun install

# Build smart contracts
docker-compose exec backend bun run build:contract

# Run tests
docker-compose exec backend bun run test
docker-compose exec backend bun run test:e2e

# Check smart contracts
docker-compose exec backend aiken check
```

### Database and Cache
```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Clear Redis cache
docker-compose exec redis redis-cli FLUSHALL
```

## 🏭 Production Deployment

### Build Images
```bash
# Build all production images
docker-compose -f docker-compose.prod.yml build

# Build specific image
docker-compose -f docker-compose.prod.yml build backend
docker-compose -f docker-compose.prod.yml build frontend
```

### Deploy
```bash
# Deploy production environment
docker-compose -f docker-compose.prod.yml up -d

# Update specific service
docker-compose -f docker-compose.prod.yml up -d --no-deps backend
```

### Health Checks
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View service logs
docker-compose -f docker-compose.prod.yml logs -f

# Check container health
docker inspect <container_name> | grep -A 5 "Health"
```

## 🔍 Monitoring and Debugging

### Container Management
```bash
# List running containers
docker ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend bash

# View container logs
docker logs <container_name> -f

# Monitor resource usage
docker stats
```

### Network Debugging
```bash
# Test internal connectivity
docker-compose exec frontend curl http://backend:3000/api/health
docker-compose exec backend curl http://frontend:3001

# Check network configuration
docker network ls
docker network inspect iot1_iot-network
```

### Volume Management
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect iot1_redis_data

# Backup Redis data
docker run --rm -v iot1_redis_data:/data alpine tar czf - /data
```

## 🚨 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Or use different ports in docker-compose.yml
```

#### Permission Issues
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Reset Docker volumes
docker-compose down -v
docker-compose up -d
```

#### Container Won't Start
```bash
# Check logs
docker-compose logs <service_name>

# Rebuild image
docker-compose build --no-cache <service_name>

# Reset everything
docker-compose down -v --remove-orphans
docker-compose up -d
```

#### Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Clean Docker cache
docker system prune -a
docker volume prune
```

### Performance Optimization

#### Development
- Use `.dockerignore` to exclude unnecessary files
- Enable BuildKit for faster builds: `DOCKER_BUILDKIT=1`
- Use multi-stage builds for production

#### Production
- Configure resource limits in docker-compose.prod.yml
- Use health checks for service monitoring
- Implement proper logging and monitoring

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files with sensitive data
- Use Docker secrets for production deployments
- Rotate API keys and credentials regularly

### Network Security
- Use custom networks to isolate services
- Implement proper firewall rules
- Use HTTPS in production with SSL certificates

### Container Security
- Run containers as non-root users
- Keep base images updated
- Scan images for vulnerabilities

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/recipes/docker)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

## 🆘 Support

For Docker-specific issues:
1. Check container logs: `docker-compose logs <service>`
2. Verify environment variables
3. Test network connectivity between services
4. Check resource usage: `docker stats`

For application issues, refer to the main project README.md.
