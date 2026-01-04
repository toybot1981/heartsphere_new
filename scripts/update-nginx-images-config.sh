#!/bin/bash

# 更新Nginx配置以支持新的图片路径结构 /images/**
# 使用方法: ./scripts/update-nginx-images-config.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# 配置变量
NGINX_CONF_FILE="${NGINX_CONF_FILE:-/etc/nginx/conf.d/heartsphere.conf}"
NGINX_SITES_AVAILABLE="${NGINX_SITES_AVAILABLE:-/etc/nginx/sites-available/heartsphere}"
BACKEND_UPLOAD_PATH="${BACKEND_UPLOAD_PATH:-${PROJECT_ROOT}/backend/uploads/images}"
CONFIG_EXAMPLE="${PROJECT_ROOT}/deploy/nginx-heartsphere.conf.example"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Nginx图片路径配置更新脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""

# 检查是否有root权限
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}提示: 此脚本需要root权限来修改Nginx配置${NC}"
    echo -e "${YELLOW}请使用: sudo $0${NC}"
    exit 1
fi

# 检查Nginx是否安装
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}错误: Nginx未安装${NC}"
    exit 1
fi

# 确定配置文件位置
CONF_FILE=""
if [ -f "${NGINX_CONF_FILE}" ]; then
    CONF_FILE="${NGINX_CONF_FILE}"
    echo -e "${BLUE}找到配置文件: ${CONF_FILE}${NC}"
elif [ -f "${NGINX_SITES_AVAILABLE}" ]; then
    CONF_FILE="${NGINX_SITES_AVAILABLE}"
    echo -e "${BLUE}找到配置文件: ${CONF_FILE}${NC}"
else
    echo -e "${YELLOW}未找到现有配置文件${NC}"
    echo -e "${YELLOW}请选择配置文件位置：${NC}"
    echo -e "1. ${NGINX_CONF_FILE}"
    echo -e "2. ${NGINX_SITES_AVAILABLE}"
    echo -e "3. 从示例文件创建新配置"
    read -p "请选择 (1/2/3): " choice
    
    case $choice in
        1)
            CONF_FILE="${NGINX_CONF_FILE}"
            ;;
        2)
            CONF_FILE="${NGINX_SITES_AVAILABLE}"
            ;;
        3)
            if [ -f "${CONFIG_EXAMPLE}" ]; then
                echo -e "${BLUE}从示例文件创建配置...${NC}"
                read -p "请输入配置文件路径 (默认: ${NGINX_CONF_FILE}): " custom_path
                CONF_FILE="${custom_path:-${NGINX_CONF_FILE}}"
                cp "${CONFIG_EXAMPLE}" "${CONF_FILE}"
                echo -e "${GREEN}✓ 配置文件已创建: ${CONF_FILE}${NC}"
                echo -e "${YELLOW}请编辑配置文件，修改 server_name 和路径等配置项${NC}"
            else
                echo -e "${RED}错误: 示例配置文件不存在: ${CONFIG_EXAMPLE}${NC}"
                exit 1
            fi
            ;;
        *)
            echo -e "${RED}无效选择${NC}"
            exit 1
            ;;
    esac
fi

# 备份现有配置
if [ -f "${CONF_FILE}" ]; then
    BACKUP_FILE="${CONF_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "${CONF_FILE}" "${BACKUP_FILE}"
    echo -e "${GREEN}✓ 配置已备份到: ${BACKUP_FILE}${NC}"
fi

# 检查是否已存在 /images/ location
if grep -q "location /images/" "${CONF_FILE}" 2>/dev/null; then
    echo -e "${YELLOW}警告: 配置文件中已存在 /images/ location 块${NC}"
    echo -e "${YELLOW}是否替换现有配置？ (yes/no)${NC}"
    read -r REPLACE_CONFIRM
    if [ "${REPLACE_CONFIRM}" != "yes" ]; then
        echo -e "${YELLOW}操作已取消${NC}"
        exit 0
    fi
fi

# 生成新的 /images/ location 块配置
echo -e "${YELLOW}请输入后端uploads/images目录的绝对路径${NC}"
read -p "路径 (默认: ${BACKEND_UPLOAD_PATH}): " UPLOAD_PATH
UPLOAD_PATH="${UPLOAD_PATH:-${BACKEND_UPLOAD_PATH}}"

