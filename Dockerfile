# Stage 1: Development/Build Stage
ARG NODE_VERSION=18-alpine
FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++ && \
    npm ci && \
    apk del python3 make g++

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production Stage
FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Add a non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy necessary files from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "server.js"]