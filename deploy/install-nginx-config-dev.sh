#!/bin/bash
# Nginx配置文件安装脚本 - 本地开发环境
# 使用方法: ./install-nginx-config-dev.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="${SCRIPT_DIR}/nginx-heartsphere-local.conf"
TARGET_FILE="/usr/local/etc/nginx/servers/heartsphere.conf"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Nginx配置文件安装脚本 - 本地开发环境${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}环境: 本地开发环境${NC}"
echo -e "源文件: ${GREEN}${SOURCE_FILE}${NC}"
echo -e "目标文件: ${GREEN}${TARGET_FILE}${NC}"
echo ""

# 检查源文件是否存在
if [ ! -f "$SOURCE_FILE" ]; then
    echo -e "${RED}错误: 源文件不存在: ${SOURCE_FILE}${NC}"
    exit 1
fi

# 确认安装
read -p "确认安装配置? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}已取消${NC}"
    exit 0
fi

# 备份现有配置文件
if [ -f "$TARGET_FILE" ]; then
    BACKUP_FILE="${TARGET_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}备份现有配置文件...${NC}"
    cp "$TARGET_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}已备份到: ${BACKUP_FILE}${NC}"
fi

# 创建目标目录（如果不存在）
TARGET_DIR=$(dirname "$TARGET_FILE")
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${YELLOW}创建目录: ${TARGET_DIR}${NC}"
    mkdir -p "$TARGET_DIR"
fi

# 复制配置文件
echo -e "${YELLOW}复制配置文件...${NC}"
cp "$SOURCE_FILE" "$TARGET_FILE"
echo -e "${GREEN}配置文件已复制${NC}"

# 测试配置
echo ""
echo -e "${YELLOW}测试Nginx配置...${NC}"
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓ 配置测试通过${NC}"
else
    echo -e "${YELLOW}使用sudo测试配置...${NC}"
    if sudo nginx -t 2>/dev/null; then
        echo -e "${GREEN}✓ 配置测试通过${NC}"
    else
        echo -e "${RED}✗ 配置测试失败${NC}"
        echo -e "${YELLOW}请检查配置文件: ${TARGET_FILE}${NC}"
        exit 1
    fi
fi

# 询问是否重载
echo ""
read -p "是否立即重载Nginx配置? [y/N]: " reload
if [[ "$reload" =~ ^[Yy]$ ]]; then
    if nginx -s reload 2>/dev/null; then
        echo -e "${GREEN}✓ Nginx配置已重载${NC}"
    elif sudo nginx -s reload 2>/dev/null; then
        echo -e "${GREEN}✓ Nginx配置已重载${NC}"
    else
        echo -e "${YELLOW}警告: 重载失败，请手动执行: sudo nginx -s reload${NC}"
    fi
else
    echo -e "${YELLOW}请手动重载Nginx配置:${NC}"
    echo -e "${BLUE}sudo nginx -s reload${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}本地开发环境配置安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "配置文件位置: ${GREEN}${TARGET_FILE}${NC}"
if [ -n "$BACKUP_FILE" ]; then
    echo -e "备份文件位置: ${GREEN}${BACKUP_FILE}${NC}"
fi
echo ""
echo -e "${YELLOW}配置说明:${NC}"
echo -e "  监听端口: ${BLUE}8080${NC}"
echo -e "  多项目路径路由:"
echo -e "    - main (PC): ${BLUE}http://localhost:8080/${NC}"
echo -e "    - main (Mobile): ${BLUE}http://localhost:8080/mobile.html${NC}"
echo -e "    - admin: ${BLUE}http://localhost:8080/admin.html${NC}"
echo -e "    - edu: ${BLUE}http://localhost:8080/edu.html${NC}"
echo -e "    - mentis: ${BLUE}http://localhost:8080/mentis${NC}"
echo -e "  前端路径:"
echo -e "    - main: ${BLUE}/Users/admin/Workspace/heartsphere_new/main/frontend/dist${NC}"
echo -e "    - admin: ${BLUE}/Users/admin/Workspace/heartsphere_new/admin/frontend/dist${NC}"
echo -e "    - edu: ${BLUE}/Users/admin/Workspace/heartsphere_new/edu/frontend/dist${NC}"
echo -e "    - mentis: ${BLUE}/Users/admin/Workspace/heartsphere_new/mentis/frontend/dist${NC}"
echo -e "  后端API代理:"
echo -e "    - /api/main/ → ${BLUE}http://localhost:8081/api/${NC}"
echo -e "    - /api/admin/ → ${BLUE}http://localhost:8085/api/${NC}"
echo -e "    - /api/edu/ → ${BLUE}http://localhost:8084/api/${NC}"
echo -e "    - /api/mentis/ → ${BLUE}http://localhost:8082/api/${NC}"
echo -e "  图片路径: ${BLUE}/Users/admin/Workspace/heartsphere_new/main/backend/uploads/images/${NC}"
echo ""
