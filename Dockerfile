FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    sqlite3 \
    libsqlite3-dev \
    libpq-dev \
    nodejs \
    npm \
    && docker-php-ext-install pdo pdo_sqlite pdo_pgsql pcntl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy composer files and install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy package files and install Node dependencies + build
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# Copy the rest of the application
COPY . .

# Run composer scripts (post-autoload-dump etc.)
RUN composer dump-autoload --optimize

# Build frontend assets
RUN npm run build

# Create SQLite database directory and file
RUN mkdir -p database && touch database/database.sqlite

# Create storage directories
RUN mkdir -p storage/framework/{cache,sessions,views} \
    && mkdir -p storage/logs \
    && mkdir -p bootstrap/cache

# Set permissions
RUN chmod -R 775 storage bootstrap/cache database

# Generate .env if it doesn't exist, set key, and run migrations + seed
RUN cp .env.example .env \
    && php artisan key:generate \
    && php artisan config:cache \
    && php artisan migrate --force --seed

EXPOSE ${PORT:-8080}

CMD php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
