# Step 1: Build the app
FROM node:24-alpine AS builder

WORKDIR /app

# Copy package config first to leverage caching
COPY package*.json ./

# Install development dependencies to run tsc
RUN npm ci

# Copy tsconfig.json and source code
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript
RUN npm run build

# Step 2: Runtime environment
FROM node:20-alpine AS runner

WORKDIR /app

# Define production environment
ENV NODE_ENV=production

# Copy package config and lockfile
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy compiled files from build stage
COPY --from=builder /app/dist ./dist

# Expose port (default is 3000, can be overridden by PORT env)
EXPOSE 3000

# Start server
CMD ["npm", "start"]
