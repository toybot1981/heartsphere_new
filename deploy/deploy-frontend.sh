#!/bin/bash
# 前端部署脚本 - React + Vite
# 适用于阿里云 ECS 部署
# 使用方法: ./deploy-frontend.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
FRONTEND_DIR="${APP_HOME}/frontend"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
ENV_FILE="${APP_HOME}/.env"
BACKEND_PORT=8081
FRONTEND_PORT=80

# 交互式输入函数
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local value
    
    if [ -n "$default" ]; then
        echo -ne "${YELLOW}${prompt} [${default}]: ${NC}"
    else
        echo -ne "${YELLOW}${prompt}: ${NC}"
    fi
    
    read value
    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi
    eval "$var_name='$value'"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}前端部署脚本 - HeartSphere${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 加载已有环境变量
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
    BACKEND_PORT="${BACKEND_PORT:-8081}"
    FRONTEND_PORT="${FRONTEND_PORT:-80}"
fi

# ==================== 交互式配置 ====================
echo -e "${BLUE}========== 配置信息 ==========${NC}"

# 1. 选择部署环境
echo ""
echo -e "${YELLOW}请选择部署环境:${NC}"
echo "  1) 开发环境 (development) - 根路径: /"
echo "  2) 生产环境 (production) - 根路径: /"
echo "  3) 自定义路径"
read -p "请选择 [1-3] (默认: 2): " env_choice
env_choice="${env_choice:-2}"

case $env_choice in
    1)
        DEPLOY_ENV="development"
        BASE_PATH="/"
        API_BASE_URL=""
        ;;
    2)
        DEPLOY_ENV="production"
        BASE_PATH="/"
        API_BASE_URL=""
        ;;
    3)
        read_input "请输入自定义根路径（例如: /app）" "/" BASE_PATH
        BASE_PATH="${BASE_PATH%/}"  # 移除尾部斜杠
        if [ "$BASE_PATH" != "/" ]; then
            BASE_PATH="${BASE_PATH}/"
        fi
        API_BASE_URL=""
        ;;
    *)
        echo -e "${RED}无效选择，使用默认值${NC}"
        DEPLOY_ENV="production"
        BASE_PATH="/"
        API_BASE_URL=""
        ;;
esac

# 2. 配置域名
read_input "请输入域名（例如: heartsphere.cn）" "heartsphere.cn" DOMAIN_NAME

# 3. 配置前端端口
read_input "请输入前端端口" "80" FRONTEND_PORT

# 4. 配置后端端口
read_input "请输入后端端口" "8081" BACKEND_PORT

# 5. 确认配置
echo ""
echo -e "${BLUE}========== 配置确认 ==========${NC}"
echo -e "部署环境: ${GREEN}${DEPLOY_ENV}${NC}"
echo -e "根路径: ${GREEN}${BASE_PATH}${NC}"
echo -e "域名: ${GREEN}${DOMAIN_NAME}${NC}"
echo -e "前端端口: ${GREEN}${FRONTEND_PORT}${NC}"
echo -e "后端端口: ${GREEN}${BACKEND_PORT}${NC}"
echo ""
read -p "确认配置是否正确? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 0
fi

# ==================== 开始部署 ====================
echo ""
echo -e "${GREEN}开始部署前端服务...${NC}"

# 1. 安装 Node.js 18+
echo -e "${YELLOW}[1/8] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo -e "${YELLOW}安装 Node.js 18...${NC}"
    if command -v yum &> /dev/null; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        yum install -y nodejs
    elif command -v apt-get &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    else
        echo -e "${RED}错误: 未找到包管理器${NC}"
        exit 1
    fi
    echo -e "${GREEN}Node.js 安装完成${NC}"
else
    echo -e "${GREEN}Node.js 已安装: $(node -v)${NC}"
fi

# 2. 安装 Nginx
echo -e "${YELLOW}[2/8] 检查 Nginx 环境...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}安装 Nginx...${NC}"
    if command -v yum &> /dev/null; then
        yum install -y nginx
    elif command -v apt-get &> /dev/null; then
        apt-get install -y nginx
    else
        echo -e "${RED}错误: 未找到包管理器${NC}"
        exit 1
    fi
    systemctl enable nginx
    echo -e "${GREEN}Nginx 安装完成${NC}"
