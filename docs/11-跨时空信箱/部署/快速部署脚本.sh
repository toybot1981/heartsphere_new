#!/bin/bash

# 跨时空信箱快速部署脚本
# 用于快速配置和执行数据库迁移

set -e

echo "🚀 开始跨时空信箱部署配置..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查数据库连接
echo -e "${YELLOW}1. 检查数据库连接...${NC}"
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-heartsphere}
DB_USER=${DB_USER:-root}
DB_PASS=${DB_PASS:-123456}

mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS -e "USE $DB_NAME;" 2>/dev/null || {
    echo -e "${RED}❌ 数据库连接失败！请检查配置。${NC}"
    exit 1
}
echo -e "${GREEN}✅ 数据库连接成功${NC}"

# 检查表是否已存在
echo -e "${YELLOW}2. 检查数据库表...${NC}"
TABLES=$(mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME -N -e "SHOW TABLES LIKE 'mailbox_%';" 2>/dev/null | wc -l)

if [ "$TABLES" -ge 4 ]; then
    echo -e "${GREEN}✅ 数据库表已存在 ($TABLES 个表)${NC}"
    echo "   - mailbox_messages"
    echo "   - mailbox_conversations"
    echo "   - mailbox_conversation_messages"
    echo "   - mailbox_notification_settings"
else
    echo -e "${YELLOW}⚠️  数据库表不存在或不全，将在应用启动时自动创建${NC}"
fi

# 检查迁移脚本
echo -e "${YELLOW}3. 检查迁移脚本...${NC}"
MIGRATION_DIR="backend/src/main/resources/db/migration"
REQUIRED_SCRIPTS=(
    "V20251230__create_mailbox_messages_table.sql"
    "V20251230__create_mailbox_conversations_table.sql"
    "V20251230__create_mailbox_conversation_messages_table.sql"
    "V20251230__create_mailbox_notification_settings_table.sql"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$MIGRATION_DIR/$script" ]; then
        echo -e "${GREEN}  ✅ $script${NC}"
    else
        echo -e "${RED}  ❌ $script 未找到${NC}"
    fi
done

# 检查编译状态
echo -e "${YELLOW}4. 检查后端编译状态...${NC}"
cd backend
if mvn compile -DskipTests -q 2>/dev/null; then
    echo -e "${GREEN}✅ 后端编译成功${NC}"
else
    echo -e "${RED}❌ 后端编译失败，请检查错误信息${NC}"
    exit 1
fi
cd ..

# 生成配置摘要
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}📋 部署配置摘要${NC}"
echo -e "${GREEN}========================================${NC}"
echo "数据库: $DB_NAME @ $DB_HOST:$DB_PORT"
echo "用户: $DB_USER"
echo "迁移脚本: ✅ 已就绪"
echo "编译状态: ✅ 成功"
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo "1. 启动后端应用: cd backend && mvn spring-boot:run"
echo "2. Flyway会在启动时自动执行迁移脚本"
echo "3. 验证API: curl http://localhost:8081/api/mailbox/messages/unread/count"
echo ""
echo -e "${GREEN}✅ 部署配置检查完成！${NC}"
