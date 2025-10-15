# Cardano IoT Example - Docker Setup

This project consists of a NestJS backend server and a Next.js frontend client, both containerized with Docker.

## Project Structure

```
iot4/
├── server/           # NestJS backend API
├── client/           # Next.js frontend
├── docker-compose.yml
├── docker-compose.dev.yml
└── DOCKER_README.md
```

## Prerequisites

- Docker Desktop (version 20.10+)
- Docker Compose (version 2.0+)

## Quick Start

### Production Build

1. **Build and start both services:**
   ```bash
   docker-compose up --build
   ```

2. **Access the applications:**
   - Frontend: http://localhost:3004
   - Backend API: http://localhost:8004
   - API Documentation: http://localhost:8004/api

3. **Stop the services:**
   ```bash
   docker-compose down
   ```

### Development Mode

For development with hot reloading:

```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Or use the profile approach:

```bash
docker-compose --profile dev up --build
```

This will:
- Start development containers with source code mounted as volumes
- Enable hot reloading for both services
- Server available at: http://localhost:8005
- Client available at: http://localhost:3005

## Individual Service Commands

### Server Only

```bash
# Build server image
docker build -t cardano-iot-server ./server

# Run server container
docker run -p 8004:8004 --env-file ./server/.env cardano-iot-server
```

### Client Only

```bash
# Build client image
docker build -t cardano-iot-client ./client

# Run client container
docker run -p 3004:3004 -e NEXT_PUBLIC_API_ENDPOINT=http://localhost:8004 cardano-iot-client
```

## Environment Variables

### Server (.env)
```
APP_WALLET=abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon beef crack
BLOCKFROST_API_KEY=preprodKHoPHW2dEwEipSjarMNsnA5oAWPSTZgM
SERVER_PORT=8004
FRONT_END_HOST=http://localhost:3004
```

### Client (.env.local)
```
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8004
```

## Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| server | 8004 | NestJS API server with Swagger docs at /api |
| client | 3004 | Next.js frontend application |
| server-dev | 8005 | Development server with hot reload |
| client-dev | 3005 | Development client with hot reload |

## Health Checks

Both services include health checks:
- **Server**: Checks the `/api` endpoint
- **Client**: Checks the root endpoint

## Networking

Services communicate through a custom Docker network (`cardano-iot-network`) which allows:
- Internal service-to-service communication
- Proper dependency management (client waits for server to be healthy)

## Volume Mounts (Development)

In development mode, source code is mounted as read-only volumes:
- `./server/src:/app/src:ro`
- `./client/src:/app/src:ro`
- `./client/public:/app/public:ro`

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3004 and 8004 are not used by other applications
2. **Build failures**: Clear Docker cache with `docker system prune -a`
3. **Environment variables**: Verify all required environment variables are set

### Logs

View logs for specific services:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs server
docker-compose logs client

# Follow logs in real-time
docker-compose logs -f server
```

### Cleanup

Remove all containers, networks, and volumes:
```bash
docker-compose down -v --rmi all
```

## Multi-stage Builds

Both Dockerfiles use multi-stage builds:

- **Development**: Includes dev dependencies and enables hot reloading
- **Production**: Optimized images with only production dependencies
- **Build**: Separate build stage for compilation

This approach provides:
- Smaller production images
- Faster development cycles
- Better security (no dev tools in production)

## Security Features

- Non-root user execution in containers
- Minimal base images (Alpine Linux)
- Health checks for monitoring
- Proper file permissions and ownership