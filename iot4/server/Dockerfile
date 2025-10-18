<<<<<<< HEAD
# Use Node.js 18 LTS as base image
FROM node:18-alpine AS base
=======
# Use Node.js 20 Alpine as base image
FROM node:20-alpine
>>>>>>> 5046dc447137b5eebd79f96be31b52c5ff623c62

# Set working directory
WORKDIR /app

<<<<<<< HEAD
# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:18-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 8004
CMD ["npm", "run", "start:dev"]

# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
=======
# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 8004
>>>>>>> 5046dc447137b5eebd79f96be31b52c5ff623c62

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

<<<<<<< HEAD
# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 8004

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "require('http').get('http://localhost:8004/api', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

=======
# Change ownership of the app directory
RUN chown -R nestjs:nodejs /app
USER nestjs

>>>>>>> 5046dc447137b5eebd79f96be31b52c5ff623c62
# Start the application
CMD ["npm", "run", "start:prod"]