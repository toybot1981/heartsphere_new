#!/bin/bash
# 检查生产环境构建产物中的 API Base URL 配置
# 使用方法: ./check-production-build.sh [服务器地址] [用户名] [路径]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}检查生产环境构建产物${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 交互式输入
if [ -z "$1" ]; then
    read -p "请输入服务器地址 (例如: heartsphere.cn): " REMOTE_HOST
else
    REMOTE_HOST="$1"
fi

if [ -z "$2" ]; then
    read -p "请输入SSH用户名 (默认: root): " REMOTE_USER
    REMOTE_USER="${REMOTE_USER:-root}"
else
    REMOTE_USER="$2"
fi

if [ -z "$3" ]; then
    read -p "请输入前端部署路径 (默认: /opt/heartsphere/frontend): " REMOTE_PATH
    REMOTE_PATH="${REMOTE_PATH:-/opt/heartsphere/frontend}"
else
    REMOTE_PATH="$3"
fi

# SSH 选项
SSH_OPTS="-o ConnectTimeout=5"

echo ""
echo -e "${BLUE}========== 检查构建产物 ==========${NC}"
echo -e "服务器: ${GREEN}${REMOTE_USER}@${REMOTE_HOST}${NC}"
echo -e "路径: ${GREEN}${REMOTE_PATH}${NC}"
echo ""

# 1. 检查是否存在错误的 localhost:8081
echo -e "${YELLOW}[1/4] 检查是否包含 localhost:8081...${NC}"
if ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "grep -r 'localhost:8081' '${REMOTE_PATH}/assets'/*.js 2>/dev/null | head -3" 2>/dev/null; then
    echo -e "${RED}❌ 发现错误：构建产物中包含 localhost:8081${NC}"
    echo -e "${RED}   说明使用了旧的构建产物，需要重新构建${NC}"
    HAS_ERROR=true
else
    echo -e "${GREEN}✅ 未发现 localhost:8081（正确）${NC}"
    HAS_ERROR=false
fi
echo ""

# 2. 检查是否包含相对路径 /api
echo -e "${YELLOW}[2/4] 检查是否包含相对路径 /api...${NC}"
if ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "grep -r '\"/api' '${REMOTE_PATH}/assets'/*.js 2>/dev/null | head -3" 2>/dev/null; then
    echo -e "${GREEN}✅ 发现相对路径 /api（正确）${NC}"
else
    echo -e "${YELLOW}⚠️  未发现相对路径 /api${NC}"
fi
echo ""

# 3. 检查 HTML 文件中是否有 window.__API_BASE_URL__
echo -e "${YELLOW}[3/4] 检查 HTML 文件中的运行时配置...${NC}"
if ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "grep -r '__API_BASE_URL__' '${REMOTE_PATH}'/*.html 2>/dev/null | head -3" 2>/dev/null; then
    echo -e "${YELLOW}⚠️  发现 HTML 中的运行时配置:${NC}"
    ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "grep -r '__API_BASE_URL__' '${REMOTE_PATH}'/*.html 2>/dev/null | head -3"
    echo -e "${YELLOW}   这可能会覆盖构建时的配置${NC}"
else
    echo -e "${GREEN}✅ 未发现 HTML 中的运行时配置（正确）${NC}"
fi
echo ""

# 4. 检查构建时间
echo -e "${YELLOW}[4/4] 检查构建时间...${NC}"
BUILD_TIME=$(ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "stat -c '%y' '${REMOTE_PATH}/assets'/*.js 2>/dev/null | head -1 | cut -d'.' -f1" 2>/dev/null || echo "无法获取")
if [ -n "$BUILD_TIME" ] && [ "$BUILD_TIME" != "无法获取" ]; then
    echo -e "${BLUE}构建时间: ${BUILD_TIME}${NC}"
else
    echo -e "${YELLOW}⚠️  无法获取构建时间${NC}"
fi
echo ""

# 总结
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}检查完成${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

if [ "$HAS_ERROR" = true ]; then
    echo -e "${RED}❌ 发现问题：构建产物包含 localhost:8081${NC}"
    echo ""
    echo -e "${YELLOW}修复步骤：${NC}"
    echo "  1. 在本地重新构建："
    echo -e "     ${BLUE}cd frontend${NC}"
    echo -e "     ${BLUE}echo 'VITE_API_BASE_URL=' > .env.production${NC}"
    echo -e "     ${BLUE}rm -rf dist${NC}"
    echo -e "     ${BLUE}npm run build${NC}"
    echo ""
    echo "  2. 上传到服务器："
    echo -e "     ${BLUE}scp -r dist/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/${NC}"
    echo ""
    echo "  3. 或使用部署脚本："
    echo -e "     ${BLUE}./deploy/deploy-frontend-scp.sh${NC}"
else
    echo -e "${GREEN}✅ 构建产物配置正确${NC}"
    echo ""
    echo -e "${YELLOW}如果仍然出现 CORS 错误，可能的原因：${NC}"
    echo "  1. 浏览器缓存了旧的 JS 文件（清除缓存并硬刷新）"
    echo "  2. HTML 中有 window.__API_BASE_URL__ 运行时配置"
    echo "  3. Nginx 配置问题"
fi
echo ""