else
    echo -e "${GREEN}Nginx 已安装${NC}"
fi

# 3. 创建用户和目录
echo -e "${YELLOW}[3/8] 创建用户和目录...${NC}"
if ! id "${APP_USER}" &>/dev/null; then
    echo -e "${YELLOW}创建用户 ${APP_USER}...${NC}"
    useradd -r -s /bin/bash -d "${APP_HOME}" "${APP_USER}" || {
        echo -e "${YELLOW}用户可能已存在，继续...${NC}"
    }
fi

mkdir -p "${FRONTEND_DIR}"
mkdir -p "${APP_HOME}/logs"
chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}"

# 4. 构建前端项目
echo -e "${YELLOW}[4/8] 构建前端项目...${NC}"
cd "${PROJECT_ROOT}/frontend" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}

# 检查是否存在 node_modules，如果没有则安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
fi

# 创建前端环境变量文件
echo -e "${YELLOW}配置前端环境变量...${NC}"
cat > .env.production <<EOF
# 部署环境
VITE_DEPLOY_ENV=${DEPLOY_ENV}

# API 基础URL（使用相对路径，留空表示使用相对路径）
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
echo -e "${GREEN}前端环境变量文件已创建${NC}"

# 构建生产版本
echo -e "${YELLOW}构建生产版本...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
    exit 1
fi

# 5. 部署前端文件
echo -e "${YELLOW}[5/8] 部署前端文件...${NC}"
mkdir -p "${FRONTEND_DIR}"
rm -rf "${FRONTEND_DIR}"/*
cp -r dist/* "${FRONTEND_DIR}"/
chown -R "${APP_USER}:${APP_USER}" "${FRONTEND_DIR}"

# 6. 配置 Nginx
echo -e "${YELLOW}[6/8] 配置 Nginx...${NC}"

# 构建 location 路径
if [ "$BASE_PATH" = "/" ]; then
    LOCATION_PATH="/"
    ROOT_PATH="${FRONTEND_DIR}"
else
    LOCATION_PATH="${BASE_PATH}"
    ROOT_PATH="${FRONTEND_DIR}"
fi

cat > "${NGINX_CONF}" <<EOF
# HeartSphere 前端服务配置
server {
    listen ${FRONTEND_PORT};
    server_name ${DOMAIN_NAME} _;
    
    root ${ROOT_PATH};
    index index.html;

    # 前端静态文件
    location ${LOCATION_PATH} {
        alias ${FRONTEND_DIR}/;
        try_files \$uri \$uri/ ${LOCATION_PATH}index.html;
    }

    # 后端 API 代理（使用相对路径）
    location ${LOCATION_PATH}api/ {
        proxy_pass http://localhost:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 增加超时时间
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 图片文件代理
    location ${LOCATION_PATH}api/images/files/ {
        proxy_pass http://localhost:${BACKEND_PORT}/api/images/files/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # 日志
    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log;
}
EOF

# 测试 Nginx 配置
nginx -t || {
    echo -e "${RED}Nginx 配置测试失败${NC}"
    exit 1
}

# 7. 启动 Nginx
echo -e "${YELLOW}[7/8] 启动 Nginx...${NC}"
systemctl restart nginx

# 8. 检查服务状态
echo -e "${YELLOW}[8/8] 检查服务状态...${NC}"
sleep 2

if systemctl is-active --quiet nginx; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}前端部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "服务地址: ${GREEN}http://${DOMAIN_NAME}:${FRONTEND_PORT}${LOCATION_PATH}${NC}"
    echo -e "查看日志: ${GREEN}journalctl -u nginx -f${NC}"
    echo -e "Nginx 配置: ${GREEN}${NGINX_CONF}${NC}"
else
    echo -e "${RED}前端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u nginx -n 50"
    exit 1
fi

echo -e "${GREEN}前端部署完成！${NC}"
