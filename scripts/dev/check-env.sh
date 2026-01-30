#!/bin/bash
# 环境检查脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 使用构建系统的依赖检查
source "$SCRIPT_DIR/../build/common.sh"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}检查开发环境${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 运行依赖检查
"$SCRIPT_DIR/../build/check-dependencies.sh"

echo ""
echo -e "${BLUE}检查项目配置...${NC}"

# 检查 .env 文件（如果存在）
if [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "${GREEN}✓ .env 文件存在${NC}"
else
    echo -e "${YELLOW}⚠ .env 文件不存在（可选）${NC}"
fi

# 检查数据库配置
if [ -f "$PROJECT_ROOT/config.json" ]; then
    echo -e "${GREEN}✓ config.json 存在${NC}"
else
    echo -e "${YELLOW}⚠ config.json 不存在${NC}"
fi

echo ""
echo -e "${GREEN}环境检查完成${NC}"
