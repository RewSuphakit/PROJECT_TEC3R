# Production Dockerfile for client
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm i

# Copy application code
COPY . .

# Build for production
RUN npm run build

# Expose port
EXPOSE 4000

# Serve the production build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
