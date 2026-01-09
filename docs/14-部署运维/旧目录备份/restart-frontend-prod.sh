#!/bin/bash
# 生产环境前端重启脚本
# 流程：重新编译 + 替换文件 + 重载 Nginx（如果配置未变）或重启 Nginx（如果配置变更）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
FRONTEND_DIR="${APP_HOME}/frontend"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FRONTEND_SOURCE_DIR="${PROJECT_ROOT}/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}生产环境前端重启脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 进入前端源码目录
echo -e "${YELLOW}[1/4] 进入前端源码目录...${NC}"
cd "${FRONTEND_SOURCE_DIR}" || {
    echo -e "${RED}错误: 无法进入前端目录 ${FRONTEND_SOURCE_DIR}${NC}"
    exit 1
}

# 2. 重新编译前端
echo -e "${YELLOW}[2/4] 重新编译前端项目...${NC}"
echo -e "${BLUE}执行: npm run build${NC}"

# 如果不存在 node_modules，先安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装前端依赖...${NC}"
    npm install
fi

# 构建生产版本
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 编译完成${NC}"

# 3. 部署前端文件（替换旧文件）
echo -e "${YELLOW}[3/4] 部署前端文件...${NC}"

# 备份当前版本（可选，用于回滚）
BACKUP_DIR="${FRONTEND_DIR}.backup.$(date +%Y%m%d_%H%M%S)"
if [ -d "${FRONTEND_DIR}" ] && [ "$(ls -A ${FRONTEND_DIR})" ]; then
    echo -e "${BLUE}备份当前版本到: ${BACKUP_DIR}${NC}"
    cp -r "${FRONTEND_DIR}" "${BACKUP_DIR}" || true
fi

# 部署新版本
mkdir -p "${FRONTEND_DIR}"
rm -rf "${FRONTEND_DIR}"/*
cp -r dist/* "${FRONTEND_DIR}"/
chown -R "${APP_USER}:${APP_USER}" "${FRONTEND_DIR}"

echo -e "${GREEN}✓ 文件部署完成${NC}"

# 4. 重载/重启 Nginx
echo -e "${YELLOW}[4/4] 重载 Nginx 配置...${NC}"

# 检查 Nginx 配置是否有变化（通过比较配置文件的时间戳）
NGINX_CONFIG_CHANGED=false
if [ -f "${NGINX_CONF}" ]; then
    # 如果配置文件的修改时间比当前时间早，说明配置可能已被外部修改
    # 这里我们默认使用 reload（优雅重启），只有在 reload 失败时才使用 restart
    NGINX_CONFIG_CHANGED=false
else
    NGINX_CONFIG_CHANGED=true
fi

# 测试 Nginx 配置
nginx -t || {
    echo -e "${RED}Nginx 配置测试失败！${NC}"
    echo -e "${YELLOW}尝试回滚...${NC}"
    if [ -d "${BACKUP_DIR}" ]; then
        rm -rf "${FRONTEND_DIR}"/*
        cp -r "${BACKUP_DIR}"/* "${FRONTEND_DIR}"/
        chown -R "${APP_USER}:${APP_USER}" "${FRONTEND_DIR}"
        echo -e "${GREEN}已回滚到备份版本${NC}"
    fi
    exit 1
}

# 使用 reload（优雅重启，不中断现有连接）
if nginx -s reload 2>/dev/null; then
    echo -e "${GREEN}✓ Nginx 已优雅重载（reload）${NC}"
    echo -e "${BLUE}说明: 使用 nginx -s reload，不中断现有连接${NC}"
else
    # 如果 reload 失败，使用 restart（完全重启）
    echo -e "${YELLOW}reload 失败，尝试完全重启 Nginx...${NC}"
    systemctl restart nginx
    echo -e "${GREEN}✓ Nginx 已重启（restart）${NC}"
fi

# 检查服务状态
sleep 1
if systemctl is-active --quiet nginx; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}前端重启成功！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}部署信息:${NC}"
    echo -e "  前端目录: ${FRONTEND_DIR}"
    echo -e "  备份目录: ${BACKUP_DIR}"
    echo -e "  Nginx 配置: ${NGINX_CONF}"
    echo ""
    echo -e "${BLUE}常用命令:${NC}"
    echo -e "  查看日志: journalctl -u nginx -f"
    echo -e "  查看访问日志: tail -f /var/log/nginx/${APP_NAME}-access.log"
    echo -e "  查看错误日志: tail -f /var/log/nginx/${APP_NAME}-error.log"
    echo ""
    if [ -d "${BACKUP_DIR}" ]; then
        echo -e "${YELLOW}回滚命令（如果需要）:${NC}"
        echo -e "  rm -rf ${FRONTEND_DIR}/*"
        echo -e "  cp -r ${BACKUP_DIR}/* ${FRONTEND_DIR}/"
        echo -e "  chown -R ${APP_USER}:${APP_USER} ${FRONTEND_DIR}"
        echo -e "  nginx -s reload"
    fi
else
    echo -e "${RED}Nginx 启动失败，请查看日志:${NC}"
    echo -e "journalctl -u nginx -n 50"
    exit 1
fi

echo ""
echo -e "${GREEN}前端重启完成！${NC}"
