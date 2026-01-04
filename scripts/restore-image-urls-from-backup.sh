#!/bin/bash

# 从备份恢复图片URL数据
# 使用方法: ./scripts/restore-image-urls-from-backup.sh

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

echo -e "${RED}========================================${NC}"
echo -e "${RED}  恢复图片URL数据（从备份）${NC}"
echo -e "${RED}========================================${NC}"
echo -e "${BLUE}数据库: ${DB_NAME}${NC}"
echo -e "${BLUE}主机: ${DB_HOST}:${DB_PORT}${NC}"
echo -e "${BLUE}用户: ${DB_USER}${NC}"
echo -e ""
echo -e "${YELLOW}警告: 此操作将从备份表恢复数据，会覆盖当前数据！${NC}"
echo -e "${YELLOW}请确认是否继续？ (yes/no)${NC}"
read -r CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo -e "${YELLOW}操作已取消${NC}"
    exit 0
fi

# 构建 mysql 命令
MYSQL_CMD="mysql -h${DB_HOST} -P${DB_PORT} -u${DB_USER}"
if [ -n "${DB_PASSWORD}" ]; then
    MYSQL_CMD="${MYSQL_CMD} -p${DB_PASSWORD}"
else
    echo -e "${YELLOW}提示: 将提示输入数据库密码${NC}"
fi

echo -e "${YELLOW}开始恢复数据...${NC}"

${MYSQL_CMD} "${DB_NAME}" <<'EOF'
-- 恢复 system_resources
UPDATE system_resources sr
INNER JOIN system_resources_url_backup b ON sr.id = b.id
SET sr.url = b.url;

-- 恢复 system_eras
UPDATE system_eras se
INNER JOIN system_eras_url_backup b ON se.id = b.id
SET se.image_url = b.image_url;

-- 恢复 system_characters
UPDATE system_characters sc
INNER JOIN system_characters_url_backup b ON sc.id = b.id
SET sc.avatar_url = b.avatar_url;

-- 恢复 characters
UPDATE characters c
INNER JOIN characters_url_backup b ON c.id = b.id
SET c.avatar_url = b.avatar_url, c.background_url = b.background_url;

-- 恢复 eras
UPDATE eras e
INNER JOIN eras_url_backup b ON e.id = b.id
SET e.image_url = b.image_url;

-- 恢复 journal_entries
UPDATE journal_entries je
INNER JOIN journal_entries_url_backup b ON je.id = b.id
SET je.image_url = b.image_url;

-- 恢复 users
UPDATE users u
INNER JOIN users_url_backup b ON u.id = b.id
SET u.avatar = b.avatar;

-- 恢复 user_main_stories
UPDATE user_main_stories ums
INNER JOIN user_main_stories_url_backup b ON ums.id = b.id
SET ums.avatar_url = b.avatar_url, ums.background_url = b.background_url;
EOF

echo -e "${GREEN}✓ 数据恢复完成${NC}"
echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}恢复操作完成！${NC}"
echo -e "${GREEN}========================================${NC}"
