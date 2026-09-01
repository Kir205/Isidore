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

# Inject DATABASE_URL and parse credentials into .env
if [ -n "$DATABASE_URL" ]; then
    echo "Parsing DATABASE_URL into .env..."
    sed -i '/^DB_CONNECTION=/d' .env
    sed -i '/^DATABASE_URL=/d' .env
    sed -i '/^DB_URL=/d' .env
    sed -i '/^DB_SSLMODE=/d' .env
    echo "DB_CONNECTION=pgsql" >> .env
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_SSLMODE=require" >> .env

    # Explicitly parse components into .env variables
    php -r '
    $url = getenv("DATABASE_URL");
    if ($url) {
        $p = parse_url($url);
        $host = $p["host"] ?? "";
        $port = $p["port"] ?? "5432";
        $user = $p["user"] ?? "postgres";
        $pass = $p["pass"] ?? "";
        $db   = ltrim($p["path"] ?? "/postgres", "/");
        $env = file_get_contents(".env");
        $env = preg_replace("/^#?\s*DB_HOST=.*/m", "DB_HOST=$host", $env);
        $env = preg_replace("/^#?\s*DB_PORT=.*/m", "DB_PORT=$port", $env);
        $env = preg_replace("/^#?\s*DB_DATABASE=.*/m", "DB_DATABASE=$db", $env);
        $env = preg_replace("/^#?\s*DB_USERNAME=.*/m", "DB_USERNAME=$user", $env);
        $env = preg_replace("/^#?\s*DB_PASSWORD=.*/m", "DB_PASSWORD=\"$pass\"", $env);
        file_put_contents(".env", $env);
    }
    '
fi

# Ensure storage write permissions
chmod -R 777 storage bootstrap/cache database 2>/dev/null || true

# Clear all cached configs
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run database migrations and seeders on startup
echo "Running database migrations on PostgreSQL..."
php artisan migrate --force --seed -v || echo "Migration encountered an issue"

# Start the Laravel application
PORT="${PORT:-10000}"
echo "Starting server on port $PORT..."
exec php artisan serve --host=0.0.0.0 --port="$PORT"