# 验证路径是否存在
if [ ! -d "${UPLOAD_PATH}" ]; then
    echo -e "${YELLOW}警告: 路径不存在: ${UPLOAD_PATH}${NC}"
    echo -e "${YELLOW}是否继续？ (yes/no)${NC}"
    read -r CONTINUE_CONFIRM
    if [ "${CONTINUE_CONFIRM}" != "yes" ]; then
        exit 0
    fi
fi

# 创建临时配置文件片段
TEMP_CONF=$(mktemp)
cat > "${TEMP_CONF}" <<EOF
    # 图片文件服务（新路径结构：/images/**）
    location /images/ {
        alias ${UPLOAD_PATH}/;
        
        # 缓存配置
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # 允许跨域（如果需要）
        add_header Access-Control-Allow-Origin *;
        
        # 禁止访问隐藏文件
        location ~ /\. {
            deny all;
            access_log off;
            log_not_found off;
        }
    }
EOF

echo -e "${YELLOW}是否自动添加配置到现有文件？ (yes/no)${NC}"
echo -e "${YELLOW}如果选择 no，配置内容将显示在屏幕上，您需要手动添加到配置文件中${NC}"
read -r AUTO_ADD

if [ "${AUTO_ADD}" = "yes" ]; then
    # 移除旧的 /api/images/files/ location（如果存在）
    if grep -q "location /api/images/files/" "${CONF_FILE}" 2>/dev/null; then
        echo -e "${YELLOW}发现旧的 /api/images/files/ 配置，是否移除？ (yes/no)${NC}"
        read -r REMOVE_OLD
        if [ "${REMOVE_OLD}" = "yes" ]; then
            # 使用sed移除旧的location块（简化处理）
            sed -i.bak '/location \/api\/images\/files\//,/^    }/d' "${CONF_FILE}" 2>/dev/null || true
            echo -e "${GREEN}✓ 已移除旧的 /api/images/files/ 配置${NC}"
        fi
    fi
    
    # 在 /api/ location 后面添加 /images/ location
    if grep -q "location /api/" "${CONF_FILE}"; then
        # 在 /api/ location 块后面插入
        sed -i.bak "/location \/api\/ {/,/^    }/a\\
\\
$(cat "${TEMP_CONF}" | sed 's/^/    /')
" "${CONF_FILE}"
        echo -e "${GREEN}✓ 配置已添加到文件${NC}"
    else
        echo -e "${YELLOW}未找到 /api/ location 块，配置内容将显示在屏幕上${NC}"
        AUTO_ADD="no"
    fi
fi

if [ "${AUTO_ADD}" != "yes" ]; then
    echo -e "${BLUE}请将以下配置添加到Nginx配置文件的 server 块中：${NC}"
    echo -e "${GREEN}========================================${NC}"
    cat "${TEMP_CONF}"
    echo -e "${GREEN}========================================${NC}"
fi

rm -f "${TEMP_CONF}"

# 验证配置
echo -e "${YELLOW}验证Nginx配置...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx配置验证通过${NC}"
    
    echo -e "${YELLOW}是否立即重载Nginx配置？ (yes/no)${NC}"
    read -r RELOAD_CONFIRM
    if [ "${RELOAD_CONFIRM}" = "yes" ]; then
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx配置已重载${NC}"
    else
        echo -e "${YELLOW}请稍后手动执行: sudo systemctl reload nginx${NC}"
    fi
else
    echo -e "${RED}✗ Nginx配置验证失败${NC}"
    echo -e "${YELLOW}请检查配置文件: ${CONF_FILE}${NC}"
    echo -e "${YELLOW}如果配置有误，可以从备份恢复: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}配置更新完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e ""
echo -e "${BLUE}配置文件: ${CONF_FILE}${NC}"
echo -e "${BLUE}备份文件: ${BACKUP_FILE}${NC}"
echo -e ""
echo -e "${YELLOW}下一步：${NC}"
echo -e "1. 测试图片访问: curl -I http://your-domain.com/images/character/2025/12/example.png"
echo -e "2. 检查Nginx日志: tail -f /var/log/nginx/heartsphere-error.log"
echo -e "3. 查看配置文档: docs/14-部署运维/nginx-images配置说明.md"
