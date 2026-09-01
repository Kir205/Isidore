#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Fallback APP_KEY
if [ -z "$APP_KEY" ]; then
    export APP_KEY="base64:N32C4q8PkidWINHCyn8biLzO2QJM6Haf6n7oezmhXMQ="
fi
if ! grep -q "^APP_KEY=" .env; then
    echo "APP_KEY=$APP_KEY" >> .env
fi

# Enable stderr logging and debug
export LOG_CHANNEL="stderr"
export LOG_STACK="stderr"
export APP_DEBUG="true"

# Inject DATABASE_URL and DB_CONNECTION=pgsql into .env if present
if [ -n "$DATABASE_URL" ]; then
    echo "Configuring PostgreSQL from DATABASE_URL into .env..."
    sed -i '/^DB_CONNECTION=/d' .env
    sed -i '/^DATABASE_URL=/d' .env
    sed -i '/^DB_URL=/d' .env
    sed -i '/^DB_SSLMODE=/d' .env
    echo "DB_CONNECTION=pgsql" >> .env
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_SSLMODE=require" >> .env
fi

# Ensure storage write permissions
chmod -R 777 storage bootstrap/cache database 2>/dev/null || true

# Clear all cached configs
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations and seeders on startup
echo "Running database migrations..."
php artisan migrate --force --seed -v || echo "Migration encountered an issue"

# Start the Laravel application
PORT="${PORT:-10000}"
echo "Starting server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
