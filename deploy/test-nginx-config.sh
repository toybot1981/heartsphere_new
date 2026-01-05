#!/bin/bash
# 测试Nginx配置文件

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "测试Nginx配置文件..."

# 测试本地配置
echo ""
echo -e "${YELLOW}测试本地配置文件...${NC}"
LOCAL_FILE="${SCRIPT_DIR}/nginx-heartsphere-local.conf"

# 检查关键配置项
echo "检查关键配置项:"
echo "  1. 前端路径:"
grep -E "^\s*root\s+" "$LOCAL_FILE" | head -1
echo "  2. 后端API:"
grep -E "proxy_pass\s+http://localhost" "$LOCAL_FILE" | head -1
echo "  3. 图片路径:"
grep -E "alias\s+/Users" "$LOCAL_FILE" | head -1
echo "  4. 监听端口:"
grep -E "^\s*listen\s+" "$LOCAL_FILE" | head -1

# 测试生产配置
echo ""
echo -e "${YELLOW}测试生产配置文件...${NC}"
PROD_FILE="${SCRIPT_DIR}/nginx-heartsphere-production.conf"

echo "检查关键配置项:"
echo "  1. 前端路径:"
grep -E "^\s*root\s+/opt/heartsphere" "$PROD_FILE" | head -1
echo "  2. 后端API:"
grep -E "proxy_pass\s+http://localhost" "$PROD_FILE" | head -1
echo "  3. 图片路径:"
grep -E "alias\s+/opt/heartsphere" "$PROD_FILE" | head -1
echo "  4. 监听端口:"
grep -E "^\s*listen\s+" "$PROD_FILE" | head -1
echo "  5. 域名:"
grep -E "^\s*server_name\s+" "$PROD_FILE" | head -1

echo ""
echo -e "${GREEN}配置文件检查完成！${NC}"
