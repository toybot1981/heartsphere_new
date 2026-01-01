#!/bin/bash
# 修复生产服务器字符编码问题脚本

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

APP_NAME="heartsphere"
BACKEND_DIR="/opt/heartsphere/backend"
CONFIG_FILE="${BACKEND_DIR}/application-prod.yml"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复生产服务器字符编码问题${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 检查配置文件是否存在
if [ ! -f "$CONFIG_FILE" ]; then
    echo -e "${RED}错误: 配置文件不存在: ${CONFIG_FILE}${NC}"
    exit 1
fi

# 备份原配置文件
echo -e "${YELLOW}[1/3] 备份原配置文件...${NC}"
cp "${CONFIG_FILE}" "${CONFIG_FILE}.bak.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}备份完成${NC}"

# 修复字符编码
echo -e "${YELLOW}[2/3] 修复字符编码配置...${NC}"
sed -i 's/characterEncoding=utf8mb4/characterEncoding=UTF-8/g' "${CONFIG_FILE}"

# 验证修复
if grep -q "characterEncoding=UTF-8" "${CONFIG_FILE}"; then
    echo -e "${GREEN}✓ 字符编码已修复为 UTF-8${NC}"
else
    echo -e "${YELLOW}警告: 未找到 characterEncoding 配置，可能已修复或配置格式不同${NC}"
fi

# 重启服务
echo -e "${YELLOW}[3/3] 重启后端服务...${NC}"
systemctl restart "${APP_NAME}-backend"
sleep 3

if systemctl is-active --quiet "${APP_NAME}-backend"; then
    echo -e "${GREEN}✓ 服务重启成功！${NC}"
    echo ""
    echo -e "${GREEN}服务状态:${NC}"
    systemctl status "${APP_NAME}-backend" --no-pager -l | head -15
else
    echo -e "${RED}✗ 服务启动失败${NC}"
    echo ""
    echo -e "${YELLOW}查看日志:${NC}"
    journalctl -u "${APP_NAME}-backend" -n 50 --no-pager
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}修复完成！${NC}"
echo -e "${GREEN}========================================${NC}"
