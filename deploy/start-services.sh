#!/bin/bash
# 启动所有服务脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="heartsphere"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}启动 HeartSphere 服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 启动后端服务
echo -e "${YELLOW}[1/3] 启动后端服务...${NC}"
if systemctl is-active --quiet "${APP_NAME}-backend"; then
    echo -e "${GREEN}后端服务已在运行${NC}"
else
    systemctl start "${APP_NAME}-backend"
    sleep 3
    if systemctl is-active --quiet "${APP_NAME}-backend"; then
        echo -e "${GREEN}后端服务启动成功${NC}"
    else
        echo -e "${RED}后端服务启动失败${NC}"
        systemctl status "${APP_NAME}-backend" --no-pager -l
        exit 1
    fi
fi

# 启动 Nginx
echo -e "${YELLOW}[2/3] 启动 Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}Nginx 已在运行${NC}"
else
    systemctl start nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}Nginx 启动成功${NC}"
    else
        echo -e "${RED}Nginx 启动失败${NC}"
        systemctl status nginx --no-pager -l
        exit 1
    fi
fi

# 检查服务状态
echo -e "${YELLOW}[3/3] 检查服务状态...${NC}"
echo ""
echo -e "${BLUE}========== 服务状态 ==========${NC}"
systemctl status "${APP_NAME}-backend" --no-pager -l | head -10
echo ""
systemctl status nginx --no-pager -l | head -10

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}所有服务已启动！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo -e "  查看后端日志: journalctl -u ${APP_NAME}-backend -f"
echo -e "  查看 Nginx 日志: journalctl -u nginx -f"
echo -e "  重启后端: systemctl restart ${APP_NAME}-backend"
echo -e "  重启 Nginx: systemctl restart nginx"
