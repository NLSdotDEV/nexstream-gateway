# Stage 1: Build the TypeScript application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy configuration and source files
COPY tsconfig.json ./
COPY src/ ./src/

# Build the project (TypeScript to JavaScript compilation)
RUN npm run build

# Stage 2: Production runtime environment
FROM node:20-alpine AS runner

# Create a dedicated, non-root system user and group for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Define production environment
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the compiled distribution from the builder stage
COPY --from=builder /app/dist ./dist

# Change directory ownership to the non-privileged user
RUN chown -R appuser:appgroup /app

# Expose the internal port the gateway listens on
EXPOSE 3000

# Set the active user to the non-privileged appuser
USER appuser

# Health check to ensure the gateway service is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/get.php').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the application
CMD ["npm", "start"]
