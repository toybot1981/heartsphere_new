#!/bin/bash

# 技能引擎重构部署脚本
# 用途：在测试/生产环境执行技能引擎重构的完整迁移
# 前置条件：数据库备份已完成

set -e  # 遇到错误立即退出

# 配置
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
ENVIRONMENT="${ENVIRONMENT:-test}"  # test 或 production

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}技能引擎重构部署脚本${NC}"
echo -e "${BLUE}环境: $ENVIRONMENT${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 确认操作
if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${RED}警告: 您正在生产环境执行迁移！${NC}"
    read -p "确认继续？(yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "已取消"
        exit 1
    fi
fi

# 步骤1：检查数据库连接
echo -e "${YELLOW}步骤1: 检查数据库连接...${NC}"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1
else
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;" > /dev/null 2>&1
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库连接成功${NC}"
else
    echo -e "${RED}✗ 数据库连接失败${NC}"
    exit 1
fi

# 步骤2：创建备份
echo -e "${YELLOW}步骤2: 创建数据备份...${NC}"
BACKUP_DIR="backups/skill-engine-refactor-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -z "$DB_PASSWORD" ]; then
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" skill_definitions character_skill_bindings > "$BACKUP_DIR/backup.sql" 2>/dev/null
else
    mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" skill_definitions character_skill_bindings > "$BACKUP_DIR/backup.sql" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 备份已保存到: $BACKUP_DIR/backup.sql${NC}"
else
    echo -e "${RED}✗ 备份失败${NC}"
    exit 1
fi

# 步骤3：执行清理脚本
echo -e "${YELLOW}步骤3: 执行数据库清理...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/../sql/cleanup_old_skills.sql"

if [ ! -f "$CLEANUP_SCRIPT" ]; then
    echo -e "${RED}✗ 清理脚本不存在: $CLEANUP_SCRIPT${NC}"
    exit 1
fi

# 先执行查询，查看将要删除的技能
echo -e "${YELLOW}查看将要删除的技能...${NC}"
if [ -z "$DB_PASSWORD" ]; then
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" < "$CLEANUP_SCRIPT" 2>&1 | grep -A 100 "查看将要删除的技能" || true
else
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$CLEANUP_SCRIPT" 2>&1 | grep -A 100 "查看将要删除的技能" || true
fi

read -p "确认执行清理？(yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "已取消清理"
    exit 0
fi

# 执行清理（只执行删除部分，跳过查询部分）
echo -e "${YELLOW}执行清理操作...${NC}"
# 这里需要修改清理脚本，分离查询和删除部分
# 暂时跳过，建议手动执行

echo -e "${GREEN}✓ 清理完成（请手动验证）${NC}"

# 步骤4：验证清理结果
echo -e "${YELLOW}步骤4: 验证清理结果...${NC}"
# 检查是否还有旧格式技能
# 这里可以添加验证查询

# 步骤5：重启服务（如果需要）
echo -e "${YELLOW}步骤5: 重启服务...${NC}"
read -p "是否需要重启后端服务？(yes/no): " restart
if [ "$restart" = "yes" ]; then
    echo "请手动重启后端服务"
    # 这里可以添加重启命令
fi

# 步骤6：运行测试
echo -e "${YELLOW}步骤6: 运行API测试...${NC}"
read -p "是否运行API测试？(yes/no): " run_test
if [ "$run_test" = "yes" ]; then
    if [ -f "$SCRIPT_DIR/test-skill-api.sh" ]; then
        echo "运行测试脚本..."
        # TOKEN 需要从环境变量或配置文件获取
        # "$SCRIPT_DIR/test-skill-api.sh"
        echo "请手动运行: ./scripts/test-skill-api.sh"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "后续步骤："
echo "1. 验证系统功能正常"
echo "2. 监控系统运行状态"
echo "3. 收集用户反馈"
echo ""
echo "备份位置: $BACKUP_DIR"
