#!/bin/bash
# 停止所有服务脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="heartsphere"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}停止 HeartSphere 服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 停止 Nginx
echo -e "${YELLOW}[1/2] 停止 Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    systemctl stop nginx
    echo -e "${GREEN}Nginx 已停止${NC}"
else
    echo -e "${YELLOW}Nginx 未运行${NC}"
fi

# 停止后端服务
echo -e "${YELLOW}[2/2] 停止后端服务...${NC}"
if systemctl is-active --quiet "${APP_NAME}-backend"; then
    systemctl stop "${APP_NAME}-backend"
    echo -e "${GREEN}后端服务已停止${NC}"
else
    echo -e "${YELLOW}后端服务未运行${NC}"
fi

echo ""
echo -e "${GREEN}所有服务已停止！${NC}"
