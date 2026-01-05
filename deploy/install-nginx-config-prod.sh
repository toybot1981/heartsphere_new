#!/bin/bash
# Nginx配置文件安装脚本 - 生产环境
# 使用方法: sudo ./install-nginx-config-prod.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_FILE="${SCRIPT_DIR}/nginx-heartsphere-production.conf"
TARGET_FILE="/etc/nginx/conf.d/heartsphere.conf"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Nginx配置文件安装脚本 - 生产环境${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误: 生产环境需要 root 权限${NC}"
    echo -e "${YELLOW}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

echo -e "${BLUE}环境: 生产环境${NC}"
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

# 提示修改域名
echo ""
echo -e "${YELLOW}注意: 配置文件中的 server_name 需要修改为实际域名${NC}"
read -p "是否现在修改域名? [y/N]: " modify_domain
if [[ "$modify_domain" =~ ^[Yy]$ ]]; then
    read -p "请输入域名 (例如: heartsphere.cn): " domain_name
    if [ -n "$domain_name" ]; then
        # 创建临时文件
        TEMP_FILE=$(mktemp)
        sed "s/server_name .*/server_name ${domain_name} www.${domain_name} _;/" "$SOURCE_FILE" > "$TEMP_FILE"
        SOURCE_FILE="$TEMP_FILE"
        echo -e "${GREEN}域名已修改为: ${domain_name}${NC}"
    fi
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

# 清理临时文件
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm -f "$TEMP_FILE"
fi

echo -e "${GREEN}配置文件已复制${NC}"

# 测试配置
echo ""
echo -e "${YELLOW}测试Nginx配置...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ 配置测试通过${NC}"
else
    echo -e "${RED}✗ 配置测试失败${NC}"
    echo -e "${YELLOW}请检查配置文件: ${TARGET_FILE}${NC}"
    exit 1
fi

# 询问是否重载
echo ""
read -p "是否立即重载Nginx配置? [y/N]: " reload
if [[ "$reload" =~ ^[Yy]$ ]]; then
    if systemctl reload nginx; then
        echo -e "${GREEN}✓ Nginx配置已重载${NC}"
    else
        echo -e "${YELLOW}警告: 重载失败，请手动执行: sudo systemctl reload nginx${NC}"
    fi
else
    echo -e "${YELLOW}请手动重载Nginx配置:${NC}"
    echo -e "${BLUE}sudo systemctl reload nginx${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}生产环境配置安装完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "配置文件位置: ${GREEN}${TARGET_FILE}${NC}"
if [ -n "$BACKUP_FILE" ]; then
    echo -e "备份文件位置: ${GREEN}${BACKUP_FILE}${NC}"
fi
echo ""
echo -e "${YELLOW}配置说明:${NC}"
echo -e "  前端路径: ${BLUE}/opt/heartsphere/frontend${NC}"
echo -e "  后端API: ${BLUE}http://localhost:8080${NC}"
echo -e "  图片路径: ${BLUE}/opt/heartsphere/backend/uploads/images/${NC}"
echo -e "  监听端口: ${BLUE}80${NC}"
echo -e "  域名: ${BLUE}$(grep 'server_name' "$TARGET_FILE" | head -1 | awk '{print $2}')${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  1. 确保目录路径正确: ${BLUE}/opt/heartsphere${NC}"
echo -e "  2. 确保Nginx用户有读取权限"
echo -e "  3. 如需修改域名，编辑: ${BLUE}${TARGET_FILE}${NC}"
echo ""
