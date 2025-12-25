# Docker Setup Guide for Balance Flow

This guide explains how to use Docker and Docker Compose to run Balance Flow in different environments.

## Prerequisites

- Docker Engine 20.10 or higher
- Docker Compose v2 (plugin version)

To check your versions:

```bash
docker --version
docker compose version
```

## File Structure

```
.
├── Dockerfile              # Multi-stage Docker build file
├── .dockerignore          # Files to exclude from Docker build context
├── compose.yml            # Base Docker Compose configuration
├── compose-dev.yml        # Development environment overrides
├── compose-prod.yml       # Production environment overrides
└── compose.override.yml   # Active override file (gitignored)
```

## Quick Start

### Development Environment

1. Copy the development override file:

```bash
cp compose-dev.yml compose.override.yml
```

2. Create environment file (optional):

```bash
cp .env.example .env.local
```

Edit `.env.local` if you need to customize `NEXT_PUBLIC_API_BASE_URL` or other environment variables.

3. Start the development server:

```bash
docker compose up
```

Or run in detached mode:

```bash
docker compose up -d
```

4. Access the application at http://localhost:3000

5. View logs:

```bash
docker compose logs -f app
```

6. Stop the containers:

```bash
docker compose down
```

### Production Environment

1. Copy the production override file:

```bash
cp compose-prod.yml compose.override.yml
```

2. Set production environment variables:

Create a `.env` file with production values:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.yourproduction.com
PORT=3000
```

3. Build and start the production server:

```bash
docker compose up --build -d
```

4. Access the application at http://localhost:3000 (or your configured PORT)

## Docker Compose Configuration

### Base Configuration (`compose.yml`)

Contains common settings shared across all environments:

- Container name and image
- Port mapping (default: 3000)
- Health checks
- Network configuration
- Common environment variables

### Development Override (`compose-dev.yml`)

Optimized for development workflow:

- **Hot Reload**: Source code is mounted as a volume for instant updates
- **Build Target**: Uses `builder` stage from Dockerfile
- **Command**: Runs `npm run dev`
- **No Health Check**: Faster startup
- **TTY**: Interactive terminal support
- **Debugging**: Port 9229 available (uncomment to use)

### Production Override (`compose-prod.yml`)

Optimized for production deployment:

- **Build Target**: Uses `runner` stage from Dockerfile (optimized image)
- **Resource Limits**: CPU and memory constraints
- **Restart Policy**: Always restart on failure
- **Logging**: JSON file driver with rotation
- **Security**: No new privileges
- **Command**: Runs `node server.js` (standalone Next.js)

## Docker Commands Reference

### Basic Operations

```bash
# Start services
docker compose up

# Start in detached mode
docker compose up -d

# Rebuild and start
docker compose up --build

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# View logs
docker compose logs -f app

# Execute commands inside container
docker compose exec app sh
```

### Development Commands

```bash
# Install new dependencies
docker compose exec app npm install <package-name>

# Run linting
docker compose exec app npm run lint

# Run format
docker compose exec app npm run format

# Access container shell
docker compose exec app sh
```

### Building Images

```bash
# Build development image
docker compose build

# Build production image (with override)
docker compose -f compose.yml -f compose-prod.yml build

# Build with no cache
docker compose build --no-cache
```

### Switching Environments

To switch between development and production:

```bash
# Switch to development
cp compose-dev.yml compose.override.yml
docker compose down
docker compose up --build

# Switch to production
cp compose-prod.yml compose.override.yml
docker compose down
docker compose up --build
```

## Dockerfile Architecture

The Dockerfile uses multi-stage builds for optimization:

### Stage 1: Dependencies (`deps`)

- Base: `node:20-alpine`
- Installs production dependencies only
- Uses `npm ci` for reproducible builds
- Cleans npm cache to reduce layer size

### Stage 2: Builder (`builder`)

- Installs all dependencies (including devDependencies)
- Copies source code
- Builds Next.js application
- Creates standalone output

### Stage 3: Runner (`runner`)

- Minimal runtime image
- Copies only necessary files from builder
- Runs as non-root user (nextjs)
- Optimized for production deployment

## Environment Variables

### Required Variables

- `NEXT_PUBLIC_API_BASE_URL`: Backend API URL (default: http://localhost:8080)

### Optional Variables

- `NODE_ENV`: Environment mode (development/production)
- `PORT`: Application port (default: 3000)
- `NEXT_TELEMETRY_DISABLED`: Disable Next.js telemetry (default: 1)

### Setting Environment Variables

**Option 1: Using .env file**

Create a `.env` file in the project root:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
PORT=3000
```

**Option 2: Using .env.local (for development)**

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

**Option 3: Inline with docker compose**

```bash
NEXT_PUBLIC_API_BASE_URL=http://api.example.com docker compose up
```

## Troubleshooting

### Hot Reload Not Working in Development

If file changes aren't being detected:

1. Ensure you're using the development override:

```bash
cp compose-dev.yml compose.override.yml
```

2. Restart the container:

```bash
docker compose down
docker compose up
```

### Port Already in Use

If port 3000 is already in use:

1. Change the port mapping in your `.env` file:

```bash
PORT=3001
```

2. Or edit `compose.override.yml`:

```yaml
ports:
    - '3001:3000'
```

### Build Errors

If you encounter build errors:

1. Clear Docker cache and rebuild:

```bash
docker compose down
docker compose build --no-cache
docker compose up
```

2. Check Node.js version compatibility (requires Node 18+)

### Permission Issues

If you encounter permission errors:

1. Ensure the `nextjs` user has proper permissions
2. Check volume mounts in development mode
3. Try removing the `.next` folder:

```bash
rm -rf .next
docker compose up --build
```

## Production Deployment Tips

1. **Environment Variables**: Never commit `.env` files. Use environment-specific files.

2. **Image Registry**: Push built images to a registry:

```bash
docker tag balance-flow:production your-registry.com/balance-flow:latest
docker push your-registry.com/balance-flow:latest
```

3. **Resource Limits**: Adjust CPU and memory limits in `compose-prod.yml` based on your needs.

4. **Logging**: Configure log rotation to prevent disk space issues.

5. **Health Checks**: Monitor container health and set up alerts.

6. **Reverse Proxy**: Use Nginx or Traefik as a reverse proxy in production.

## Advanced Usage

### Using with Docker Swarm

```bash
docker stack deploy -c compose.yml -c compose-prod.yml balance-flow
```

### Using with Kubernetes

Convert Docker Compose to Kubernetes manifests using Kompose:

```bash
kompose convert -f compose.yml -f compose-prod.yml
```

### Custom Override Files

You can create custom override files for different scenarios:

```bash
# Use custom override
docker compose -f compose.yml -f my-custom-override.yml up
```

## Support

For issues related to Docker setup, please check:

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- Project Issues: Check CLAUDE.md for project-specific guidelines
