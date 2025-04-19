# Stage 1: Development/Build Stage
FROM node:18.19-alpine3.18 AS builder

# Set working directory
WORKDIR /app

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all project files
COPY . .

# Build the Next.js application
RUN npm run build

# Stage 2: Production Stage
FROM node:18.19-alpine3.18 AS runner

# Set working directory
WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user and switch to it
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && chown -R nextjs:nodejs /app

# Add image labels
LABEL org.opencontainers.image.title="EasyShop Application" \
      org.opencontainers.image.description="Modern E-commerce Platform built with Next.js" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.vendor="EasyShop" \
      org.opencontainers.image.created="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
      org.opencontainers.image.source="https://github.com/yourusername/tws-e-commerce-app"

# Expose the port the app runs on
EXPOSE 3000

# Switch to non-root user
USER nextjs

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Command to run the application
CMD ["node", "server.js"] 