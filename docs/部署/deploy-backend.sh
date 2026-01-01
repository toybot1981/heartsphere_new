#!/bin/bash
# 后端部署脚本 - Spring Boot

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
BACKEND_DIR="${APP_HOME}/backend"
JAVA_VERSION="17"
BACKEND_PORT=8081
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}-backend.conf"
DOMAIN_NAME="${DOMAIN_NAME:-heartsphere.cn}"

echo -e "${GREEN}开始部署后端服务...${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 安装 Java 17
echo -e "${YELLOW}[1/7] 检查 Java 环境...${NC}"
if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "version \"17"; then
    echo -e "${YELLOW}安装 Java 17...${NC}"
    yum update -y
    yum install -y java-17-openjdk java-17-openjdk-devel
    
    # 设置 JAVA_HOME
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
    echo "export JAVA_HOME=${JAVA_HOME}" >> /etc/profile
    echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile
    source /etc/profile
else
    echo -e "${GREEN}Java 17 已安装${NC}"
fi

# 2. 安装 Maven
echo -e "${YELLOW}[2/7] 检查 Maven 环境...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}安装 Maven...${NC}"
    yum install -y maven
else
    echo -e "${GREEN}Maven 已安装${NC}"
fi

# 3. 安装 MySQL（如果未安装）
echo -e "${YELLOW}[3/7] 检查 MySQL 环境...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}安装 MySQL 8.0...${NC}"
    yum install -y mysql-server
    systemctl enable mysqld
    systemctl start mysqld
    
    # 获取临时密码
    TEMP_PASSWORD=$(grep 'temporary password' /var/log/mysqld.log | awk '{print $NF}' | tail -1)
    echo -e "${YELLOW}MySQL 临时密码: ${TEMP_PASSWORD}${NC}"
    echo -e "${YELLOW}请运行以下命令设置 MySQL root 密码:${NC}"
    echo -e "mysql_secure_installation"
else
    echo -e "${GREEN}MySQL 已安装${NC}"
fi

# 4. 创建数据库
echo -e "${YELLOW}[4/7] 配置数据库...${NC}"
if [ -f "${APP_HOME}/.env" ]; then
    source ${APP_HOME}/.env
fi

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-heartsphere}"
DB_PASSWORD="${DB_PASSWORD:-HeartSphere@2024}"

mysql -u root -p <<EOF 2>/dev/null || echo -e "${YELLOW}请手动创建数据库:${NC}"
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# 5. 构建后端项目
echo -e "${YELLOW}[5/7] 构建后端项目...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/backend"

echo -e "${YELLOW}清理旧的构建...${NC}"
mvn clean

echo -e "${YELLOW}编译打包...${NC}"
mvn package -DskipTests

