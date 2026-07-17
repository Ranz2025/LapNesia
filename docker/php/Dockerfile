FROM php:8.3-fpm AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libmcrypt-dev \
    libonig-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    zip \
    unzip \
    git \
    wget \
    default-mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg
RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd xml curl opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/backend

# --- DEV STAGE ---
FROM base AS dev
RUN pecl install xdebug && docker-php-ext-enable xdebug
# Code will be mounted as volume
CMD ["php-fpm"]

# --- PROD STAGE ---
FROM base AS prod
COPY Backend/ .
RUN composer install --optimize-autoloader --no-dev
RUN chown -R www-data:www-data /var/www/backend/storage /var/www/backend/bootstrap/cache
CMD ["php-fpm"]
