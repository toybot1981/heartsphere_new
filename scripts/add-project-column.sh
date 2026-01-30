#!/bin/bash

# 为 deployment_pipelines 表添加 project 字段

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DB_NAME="${1:-heartsphere}"
DB_USER="${2:-root}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}为 deployment_pipelines 表添加 project 字段${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查表是否存在
if ! mysql -u "$DB_USER" -p -e "USE $DB_NAME; SHOW TABLES LIKE 'deployment_pipelines';" 2>/dev/null | grep -q "deployment_pipelines"; then
    echo -e "${RED}❌ 表 deployment_pipelines 不存在${NC}"
    echo -e "${YELLOW}请先执行 sql/create_pipeline_tables.sql 创建表${NC}"
    exit 1
fi

# 检查字段是否已存在
if mysql -u "$DB_USER" -p -e "USE $DB_NAME; DESCRIBE deployment_pipelines;" 2>/dev/null | grep -q "project"; then
    echo -e "${YELLOW}⚠️  project 字段已存在，跳过添加${NC}"
else
    echo -e "${BLUE}正在添加 project 字段...${NC}"
    mysql -u "$DB_USER" -p "$DB_NAME" <<EOF
ALTER TABLE \`deployment_pipelines\` 
ADD COLUMN \`project\` VARCHAR(50) DEFAULT '' COMMENT '关联的项目 (main, admin, company, edu, mentis, shared, 或空字符串表示通用)' 
AFTER \`environment\`;

ALTER TABLE \`deployment_pipelines\` 
ADD INDEX \`idx_project\` (\`project\`);
EOF
    echo -e "${GREEN}✅ project 字段已添加${NC}"
fi

# 更新现有记录的 project 字段
echo -e "${BLUE}正在更新现有记录的 project 字段...${NC}"
mysql -u "$DB_USER" -p "$DB_NAME" <<EOF
UPDATE \`deployment_pipelines\` 
SET \`project\` = CASE
    WHEN \`name\` LIKE '%main%' OR \`name\` LIKE '%主项目%' THEN 'main'
    WHEN \`name\` LIKE '%admin%' OR \`name\` LIKE '%管理%' THEN 'admin'
    WHEN \`name\` LIKE '%company%' OR \`name\` LIKE '%公司%' THEN 'company'
    WHEN \`name\` LIKE '%edu%' OR \`name\` LIKE '%教育%' THEN 'edu'
    WHEN \`name\` LIKE '%mentis%' THEN 'mentis'
    WHEN \`name\` LIKE '%shared%' OR \`name\` LIKE '%共享%' THEN 'shared'
    ELSE ''
END
WHERE \`project\` IS NULL OR \`project\` = '';
EOF
echo -e "${GREEN}✅ 现有记录的 project 字段已更新${NC}"

echo ""
echo -e "${GREEN}✅ 完成！${NC}"
echo ""
echo -e "${BLUE}验证：${NC}"
mysql -u "$DB_USER" -p -e "USE $DB_NAME; DESCRIBE deployment_pipelines;" 2>/dev/null | grep -E "Field|project" || echo "请手动验证"
