#!/bin/sh
set -e

# Clear and rebuild cache with runtime environment variables
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations and seeders on startup
echo "Running database migrations..."
php artisan migrate --force --seed || echo "Migration skipped or failed"

# Start the Laravel application
PORT="${PORT:-10000}"
echo "Starting server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
