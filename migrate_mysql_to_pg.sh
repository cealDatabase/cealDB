#!/bin/bash

set -e

# 配置参数
MYSQL_ORIGINAL_DB="ceal_db_24"
MYSQL_ORIGINAL_USER="root"
MYSQL_ORIGINAL_PASS="jiuqianwan"
PG_DB="my_pg_ceal_24"

DOCKER_MYSQL_IMAGE="bitnami/mysql:5.7"
DOCKER_MYSQL_CONTAINER="mysql57-ceal"
DOCKER_MYSQL_PORT=3307
DOCKER_MYSQL_ROOT_PASS="rootpass"

DUMP_FILE="ceal_db_24.sql"

echo "📤 Step 1: Dump original MySQL database..."
mysqldump -u$MYSQL_ORIGINAL_USER -p$MYSQL_ORIGINAL_PASS \
  --set-gtid-purged=OFF --skip-lock-tables --single-transaction \
  --databases $MYSQL_ORIGINAL_DB > $DUMP_FILE

echo "🐳 Step 2: Start MySQL 5.7 Docker container..."
docker run -d --rm \
  --name $DOCKER_MYSQL_CONTAINER \
  -e MYSQL_ROOT_PASSWORD=$DOCKER_MYSQL_ROOT_PASS \
  -p $DOCKER_MYSQL_PORT:3306 \
  $DOCKER_MYSQL_IMAGE

echo "⏳ Waiting for MySQL container to initialize..."
sleep 20

echo "📦 Step 3: Copy dump into container..."
docker cp $DUMP_FILE $DOCKER_MYSQL_CONTAINER:/tmp/$DUMP_FILE

echo "📥 Step 4: Import dump into Docker MySQL..."
docker exec -i $DOCKER_MYSQL_CONTAINER \
  mysql -uroot -p$DOCKER_MYSQL_ROOT_PASS -e "CREATE DATABASE IF NOT EXISTS $MYSQL_ORIGINAL_DB"

docker exec -i $DOCKER_MYSQL_CONTAINER \
  mysql -uroot -p$DOCKER_MYSQL_ROOT_PASS < /tmp/$DUMP_FILE

echo "🔄 Step 5: Run pgloader to migrate MySQL -> PostgreSQL..."
pgloader mysql://root:$DOCKER_MYSQL_ROOT_PASS@localhost:$DOCKER_MYSQL_PORT/$MYSQL_ORIGINAL_DB \
         postgresql://postgres:jiuqianwan@localhost/$PG_DB

echo "✅ Migration complete."
