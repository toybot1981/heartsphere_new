#!/bin/bash
# 后端部署脚本 - Spring Boot
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
JAVA_VERSION="17"
BACKEND_PORT=8081

echo -e "${GREEN}开始部署后端服务...${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 加载环境变量
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
    BACKEND_PORT="${BACKEND_PORT:-8081}"
fi

# 1. 安装 Java 17
echo -e "${YELLOW}[1/8] 检查 Java 环境...${NC}"
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
echo -e "${YELLOW}[2/8] 检查 Maven 环境...${NC}"
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
echo -e "${YELLOW}[3/8] 构建后端项目...${NC}"
cd "${PROJECT_ROOT}/backend" || {
    echo -e "${RED}错误: 无法进入后端目录${NC}"
    exit 1
}

echo -e "${YELLOW}清理旧的构建...${NC}"
mvn clean

echo -e "${YELLOW}编译打包...${NC}"
mvn package -DskipTests

# 4. 查找 JAR 文件
echo -e "${YELLOW}[4/8] 查找 JAR 文件...${NC}"
JAR_FILE=$(find target -name "*.jar" ! -name "*sources.jar" ! -name "*javadoc.jar" | head -1)

if [ -z "$JAR_FILE" ]; then
    echo -e "${RED}错误: 未找到 JAR 文件！${NC}"
    exit 1
fi

echo -e "${GREEN}找到 JAR 文件: ${JAR_FILE}${NC}"

# 5. 创建用户和目录
echo -e "${YELLOW}[5/9] 创建用户和目录...${NC}"
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
echo -e "${YELLOW}[6/9] 部署 JAR 文件...${NC}"
cp "${JAR_FILE}" "${BACKEND_DIR}/app.jar"
chown "${APP_USER}:${APP_USER}" "${BACKEND_DIR}/app.jar"

# 7. 创建 application-prod.yml
echo -e "${YELLOW}[7/9] 创建生产环境配置...${NC}"
cat > "${BACKEND_DIR}/application-prod.yml" <<EOF
server:
  port: ${BACKEND_PORT}

spring:
  datasource:
    url: jdbc:mysql://\${DB_HOST:localhost}:\${DB_PORT:3306}/\${DB_NAME:heartsphere}?useUnicode=true&characterEncoding=utf8mb4&useSSL=false&serverTimezone=Asia/Shanghai
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

chown "${APP_USER}:${APP_USER}" "${BACKEND_DIR}/application-prod.yml"

# 8. 创建环境变量文件（如果不存在）
echo -e "${YELLOW}[8/9] 检查环境变量文件...${NC}"
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}创建默认环境变量文件...${NC}"
    cat > "${ENV_FILE}" <<ENVEOF
# 数据库配置
DB_NAME=heartsphere
DB_USER=heartsphere
DB_PASSWORD=HeartSphere@2024
DB_HOST=localhost
DB_PORT=3306

# JWT 配置
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-secret-key-change-in-production")

# Spring 配置
SPRING_PROFILES_ACTIVE=prod
BACKEND_PORT=8081
ENVEOF
    chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
    chmod 600 "${ENV_FILE}"
    echo -e "${YELLOW}请编辑 ${ENV_FILE} 配置正确的数据库信息${NC}"
fi

# 9. 创建 systemd 服务
echo -e "${YELLOW}[9/9] 创建 systemd 服务...${NC}"
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
    echo -e "${GREEN}服务地址: http://localhost:${BACKEND_PORT}${NC}"
    echo -e "${GREEN}查看日志: journalctl -u ${APP_NAME}-backend -f${NC}"
else
    echo -e "${RED}后端服务启动失败，请查看日志:${NC}"
    echo -e "journalctl -u ${APP_NAME}-backend -n 50"
    exit 1
fi

echo -e "${GREEN}后端部署完成！${NC}"




