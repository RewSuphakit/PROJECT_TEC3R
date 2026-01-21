# Simple Node.js Dockerfile for servers
FROM node:20-alpine

# Install dependencies for native modules (sharp, bcrypt)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy application code
COPY . .

ENV PORT=8000

# Create uploads directories
RUN mkdir -p /app/uploads && mkdir -p /app/image_return

# Expose port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]
