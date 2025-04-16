# Stage 1: Development/Build Stage
ARG NODE_VERSION=18-slim
FROM node:${NODE_VERSION} AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install necessary build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 make g++ && \
    npm ci && \
    apt-get remove -y python3 make g++ && \
    apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production Stage
FROM node:${NODE_VERSION} AS runner

# Set working directory
WORKDIR /app

# Add a non-root user
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
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