#!/bin/bash
# 快速修复生产环境 API Base URL 配置
# 使用方法: ./fix-api-base-url.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复生产环境 API Base URL 配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户（如果需要访问系统目录）
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 建议使用 root 用户运行此脚本${NC}"
fi

# 1. 获取配置
echo -e "${YELLOW}请选择API访问方式:${NC}"
echo "  1) 通过Nginx代理（相对路径 /api，推荐）"
echo "  2) 直接访问后端（绝对URL，如 http://heartsphere.cn:8080）"
read -p "请选择 [1-2] (默认: 2): " api_access_choice
api_access_choice="${api_access_choice:-2}"

if [ "$api_access_choice" = "2" ]; then
    read -p "请输入后端完整URL（例如: http://heartsphere.cn:8080）: " API_BASE_URL
    API_BASE_URL="${API_BASE_URL%/}"  # 移除末尾斜杠
    if [ -z "$API_BASE_URL" ]; then
        echo -e "${RED}错误: API Base URL 不能为空${NC}"
        exit 1
    fi
    echo -e "${GREEN}将设置 API_BASE_URL=${API_BASE_URL}${NC}"
else
    API_BASE_URL=""
    echo -e "${GREEN}将使用相对路径（通过Nginx代理）${NC}"
fi

# 2. 创建 .env.production 文件
echo ""
echo -e "${YELLOW}[1/3] 创建 .env.production 文件...${NC}"
cd "${FRONTEND_DIR}" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}

cat > .env.production <<EOF
# API 基础URL配置
VITE_API_BASE_URL=${API_BASE_URL}
EOF

echo -e "${GREEN}.env.production 文件已创建${NC}"
cat .env.production

# 3. 重新构建前端
echo ""
echo -e "${YELLOW}[2/3] 重新构建前端项目...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
fi

npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
    exit 1
fi

echo -e "${GREEN}前端构建完成${NC}"

# 4. 提示部署
echo ""
echo -e "${YELLOW}[3/3] 部署提示${NC}"
echo -e "${GREEN}构建完成！接下来请：${NC}"
echo ""
echo -e "1. 将构建产物部署到生产环境："
echo -e "   ${YELLOW}sudo cp -r ${FRONTEND_DIR}/dist/* /opt/heartsphere/frontend/${NC}"
echo ""
echo -e "2. 或者使用部署脚本重新部署："
echo -e "   ${YELLOW}cd ${SCRIPT_DIR} && sudo ./deploy-frontend.sh${NC}"
echo ""
echo -e "${GREEN}配置完成！${NC}"
