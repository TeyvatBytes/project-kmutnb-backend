# Use Bun base image
FROM oven/bun:1.2-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock tsconfig.json ./

# Copy source code
COPY . /app

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bun run prisma generate

# Build the application (if needed)
RUN bun build ./src/index.ts --target bun --outdir ./dist

# Create production image
FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy built application and necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./


# Set environment variables
ENV NODE_ENV=production

# Create a non-root user
# RUN addgroup --system --gid 1001 nodejs && \
#     adduser --system --uid 1001 worker

# # Set ownership
# RUN chown -R worker:nodejs /app

# # Switch to non-root user
# USER worker

# Command to run the worker
CMD ["bun", "run", "./dist/index.js"]
