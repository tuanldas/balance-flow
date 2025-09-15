# Multi-stage Dockerfile for Next.js (Node 22) with standalone output

# Base image
FROM node:22-alpine AS base

# System deps (improves compatibility for some native modules)
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Install dependencies only (production pipeline)
FROM base AS deps

# Copy lockfiles
COPY package.json package-lock.json ./

# Install with clean reproducible env for PROD
RUN npm ci

# Build the app (production)
FROM base AS builder
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

WORKDIR /app

# Reuse installed deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Build Next.js app (standalone)
RUN npm run build

# Production runtime image
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Create non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
WORKDIR /app

# Copy the standalone output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Start the server
CMD ["node", "server.js"]

# Development image (with bash for interactive exec)
FROM node:22 AS dev
ENV NODE_ENV=development
WORKDIR /app

# Install bash and useful tooling
RUN apt-get update && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# Use npm install in DEV to allow updating packages
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
