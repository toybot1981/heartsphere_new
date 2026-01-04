#!/bin/bash

# 备份图片URL相关数据（在执行迁移前备份包含 localhost URL 的数据）
# 使用方法: ./scripts/backup-image-urls-before-migration.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"

# 备份目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../database_backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/image_urls_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  备份图片URL数据（迁移前备份）${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e "${BLUE}备份文件: ${BACKUP_FILE}${NC}"
echo -e ""

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_CMD="${MYSQL_CMD} -p${DB_PASSWORD}"
    MYSQLDUMP_CMD="mysqldump -h${DB_HOST} -P${DB_PORT} -u${DB_USER} -p${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
    MYSQLDUMP_CMD="mysqldump -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
fi

# 创建备份SQL文件
cat > "${BACKUP_FILE}" <<'EOF'
-- ============================================
-- 图片URL数据备份
-- 备份时间: 
-- 说明: 备份包含 localhost URL 的数据，用于数据迁移前的恢复
-- ============================================

-- 备份 system_resources 表中包含 localhost 的记录
-- 只备份 id, name, url 字段，用于恢复
CREATE TABLE IF NOT EXISTS `system_resources_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 system_eras 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `system_eras_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 system_characters 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `system_characters_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NOT NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 characters 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `characters_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `background_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 eras 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `eras_url_backup` (
  `id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 journal_entries 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `journal_entries_url_backup` (
  `id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 users 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `users_url_backup` (
  `id` BIGINT NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `avatar` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 备份 user_main_stories 表中包含 localhost 的记录
CREATE TABLE IF NOT EXISTS `user_main_stories_url_backup` (
  `id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `avatar_url` VARCHAR(500) NULL,
  `background_url` VARCHAR(500) NULL,
  `backup_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

EOF

echo -e "${YELLOW}[1/3] 备份 system_resources 表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -e "
INSERT INTO system_resources_url_backup (id, name, url)
SELECT id, name, url FROM system_resources WHERE url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE name=VALUES(name), url=VALUES(url), backup_time=NOW();
" 2>/dev/null || echo -e "${YELLOW}警告: system_resources 备份失败或表不存在${NC}"

echo -e "${YELLOW}[2/3] 备份其他表...${NC}"
${MYSQL_CMD} "${DB_NAME}" -e "
INSERT INTO system_eras_url_backup (id, name, image_url)
SELECT id, name, image_url FROM system_eras WHERE image_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE name=VALUES(name), image_url=VALUES(image_url), backup_time=NOW();

INSERT INTO system_characters_url_backup (id, name, avatar_url)
SELECT id, name, avatar_url FROM system_characters WHERE avatar_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE name=VALUES(name), avatar_url=VALUES(avatar_url), backup_time=NOW();

INSERT INTO characters_url_backup (id, name, avatar_url, background_url)
SELECT id, name, avatar_url, background_url FROM characters 
WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE name=VALUES(name), avatar_url=VALUES(avatar_url), background_url=VALUES(background_url), backup_time=NOW();

INSERT INTO eras_url_backup (id, name, image_url)
SELECT id, name, image_url FROM eras WHERE image_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE name=VALUES(name), image_url=VALUES(image_url), backup_time=NOW();

INSERT INTO journal_entries_url_backup (id, title, image_url)
SELECT id, title, image_url FROM journal_entries WHERE image_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE title=VALUES(title), image_url=VALUES(image_url), backup_time=NOW();

INSERT INTO users_url_backup (id, username, avatar)
SELECT id, username, avatar FROM users WHERE avatar LIKE '%localhost%'
ON DUPLICATE KEY UPDATE username=VALUES(username), avatar=VALUES(avatar), backup_time=NOW();

INSERT INTO user_main_stories_url_backup (id, user_id, avatar_url, background_url)
SELECT id, user_id, avatar_url, background_url FROM user_main_stories 
WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%'
ON DUPLICATE KEY UPDATE user_id=VALUES(user_id), avatar_url=VALUES(avatar_url), background_url=VALUES(background_url), backup_time=NOW();
" 2>/dev/null || echo -e "${YELLOW}警告: 部分表备份失败${NC}"

echo -e "${YELLOW}[3/3] 导出备份数据...${NC}"
${MYSQLDUMP_CMD} "${DB_NAME}" \
  system_resources_url_backup \
  system_eras_url_backup \
  system_characters_url_backup \
  characters_url_backup \
  eras_url_backup \
  journal_entries_url_backup \
  users_url_backup \
  user_main_stories_url_backup \
  >> "${BACKUP_FILE}" 2>/dev/null || echo -e "${YELLOW}警告: 数据导出失败${NC}"

# 添加恢复说明
cat >> "${BACKUP_FILE}" <<EOF

-- ============================================
-- 恢复说明
-- ============================================
-- 如果需要恢复备份的数据，可以使用以下SQL：
-- 
-- UPDATE system_resources sr
-- INNER JOIN system_resources_url_backup b ON sr.id = b.id
-- SET sr.url = b.url;
-- 
-- UPDATE system_eras se
-- INNER JOIN system_eras_url_backup b ON se.id = b.id
-- SET se.image_url = b.image_url;
-- 
-- UPDATE system_characters sc
-- INNER JOIN system_characters_url_backup b ON sc.id = b.id
-- SET sc.avatar_url = b.avatar_url;
-- 
-- UPDATE characters c
-- INNER JOIN characters_url_backup b ON c.id = b.id
-- SET c.avatar_url = b.avatar_url, c.background_url = b.background_url;
-- 
-- UPDATE eras e
-- INNER JOIN eras_url_backup b ON e.id = b.id
-- SET e.image_url = b.image_url;
-- 
-- UPDATE journal_entries je
-- INNER JOIN journal_entries_url_backup b ON je.id = b.id
-- SET je.image_url = b.image_url;
-- 
-- UPDATE users u
-- INNER JOIN users_url_backup b ON u.id = b.id
-- SET u.avatar = b.avatar;
-- 
-- UPDATE user_main_stories ums
-- INNER JOIN user_main_stories_url_backup b ON ums.id = b.id
-- SET ums.avatar_url = b.avatar_url, ums.background_url = b.background_url;
-- 
-- 备份时间: $(date '+%Y-%m-%d %H:%M:%S')
EOF

echo -e "${GREEN}✓ 备份完成${NC}"
echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}备份文件: ${BACKUP_FILE}${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${YELLOW}注意：${NC}"
echo -e "1. 备份数据保存在数据库中的备份表中"
echo -e "2. SQL文件已保存到: ${BACKUP_FILE}"
echo -e "3. 如果迁移失败，可以使用备份表恢复数据"
echo -e "4. 备份表可以保留一段时间，确认迁移成功后可以删除"
