FROM oven/bun:latest as base

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY tsconfig.json ./

# Generate Prisma client
RUN bunx prisma generate

# Build the application
RUN bun build ./src/index.ts --outdir ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["bun", "run", "src/index.ts", "--watch"]
