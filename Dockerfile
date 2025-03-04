# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package files first (for caching)
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files and build
COPY . .
# Define build argument and set env var for build time
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Set non-root user explicitly (optional, aligns with node:18-alpine defaults)
USER node

# Set runtime environment variables
ENV NODE_ENV=production
# Pass NEXT_PUBLIC_API_URL as an ARG again for runtime (defaults to build-time value if not overridden)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Copy necessary files from builder (ensure ownership matches 'node' user)
COPY --from=builder --chown=node:node /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json

# Install pnpm in the runner stage (minimal install for runtime)
RUN npm install -g pnpm

# Expose port
EXPOSE 3000

# Add a healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the app with pnpm (assuming 'start' is defined in package.json for Next.js)
CMD ["pnpm", "start"]