# Simple Node.js Dockerfile for client
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy application code
COPY . .

# Expose Vite dev server port
EXPOSE 4000

# Start the Vite dev server
CMD ["npm", "run", "dev"]
