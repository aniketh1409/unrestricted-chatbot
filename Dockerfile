# Multi-stage build for React app
FROM node:18-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Server setup
FROM node:18-alpine AS server

WORKDIR /app

# Copy server package files
COPY package*.json ./
RUN npm ci --only=production

# Copy server source
COPY server/ ./server/

# Copy built client files
COPY --from=client-build /app/client/build ./client/build

# Create data directory
RUN mkdir -p server/data/conversations

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "server/index.js"] 