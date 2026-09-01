#!/bin/sh
set -e

# Sync DATABASE_URL and DB_URL
if [ -n "$DATABASE_URL" ]; then
    export DB_URL="$DATABASE_URL"
    export DB_CONNECTION="pgsql"
fi

# Ensure APP_KEY exists
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Clear old caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations and seeders on startup
echo "Running database migrations on $DB_CONNECTION..."
php artisan migrate --force --seed || echo "Migration encountered an issue, check Supabase credentials"

# Start the Laravel application
PORT="${PORT:-10000}"
echo "Starting server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
