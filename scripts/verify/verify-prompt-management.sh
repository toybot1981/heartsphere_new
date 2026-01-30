#!/bin/bash

# 提示词管理系统验证脚本
# 用于验证数据库迁移和功能是否正常
# 使用 UTF-8 编码，避免终端中文乱码

set -e

# 强制终端与 MySQL 使用 UTF-8，避免中文乱码（若仍乱码可设 VERIFY_OUTPUT_FILE=文件名 将结果写入 UTF-8 文件）
export LANG="${LANG:-en_US.UTF-8}"
export LC_ALL="${LC_ALL:-en_US.UTF-8}"
MYSQL_CHARSET="--default-character-set=utf8mb4"

echo "=========================================="
echo "提示词管理系统验证脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 数据库配置（从环境变量或配置文件读取）
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASS="${DB_PASS:-}"

echo "数据库配置："
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 检查数据库连接
echo "1. 检查数据库连接..."
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" $MYSQL_CHARSET -e "USE $DB_NAME;" 2>/dev/null; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    echo "请检查数据库配置和连接信息"
    exit 1
fi
echo ""

# 检查表是否存在
echo "2. 检查表结构..."
TABLES=("prompt_categories" "prompt_templates" "prompt_variables" "prompt_versions")
ALL_TABLES_EXIST=true

for table in "${TABLES[@]}"; do
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" $MYSQL_CHARSET "$DB_NAME" -e "DESCRIBE $table;" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ 表 $table 存在${NC}"
    else
        echo -e "${RED}✗ 表 $table 不存在${NC}"
        ALL_TABLES_EXIST=false
    fi
done

if [ "$ALL_TABLES_EXIST" = false ]; then
    echo -e "${RED}部分表不存在，请执行数据库迁移${NC}"
    exit 1
fi
echo ""

# 检查 Flyway 迁移 V20260132（后端提示词入库）是否已执行
echo "3. 检查 Flyway 迁移 V20260132..."
V20260132=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -sN -e "SELECT 1 FROM flyway_schema_history WHERE version='20260132' AND success=1 LIMIT 1;" 2>/dev/null || echo "")
if [ -n "$V20260132" ]; then
    echo -e "${GREEN}✓ 迁移 V20260132（后端提示词模板）已执行${NC}"
else
    echo -e "${YELLOW}⚠ 未找到迁移 V20260132 记录（需启动 main 后端或手动执行迁移）${NC}"
fi
echo ""

# 检查分类数据
echo "4. 检查分类数据..."
CATEGORY_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -sN -e "SELECT COUNT(*) FROM prompt_categories WHERE is_active = TRUE;" 2>/dev/null || echo "0")

if [ "$CATEGORY_COUNT" -ge 6 ]; then
    echo -e "${GREEN}✓ 找到 $CATEGORY_COUNT 个启用的分类${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -e "SELECT code, name FROM prompt_categories WHERE is_active = TRUE ORDER BY sort_order;"
else
    echo -e "${YELLOW}⚠ 只找到 $CATEGORY_COUNT 个分类（预期至少6个）${NC}"
fi
echo ""

# 检查模板数据
echo "5. 检查模板数据..."
TEMPLATE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -sN -e "SELECT COUNT(*) FROM prompt_templates WHERE is_active = TRUE;" 2>/dev/null || echo "0")

if [ "$TEMPLATE_COUNT" -ge 5 ]; then
    echo -e "${GREEN}✓ 找到 $TEMPLATE_COUNT 个启用的模板${NC}"
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -e "SELECT id, name, category_code, version FROM prompt_templates WHERE is_active = TRUE ORDER BY category_code, name;"
else
    echo -e "${YELLOW}⚠ 只找到 $TEMPLATE_COUNT 个模板（预期至少5个）${NC}"
fi
echo ""

# 检查索引
echo "6. 检查索引..."
INDEXES=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -sN -e "SHOW INDEXES FROM prompt_templates;" 2>/dev/null | wc -l)
if [ "$INDEXES" -gt 0 ]; then
    echo -e "${GREEN}✓ 索引创建成功（找到 $INDEXES 个索引）${NC}"
else
    echo -e "${YELLOW}⚠ 未找到索引${NC}"
fi
echo ""

# 检查外键约束
echo "7. 检查外键约束..."
FK_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -sN -e "SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = '$DB_NAME' AND TABLE_NAME = 'prompt_templates' AND CONSTRAINT_NAME != 'PRIMARY';" 2>/dev/null || echo "0")
if [ "$FK_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ 外键约束创建成功${NC}"
else
    echo -e "${YELLOW}⚠ 未找到外键约束${NC}"
fi
echo ""

# 总结
echo "=========================================="
echo "验证总结"
echo "=========================================="

if [ "$ALL_TABLES_EXIST" = true ] && [ "$CATEGORY_COUNT" -ge 6 ] && [ "$TEMPLATE_COUNT" -ge 5 ]; then
    # 若需将结果输出到 UTF-8 文件（避免终端乱码），可执行: VERIFY_OUTPUT_FILE=1 ./scripts/verify/verify-prompt-management.sh
    if [ -n "$VERIFY_OUTPUT_FILE" ]; then
        OUT_FILE="${VERIFY_OUTPUT_FILE:-prompt-management-verify.txt}"
        {
            echo "=== 提示词管理验证报告 $(date -Iseconds) ==="
            mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" $MYSQL_CHARSET -e "SELECT id, name, category_code FROM prompt_templates WHERE is_active = TRUE ORDER BY category_code, name;"
        } > "$OUT_FILE" 2>/dev/null && echo -e "${GREEN}✓ 已写入 $OUT_FILE（UTF-8）${NC}"
    fi
    echo -e "${GREEN}✓ 所有检查通过！提示词管理系统已就绪${NC}"
    echo ""
    echo "下一步："
    echo "1. 启动后端服务"
    echo "2. 访问管理后台: http://localhost:3000/admin"
    echo "3. 进入'提示词管理'页面"
    echo "4. 测试模板功能"
    exit 0
else
    echo -e "${RED}✗ 部分检查未通过，请检查数据库迁移${NC}"
    exit 1
fi