# 6. 部署 JAR 文件
echo -e "${YELLOW}[6/7] 部署 JAR 文件...${NC}"
JAR_FILE=$(find target -name "*.jar" ! -name "*sources.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}未找到 JAR 文件！${NC}"
    exit 1
fi

mkdir -p ${BACKEND_DIR}
cp ${JAR_FILE} ${BACKEND_DIR}/app.jar
chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/app.jar

# 7. 安装和配置 Nginx
echo -e "${YELLOW}[7/8] 安装和配置 Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}安装 Nginx...${NC}"
    yum install -y nginx
    systemctl enable nginx
else
    echo -e "${GREEN}Nginx 已安装${NC}"
fi

# 创建后端 Nginx 配置（仅 API 反向代理）
cat > ${NGINX_CONF} <<EOF
# HeartSphere 后端 API 反向代理配置
# 注意：前端静态文件由 deploy-frontend.sh 配置在 80 端口

upstream ${APP_NAME}-backend {
    server 127.0.0.1:${BACKEND_PORT};
    keepalive 32;
}

server {
    listen 8081;
    server_name ${DOMAIN_NAME} localhost;

    # 日志配置
    access_log /var/log/nginx/${APP_NAME}-backend-access.log;
    error_log /var/log/nginx/${APP_NAME}-backend-error.log;

    # 客户端请求体大小限制
    client_max_body_size 10M;

    # API 反向代理
    location /api/ {
        proxy_pass http://${APP_NAME}-backend;
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

    # 健康检查端点
    location /actuator/ {
        proxy_pass http://${APP_NAME}-backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 测试 Nginx 配置
if nginx -t; then
    echo -e "${GREEN}Nginx 配置验证成功${NC}"
    systemctl reload nginx || systemctl restart nginx
else
    echo -e "${RED}Nginx 配置验证失败，请检查配置${NC}"
    exit 1
fi

# 8. 创建 systemd 服务
echo -e "${YELLOW}[8/8] 创建 systemd 服务...${NC}"
cat > /etc/systemd/system/${APP_NAME}-backend.service <<EOF
[Unit]
Description=HeartSphere Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m ${BACKEND_DIR}/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${APP_NAME}-backend

# 环境变量
Environment="JAVA_HOME=${JAVA_HOME}"
Environment="SPRING_PROFILES_ACTIVE=prod"

[Install]
WantedBy=multi-user.target
EOF

# 创建环境配置文件
if [ ! -f "${APP_HOME}/.env" ]; then
    cat > ${APP_HOME}/.env <<EOF
# 数据库配置
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=3306

# JWT 配置
JWT_SECRET=$(openssl rand -base64 32)

# 微信配置（可选）
WECHAT_APP_ID=
WECHAT_APP_SECRET=
WECHAT_REDIRECT_URI=

# 图片存储配置
IMAGE_STORAGE_PATH=${APP_HOME}/uploads/images
IMAGE_BASE_URL=http://localhost:${BACKEND_PORT}/api/images

# ==================== 大模型 API Key 配置 ====================
# Gemini (Google)
GEMINI_API_KEY=
GEMINI_MODEL_NAME=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_VIDEO_MODEL=veo-3.1-fast-generate-preview

# OpenAI (ChatGPT)
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3

# 通义千问 (Qwen)
QWEN_API_KEY=
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL_NAME=qwen-max
QWEN_IMAGE_MODEL=qwen-image-plus
QWEN_VIDEO_MODEL=wanx-video

# 豆包 (Doubao)
DOUBAO_API_KEY=
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL_NAME=ep-2024...
DOUBAO_IMAGE_MODEL=doubao-image-v1
DOUBAO_VIDEO_MODEL=doubao-video-v1

# ==================== 大模型路由策略配置 ====================
# 可选值: gemini, openai, qwen, doubao
TEXT_PROVIDER=gemini
IMAGE_PROVIDER=gemini
VIDEO_PROVIDER=gemini
AUDIO_PROVIDER=gemini
ENABLE_FALLBACK=true
EOF
    chown ${APP_USER}:${APP_USER} ${APP_HOME}/.env
    chmod 600 ${APP_HOME}/.env
    echo -e "${YELLOW}环境配置文件已创建: ${APP_HOME}/.env${NC}"
    echo -e "${YELLOW}请编辑此文件配置大模型 API Key${NC}"
fi

# 创建 application-prod.yml
cat > ${BACKEND_DIR}/application-prod.yml <<EOF
server:
  port: ${BACKEND_PORT}
  address: 127.0.0.1  # 仅监听本地接口，避免与 Nginx 端口冲突

spring:
  datasource:
    url: jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:heartsphere}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: \${DB_USER:root}
    password: \${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

jwt:
  secret: \${JWT_SECRET:your-secret-key-change-in-production}
  expiration: 86400000
  refresh-expiration: 604800000

wechat:
  app-id: \${WECHAT_APP_ID:}
  app-secret: \${WECHAT_APP_SECRET:}
  redirect-uri: \${WECHAT_REDIRECT_URI:http://localhost:${BACKEND_PORT}/api/wechat/callback}

app:
  image:
    storage:
      type: local
      local:
        path: \${IMAGE_STORAGE_PATH:${APP_HOME}/uploads/images}
      base-url: \${IMAGE_BASE_URL:http://localhost:${BACKEND_PORT}/api/images}
      max-size: 10485760

logging:
  level:
    root: INFO
    com.heartsphere: INFO
  file:
    name: ${APP_HOME}/logs/backend.log
EOF

chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/application-prod.yml

# 重新加载 systemd
systemctl daemon-reload

# 启动服务
echo -e "${YELLOW}启动后端服务...${NC}"
systemctl enable ${APP_NAME}-backend
systemctl restart ${APP_NAME}-backend

# 等待服务启动
sleep 5

# 检查服务状态
if systemctl is-active --quiet ${APP_NAME}-backend; then
    echo -e "${GREEN}后端服务启动成功！${NC}"
    echo -e "${GREEN}内部服务地址: http://localhost:${BACKEND_PORT}${NC}"
    echo -e "${GREEN}Nginx 代理地址: http://${DOMAIN_NAME}:8081/api${NC}"
else
    echo -e "${RED}后端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u ${APP_NAME}-backend -n 50"
    exit 1
fi

# 检查 Nginx 状态
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}Nginx 服务运行正常${NC}"
else
    echo -e "${YELLOW}警告: Nginx 服务未运行，请手动启动: systemctl start nginx${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}服务配置:${NC}"
echo -e "  后端内部端口: ${BACKEND_PORT}"
echo -e "  Nginx 代理端口: 8081"
echo -e "  前端端口: 80 (由 deploy-frontend.sh 配置)"
echo -e "  域名: ${DOMAIN_NAME}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  后端 API: http://${DOMAIN_NAME}:8081/api"
echo -e "  前端页面: http://${DOMAIN_NAME}"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo -e "  查看后端日志: journalctl -u ${APP_NAME}-backend -f"
echo -e "  查看 Nginx 日志: tail -f /var/log/nginx/${APP_NAME}-backend-*.log"
echo -e "  重启后端: systemctl restart ${APP_NAME}-backend"
echo -e "  重启 Nginx: systemctl restart nginx"








