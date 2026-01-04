#!/bin/bash
# Development 环境前端部署脚本（本地部署）
# 使用方法: ./deploy-frontend-dev.sh
# 
# 功能:
# - 设置 development 环境变量（API Base URL: http://localhost:8080）
# - 构建前端项目
# - 将构建产物拷贝到 /opt/heartsphere/frontend

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"
DEPLOY_DIR="/opt/heartsphere/frontend"

# Development 环境配置
DEPLOY_ENV="development"
API_BASE_URL="http://localhost:8080"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Development 环境前端部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户（可能需要 root 权限访问 /opt 目录）
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}提示: 建议使用 root 用户运行此脚本（需要访问 /opt 目录）${NC}"
    read -p "继续执行? [y/N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}部署已取消${NC}"
        exit 0
    fi
fi

# ==================== 配置确认 ====================
echo -e "${BLUE}========== 部署配置 ==========${NC}"
echo -e "部署环境: ${GREEN}${DEPLOY_ENV}${NC}"
echo -e "API Base URL: ${GREEN}${API_BASE_URL}${NC}"
echo -e "部署目录: ${GREEN}${DEPLOY_DIR}${NC}"
echo ""
read -p "确认配置是否正确? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 0
fi

# ==================== 开始部署 ====================
echo ""
echo -e "${GREEN}开始部署流程...${NC}"

# 1. 检查前端目录
echo -e "${YELLOW}[1/5] 检查前端目录...${NC}"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}错误: 前端目录不存在: ${FRONTEND_DIR}${NC}"
    exit 1
fi
cd "$FRONTEND_DIR" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}
echo -e "${GREEN}前端目录检查通过${NC}"
echo ""

# 2. 设置 API Base URL 环境变量
echo -e "${YELLOW}[2/5] 设置 API Base URL 环境变量...${NC}"

# 读取现有的环境变量（如果有）
if [ -f "${PROJECT_ROOT}/.env" ]; then
    set -a
    source "${PROJECT_ROOT}/.env" 2>/dev/null || true
    set +a
fi

# 创建 .env.development 文件
cat > ".env.development" <<EOF
# 部署环境
VITE_DEPLOY_ENV=${DEPLOY_ENV}

# API 基础URL配置
# Development 环境默认使用 http://localhost:8080
VITE_API_BASE_URL=${API_BASE_URL}

# 大模型 API Key 配置（从主环境变量文件读取）
VITE_GEMINI_API_KEY=${GEMINI_API_KEY:-}
VITE_OPENAI_API_KEY=${OPENAI_API_KEY:-}
VITE_OPENAI_BASE_URL=${OPENAI_OPENAI_BASE_URL:-https://api.openai.com/v1}
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

chmod 600 .env.development
echo -e "${GREEN}环境变量文件已创建: .env.development${NC}"
echo -e "${BLUE}API Base URL: ${GREEN}${API_BASE_URL}${NC}"
echo ""

# 3. 检查是否需要构建
echo -e "${YELLOW}[3/5] 检查是否需要构建...${NC}"
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
    echo -e "${YELLOW}dist 目录不存在或为空，需要构建...${NC}"
    BUILD_NEEDED=true
else
    read -p "dist 目录已存在，是否重新构建? [y/N]: " rebuild
    if [[ "$rebuild" =~ ^[Yy]$ ]]; then
        BUILD_NEEDED=true
    else
        BUILD_NEEDED=false
    fi
fi

# 4. 构建前端项目
if [ "$BUILD_NEEDED" = true ]; then
    echo -e "${YELLOW}[4/5] 构建前端项目...${NC}"
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    # 构建（使用 development 模式）
    echo -e "${YELLOW}开始构建（development 模式）...${NC}"
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}构建完成${NC}"
else
    echo -e "${YELLOW}[4/5] 跳过构建，使用现有 dist 目录${NC}"
fi
echo ""

# 5. 验证构建产物
echo -e "${YELLOW}[5/5] 验证构建产物...${NC}"
if grep -r "localhost:8080" dist/assets/*.js 2>/dev/null | head -1; then
    echo -e "${GREEN}✅ 验证通过: 构建产物中包含 ${API_BASE_URL}${NC}"
else
    echo -e "${YELLOW}⚠️  未在构建产物中找到 ${API_BASE_URL}${NC}"
    echo -e "${YELLOW}   这可能是正常的（如果使用了相对路径）${NC}"
fi
echo ""

# 6. 部署到目标目录
echo -e "${YELLOW}[部署] 拷贝构建产物到部署目录...${NC}"

# 创建部署目录（如果不存在）
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${YELLOW}创建部署目录: ${DEPLOY_DIR}${NC}"
    mkdir -p "$DEPLOY_DIR"
fi

# 备份现有文件（如果存在）
if [ -d "$DEPLOY_DIR" ] && [ -n "$(ls -A "$DEPLOY_DIR" 2>/dev/null)" ]; then
    BACKUP_DIR="${DEPLOY_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}备份现有文件到: ${BACKUP_DIR}${NC}"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR" 2>/dev/null || true
    echo -e "${GREEN}备份完成${NC}"
fi

# 清空部署目录（可选）
read -p "是否清空部署目录后再拷贝? [y/N]: " clear_dir
if [[ "$clear_dir" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}清空部署目录...${NC}"
    rm -rf "${DEPLOY_DIR}"/*
    echo -e "${GREEN}目录已清空${NC}"
fi

# 拷贝构建产物
echo -e "${YELLOW}拷贝构建产物...${NC}"
cp -r dist/* "$DEPLOY_DIR"/

# 设置权限（如果是以 root 用户运行）
if [ "$EUID" -eq 0 ]; then
    # 检查是否存在 heartsphere 用户
    if id "heartsphere" &>/dev/null; then
        chown -R heartsphere:heartsphere "$DEPLOY_DIR"
        echo -e "${GREEN}已设置文件权限（heartsphere:heartsphere）${NC}"
    else
        # 如果没有 heartsphere 用户，设置为当前用户
        CURRENT_USER=${SUDO_USER:-$USER}
        if [ -n "$CURRENT_USER" ]; then
            chown -R "$CURRENT_USER:$CURRENT_USER" "$DEPLOY_DIR"
            echo -e "${GREEN}已设置文件权限（${CURRENT_USER}:${CURRENT_USER}）${NC}"
        fi
    fi
fi

echo -e "${GREEN}部署完成${NC}"
echo ""

# 7. 完成
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}部署信息:${NC}"
echo -e "  部署环境: ${GREEN}${DEPLOY_ENV}${NC}"
echo -e "  API Base URL: ${GREEN}${API_BASE_URL}${NC}"
echo -e "  部署目录: ${GREEN}${DEPLOY_DIR}${NC}"
if [ -n "$BACKUP_DIR" ]; then
    echo -e "  备份位置: ${GREEN}${BACKUP_DIR}${NC}"
fi
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 检查部署结果: ${CYAN}ls -la ${DEPLOY_DIR}${NC}"
echo -e "  2. 如果使用 Nginx，重新加载配置: ${CYAN}sudo systemctl reload nginx${NC}"
echo -e "  3. 访问前端: ${CYAN}http://localhost${NC} (或配置的域名)"
echo ""
echo -e "${GREEN}完成！${NC}"
