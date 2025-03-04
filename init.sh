#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 5

# Run migrations
echo "Running database migrations..."
bunx prisma migrate deploy

# Optional: Seed database with initial data if needed
# echo "Seeding database..."
# bunx prisma db seed

echo "Database initialization completed!"
