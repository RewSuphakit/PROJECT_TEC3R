# Simple Node.js Dockerfile for servers
FROM node:20-alpine

# Install build dependencies for native modules (sharp, bcrypt)
RUN apk add --no-cache python3 make g++ vips-dev

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]
