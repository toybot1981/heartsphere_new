#!/bin/bash
# 完整部署脚本 - 前后端一键部署
# 使用方法: ./deploy-all.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置变量
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
BACKEND_DIR="${APP_HOME}/backend"
FRONTEND_DIR="${APP_HOME}/frontend"
ENV_FILE="${APP_HOME}/.env"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  心域系统完整部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}错误: 请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 1. 检查环境变量文件
echo -e "${YELLOW}[1/8] 检查环境变量配置...${NC}"
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${YELLOW}环境变量文件不存在，正在创建...${NC}"
    mkdir -p "${APP_HOME}"
    cp "${SCRIPT_DIR}/env.template" "${ENV_FILE}"
    chmod 600 "${ENV_FILE}"
    echo -e "${RED}请先编辑 ${ENV_FILE} 配置数据库和API密钥，然后重新运行此脚本${NC}"
    exit 1
fi

# 加载环境变量
set -a
source "${ENV_FILE}"
set +a

# 2. 创建应用用户
echo -e "${YELLOW}[2/8] 创建应用用户...${NC}"
if ! id "${APP_USER}" &>/dev/null; then
    useradd -r -s /bin/bash -d "${APP_HOME}" "${APP_USER}"
    echo -e "${GREEN}用户 ${APP_USER} 创建成功${NC}"
else
    echo -e "${GREEN}用户 ${APP_USER} 已存在${NC}"
fi

# 3. 创建目录结构
echo -e "${YELLOW}[3/8] 创建目录结构...${NC}"
mkdir -p "${APP_HOME}"
mkdir -p "${BACKEND_DIR}"
mkdir -p "${FRONTEND_DIR}"
mkdir -p "${APP_HOME}/logs"
mkdir -p "${APP_HOME}/uploads/images"
chown -R "${APP_USER}:${APP_USER}" "${APP_HOME}"

# 4. 部署后端
echo -e "${YELLOW}[4/8] 部署后端服务...${NC}"
"${SCRIPT_DIR}/deploy-backend.sh"

# 5. 部署前端
echo -e "${YELLOW}[5/8] 部署前端服务...${NC}"
"${SCRIPT_DIR}/deploy-frontend.sh"

# 6. 导入数据库（如果提供了数据库配置）
echo -e "${YELLOW}[6/8] 检查数据库配置...${NC}"
if [ -n "${DB_HOST}" ] && [ -n "${DB_NAME}" ] && [ -n "${DB_USER}" ] && [ -n "${DB_PASSWORD}" ]; then
    echo -e "${YELLOW}检测到数据库配置，是否导入数据库？(y/n)${NC}"
    read -r import_db
    if [ "${import_db}" = "y" ] || [ "${import_db}" = "Y" ]; then
        "${SCRIPT_DIR}/import-database.sh"
    fi
else
    echo -e "${YELLOW}未检测到完整数据库配置，跳过数据库导入${NC}"
fi

# 7. 检查服务状态
echo -e "${YELLOW}[7/8] 检查服务状态...${NC}"
sleep 3

# 检查后端服务
if systemctl is-active --quiet "${APP_NAME}-backend"; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务未运行，请检查日志: journalctl -u ${APP_NAME}-backend -n 50${NC}"
fi

# 检查前端服务
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx服务运行正常${NC}"
else
    echo -e "${RED}✗ Nginx服务未运行，请检查日志: journalctl -u nginx -n 50${NC}"
fi

# 8. 显示部署信息
echo -e "${YELLOW}[8/8] 部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署信息:${NC}"
echo -e "${BLUE}后端服务地址: http://localhost:${BACKEND_PORT:-8081}${NC}"
echo -e "${BLUE}前端服务地址: http://localhost:${FRONTEND_PORT:-80}${NC}"
echo -e "${BLUE}应用目录: ${APP_HOME}${NC}"
echo -e "${BLUE}环境变量文件: ${ENV_FILE}${NC}"
echo -e "${GREEN}========================================${NC}"

