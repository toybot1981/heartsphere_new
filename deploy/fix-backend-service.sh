#!/bin/bash
# 修复后端 systemd 服务启动失败问题

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
ENV_FILE="${APP_HOME}/.env"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}-backend.service"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断和修复后端服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 检查用户是否存在
echo -e "${YELLOW}[1/7] 检查用户...${NC}"
if ! id "${APP_USER}" &>/dev/null; then
    echo -e "${YELLOW}用户 ${APP_USER} 不存在，正在创建...${NC}"
    useradd -r -s /bin/bash -d "${APP_HOME}" "${APP_USER}" || {
        echo -e "${RED}创建用户失败${NC}"
        exit 1
    }
    echo -e "${GREEN}用户创建成功${NC}"
else
    echo -e "${GREEN}用户 ${APP_USER} 已存在${NC}"
fi

# 2. 检查并创建目录
echo -e "${YELLOW}[2/7] 检查目录...${NC}"
mkdir -p "${BACKEND_DIR}"
mkdir -p "${APP_HOME}/logs"
mkdir -p "${APP_HOME}/uploads/images"
chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}"
echo -e "${GREEN}目录创建成功${NC}"

# 3. 检查 JAR 文件
echo -e "${YELLOW}[3/7] 检查 JAR 文件...${NC}"
if [ ! -f "${BACKEND_DIR}/app.jar" ]; then
    echo -e "${RED}错误: JAR 文件不存在: ${BACKEND_DIR}/app.jar${NC}"
    echo -e "${YELLOW}请先运行部署脚本或手动复制 JAR 文件${NC}"
    exit 1
else
    echo -e "${GREEN}JAR 文件存在${NC}"
    chown "${APP_USER}:${APP_USER}" "${BACKEND_DIR}/app.jar"
fi

# 4. 检查 Java
echo -e "${YELLOW}[4/7] 检查 Java 环境...${NC}"
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: Java 未安装${NC}"
    exit 1
fi

JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME="/usr/lib/jvm/java-17-openjdk"
fi
export JAVA_HOME

echo -e "${GREEN}Java 路径: $(which java)${NC}"
echo -e "${GREEN}JAVA_HOME: ${JAVA_HOME}${NC}"

# 5. 检查环境变量文件
echo -e "${YELLOW}[5/7] 检查环境变量文件...${NC}"
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}环境变量文件不存在，创建默认配置...${NC}"
    cat > "${ENV_FILE}" <<EOF
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
EOF
    chown "${APP_USER}:${APP_USER}" "${ENV_FILE}"
    chmod 600 "${ENV_FILE}"
    echo -e "${GREEN}环境变量文件已创建${NC}"
    echo -e "${YELLOW}请编辑 ${ENV_FILE} 配置正确的数据库信息${NC}"
else
    echo -e "${GREEN}环境变量文件存在${NC}"
    # 验证环境变量文件格式
    if ! grep -q "DB_NAME=" "${ENV_FILE}"; then
        echo -e "${YELLOW}警告: 环境变量文件格式可能不正确${NC}"
    fi
fi

# 6. 检查并修复 systemd 服务文件
echo -e "${YELLOW}[6/7] 检查 systemd 服务文件...${NC}"
if [ ! -f "${SERVICE_FILE}" ]; then
    echo -e "${RED}错误: 服务文件不存在${NC}"
    exit 1
fi

# 验证服务文件中的关键路径
if ! grep -q "User=${APP_USER}" "${SERVICE_FILE}"; then
    echo -e "${YELLOW}警告: 服务文件中的用户配置可能不正确${NC}"
fi

if ! grep -q "WorkingDirectory=${BACKEND_DIR}" "${SERVICE_FILE}"; then
    echo -e "${YELLOW}警告: 服务文件中的工作目录可能不正确${NC}"
fi

# 重新创建服务文件以确保配置正确
echo -e "${YELLOW}更新服务文件...${NC}"
cat > "${SERVICE_FILE}" <<EOF
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

echo -e "${GREEN}服务文件已更新${NC}"

# 7. 重新加载并启动服务
echo -e "${YELLOW}[7/7] 重新加载 systemd 并启动服务...${NC}"
systemctl daemon-reload

# 验证服务文件语法
if ! systemctl cat "${APP_NAME}-backend" &>/dev/null; then
    echo -e "${RED}错误: 服务文件语法错误${NC}"
    exit 1
fi

# 停止旧服务（如果存在）
systemctl stop "${APP_NAME}-backend" 2>/dev/null || true

# 启用服务
systemctl enable "${APP_NAME}-backend"

# 启动服务
echo -e "${YELLOW}启动服务...${NC}"
if systemctl start "${APP_NAME}-backend"; then
    sleep 3
    if systemctl is-active --quiet "${APP_NAME}-backend"; then
        echo -e "${GREEN}✓ 服务启动成功！${NC}"
        echo ""
        echo -e "${GREEN}服务状态:${NC}"
        systemctl status "${APP_NAME}-backend" --no-pager -l || true
    else
        echo -e "${RED}✗ 服务启动失败${NC}"
        echo ""
        echo -e "${YELLOW}查看服务状态:${NC}"
        systemctl status "${APP_NAME}-backend" --no-pager -l || true
        echo ""
        echo -e "${YELLOW}查看日志:${NC}"
        journalctl -u "${APP_NAME}-backend" -n 50 --no-pager || true
        exit 1
    fi
else
    echo -e "${RED}✗ 启动服务时出错${NC}"
    echo ""
    echo -e "${YELLOW}查看详细错误:${NC}"
    journalctl -u "${APP_NAME}-backend" -n 50 --no-pager || true
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo -e "  查看状态: systemctl status ${APP_NAME}-backend"
echo -e "  查看日志: journalctl -u ${APP_NAME}-backend -f"
echo -e "  重启服务: systemctl restart ${APP_NAME}-backend"
echo -e "  停止服务: systemctl stop ${APP_NAME}-backend"

