# LAPNESIA DOCKER SETUP — PHASE 2 IMPLEMENTATION
**Date:** 2026-07-14  
**Status:** ✅ COMPLETE

---

## DOCKER INFRASTRUCTURE

### Services Configured

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| app | php:8.3-fpm | 9000 | Laravel application |
| nginx | nginx:alpine | 80, 443 | Web server, reverse proxy |
| db | mariadb:10.6 | 3306 | MySQL database |
| redis | redis:7-alpine | 6379 | Cache & queue broker |
| queue | php:8.3-fpm | — | Background job worker |

---

## FILES CREATED

### Docker Compose
**File:** `docker-compose.yml`
- ✅ 5 services configured
- ✅ Volume management (persistent data)
- ✅ Network isolation
- ✅ Environment variables
- ✅ Health checks
- ✅ Dependencies defined

### Application Container
**File:** `Dockerfile`
- ✅ PHP 8.3-FPM base
- ✅ System dependencies installed
- ✅ PHP extensions: pdo, mysql, redis, bcmath, gd, xml
- ✅ Composer installed
- ✅ Health check configured
- ✅ Permissions set

### Web Server
**File:** `docker/nginx/conf.d/default.conf`
- ✅ HTTP server on port 80
- ✅ Security headers configured
- ✅ Gzip compression enabled
- ✅ Static asset caching
- ✅ PHP-FPM upstream configured
- ✅ SSL configuration ready (commented)

### Database
**File:** `docker/mysql/my.cnf`
- ✅ Performance tuning
- ✅ InnoDB optimizations
- ✅ Connection pool (1000 max)
- ✅ Buffer pool (256MB)
- ✅ Slow query logging
- ✅ Character set: utf8mb4

### Configuration
**File:** `Backend/.env.example`
- ✅ Database credentials
- ✅ Redis configuration
- ✅ Cache driver
- ✅ Queue connection
- ✅ Midtrans payment settings
- ✅ Sentry error tracking (ready for Phase 4)

### Startup Script
**File:** `docker-start.sh`
- ✅ Environment setup
- ✅ Service startup
- ✅ Database migrations
- ✅ Cache optimization
- ✅ Permissions management

---

## QUICK START

### 1. Initial Setup

```bash
# Copy environment configuration
cp Backend/.env.example Backend/.env

# Edit .env with your settings
vim Backend/.env
```

### 2. Start Services

```bash
# On Windows with Git Bash / WSL:
bash docker-start.sh

# Or manually:
docker-compose up -d
```

### 3. Verify Services

```bash
docker-compose ps
```

### 4. Check Logs

```bash
docker-compose logs -f app
```

---

## ENVIRONMENT VARIABLES

**Critical Settings:**
```env
APP_KEY=base64:YOUR_KEY_HERE  # Generate with: php artisan key:generate
DB_PASSWORD=secure_password    # Must be strong
REDIS_PASSWORD=redis_password  # Must be strong
```

**Optional Settings:**
```env
MIDTRANS_SERVER_KEY=...
MIDTRANS_CLIENT_KEY=...
SENTRY_LARAVEL_DSN=...
```

---

## USEFUL DOCKER COMMANDS

### Container Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f app

# Shell into app container
docker-compose exec app bash

# Run artisan commands
docker-compose exec app php artisan migrate
docker-compose exec app php artisan seed:run
```

### Database Management
```bash
# MySQL shell
docker-compose exec db mysql -u root -p

# Database backup
docker-compose exec db mysqldump -u root -p lapnesia > backup.sql

# Database restore
docker-compose exec -T db mysql -u root -p lapnesia < backup.sql
```

### Queue Monitoring
```bash
# Watch queue worker logs
docker-compose logs -f queue

# Monitor queue jobs
docker-compose exec app php artisan queue:monitor
```

### Performance Testing
```bash
# Check container resource usage
docker stats

# Load test
docker-compose exec app php artisan tinker
> \Illuminate\Support\Facades\Http::get('http://localhost/api/v1/products')->json()
```

---

## PRODUCTION DEPLOYMENT

### Configuration for Production
```env
APP_ENV=production
APP_DEBUG=false
DB_HOST=production-db-server
REDIS_HOST=production-redis-server
LOG_CHANNEL=sentry
```

### Production Docker Build
```bash
# Build optimized image
docker build -t lapnesia:1.0 --build-arg APP_ENV=production .

# Push to registry
docker push lapnesia:1.0
```

### SSL/TLS Setup (Production)
1. Generate or obtain certificates (Let's Encrypt recommended)
2. Place in `docker/nginx/ssl/`
3. Uncomment HTTPS block in `docker/nginx/conf.d/default.conf`
4. Update `docker-compose.yml` to mount certificates

---

## TROUBLESHOOTING

### Issue: Database connection refused
```bash
# Check if db service is running
docker-compose ps db

# Check db logs
docker-compose logs db

# Wait longer for db to initialize
sleep 30 && docker-compose up -d
```

### Issue: Redis connection refused
```bash
# Check redis is running
docker-compose ps redis

# Test redis connection
docker-compose exec app redis-cli -h redis -p 6379 -a $REDIS_PASSWORD ping
```

### Issue: Permission denied on storage
```bash
# Fix permissions
docker-compose exec app chown -R www-data:www-data /app/storage
docker-compose exec app chmod -R 775 /app/storage
```

### Issue: Port already in use
```bash
# Find process using port 80
lsof -i :80

# Change port in docker-compose.yml
# ports:
#   - "8080:80"  # Changed from 80:80
```

---

## MONITORING & HEALTH CHECKS

### Container Health
```bash
# View health status
docker-compose ps

# Manual health check
curl http://localhost/api/v1/health
```

### Resource Monitoring
```bash
# Real-time stats
docker stats

# Container details
docker inspect lapnesia-app
```

### Log Aggregation (Ready for Phase 4)
```bash
# Current logs
docker-compose logs app

# Filter by level
docker-compose logs app | grep ERROR

# Follow logs
docker-compose logs -f app
```

---

## VOLUMES & PERSISTENCE

### Database Persistence
- **Volume:** `dbdata`
- **Mount:** `/var/lib/mysql`
- **Backup:** `docker-compose exec db mysqldump`

### Cache Persistence
- **Volume:** `redisdata`
- **Mount:** `/data`
- **Clear:** `docker-compose exec redis redis-cli -a $REDIS_PASSWORD FLUSHALL`

### Application Storage
- **Mount:** `./Backend/storage:/app/storage`
- **Purpose:** Logs, uploaded files, cache

---

## PHASE 2 CHECKLIST

- ✅ Docker Compose file created (5 services)
- ✅ Dockerfile for PHP 8.3-FPM
- ✅ Nginx configuration (HTTP/HTTPS ready)
- ✅ MySQL configuration optimized
- ✅ Redis configuration with persistence
- ✅ Queue worker configured
- ✅ Startup script created
- ✅ Environment templates configured
- ✅ Health checks implemented
- ✅ Volume management setup
- ✅ Documentation complete

---

## NEXT PHASE

**PHASE 3:** GitHub Actions CI/CD Pipeline
- Automated testing on push
- Linting (PHPStan, Pint)
- Frontend build
- Docker image build
- Deployment workflow

---

**Status:** ✅ COMPLETE  
**Created:** 2026-07-14T06:53:41.050Z

Docker infrastructure is production-ready. Next: Setup CI/CD pipeline (PHASE 3).
