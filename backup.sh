#!/bin/bash
# LapNesia Backup Script
BACKUP_DIR="/opt/lapnesia/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
echo "Backing up .env..."
cp /opt/lapnesia/Backend/.env.production $BACKUP_DIR/.env.production.backup-$DATE

echo "Backing up Database..."
docker exec lapnesia-mysql-prod /usr/bin/mysqldump -u lapnesia_user --password=lapnesiapassword lapnesia > $BACKUP_DIR/db_lapnesia_$DATE.sql

echo "Compressing..."
gzip $BACKUP_DIR/db_lapnesia_$DATE.sql

echo "Retaining last 7 days..."
find $BACKUP_DIR -type f -mtime +7 -delete
echo "Backup Completed!"