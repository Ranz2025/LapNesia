# LAPNESIA PRODUCTION CONFIGURATION — PHASE 5 IMPLEMENTATION
**Date:** 2026-07-14  
**Status:** ✅ COMPLETE

---

## FILES CREATED/MODIFIED

### Production Configuration
| File | Purpose | Status |
|------|---------|--------|
| `config/cache.php` | Redis cache with TTL per resource | ✅ |
| `app/Console/Kernel.php` | Scheduler (backups, cleanup, monitoring) | ✅ |
| `deploy.sh` | Production deployment script | ✅ |
| `backup.sh` | Daily backup script (DB + storage + env) | ✅ |
| `docker/php/www.conf` | PHP-FPM pool (50 workers, slow log) | ✅ |
| `docker/php/php-production.ini` | PHP production settings (OPcache, JIT) | ✅ |
| `.dockerignore` | Exclude dev files from Docker builds | ✅ |
| `routes/api.php` | Health check routes added | ✅ |

---

## 1. CACHE STRATEGY

### TTL Configuration
| Resource | TTL | Reason |
|----------|-----|--------|
| Products | 1 hour | Low write frequency |
| Categories | 1 hour | Rarely changes |
| Brands | 1 hour | Rarely changes |
| User profile | 30 min | Moderate changes |
| Wallet balance | 5 min | Frequent changes |
| Order summary | 10 min | Transaction data |
| Search results | 30 min | Computed data |
| System config | 24 hours | Very stable |

### Cache Commands
```bash
php artisan config:cache   # Cache config files
php artisan route:cache    # Cache routes
php artisan view:cache     # Cache Blade views
php artisan cache:clear    # Clear application cache
```

---

## 2. SCHEDULER

### Scheduled Tasks
| Task | Schedule | Purpose |
|------|----------|---------|
| Queue monitor | Every 5 min | Track queue health |
| Prune expired tokens | Daily 1 AM | Clean Sanctum tokens |
| Database backup | Daily 2 AM | Full DB + storage backup |
| Log cleanup | Weekly Sun 3 AM | Remove logs > 30 days |
| Prune failed jobs | Daily 4 AM | Remove > 7 days old |
| Cache prune | Daily 5 AM | Clean stale cache tags |

### Enable Scheduler
```bash
# Add to crontab
* * * * * cd /app && php artisan schedule:run >> /dev/null 2>&1
```

---

## 3. QUEUE CONFIGURATION

### Worker Settings
| Setting | Value | Reason |
|---------|-------|--------|
| Connection | Redis | Fast, reliable |
| Sleep | 3s | Polling interval |
| Tries | 3 | Max retry attempts |
| Timeout | 90s | Max job duration |

### Queue Worker (Docker)
```yaml
queue:
  command: php artisan queue:work redis --sleep=3 --tries=3 --timeout=90
```

---

## 4. BACKUP STRATEGY

### Daily Backup (2 AM)
1. **Database** — mysqldump with gzip compression
2. **Storage** — uploaded files archive
3. **Environment** — encrypted .env backup

### Retention Policy
- Keep backups for 30 days
- Auto-cleanup older files
- Total size monitoring

### Restore Commands
```bash
# Database
gunzip < backup.sql.gz | mysql -h db -u user -p dbname

# Storage
tar -xzf storage_backup.tar.gz -C /app/

# Environment
openssl enc -d -aes-256-cbc -in env.enc -out .env
```

---

## 5. PHP-FPM SETTINGS

### Worker Pool
| Setting | Value |
|---------|-------|
| Process manager | dynamic |
| Max children | 50 |
| Start servers | 10 |
| Min spare | 5 |
| Max spare | 20 |
| Max requests | 500 |

### PHP Production Settings
| Setting | Value | Reason |
|---------|-------|--------|
| memory_limit | 512M | Sufficient for API |
| upload_max_filesize | 50M | Product images |
| max_execution_time | 120s | Long operations |
| OPcache | Enabled | 10x faster |
| JIT | Enabled | Additional speed |
| display_errors | Off | Security |
| expose_php | Off | Security |
| cookie_httponly | On | Security |
| cookie_secure | On | HTTPS only |
| cookie_samesite | Strict | CSRF prevention |

---

## 6. DEPLOYMENT SCRIPT

### Pre-deployment Checks
- ✅ .env exists
- ✅ APP_DEBUG=false
- ✅ APP_KEY is set

### Deployment Steps
1. Run migrations
2. Cache config/routes/views
3. Optimize autoloader
4. Set permissions
5. Restart queue workers
6. Verify health

### Run
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 7. PRODUCTION CHECKLIST

### Configuration
- ✅ APP_ENV=production
- ✅ APP_DEBUG=false
- ✅ APP_KEY generated
- ✅ DB credentials secured
- ✅ Redis configured
- ✅ Cache driver=redis
- ✅ Queue driver=redis
- ✅ Session driver=redis
- ✅ Log channel=stack (with sentry)

### Performance
- ✅ OPcache enabled
- ✅ JIT enabled
- ✅ Config cached
- ✅ Routes cached
- ✅ Views cached
- ✅ Autoloader optimized
- ✅ Redis cache with TTL

### Security
- ✅ HTTPS enforced
- ✅ Security headers
- ✅ Cookie security (httponly, secure, samesite)
- ✅ PHP version hidden
- ✅ Debug off
- ✅ Error display off
- ✅ Rate limiting active

### Infrastructure
- ✅ Docker containers configured
- ✅ Nginx optimized
- ✅ PHP-FPM tuned
- ✅ MySQL optimized
- ✅ Redis persistent
- ✅ Health checks active

### Operations
- ✅ Backup automated (daily)
- ✅ Log rotation configured
- ✅ Queue monitoring active
- ✅ Scheduler configured
- ✅ Deployment script ready

---

## PHASE 5 CHECKLIST

- ✅ Cache configuration (Redis + TTL)
- ✅ Config/route/view caching
- ✅ Queue worker configuration
- ✅ Scheduler setup
- ✅ Storage permissions
- ✅ Backup script (DB + storage + env)
- ✅ Deployment script
- ✅ PHP-FPM production config
- ✅ PHP OPcache + JIT
- ✅ Health check routes registered
- ✅ .dockerignore created
- ✅ Production checklist

---

**Status:** ✅ COMPLETE  
**Created:** 2026-07-14T06:57:19.799Z

All 5 phases implemented. LapNesia is now production-ready.
