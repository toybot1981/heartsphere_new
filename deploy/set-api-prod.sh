#!/bin/bash
# 快速设置生产环境 API Base URL 为 http://heartsphere.cn:8080
# 使用方法: ./set-api-prod.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}快速设置生产环境 API Base URL${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# 检查前端目录
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}错误: 前端目录不存在: ${FRONTEND_DIR}${NC}"
    exit 1
fi

cd "$FRONTEND_DIR" || exit 1

# 设置 API Base URL
API_BASE_URL="http://heartsphere.cn:8080"
DEPLOY_ENV="production"

echo -e "${BLUE}设置信息:${NC}"
echo -e "  环境: ${GREEN}${DEPLOY_ENV}${NC}"
echo -e "  API Base URL: ${GREEN}${API_BASE_URL}${NC}"
echo -e "${YELLOW}注意: 使用绝对 URL 直接访问后端，需要确保后端配置了 CORS${NC}"
echo ""

# 读取现有的环境变量（如果有）
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    source "${PROJECT_ROOT}/.env" 2>/dev/null || true
    set +a
fi

# 创建 .env.production 文件
cat > ".env.production" <<EOF
# 部署环境
VITE_DEPLOY_ENV=${DEPLOY_ENV}

# API 基础URL配置
# 设置为 http://heartsphere.cn:8080，直接访问后端
# 注意: 需要确保后端配置了 CORS 允许前端域名
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

chmod 600 ".env.production"
echo -e "${GREEN}✅ 环境变量文件已创建: .env.production${NC}"
echo ""

# 显示配置摘要
echo -e "${CYAN}配置摘要:${NC}"
echo -e "  文件: ${YELLOW}.env.production${NC}"
echo -e "  VITE_API_BASE_URL: ${GREEN}${API_BASE_URL}${NC}"
echo -e "  最终 API_BASE_URL: ${GREEN}${API_BASE_URL}/api${NC}"
echo ""

# 显示下一步
echo -e "${CYAN}下一步:${NC}"
echo "  1. 检查配置: ${YELLOW}cat .env.production | grep VITE_API_BASE_URL${NC}"
echo "  2. 删除旧构建: ${YELLOW}rm -rf dist${NC}"
echo "  3. 重新构建: ${YELLOW}npm run build${NC}"
echo "  4. 验证构建: ${YELLOW}grep -r '${API_BASE_URL}' dist/assets/*.js${NC}"
echo "  5. 上传到服务器: ${YELLOW}scp -r dist/* user@server:/opt/heartsphere/frontend/${NC}"
echo ""
echo -e "${YELLOW}重要提醒:${NC}"
echo -e "  - 使用绝对 URL 直接访问后端，需要确保后端配置了 CORS"
echo -e "  - 推荐使用相对路径 /api 通过 nginx 代理（更安全）"
echo -e "  - 如果需要切换回相对路径，运行: ${BLUE}./deploy/set-api-env.sh production \"\"${NC}"
echo ""
echo -e "${GREEN}完成！${NC}"
