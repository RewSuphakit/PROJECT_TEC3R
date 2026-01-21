# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

# Install build dependencies for native modules (sharp, bcrypt)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

# Install runtime dependencies for sharp
RUN apk add --no-cache vips

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory (for file uploads via multer)
RUN mkdir -p /app/uploads && mkdir -p /app/image_return

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start the server
CMD ["node", "index.js"]

# ================================
# Stage 3: Development
# ================================
FROM node:20-alpine AS development

# Install build dependencies for native modules (sharp, bcrypt)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies
RUN npm ci

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && mkdir -p /app/image_return

# Set environment
ENV NODE_ENV=development
ENV PORT=8000

# Expose port
EXPOSE 8000

# Start the server with nodemon for hot-reload
CMD ["npx", "nodemon", "index.js"]
