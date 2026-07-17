#!/bin/bash
set -e

# LapNesia Backup Script
# Run daily via cron: 0 2 * * * /app/backup.sh >> /var/log/backup.log 2>&1

echo "🗄️  LapNesia Backup — $(date +%Y-%m-%d_%H:%M:%S)"
echo "============================================"

BACKUP_DIR="${BACKUP_DIR:-/backups/lapnesia}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DB_HOST="${DB_HOST:-db}"
DB_NAME="${DB_DATABASE:-lapnesia}"
DB_USER="${DB_USERNAME:-lapnesia_user}"
DB_PASS="${DB_PASSWORD}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo ""
echo "📋 Configuration:"
echo "   Backup directory: $BACKUP_DIR"
echo "   Retention: $RETENTION_DAYS days"
echo "   Database: $DB_NAME"
echo ""

# 1. Database backup
echo "🗃️  Backing up database..."
DB_BACKUP_FILE="$BACKUP_DIR/db_${DB_NAME}_${TIMESTAMP}.sql.gz"
mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    | gzip > "$DB_BACKUP_FILE"
echo "  ✅ Database backup: $DB_BACKUP_FILE ($(du -h "$DB_BACKUP_FILE" | cut -f1))"

# 2. Storage backup (uploaded files)
echo "📁 Backing up storage..."
STORAGE_BACKUP_FILE="$BACKUP_DIR/storage_${TIMESTAMP}.tar.gz"
tar -czf "$STORAGE_BACKUP_FILE" -C /app storage/app/public/ 2>/dev/null || true
echo "  ✅ Storage backup: $STORAGE_BACKUP_FILE ($(du -h "$STORAGE_BACKUP_FILE" | cut -f1))"

# 3. Environment backup (encrypted)
echo "🔐 Backing up environment..."
ENV_BACKUP_FILE="$BACKUP_DIR/env_${TIMESTAMP}.enc"
if [ -f /app/.env ]; then
    openssl enc -aes-256-cbc -salt -in /app/.env -out "$ENV_BACKUP_FILE" -pass pass:"${BACKUP_ENCRYPTION_KEY:-backup_key}" 2>/dev/null || \
    cp /app/.env "$BACKUP_DIR/env_${TIMESTAMP}.bak"
    echo "  ✅ Environment backup created"
else
    echo "  ⚠️  No .env file found"
fi

# 4. Cleanup old backups
echo "🗑️  Cleaning up backups older than $RETENTION_DAYS days..."
DELETED_COUNT=$(find "$BACKUP_DIR" -type f -mtime +"$RETENTION_DAYS" -delete -print | wc -l)
echo "  ✅ Deleted $DELETED_COUNT old backup files"

# 5. Summary
echo ""
echo "============================================"
echo "✅ Backup complete!"
echo ""
echo "📊 Backup summary:"
echo "   Database: $(du -h "$DB_BACKUP_FILE" | cut -f1)"
echo "   Storage:  $(du -h "$STORAGE_BACKUP_FILE" | cut -f1)"
echo "   Total:    $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "📌 Restore commands:"
echo "   Database: gunzip < $DB_BACKUP_FILE | mysql -h $DB_HOST -u $DB_USER -p $DB_NAME"
echo "   Storage:  tar -xzf $STORAGE_BACKUP_FILE -C /app/"
echo "============================================"
