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

export LOG_CHANNEL="stderr"
export APP_DEBUG="false"

# Inject DATABASE_URL into .env
if [ -n "$DATABASE_URL" ]; then
    echo "Configuring PostgreSQL..."
    sed -i '/^DB_CONNECTION=/d' .env
    sed -i '/^DATABASE_URL=/d' .env
    sed -i '/^DB_URL=/d' .env
    sed -i '/^DB_SSLMODE=/d' .env
    echo "DB_CONNECTION=pgsql" >> .env
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_URL=\"$DATABASE_URL\"" >> .env
    echo "DB_SSLMODE=require" >> .env

    php -r '
    $url = getenv("DATABASE_URL");
    if ($url) {
        $p = parse_url($url);
        $env = file_get_contents(".env");
        $env = preg_replace("/^#?\s*DB_HOST=.*/m", "DB_HOST=" . ($p["host"] ?? ""), $env);
        $env = preg_replace("/^#?\s*DB_PORT=.*/m", "DB_PORT=" . ($p["port"] ?? "5432"), $env);
        $env = preg_replace("/^#?\s*DB_DATABASE=.*/m", "DB_DATABASE=" . ltrim($p["path"] ?? "/postgres", "/"), $env);
        $env = preg_replace("/^#?\s*DB_USERNAME=.*/m", "DB_USERNAME=" . ($p["user"] ?? "postgres"), $env);
        $env = preg_replace("/^#?\s*DB_PASSWORD=.*/m", "DB_PASSWORD=\"" . ($p["pass"] ?? "") . "\"", $env);
        file_put_contents(".env", $env);
    }
    '
fi

# Fix permissions
chmod -R 775 storage bootstrap/cache database 2>/dev/null || true
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

# Clear and rebuild cache
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Run migrations
echo "Running migrations..."
php artisan migrate --force --seed -v || echo "Migration complete or already exists"

# Build production cache
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Create supervisor log directory
mkdir -p /var/log/supervisor

echo "Starting nginx + php-fpm via supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
