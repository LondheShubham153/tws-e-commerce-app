# EasyShop Docker Configuration

This directory contains Docker configurations for running the EasyShop e-commerce application in both development and production environments.

## Quick Start

### Development Environment

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up

# Start in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Stop the development environment
docker-compose -f docker-compose.dev.yml down
```

### Production Environment

```bash
# Start the production stack
docker-compose up -d

# Stop the production stack
docker-compose down

# View logs
docker-compose logs -f app
```

## Docker Files

| File | Description |
|------|-------------|
| `Dockerfile` | Production build configuration with multi-stage build for optimized image size |
| `Dockerfile.dev` | Development configuration with hot-reloading support |
| `docker-compose.yml` | Production stack with MongoDB, app service, and monitoring tools |
| `docker-compose.dev.yml` | Development stack with volume mounts for live code updates |
| `.dockerignore` | Specifies files to exclude from Docker builds |

## Environment Configuration

The application requires environment variables to run properly. For local development:

1. Create a `.env.local` file in the project root with the required variables:

```
# Required environment variables
MONGODB_URI=mongodb://mongodb:27017/easyshop
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional variables
MONGO_USERNAME=admin
MONGO_PASSWORD=password
```

## Architecture

The Docker setup includes:

### Development Stack

- **MongoDB**: NoSQL database running on port 27017
- **App Service**: Next.js application with hot-reloading on port 3000

### Production Stack

- **MongoDB**: Primary database with persistence
- **MongoDB Exporter**: Exports MongoDB metrics for monitoring
- **Migration Service**: Handles database schema and seed data
- **App Service**: Optimized Next.js application
- **Prometheus**: Metrics collection and storage
- **Grafana**: Visualization and dashboards (available on port 3001)

## Building Images

```bash
# Build the production image
docker build -t easyshop-app:latest -f Dockerfile ..

# Build the development image
docker build -t easyshop-app:dev -f Dockerfile.dev ..
```

## Volumes

The configuration uses Docker volumes for data persistence:

- `mongodb_data`: MongoDB database files
- `mongodb_config`: MongoDB configuration
- `prometheus_data`: Prometheus metrics storage
- `grafana_data`: Grafana dashboards and settings

## Networks

Services are connected through dedicated Docker networks:

- `easyshop-network`: Production network
- `easyshop-dev-network`: Development network

## Health Checks

All services include health checks to ensure proper initialization:

- MongoDB: Checks database connectivity
- App Service: Verifies API endpoint availability

## Monitoring

The production stack includes monitoring tools:

- **Prometheus**: Access on http://localhost:9090
- **Grafana**: Access on http://localhost:3001 (default credentials: admin/admin)

## Troubleshooting

### Common Issues

1. **MongoDB connection errors**:
   - Check if the MongoDB container is running: `docker ps`
   - Verify the connection string in your environment variables

2. **Port conflicts**:
   - Ensure ports 3000, 3001, 9090, and 27017 are not in use by other applications
   - Change the port mapping in docker-compose files if needed

3. **Volume permission issues**:
   - Run `docker-compose down -v` to remove volumes and recreate them

4. **Changes not reflecting in development**:
   - Ensure volume mounts are correctly configured
   - Check that the file is not in .dockerignore

### Viewing Logs

```bash
# View logs for a specific service
docker-compose logs -f app

# View logs for all services
docker-compose logs -f
```

## Performance Optimization

- The production Dockerfile uses multi-stage builds to minimize image size
- Node.js is configured to run in production mode for optimal performance
- MongoDB uses persistent volumes for data integrity 