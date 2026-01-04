#!/bin/bash
# 修复生产环境 API Base URL 配置问题
# 问题：生产环境使用了 localhost:8081，导致 CORS 错误
# 解决：使用相对路径，通过 nginx 代理

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
APP_HOME="/opt/heartsphere"
PROD_FRONTEND_DIR="${APP_HOME}/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复生产环境 API Base URL 配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}问题描述：${NC}"
echo -e "  生产环境前端尝试访问 http://localhost:8081，导致 CORS 错误"
echo -e "  应该使用相对路径 /api，通过 nginx 代理"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 建议使用 root 用户运行此脚本${NC}"
    read -p "继续执行? [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# 1. 创建正确的 .env.production 文件
echo -e "${YELLOW}[1/4] 创建正确的 .env.production 文件...${NC}"
cd "${FRONTEND_DIR}" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}

# 读取现有的环境变量（如果有）
if [ -f "${APP_HOME}/.env" ]; then
    set -a
    source "${APP_HOME}/.env"
    set +a
fi

# 创建 .env.production，使用相对路径（空字符串）
cat > .env.production <<EOF
# 部署环境
VITE_DEPLOY_ENV=production

# API 基础URL（使用相对路径，通过 nginx 代理）
# 空字符串表示使用相对路径 /api
VITE_API_BASE_URL=

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
echo -e "${GREEN}.env.production 文件已创建${NC}"
echo -e "${BLUE}关键配置: VITE_API_BASE_URL=${NC}${GREEN}（空字符串，使用相对路径）${NC}"
echo ""

# 2. 重新构建前端
echo -e "${YELLOW}[2/4] 重新构建前端项目...${NC}"
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

# 3. 验证构建产物中的 API 配置
echo -e "${YELLOW}[3/4] 验证构建产物...${NC}"
if grep -r "localhost:8081" dist/assets/*.js 2>/dev/null | head -1; then
    echo -e "${RED}警告: 构建产物中仍包含 localhost:8081${NC}"
    echo -e "${YELLOW}这可能是缓存问题，请检查 .env.production 文件${NC}"
else
    echo -e "${GREEN}验证通过: 构建产物中不包含 localhost:8081${NC}"
fi
echo ""

# 4. 部署到生产环境
echo -e "${YELLOW}[4/4] 部署到生产环境...${NC}"
if [ ! -d "${PROD_FRONTEND_DIR}" ]; then
    echo -e "${YELLOW}创建生产目录...${NC}"
    mkdir -p "${PROD_FRONTEND_DIR}"
fi

echo -e "${YELLOW}复制构建产物...${NC}"
cp -r dist/* "${PROD_FRONTEND_DIR}"/

# 设置权限
if id "heartsphere" &>/dev/null; then
    chown -R heartsphere:heartsphere "${PROD_FRONTEND_DIR}"
    echo -e "${GREEN}已设置文件权限${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}修复内容：${NC}"
echo -e "  1. ✅ 创建了正确的 .env.production（VITE_API_BASE_URL 为空）"
echo -e "  2. ✅ 重新构建了前端项目"
echo -e "  3. ✅ 部署到生产目录 ${PROD_FRONTEND_DIR}"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo -e "  1. 清除浏览器缓存并刷新页面"
echo -e "  2. 检查 nginx 配置，确保 /api/ 代理配置正确"
echo -e "  3. 如果问题仍然存在，检查是否有其他地方设置了 window.__API_BASE_URL__"
echo ""
echo -e "${GREEN}修复完成！${NC}"
