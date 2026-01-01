#!/bin/bash
# 后端部署脚本 - Spring Boot
# 适用于阿里云 ECS 部署
# 使用方法: ./deploy-backend.sh

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
BACKEND_DIR="${APP_HOME}/backend"
ENV_FILE="${APP_HOME}/.env"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}-backend.conf"
JAVA_VERSION="17"
BACKEND_PORT=8081

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

# 密码输入函数
read_password() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local value
    
    if [ -n "$default" ]; then
        echo -ne "${YELLOW}${prompt} [回车使用默认值]: ${NC}"
    else
        echo -ne "${YELLOW}${prompt}: ${NC}"
    fi
    
    read -s value
    echo ""
    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi
    eval "$var_name='$value'"
}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端部署脚本 - HeartSphere${NC}"
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
fi

# ==================== 交互式配置 ====================
echo -e "${BLUE}========== 数据库配置 ==========${NC}"
echo ""

# 1. 数据库主机
read_input "数据库主机地址" "${DB_HOST:-rm-bp1bg7xxnka508amyvo.mysql.rds.aliyuncs.com}" DB_HOST

# 2. 数据库端口
read_input "数据库端口" "${DB_PORT:-3306}" DB_PORT

# 3. 数据库名称
read_input "数据库名称" "${DB_NAME:-heartsphere}" DB_NAME

# 4. 数据库用户名
read_input "数据库用户名" "${DB_USER:-heartsphere}" DB_USER

# 5. 数据库密码
read_password "数据库密码" "${DB_PASSWORD:-}" DB_PASSWORD
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}错误: 数据库密码不能为空${NC}"
    exit 1
fi

# 6. 后端端口
read_input "后端服务端口" "${BACKEND_PORT:-8081}" BACKEND_PORT

# 7. 域名配置（用于 Nginx）
read_input "域名（用于 Nginx 配置）" "${DOMAIN_NAME:-heartsphere.cn}" DOMAIN_NAME

# 8. JWT 密钥
echo ""
echo -e "${YELLOW}JWT 密钥配置:${NC}"
echo "  1) 自动生成（推荐）"
echo "  2) 手动输入"
read -p "请选择 [1-2] (默认: 1): " jwt_choice
jwt_choice="${jwt_choice:-1}"

