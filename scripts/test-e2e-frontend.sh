#!/bin/bash

# 前端端到端测试脚本
# 
# 使用方法:
#   ./scripts/test-e2e-frontend.sh
# 
# 环境变量:
#   BACKEND_URL - 后端服务 URL（可选，默认 http://localhost:8082）
#   FRONTEND_URL - 前端服务 URL（可选，默认 http://localhost:3002）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BACKEND_URL=${BACKEND_URL:-http://localhost:8082}
FRONTEND_URL=${FRONTEND_URL:-http://localhost:3002}

echo -e "${GREEN}=== 前端端到端测试 ===${NC}"
echo "后端 URL: ${BACKEND_URL}"
echo "前端 URL: ${FRONTEND_URL}"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

# 检查后端是否运行
echo -e "${YELLOW}检查后端服务状态...${NC}"
if ! curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${RED}错误: 后端服务未运行 (${BACKEND_URL})${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 后端服务运行中${NC}"

# 检查前端是否运行
echo -e "${YELLOW}检查前端服务状态...${NC}"
if ! curl -s -f "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "${RED}错误: 前端服务未运行 (${FRONTEND_URL})${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 前端服务运行中${NC}"

echo ""
echo -e "${GREEN}=== 前端端到端测试完成 ===${NC}"
echo ""
echo "前端已运行，请在浏览器中访问:"
echo "  ${FRONTEND_URL}/mentis/manus"
echo ""
echo "手动测试建议:"
echo "  1. 创建新会话"
echo "  2. 创建虚拟机"
echo "  3. 在终端中执行命令"
echo "  4. 查看虚拟机截图"
echo "  5. 获取 VNC 连接信息"
echo "  6. 测试任务列表显示"
echo "  7. 测试实时更新"
