#!/bin/bash
# Nginx 配置脚本
# 用于配置前端和后端的反向代理

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="heartsphere"
FRONTEND_PORT=80
BACKEND_PORT=8081
DOMAIN_NAME="heartsphere.cn"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Nginx 配置脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 交互式输入
read -p "请输入域名 [${DOMAIN_NAME}]: " input_domain
DOMAIN_NAME="${input_domain:-${DOMAIN_NAME}}"

read -p "请输入前端端口 [${FRONTEND_PORT}]: " input_frontend_port
FRONTEND_PORT="${input_frontend_port:-${FRONTEND_PORT}}"

read -p "请输入后端端口 [${BACKEND_PORT}]: " input_backend_port
BACKEND_PORT="${input_backend_port:-${BACKEND_PORT}}"

# 检查 Nginx 是否安装
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
fi

# 创建前端配置
FRONTEND_CONF="/etc/nginx/conf.d/${APP_NAME}-frontend.conf"
cat > "${FRONTEND_CONF}" <<EOF
# HeartSphere 前端服务配置
server {
    listen ${FRONTEND_PORT};
    server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
    
    root /opt/${APP_NAME}/frontend;
    index index.html;

    # 前端静态文件
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:${BACKEND_PORT}/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
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
    access_log /var/log/nginx/${APP_NAME}-frontend-access.log;
    error_log /var/log/nginx/${APP_NAME}-frontend-error.log;
}
EOF

echo -e "${GREEN}前端 Nginx 配置已创建: ${FRONTEND_CONF}${NC}"

# 创建后端配置
BACKEND_CONF="/etc/nginx/conf.d/${APP_NAME}-backend.conf"
cat > "${BACKEND_CONF}" <<EOF
# HeartSphere 后端 API 反向代理配置
upstream backend_api {
    server localhost:${BACKEND_PORT};
    keepalive 32;
}

server {
    listen 80;
    server_name api.${DOMAIN_NAME};

    # API 代理
    location /api/ {
        proxy_pass http://backend_api/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 日志
    access_log /var/log/nginx/${APP_NAME}-backend-access.log;
    error_log /var/log/nginx/${APP_NAME}-backend-error.log;
}
EOF

echo -e "${GREEN}后端 Nginx 配置已创建: ${BACKEND_CONF}${NC}"

# 测试配置
echo -e "${YELLOW}测试 Nginx 配置...${NC}"
nginx -t || {
    echo -e "${RED}Nginx 配置测试失败${NC}"
    exit 1
}

# 重新加载 Nginx
echo -e "${YELLOW}重新加载 Nginx...${NC}"
systemctl restart nginx

if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}Nginx 配置成功！${NC}"
    echo -e "前端地址: http://${DOMAIN_NAME}"
    echo -e "后端 API: http://api.${DOMAIN_NAME}/api"
else
    echo -e "${RED}Nginx 启动失败${NC}"
    exit 1
fi