if [ "$jwt_choice" = "2" ]; then
    read_input "请输入 JWT 密钥（至少 32 位）" "${JWT_SECRET:-}" JWT_SECRET
    if [ -z "$JWT_SECRET" ] || [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${RED}错误: JWT 密钥长度至少 32 位${NC}"
        exit 1
    fi
else
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")
    echo -e "${GREEN}JWT 密钥已自动生成${NC}"
fi

# 9. 确认配置
echo ""
echo -e "${BLUE}========== 配置确认 ==========${NC}"
echo -e "数据库主机: ${GREEN}${DB_HOST}${NC}"
echo -e "数据库端口: ${GREEN}${DB_PORT}${NC}"
echo -e "数据库名称: ${GREEN}${DB_NAME}${NC}"
echo -e "数据库用户名: ${GREEN}${DB_USER}${NC}"
echo -e "数据库密码: ${GREEN}******${NC}"
echo -e "后端端口: ${GREEN}${BACKEND_PORT}${NC}"
echo -e "域名: ${GREEN}${DOMAIN_NAME}${NC}"
echo ""
read -p "确认配置是否正确? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 0
fi

# ==================== 开始部署 ====================
echo ""
echo -e "${GREEN}开始部署后端服务...${NC}"

# 1. 安装 Java 17
echo -e "${YELLOW}[1/10] 检查 Java 环境...${NC}"
if ! command -v java &> /dev/null || ! java -version 2>&1 | grep -q "version \"17"; then
    echo -e "${YELLOW}安装 Java 17...${NC}"
    if command -v yum &> /dev/null; then
        yum update -y
        yum install -y java-17-openjdk java-17-openjdk-devel
    elif command -v apt-get &> /dev/null; then
        apt-get update -y
        apt-get install -y openjdk-17-jdk
    else
        echo -e "${RED}错误: 未找到包管理器 (yum/apt-get)${NC}"
        exit 1
    fi
    
    # 设置 JAVA_HOME
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
    if ! grep -q "JAVA_HOME" /etc/profile; then
        echo "export JAVA_HOME=${JAVA_HOME}" >> /etc/profile
        echo "export PATH=\$JAVA_HOME/bin:\$PATH" >> /etc/profile
    fi
    export JAVA_HOME
    export PATH="${JAVA_HOME}/bin:${PATH}"
    echo -e "${GREEN}Java 17 安装完成${NC}"
else
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
    export JAVA_HOME
    echo -e "${GREEN}Java 17 已安装: $(java -version 2>&1 | head -1)${NC}"
fi

# 2. 安装 Maven
echo -e "${YELLOW}[2/10] 检查 Maven 环境...${NC}"
if ! command -v mvn &> /dev/null; then
    echo -e "${YELLOW}安装 Maven...${NC}"
    if command -v yum &> /dev/null; then
        yum install -y maven
    elif command -v apt-get &> /dev/null; then
        apt-get install -y maven
    else
        echo -e "${RED}错误: 未找到包管理器${NC}"
        exit 1
    fi
    echo -e "${GREEN}Maven 安装完成${NC}"
else
    echo -e "${GREEN}Maven 已安装: $(mvn --version | head -1)${NC}"
fi

# 3. 构建后端项目
echo -e "${YELLOW}[3/10] 构建后端项目...${NC}"
cd "${PROJECT_ROOT}/backend" || {
    echo -e "${RED}错误: 无法进入后端目录${NC}"
    exit 1
}

echo -e "${YELLOW}清理旧的构建...${NC}"
mvn clean

echo -e "${YELLOW}编译打包...${NC}"
mvn package -DskipTests

# 4. 查找 JAR 文件
echo -e "${YELLOW}[4/10] 查找 JAR 文件...${NC}"
JAR_FILE=$(find target -name "*.jar" ! -name "*sources.jar" ! -name "*javadoc.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}错误: 未找到 JAR 文件！${NC}"
    exit 1
fi

echo -e "${GREEN}找到 JAR 文件: ${JAR_FILE}${NC}"

# 5. 创建用户和目录
echo -e "${YELLOW}[5/10] 创建用户和目录...${NC}"
if ! id "${APP_USER}" &>/dev/null; then
    echo -e "${YELLOW}创建用户 ${APP_USER}...${NC}"
    useradd -r -s /bin/bash -d "${APP_HOME}" "${APP_USER}" || {
        echo -e "${YELLOW}用户可能已存在，继续...${NC}"
    }
fi

mkdir -p "${BACKEND_DIR}"
mkdir -p "${APP_HOME}/logs"
mkdir -p "${APP_HOME}/uploads/images"
chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}"

# 6. 部署 JAR 文件
echo -e "${YELLOW}[6/10] 部署 JAR 文件...${NC}"
cp "${JAR_FILE}" "${BACKEND_DIR}/app.jar"
chown "${APP_USER}:${APP_USER}" "${BACKEND_DIR}/app.jar"

# 7. 创建环境变量文件
echo -e "${YELLOW}[7/10] 创建环境变量文件...${NC}"
cat > "${ENV_FILE}" <<EOF
# 数据库配置
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}

# JWT 配置
JWT_SECRET=${JWT_SECRET}

# Spring 配置
SPRING_PROFILES_ACTIVE=prod
BACKEND_PORT=${BACKEND_PORT}

# 域名配置
DOMAIN_NAME=${DOMAIN_NAME}
EOF
chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"
echo -e "${GREEN}环境变量文件已创建: ${ENV_FILE}${NC}"

# 8. 创建 application-prod.yml
echo -e "${YELLOW}[8/10] 创建生产环境配置...${NC}"
cat > "${BACKEND_DIR}/application-prod.yml" <<EOF
server:
  port: ${BACKEND_PORT}

spring:
  datasource:
    url: jdbc:mysql://\${DB_HOST:${DB_HOST}}:\${DB_PORT:${DB_PORT}}/\${DB_NAME:${DB_NAME}}?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
    username: \${DB_USER:${DB_USER}}
    password: \${DB_PASSWORD:${DB_PASSWORD}}
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
  secret: \${JWT_SECRET:${JWT_SECRET}}
  expiration: 86400000
  refresh-expiration: 604800000

