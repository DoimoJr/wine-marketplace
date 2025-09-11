# Multi-stage build for Next.js Admin App
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml ./
COPY pnpm-lock.yaml ./
COPY package.json ./

# Copy shared packages
COPY packages/shared ./packages/shared
COPY packages/ui ./packages/ui

# Copy admin app source
COPY apps/admin ./apps/admin

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages first
RUN pnpm --filter shared build
RUN pnpm --filter ui build

# Build admin app
RUN pnpm --filter admin build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy built application
COPY --from=base /app/apps/admin/.next/standalone ./
COPY --from=base /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=base /app/apps/admin/public ./apps/admin/public

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "apps/admin/server.js"]