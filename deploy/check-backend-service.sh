#!/bin/bash
# 快速诊断后端服务问题

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
BACKEND_DIR="${APP_HOME}/backend"
ENV_FILE="${APP_HOME}/.env"
SERVICE_FILE="/etc/systemd/system/${APP_NAME}-backend.service"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端服务诊断${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查用户
echo -e "${YELLOW}[1] 检查用户...${NC}"
if id "${APP_USER}" &>/dev/null; then
    echo -e "${GREEN}✓ 用户 ${APP_USER} 存在${NC}"
else
    echo -e "${RED}✗ 用户 ${APP_USER} 不存在${NC}"
    echo -e "${YELLOW}  解决方案: 运行 fix-backend-service.sh${NC}"
fi

# 2. 检查目录
echo -e "${YELLOW}[2] 检查目录...${NC}"
if [ -d "${BACKEND_DIR}" ]; then
    echo -e "${GREEN}✓ 目录 ${BACKEND_DIR} 存在${NC}"
else
    echo -e "${RED}✗ 目录 ${BACKEND_DIR} 不存在${NC}"
fi

# 3. 检查 JAR 文件
echo -e "${YELLOW}[3] 检查 JAR 文件...${NC}"
if [ -f "${BACKEND_DIR}/app.jar" ]; then
    echo -e "${GREEN}✓ JAR 文件存在${NC}"
    ls -lh "${BACKEND_DIR}/app.jar"
else
    echo -e "${RED}✗ JAR 文件不存在: ${BACKEND_DIR}/app.jar${NC}"
fi

# 4. 检查 Java
echo -e "${YELLOW}[4] 检查 Java...${NC}"
if command -v java &> /dev/null; then
    echo -e "${GREEN}✓ Java 已安装${NC}"
    java -version 2>&1 | head -1
    JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
    echo -e "${GREEN}  JAVA_HOME: ${JAVA_HOME}${NC}"
else
    echo -e "${RED}✗ Java 未安装${NC}"
fi

# 5. 检查环境变量文件
echo -e "${YELLOW}[5] 检查环境变量文件...${NC}"
if [ -f "${ENV_FILE}" ]; then
    echo -e "${GREEN}✓ 环境变量文件存在${NC}"
    if grep -q "DB_NAME=" "${ENV_FILE}"; then
        echo -e "${GREEN}  ✓ 文件格式正确${NC}"
    else
        echo -e "${YELLOW}  ⚠ 文件格式可能不正确${NC}"
    fi
else
    echo -e "${RED}✗ 环境变量文件不存在: ${ENV_FILE}${NC}"
fi

# 6. 检查服务文件
echo -e "${YELLOW}[6] 检查 systemd 服务文件...${NC}"
if [ -f "${SERVICE_FILE}" ]; then
    echo -e "${GREEN}✓ 服务文件存在${NC}"
    
    # 检查关键配置
    if grep -q "User=${APP_USER}" "${SERVICE_FILE}"; then
        echo -e "${GREEN}  ✓ 用户配置正确${NC}"
    else
        echo -e "${RED}  ✗ 用户配置不正确${NC}"
    fi
    
    if grep -q "WorkingDirectory=${BACKEND_DIR}" "${SERVICE_FILE}"; then
        echo -e "${GREEN}  ✓ 工作目录配置正确${NC}"
    else
        echo -e "${RED}  ✗ 工作目录配置不正确${NC}"
    fi
    
    if grep -q "EnvironmentFile=${ENV_FILE}" "${SERVICE_FILE}"; then
        echo -e "${GREEN}  ✓ 环境变量文件配置正确${NC}"
    else
        echo -e "${YELLOW}  ⚠ 环境变量文件配置可能不正确${NC}"
    fi
else
    echo -e "${RED}✗ 服务文件不存在: ${SERVICE_FILE}${NC}"
fi

# 7. 检查服务状态
echo -e "${YELLOW}[7] 检查服务状态...${NC}"
if systemctl list-unit-files | grep -q "${APP_NAME}-backend"; then
    echo -e "${GREEN}✓ 服务已注册${NC}"
    
    if systemctl is-active --quiet "${APP_NAME}-backend" 2>/dev/null; then
        echo -e "${GREEN}  ✓ 服务正在运行${NC}"
    else
        echo -e "${RED}  ✗ 服务未运行${NC}"
    fi
    
    if systemctl is-enabled --quiet "${APP_NAME}-backend" 2>/dev/null; then
        echo -e "${GREEN}  ✓ 服务已启用${NC}"
    else
        echo -e "${YELLOW}  ⚠ 服务未启用${NC}"
    fi
else
    echo -e "${RED}✗ 服务未注册${NC}"
fi

# 8. 查看最近的错误日志
echo -e "${YELLOW}[8] 最近的错误日志...${NC}"
if systemctl list-unit-files | grep -q "${APP_NAME}-backend"; then
    echo -e "${YELLOW}最后 20 行日志:${NC}"
    journalctl -u "${APP_NAME}-backend" -n 20 --no-pager 2>/dev/null || echo -e "${RED}无法读取日志${NC}"
else
    echo -e "${YELLOW}服务未注册，无法查看日志${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}如果发现问题，请运行:${NC}"
echo -e "  ./fix-backend-service.sh"
echo ""

