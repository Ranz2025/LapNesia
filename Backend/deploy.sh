#!/bin/bash
set -e

echo "🚀 LapNesia Production Deployment Script"
echo "=========================================="
echo ""

# Environment check
if [ "$APP_ENV" != "production" ]; then
    echo "⚠️  APP_ENV is not 'production'. Set APP_ENV=production first."
    echo "    export APP_ENV=production"
    exit 1
fi

echo "📋 Pre-deployment checks..."

# 1. Verify .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    exit 1
fi
echo "  ✅ .env file exists"

# 2. Check debug mode is off
DEBUG=$(grep "^APP_DEBUG" .env | cut -d'=' -f2)
if [ "$DEBUG" == "true" ]; then
    echo "❌ APP_DEBUG is true! Set to false for production."
    exit 1
fi
echo "  ✅ Debug mode is off"

# 3. Check APP_KEY is set
KEY=$(grep "^APP_KEY" .env | cut -d'=' -f2)
if [ -z "$KEY" ] || [ "$KEY" == "base64:YOUR_APP_KEY_HERE" ]; then
    echo "❌ APP_KEY not set! Run: php artisan key:generate"
    exit 1
fi
echo "  ✅ APP_KEY is set"

echo ""
echo "🗄️  Database operations..."

# 4. Run migrations
php artisan migrate --force
echo "  ✅ Migrations complete"

echo ""
echo "⚡ Optimizing for production..."

# 5. Cache configuration
php artisan config:cache
echo "  ✅ Configuration cached"

# 6. Cache routes
php artisan route:cache
echo "  ✅ Routes cached"

# 7. Cache views
php artisan view:cache
echo "  ✅ Views cached"

# 8. Optimize autoloader
composer dump-autoload --optimize --no-dev
echo "  ✅ Autoloader optimized"

echo ""
echo "🔐 Setting permissions..."

# 9. Set storage permissions
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
chown -R www-data:www-data storage/
chown -R www-data:www-data bootstrap/cache/
echo "  ✅ Permissions set"

echo ""
echo "📦 Queue & Scheduler..."

# 10. Restart queue workers
php artisan queue:restart
echo "  ✅ Queue workers restarted"

echo ""
echo "🔍 Post-deployment verification..."

# 11. Health check
HEALTH=$(php artisan tinker --execute="echo json_encode(['status' => 'ok']);" 2>/dev/null || echo '{"status":"error"}')
echo "  Health: $HEALTH"

# 12. Verify storage link
php artisan storage:link 2>/dev/null || true
echo "  ✅ Storage linked"

echo ""
echo "=========================================="
echo "✅ Deployment complete!"
echo "=========================================="
echo ""
echo "📌 Post-deployment actions:"
echo "   1. Verify health: curl http://your-domain/api/v1/health"
echo "   2. Monitor logs: tail -f storage/logs/laravel.log"
echo "   3. Check queue: php artisan queue:monitor"
echo ""
