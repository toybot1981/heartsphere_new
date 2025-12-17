#!/bin/bash
# 前端部署脚本 - React + Vite

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置变量
APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
FRONTEND_DIR="${APP_HOME}/frontend"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
BACKEND_PORT=8081
FRONTEND_PORT=80

echo -e "${GREEN}开始部署前端服务...${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 安装 Node.js 18+
echo -e "${YELLOW}[1/6] 检查 Node.js 环境...${NC}"
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt 18 ]; then
    echo -e "${YELLOW}安装 Node.js 18...${NC}"
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    yum install -y nodejs
else
    echo -e "${GREEN}Node.js 已安装: $(node -v)${NC}"
fi

# 2. 安装 Nginx
echo -e "${YELLOW}[2/6] 检查 Nginx 环境...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}安装 Nginx...${NC}"
    yum install -y nginx
    systemctl enable nginx
else
    echo -e "${GREEN}Nginx 已安装${NC}"
fi

# 3. 构建前端项目
echo -e "${YELLOW}[3/6] 构建前端项目...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/frontend"

# 检查是否存在 node_modules，如果没有则安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
fi

# 创建前端环境变量文件
echo -e "${YELLOW}配置前端环境变量...${NC}"
if [ -f "${APP_HOME}/.env" ]; then
    # 读取环境变量（使用 source 但避免污染当前 shell）
    set -a
    source ${APP_HOME}/.env
    set +a
    
    # 创建 .env.production 文件（Vite 会自动读取）
    cat > .env.production <<EOF
# 大模型 API Key 配置
# 注意: Vite 只读取以 VITE_ 开头的环境变量
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
VITE_OPENAI_MODEL_NAME=${OPENAI_MODEL_NAME:-gpt-4o}
VITE_OPENAI_IMAGE_MODEL=${OPENAI_IMAGE_MODEL:-dall-e-3}
VITE_QWEN_MODEL_NAME=${QWEN_MODEL_NAME:-qwen-max}
VITE_QWEN_IMAGE_MODEL=${QWEN_IMAGE_MODEL:-qwen-image-plus}
VITE_QWEN_VIDEO_MODEL=${QWEN_VIDEO_MODEL:-wanx-video}
VITE_DOUBAO_MODEL_NAME=${DOUBAO_MODEL_NAME:-ep-2024...}
VITE_DOUBAO_IMAGE_MODEL=${DOUBAO_IMAGE_MODEL:-doubao-image-v1}
VITE_DOUBAO_VIDEO_MODEL=${DOUBAO_VIDEO_MODEL:-doubao-video-v1}

# 路由策略配置
VITE_TEXT_PROVIDER=${TEXT_PROVIDER:-gemini}
VITE_IMAGE_PROVIDER=${IMAGE_PROVIDER:-gemini}
VITE_VIDEO_PROVIDER=${VIDEO_PROVIDER:-gemini}
VITE_AUDIO_PROVIDER=${AUDIO_PROVIDER:-gemini}
VITE_ENABLE_FALLBACK=${ENABLE_FALLBACK:-true}
EOF
    chmod 600 .env.production
    echo -e "${GREEN}前端环境变量文件已创建: .env.production${NC}"
    echo -e "${YELLOW}已配置的 API Key:${NC}"
    [ -n "${GEMINI_API_KEY}" ] && echo -e "  ${GREEN}✓${NC} Gemini"
    [ -n "${OPENAI_API_KEY}" ] && echo -e "  ${GREEN}✓${NC} OpenAI"
    [ -n "${QWEN_API_KEY}" ] && echo -e "  ${GREEN}✓${NC} Qwen"
    [ -n "${DOUBAO_API_KEY}" ] && echo -e "  ${GREEN}✓${NC} Doubao"
else
    echo -e "${YELLOW}警告: 未找到 ${APP_HOME}/.env 文件，将使用默认配置${NC}"
    echo -e "${YELLOW}提示: 可以在部署后运行 ./configure-api-keys.sh 配置 API Key${NC}"
fi

# 构建生产版本
echo -e "${YELLOW}构建生产版本...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
    exit 1
fi

# 4. 部署前端文件
echo -e "${YELLOW}[4/6] 部署前端文件...${NC}"
mkdir -p ${FRONTEND_DIR}
rm -rf ${FRONTEND_DIR}/*
cp -r dist/* ${FRONTEND_DIR}/
chown -R ${APP_USER}:${APP_USER} ${FRONTEND_DIR}

# 5. 配置 Nginx
echo -e "${YELLOW}[5/6] 配置 Nginx...${NC}"
cat > ${NGINX_CONF} <<EOF
server {
    listen ${FRONTEND_PORT};
    server_name _;
    
    root ${FRONTEND_DIR};
    index index.html;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT};
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
    location /api/images/files/ {
        proxy_pass http://localhost:${BACKEND_PORT};
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
nginx -t

# 6. 启动 Nginx
echo -e "${YELLOW}[6/6] 启动 Nginx...${NC}"
systemctl restart nginx

# 检查服务状态
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}前端服务启动成功！${NC}"
    echo -e "${GREEN}服务地址: http://localhost:${FRONTEND_PORT}${NC}"
else
    echo -e "${RED}前端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u nginx -n 50"
    exit 1
fi

echo -e "${GREEN}前端部署完成！${NC}"





