#!/bin/bash

# ============================================
# 执行语音模型数据库迁移脚本
# 添加豆包和DashScope的语音模型配置和计费信息
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 默认配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$PROJECT_ROOT/backend/src/main/resources/db/migration/V10010__add_audio_models_doubao_dashscope.sql"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}执行语音模型数据库迁移${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查迁移文件是否存在
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}错误: 迁移文件不存在: $MIGRATION_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}数据库配置:${NC}"
echo "  主机: $DB_HOST"
echo "  端口: $DB_PORT"
echo "  数据库: $DB_NAME"
echo "  用户: $DB_USER"
echo ""

# 确认执行
read -p "是否继续执行迁移? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo -e "${YELLOW}已取消迁移${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}开始执行迁移...${NC}"

# 执行迁移脚本
if [ -z "$DB_PASSWORD" ]; then
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" < "$MIGRATION_FILE"
else
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$MIGRATION_FILE"
fi

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}迁移执行成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    
    # 验证迁移结果
    echo -e "${YELLOW}验证迁移结果...${NC}"
    echo ""
    
    if [ -z "$DB_PASSWORD" ]; then
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" -e "
        SELECT 
            '模型配置统计' AS type,
            provider,
            capability,
            COUNT(*) AS count
        FROM ai_model_config 
        WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio'
        GROUP BY provider, capability;
        
        SELECT 
            '计费信息统计' AS type,
            amc.provider,
            amc.model_name,
            amp.pricing_type,
            amp.unit_price,
            amp.unit
        FROM ai_model_pricing amp
        INNER JOIN ai_model_config amc ON amp.model_id = amc.id
        WHERE amc.provider IN ('doubao', 'dashscope') AND amc.capability = 'audio'
        ORDER BY amc.provider, amc.model_name, amp.pricing_type;
        "
    else
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "
        SELECT 
            '模型配置统计' AS type,
            provider,
            capability,
            COUNT(*) AS count
        FROM ai_model_config 
        WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio'
        GROUP BY provider, capability;
        
        SELECT 
            '计费信息统计' AS type,
            amc.provider,
            amc.model_name,
            amp.pricing_type,
            amp.unit_price,
            amp.unit
        FROM ai_model_pricing amp
        INNER JOIN ai_model_config amc ON amp.model_id = amc.id
        WHERE amc.provider IN ('doubao', 'dashscope') AND amc.capability = 'audio'
        ORDER BY amc.provider, amc.model_name, amp.pricing_type;
        "
    fi
    
    echo ""
    echo -e "${GREEN}迁移完成！${NC}"
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}迁移执行失败！${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
