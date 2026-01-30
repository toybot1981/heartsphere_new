#!/bin/bash

# 检查部署流程相关数据库表是否存在

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
echo -e "${BLUE}检查部署流程数据库表${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查表是否存在
check_table() {
    local table_name=$1
    local result=$(mysql -u "$DB_USER" -p -e "USE $DB_NAME; SHOW TABLES LIKE '$table_name';" 2>/dev/null | grep -c "$table_name" || echo "0")
    
    if [ "$result" -gt 0 ]; then
        echo -e "${GREEN}✅ 表 $table_name 存在${NC}"
        return 0
    else
        echo -e "${RED}❌ 表 $table_name 不存在${NC}"
        return 1
    fi
}

# 检查所有表
TABLES=(
    "deployment_pipelines"
    "pipeline_steps"
    "pipeline_executions"
    "pipeline_step_executions"
)

MISSING_TABLES=0

for table in "${TABLES[@]}"; do
    if ! check_table "$table"; then
        ((MISSING_TABLES++))
    fi
done

echo ""

if [ $MISSING_TABLES -eq 0 ]; then
    echo -e "${GREEN}✅ 所有表都存在${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  有 $MISSING_TABLES 个表不存在${NC}"
    echo ""
    echo -e "${YELLOW}请执行以下命令创建表：${NC}"
    echo "  mysql -u $DB_USER -p $DB_NAME < sql/create_pipeline_tables.sql"
    exit 1
fi
