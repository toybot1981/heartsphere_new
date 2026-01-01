#!/bin/bash
# 更新部署脚本 - 用于更新已部署的系统

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置变量
APP_NAME="heartsphere"
APP_HOME="/opt/${APP_NAME}"
BACKEND_DIR="${APP_HOME}/backend"
FRONTEND_DIR="${APP_HOME}/frontend"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}更新数字生命体交互系统（心域）${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 选择更新内容
echo -e "${YELLOW}请选择要更新的内容:${NC}"
echo -e "1) 仅更新后端"
echo -e "2) 仅更新前端"
echo -e "3) 更新后端和前端"
read -p "请输入选项 (1-3): " choice

case $choice in
    1)
        UPDATE_BACKEND=true
        UPDATE_FRONTEND=false
        ;;
    2)
        UPDATE_BACKEND=false
        UPDATE_FRONTEND=true
        ;;
    3)
        UPDATE_BACKEND=true
        UPDATE_FRONTEND=true
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

# 更新后端
if [ "$UPDATE_BACKEND" = true ]; then
    echo -e "${YELLOW}更新后端服务...${NC}"
    
    cd "${SCRIPT_DIR}/backend"
    
    echo -e "${YELLOW}停止后端服务...${NC}"
    systemctl stop ${APP_NAME}-backend
    
    echo -e "${YELLOW}构建新版本...${NC}"
    mvn clean package -DskipTests
    
    JAR_FILE=$(find target -name "*.jar" ! -name "*sources.jar" | head -1)
    
    if [ -z "$JAR_FILE" ]; then
        echo -e "${RED}未找到 JAR 文件！${NC}"
        systemctl start ${APP_NAME}-backend
        exit 1
    fi
    
    echo -e "${YELLOW}备份旧版本...${NC}"
    if [ -f "${BACKEND_DIR}/app.jar" ]; then
        cp ${BACKEND_DIR}/app.jar ${BACKEND_DIR}/app.jar.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    echo -e "${YELLOW}部署新版本...${NC}"
    cp ${JAR_FILE} ${BACKEND_DIR}/app.jar
    chown ${APP_NAME}:${APP_NAME} ${BACKEND_DIR}/app.jar
    
    echo -e "${YELLOW}启动后端服务...${NC}"
    systemctl start ${APP_NAME}-backend
    
    sleep 5
    
    if systemctl is-active --quiet ${APP_NAME}-backend; then
        echo -e "${GREEN}后端更新成功！${NC}"
    else
        echo -e "${RED}后端启动失败，正在恢复旧版本...${NC}"
        if [ -f "${BACKEND_DIR}/app.jar.backup."* ]; then
            LATEST_BACKUP=$(ls -t ${BACKEND_DIR}/app.jar.backup.* | head -1)
            cp ${LATEST_BACKUP} ${BACKEND_DIR}/app.jar
            systemctl start ${APP_NAME}-backend
        fi
        exit 1
    fi
fi

# 更新前端
if [ "$UPDATE_FRONTEND" = true ]; then
    echo -e "${YELLOW}更新前端服务...${NC}"
    
    cd "${SCRIPT_DIR}/frontend"
    
    echo -e "${YELLOW}安装/更新依赖...${NC}"
    npm install --legacy-peer-deps
    
    echo -e "${YELLOW}构建新版本...${NC}"
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}备份旧版本...${NC}"
    if [ -d "${FRONTEND_DIR}" ] && [ "$(ls -A ${FRONTEND_DIR})" ]; then
        BACKUP_DIR="${FRONTEND_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
        cp -r ${FRONTEND_DIR} ${BACKUP_DIR}
    fi
    
    echo -e "${YELLOW}部署新版本...${NC}"
    rm -rf ${FRONTEND_DIR}/*
    cp -r dist/* ${FRONTEND_DIR}/
    chown -R ${APP_NAME}:${APP_NAME} ${FRONTEND_DIR}
    
    echo -e "${YELLOW}重启 Nginx...${NC}"
    systemctl restart nginx
    
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}前端更新成功！${NC}"
    else
        echo -e "${RED}前端启动失败！${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}更新完成！${NC}"
echo -e "${GREEN}========================================${NC}"








