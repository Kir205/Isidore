#!/bin/sh
set -e

# Default Fallback APP_KEY if not supplied in Render environment
if [ -z "$APP_KEY" ]; then
    export APP_KEY="base64:N32C4q8PkidWINHCyn8biLzO2QJM6Haf6n7oezmhXMQ="
fi

# Enable stderr logging so Render logs show all details
export LOG_CHANNEL="stderr"
export APP_DEBUG="true"

# Sync DATABASE_URL and DB_URL
if [ -n "$DATABASE_URL" ]; then
    export DB_URL="$DATABASE_URL"
    export DB_CONNECTION="pgsql"
    export DB_SSLMODE="require"
fi

# Ensure storage write permissions
chmod -R 777 storage bootstrap/cache database 2>/dev/null || true

# Clear old caches
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations and seeders on startup
echo "Running database migrations on $DB_CONNECTION..."
php artisan migrate --force --seed || echo "Migration encountered an issue"

# Start the Laravel application
PORT="${PORT:-10000}"
echo "Starting server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
