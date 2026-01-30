#!/bin/bash
# 本地环境设置脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../build/common.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}设置本地开发环境${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查依赖
echo -e "${BLUE}[1/3] 检查依赖...${NC}"
if ! "$SCRIPT_DIR/../build/check-dependencies.sh"; then
    echo -e "${RED}请先安装缺失的依赖${NC}"
    exit 1
fi

# 创建必要的目录
echo ""
echo -e "${BLUE}[2/3] 创建必要的目录...${NC}"
mkdir -p "$PROJECT_ROOT/.build-cache"
mkdir -p "$PROJECT_ROOT/.deps-cache"
mkdir -p "$PROJECT_ROOT/logs"
echo -e "${GREEN}✓ 目录创建完成${NC}"

# 检查配置文件
echo ""
echo -e "${BLUE}[3/3] 检查配置文件...${NC}"
if [ ! -f "$PROJECT_ROOT/.gitignore" ]; then
    echo -e "${YELLOW}⚠ .gitignore 不存在${NC}"
else
    # 检查 .gitignore 是否包含缓存目录
    if ! grep -q ".build-cache" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
        echo ".build-cache/" >> "$PROJECT_ROOT/.gitignore"
        echo -e "${GREEN}✓ 已添加 .build-cache 到 .gitignore${NC}"
    fi
    if ! grep -q ".deps-cache" "$PROJECT_ROOT/.gitignore" 2>/dev/null; then
        echo ".deps-cache/" >> "$PROJECT_ROOT/.gitignore"
        echo -e "${GREEN}✓ 已添加 .deps-cache 到 .gitignore${NC}"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}本地环境设置完成${NC}"
echo -e "${GREEN}========================================${NC}"
