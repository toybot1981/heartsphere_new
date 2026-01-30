#!/bin/bash
# 启动本地服务脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../build/common.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}启动本地开发服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查环境
if ! "$SCRIPT_DIR/check-env.sh"; then
    echo -e "${RED}环境检查失败${NC}"
    exit 1
fi

# 检查 Docker（可选）
if command -v docker &> /dev/null; then
    echo -e "${BLUE}检查 Docker 服务...${NC}"
    if docker ps &> /dev/null; then
        echo -e "${GREEN}✓ Docker 运行中${NC}"
        
        # 检查是否有 docker-compose.local.yml
        if [ -f "$PROJECT_ROOT/docker-compose.local.yml" ]; then
            echo -e "${BLUE}启动 Docker 服务...${NC}"
            cd "$PROJECT_ROOT"
            docker-compose -f docker-compose.local.yml up -d
            echo -e "${GREEN}✓ Docker 服务已启动${NC}"
        else
            echo -e "${YELLOW}⚠ docker-compose.local.yml 不存在，跳过 Docker 服务${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ Docker 未运行，跳过 Docker 服务${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Docker 未安装，跳过 Docker 服务${NC}"
fi

echo ""
echo -e "${BLUE}提示:${NC}"
echo -e "${BLUE}  - 使用 scripts/start-all.sh 启动所有项目服务${NC}"
echo -e "${BLUE}  - Mock LLM 服务将在后续版本中实现${NC}"
echo ""
echo -e "${GREEN}本地服务启动完成${NC}"