wechat:
  app-id: \${WECHAT_APP_ID:}
  app-secret: \${WECHAT_APP_SECRET:}
  redirect-uri: \${WECHAT_REDIRECT_URI:http://${DOMAIN_NAME}/api/wechat/callback}

app:
  image:
    storage:
      type: local
      local:
        path: \${IMAGE_STORAGE_PATH:${APP_HOME}/uploads/images}
      base-url: \${IMAGE_BASE_URL:http://${DOMAIN_NAME}/api/images}
      max-size: 10485760

logging:
  level:
    root: INFO
    com.heartsphere: INFO
  file:
    name: ${APP_HOME}/logs/backend.log
EOF

chown "${APP_USER}:${APP_USER}" "${BACKEND_DIR}/application-prod.yml"

# 9. 创建 systemd 服务
echo -e "${YELLOW}[9/10] 创建 systemd 服务...${NC}"
cat > /etc/systemd/system/${APP_NAME}-backend.service <<EOF
[Unit]
Description=HeartSphere Backend Service
After=network.target mysql.service
Requires=network.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_USER}
WorkingDirectory=${BACKEND_DIR}
ExecStart=/usr/bin/java -jar -Xms512m -Xmx1024m \\
  -Dspring.profiles.active=prod \\
  -Dspring.config.additional-location=file:${BACKEND_DIR}/application-prod.yml \\
  -Djava.net.preferIPv4Stack=true \\
  -Dio.netty.resolver.dns.queryTimeoutMillis=30000 \\
  ${BACKEND_DIR}/app.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${APP_NAME}-backend

# 环境变量
Environment="JAVA_HOME=${JAVA_HOME}"
Environment="SPRING_PROFILES_ACTIVE=prod"
EnvironmentFile=${ENV_FILE}

# 安全设置
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
systemctl daemon-reload

# 验证服务文件
if ! systemctl cat "${APP_NAME}-backend" &>/dev/null; then
    echo -e "${RED}错误: 服务文件语法错误${NC}"
    exit 1
fi

# 启动服务
echo -e "${YELLOW}启动后端服务...${NC}"
systemctl enable ${APP_NAME}-backend
systemctl restart ${APP_NAME}-backend

# 等待服务启动
sleep 5

# 检查服务状态
if systemctl is-active --quiet ${APP_NAME}-backend; then
    echo -e "${GREEN}后端服务启动成功！${NC}"
else
    echo -e "${RED}后端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u ${APP_NAME}-backend -n 50"
    exit 1
fi

# 10. 配置 Nginx（后端反向代理）
echo -e "${YELLOW}[10/10] 配置 Nginx 反向代理...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}安装 Nginx...${NC}"
    if command -v yum &> /dev/null; then
        yum install -y nginx
    elif command -v apt-get &> /dev/null; then
        apt-get install -y nginx
    fi
    systemctl enable nginx
fi

cat > "${NGINX_CONF}" <<EOF
# HeartSphere 后端 API 反向代理配置
upstream backend_api {
    server localhost:${BACKEND_PORT};
    keepalive 32;
}

server {
    listen 80;
    server_name api.${DOMAIN_NAME} ${DOMAIN_NAME};

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
        
        # 增加超时时间
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 日志
    access_log /var/log/nginx/${APP_NAME}-backend-access.log;
    error_log /var/log/nginx/${APP_NAME}-backend-error.log;
}
EOF

# 测试 Nginx 配置
nginx -t || {
    echo -e "${YELLOW}警告: Nginx 配置测试失败，但继续...${NC}"
}

# 重新加载 Nginx
systemctl restart nginx 2>/dev/null || systemctl start nginx

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "服务地址: ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
echo -e "API 地址: ${GREEN}http://${DOMAIN_NAME}/api${NC}"
echo -e "查看日志: ${GREEN}journalctl -u ${APP_NAME}-backend -f${NC}"
echo -e "环境变量文件: ${GREEN}${ENV_FILE}${NC}"
echo -e "Nginx 配置: ${GREEN}${NGINX_CONF}${NC}"
