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

# 4. 配置域名和图片URL
echo -e "${YELLOW}[4/8] 配置域名和图片URL...${NC}"
if [ -f "${APP_HOME}/.env" ]; then
    source ${APP_HOME}/.env
fi

# 获取域名配置（用于图片URL）
if [ -z "${DOMAIN_NAME}" ]; then
    echo -e "${YELLOW}请输入生产环境域名（例如: heartsphere.cn 或 www.heartsphere.cn）:${NC}"
    echo -e "${YELLOW}如果使用HTTPS，请输入完整域名（例如: https://heartsphere.cn）${NC}"
    read -p "域名 [默认: heartsphere.cn]: " DOMAIN_NAME
    DOMAIN_NAME="${DOMAIN_NAME:-heartsphere.cn}"
fi

# 处理域名格式
if [[ ! "$DOMAIN_NAME" =~ ^https?:// ]]; then
    # 如果没有协议，默认使用 http
    DOMAIN_NAME="http://${DOMAIN_NAME}"
fi

# 构建图片基础URL（格式：http://domain.com/images，不需要 /api 前缀）
IMAGE_BASE_URL="${DOMAIN_NAME%/}/images"

echo -e "${GREEN}图片基础URL已配置: ${IMAGE_BASE_URL}${NC}"
echo -e "${YELLOW}注意：确保Nginx已配置 /images/ 路径代理或静态文件服务${NC}"

# 5. 创建数据库
echo -e "${YELLOW}[5/8] 配置数据库...${NC}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-heartsphere}"
DB_PASSWORD="${DB_PASSWORD:-HeartSphere@2024}"

mysql -u root -p <<EOF 2>/dev/null || echo -e "${YELLOW}请手动创建数据库:${NC}"
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
EOF

# 6. 构建后端项目
echo -e "${YELLOW}[6/8] 构建后端项目...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}/backend"

echo -e "${YELLOW}清理旧的构建...${NC}"
mvn clean

echo -e "${YELLOW}编译打包...${NC}"
mvn package -DskipTests

# 7. 部署 JAR 文件
echo -e "${YELLOW}[7/8] 部署 JAR 文件...${NC}"
JAR_FILE=$(find target -name "*.jar" ! -name "*sources.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}未找到 JAR 文件！${NC}"
    exit 1
fi

mkdir -p ${BACKEND_DIR}
cp ${JAR_FILE} ${BACKEND_DIR}/app.jar
chown ${APP_USER}:${APP_USER} ${BACKEND_DIR}/app.jar

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
# 加载 .env 文件中的环境变量（包括 IMAGE_BASE_URL）
EnvironmentFile=${APP_HOME}/.env

[Install]
WantedBy=multi-user.target
EOF

# 创建或更新环境配置文件
if [ ! -f "${APP_HOME}/.env" ]; then
    cat > ${APP_HOME}/.env <<EOF
# 数据库配置
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=3306

# JWT 配置
JWT_SECRET=$(openssl rand -base64 32)

# 微信配置（可选）
WECHAT_APP_ID=
WECHAT_APP_SECRET=
WECHAT_REDIRECT_URI=

# 图片存储配置
# 注意：格式为 http://domain.com/images（不需要 /api 前缀）
# 如果使用HTTPS，改为 https://domain.com/images
IMAGE_STORAGE_PATH=${APP_HOME}/uploads/images
IMAGE_BASE_URL=${IMAGE_BASE_URL}

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
    echo -e "${GREEN}环境配置文件已创建: ${APP_HOME}/.env${NC}"
    echo -e "${YELLOW}请编辑此文件配置大模型 API Key${NC}"
else
    # 如果 .env 文件已存在，更新 IMAGE_BASE_URL（如果未设置或为localhost）
    if ! grep -q "^IMAGE_BASE_URL=" ${APP_HOME}/.env || grep -q "IMAGE_BASE_URL=.*localhost" ${APP_HOME}/.env; then
        echo -e "${YELLOW}更新 .env 文件中的 IMAGE_BASE_URL...${NC}"
        # 如果存在但值为localhost，则更新
        if grep -q "^IMAGE_BASE_URL=" ${APP_HOME}/.env; then
            sed -i "s|^IMAGE_BASE_URL=.*|IMAGE_BASE_URL=${IMAGE_BASE_URL}|" ${APP_HOME}/.env
        else
            # 如果不存在，则添加
            echo "" >> ${APP_HOME}/.env
            echo "# 图片存储配置" >> ${APP_HOME}/.env
            echo "IMAGE_BASE_URL=${IMAGE_BASE_URL}" >> ${APP_HOME}/.env
        fi
        echo -e "${GREEN}已更新 IMAGE_BASE_URL=${IMAGE_BASE_URL}${NC}"
    fi
fi

# 创建 application-prod.yml
cat > ${BACKEND_DIR}/application-prod.yml <<EOF
server:
  port: ${BACKEND_PORT}

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
      # 图片基础URL配置
      # 格式：http://domain.com/images 或 https://domain.com/images（不需要 /api 前缀）
      # 如果未配置 IMAGE_BASE_URL 环境变量，将自动从请求中获取域名
      # 生产环境建议在 .env 文件中配置 IMAGE_BASE_URL
      base-url: \${IMAGE_BASE_URL:}
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
    echo -e "${GREEN}服务地址: http://localhost:${BACKEND_PORT}${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}配置信息：${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "域名: ${DOMAIN_NAME}"
    echo -e "图片基础URL: ${IMAGE_BASE_URL}"
    echo -e "环境配置文件: ${APP_HOME}/.env"
    echo ""
    echo -e "${YELLOW}重要提示：${NC}"
    echo -e "1. 确保Nginx已配置 /images/ 路径代理或静态文件服务"
    echo -e "2. 确保Nginx设置了 X-Forwarded-Host 和 X-Forwarded-Proto header"
    echo -e "3. 如果使用HTTPS，请将 .env 中的 IMAGE_BASE_URL 改为 https://"
    echo -e "4. 查看配置说明: docs/14-部署运维/图片URL配置修复说明.md"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${RED}后端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u ${APP_NAME}-backend -n 50"
    exit 1
fi

echo -e "${GREEN}后端部署完成！${NC}"








