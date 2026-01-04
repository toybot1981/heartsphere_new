#!/bin/bash
# 本地修复 API Base URL 配置（用于本地打包后上传到服务器）
# 使用方法: ./fix-api-url-local.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}本地修复 API Base URL 配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}此脚本用于在本地修复配置并重新构建，然后上传到服务器${NC}"
echo ""

# 1. 检查当前配置
echo -e "${BLUE}[1/4] 检查当前配置...${NC}"
cd "${FRONTEND_DIR}" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}

if [ -f ".env.production" ]; then
    echo -e "${YELLOW}当前 .env.production 内容：${NC}"
    cat .env.production | grep -E "VITE_API_BASE_URL|VITE_DEPLOY_ENV" || echo "  未找到相关配置"
    
    API_BASE_URL_VALUE=$(grep "^VITE_API_BASE_URL=" .env.production 2>/dev/null | cut -d'=' -f2 || echo "")
    if [ -z "$API_BASE_URL_VALUE" ]; then
        echo -e "${GREEN}✅ 当前配置正确：VITE_API_BASE_URL 为空（使用相对路径）${NC}"
        read -p "是否仍要重新构建? [y/N]: " rebuild_confirm
        if [[ ! "$rebuild_confirm" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}已取消${NC}"
            exit 0
        fi
    elif [[ "$API_BASE_URL_VALUE" == *"localhost"* ]]; then
        echo -e "${RED}❌ 发现错误配置：VITE_API_BASE_URL=${API_BASE_URL_VALUE}${NC}"
        echo -e "${YELLOW}需要修复为相对路径（空字符串）${NC}"
    else
        echo -e "${YELLOW}⚠️  当前配置: VITE_API_BASE_URL=${API_BASE_URL_VALUE}${NC}"
        read -p "是否要修改为相对路径（空字符串）? [Y/n]: " fix_confirm
        if [[ ! "$fix_confirm" =~ ^[Nn]$ ]]; then
            API_BASE_URL_VALUE=""
        fi
    fi
else
    echo -e "${YELLOW}⚠️  .env.production 文件不存在，将创建新文件${NC}"
    API_BASE_URL_VALUE=""
fi
echo ""

# 2. 选择 API 访问方式
echo -e "${BLUE}[2/4] 配置 API 访问方式${NC}"
echo -e "${YELLOW}请选择API访问方式:${NC}"
echo "  1) 通过Nginx代理（相对路径 /api，推荐生产环境）"
echo "  2) 直接访问后端（绝对URL，如 http://heartsphere.cn:8081）"
read -p "请选择 [1-2] (默认: 1): " api_access_choice
api_access_choice="${api_access_choice:-1}"

if [ "$api_access_choice" = "2" ]; then
    read -p "请输入后端完整URL（例如: http://heartsphere.cn:8081）: " API_BASE_URL
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
echo ""

# 3. 创建/更新 .env.production 文件
echo -e "${BLUE}[3/4] 创建/更新 .env.production 文件...${NC}"

# 读取现有的环境变量（如果有）
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    source "${PROJECT_ROOT}/.env"
    set +a
fi

cat > .env.production <<EOF
# 部署环境
VITE_DEPLOY_ENV=production

# API 基础URL（相对路径，使用空字符串表示使用相对路径）
# 空字符串表示使用相对路径 /api，通过 nginx 代理
VITE_API_BASE_URL=${API_BASE_URL}

# 大模型 API Key 配置（从主环境变量文件读取）
VITE_GEMINI_API_KEY=${GEMINI_API_KEY:-}
VITE_OPENAI_API_KEY=${OPENAI_API_KEY:-}
VITE_OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://api.openai.com/v1}
VITE_QWEN_API_KEY=${QWEN_API_KEY:-}
VITE_QWEN_BASE_URL=${QWEN_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}
VITE_DOUBAO_API_KEY=${DOUBAO_API_KEY:-}
VITE_DOUBAO_BASE_URL=${DOUBAO_BASE_URL:-https://ark.cn-beijing.volces.com/api/v3}

# 模型名称配置
VITE_GEMINI_MODEL_NAME=${GEMINI_MODEL_NAME:-gemini-2.5-flash}
VITE_GEMINI_IMAGE_MODEL=${GEMINI_IMAGE_MODEL:-gemini-2.5-flash-image}
VITE_GEMINI_VIDEO_MODEL=${GEMINI_VIDEO_MODEL:-veo-3.1-fast-generate-preview}
VITE_OPENAI_MODEL_NAME=${VITE_OPENAI_MODEL_NAME:-gpt-4o}
VITE_OPENAI_IMAGE_MODEL=${VITE_OPENAI_IMAGE_MODEL:-dall-e-3}
VITE_QWEN_MODEL_NAME=${VITE_QWEN_MODEL_NAME:-qwen-max}
VITE_QWEN_IMAGE_MODEL=${VITE_QWEN_IMAGE_MODEL:-qwen-image-plus}
VITE_QWEN_VIDEO_MODEL=${VITE_QWEN_VIDEO_MODEL:-wanx-video}
VITE_DOUBAO_MODEL_NAME=${VITE_DOUBAO_MODEL_NAME:-ep-2024...}
VITE_DOUBAO_IMAGE_MODEL=${VITE_DOUBAO_IMAGE_MODEL:-doubao-image-v1}
VITE_DOUBAO_VIDEO_MODEL=${VITE_DOUBAO_VIDEO_MODEL:-doubao-video-v1}

# 路由策略配置
VITE_TEXT_PROVIDER=${TEXT_PROVIDER:-gemini}
VITE_IMAGE_PROVIDER=${IMAGE_PROVIDER:-gemini}
VITE_VIDEO_PROVIDER=${VIDEO_PROVIDER:-gemini}
VITE_AUDIO_PROVIDER=${AUDIO_PROVIDER:-gemini}
VITE_ENABLE_FALLBACK=${ENABLE_FALLBACK:-true}
EOF

chmod 600 .env.production
echo -e "${GREEN}.env.production 文件已创建/更新${NC}"
echo -e "${BLUE}关键配置: VITE_API_BASE_URL=${NC}${GREEN}${API_BASE_URL:-（空字符串，使用相对路径）}${NC}"
echo ""

# 4. 重新构建前端
echo -e "${BLUE}[4/4] 重新构建前端项目...${NC}"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
fi

echo -e "${YELLOW}开始构建...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
    exit 1
fi

echo -e "${GREEN}前端构建完成${NC}"
echo ""

# 5. 验证构建产物
echo -e "${BLUE}[验证] 检查构建产物...${NC}"
if [ -z "$API_BASE_URL" ]; then
    # 使用相对路径，不应该包含 localhost:8081
    if grep -r "localhost:8081" dist/assets/*.js 2>/dev/null | head -1; then
        echo -e "${RED}❌ 警告: 构建产物中仍包含 localhost:8081${NC}"
        echo -e "${YELLOW}这可能是缓存问题，请检查 .env.production 文件${NC}"
    else
        echo -e "${GREEN}✅ 验证通过: 构建产物中不包含 localhost:8081${NC}"
    fi
    
    # 应该包含相对路径 /api
    if grep -r '"/api' dist/assets/*.js 2>/dev/null | head -1; then
        echo -e "${GREEN}✅ 验证通过: 构建产物中包含相对路径 /api${NC}"
    fi
else
    # 使用绝对路径
    if grep -r "$API_BASE_URL" dist/assets/*.js 2>/dev/null | head -1; then
        echo -e "${GREEN}✅ 验证通过: 构建产物中包含配置的 API 地址${NC}"
    fi
fi
echo ""

# 6. 显示部署提示
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步操作：${NC}"
echo -e "  1. 将构建产物上传到服务器："
echo -e "     ${YELLOW}scp -r ${FRONTEND_DIR}/dist/* user@server:/opt/heartsphere/frontend/${NC}"
echo ""
echo -e "  2. 或者在服务器上执行："
echo -e "     ${YELLOW}cd /opt/heartsphere/frontend${NC}"
echo -e "     ${YELLOW}sudo rm -rf *${NC}"
echo -e "     ${YELLOW}sudo cp -r /path/to/local/dist/* .${NC}"
echo ""
echo -e "  3. 设置文件权限（如果需要）："
echo -e "     ${YELLOW}sudo chown -R heartsphere:heartsphere /opt/heartsphere/frontend${NC}"
echo ""
echo -e "  4. 清除浏览器缓存并刷新页面"
echo ""
echo -e "${GREEN}配置信息：${NC}"
echo -e "  API 访问方式: ${GREEN}${API_BASE_URL:-相对路径 /api（通过 nginx 代理）}${NC}"
echo -e "  构建目录: ${GREEN}${FRONTEND_DIR}/dist${NC}"
echo ""
echo -e "${GREEN}完成！${NC}"
