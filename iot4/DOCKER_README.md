# Cardano IoT Example - Docker Setup

This directory contains a Docker Compose setup for the Cardano IoT Example application, which includes:

- **Server**: NestJS backend API (Port 8004)
- **Client**: Next.js frontend application (Port 3004)

## Prerequisites

- Docker and Docker Compose installed on your system
- Make sure ports 3004 and 8004 are available

## Environment Variables

Before running the application, you need to set up environment variables:

### Server Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```bash
APP_WALLET="your_wallet_mnemonic_here"
BLOCKFROST_API_KEY="your_blockfrost_api_key"
SERVER_PORT=8004
FRONT_END_HOST="http://localhost:3004"
```

### Client Environment Variables

Create a `.env.local` file in the `client` directory with:

```bash
NEXT_PUBLIC_API_ENDPOINT="http://localhost:8004/api"
```

## Running the Application

### Using Docker Compose (Recommended)

1. Clone the repository and navigate to the project root
2. Set up environment variables as described above
3. Run the following command:

```bash
docker-compose up --build
```

This will:
- Build both the server and client Docker images
- Start the containers
- Set up networking between them
- Make the applications available at:
  - Frontend: http://localhost:3004
  - Backend API: http://localhost:8004
  - API Documentation: http://localhost:8004/api

### Development Mode

For development with hot reloading, you can override the default commands:

```bash
# Run in development mode
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Running Individual Services

To run only specific services:

```bash
# Run only the server
docker-compose up server

# Run only the client
docker-compose up client
```

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Stop and remove everything (containers, networks, images)
docker-compose down --rmi all -v
```

## Building Individual Images

If you want to build images separately:

```bash
# Build server image
cd server
docker build -t cardano-iot-server .

# Build client image
cd client
docker build -t cardano-iot-client .
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3004 and 8004 are not in use
2. **Environment variables**: Ensure all required environment variables are set
3. **Docker permissions**: On Linux, you might need to run with `sudo`

### Logs

To view logs from the containers:

```bash
# View all logs
docker-compose logs

# View logs from specific service
docker-compose logs server
docker-compose logs client

# Follow logs in real-time
docker-compose logs -f
```

### Health Checks

Both services include health checks. You can check the status:

```bash
docker-compose ps
```

## Project Structure

```
├── docker-compose.yml          # Main Docker Compose configuration
├── server/
│   ├── Dockerfile             # Server Docker image definition
│   ├── .dockerignore          # Files to ignore in Docker build
│   └── ...                    # NestJS application files
├── client/
│   ├── Dockerfile             # Client Docker image definition
│   ├── .dockerignore          # Files to ignore in Docker build
│   └── ...                    # Next.js application files
└── README.md                  # This file
```

## Production Deployment

For production deployment, consider:

1. Using environment-specific Docker Compose files
2. Setting up proper secrets management
3. Configuring reverse proxy (nginx, traefik)
4. Setting up SSL certificates
5. Implementing proper logging and monitoring
6. Using Docker Swarm or Kubernetes for orchestration