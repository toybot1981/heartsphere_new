#!/bin/bash
# 前端重新部署脚本 - 完整清理和重建
# 用于解决生产环境构建问题（如 React ForwardRef 错误）
# 使用方法: ./redeploy-frontend.sh

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
FRONTEND_DIR="${APP_HOME}/frontend"
FRONTEND_SOURCE="${PROJECT_ROOT}/frontend"
NGINX_CONF="/etc/nginx/conf.d/${APP_NAME}.conf"
ENV_FILE="${APP_HOME}/.env"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}前端重新部署脚本 - HeartSphere${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 检查前端源码目录是否存在
if [ ! -d "${FRONTEND_SOURCE}" ]; then
    echo -e "${RED}前端源码目录不存在: ${FRONTEND_SOURCE}${NC}"
    exit 1
fi

# 加载环境变量
if [ -f "${ENV_FILE}" ]; then
    set -a
    source "${ENV_FILE}"
    set +a
fi

# ==================== 步骤1: 清理旧文件 ====================
echo -e "${BLUE}[1/7] 清理旧的构建产物和缓存...${NC}"

# 清理生产目录
if [ -d "${FRONTEND_DIR}" ]; then
    echo -e "${YELLOW}清理生产目录: ${FRONTEND_DIR}${NC}"
    rm -rf "${FRONTEND_DIR}/dist"
    rm -rf "${FRONTEND_DIR}/node_modules"
    rm -rf "${FRONTEND_DIR}/.vite"
    rm -f "${FRONTEND_DIR}/.env.production"
    rm -f "${FRONTEND_DIR}/package-lock.json"
    echo -e "${GREEN}生产目录清理完成${NC}"
fi

# 清理源码目录
cd "${FRONTEND_SOURCE}"
echo -e "${YELLOW}清理源码目录缓存...${NC}"
rm -rf node_modules
rm -rf dist
rm -rf .vite
rm -f .env.production
rm -f package-lock.json
rm -rf .npm
echo -e "${GREEN}源码目录清理完成${NC}"

# ==================== 步骤2: 检查 Node.js 环境 ====================
echo -e "${BLUE}[2/7] 检查 Node.js 环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js 未安装，请先安装 Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 版本过低，需要 18+，当前版本: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}Node.js 版本: $(node -v)${NC}"
echo -e "${GREEN}npm 版本: $(npm -v)${NC}"

# ==================== 步骤3: 重新安装依赖 ====================
echo -e "${BLUE}[3/7] 重新安装依赖...${NC}"

cd "${FRONTEND_SOURCE}"

# 清理npm缓存
echo -e "${YELLOW}清理 npm 缓存...${NC}"
npm cache clean --force

# 安装依赖（使用 --legacy-peer-deps 避免 peer dependencies 冲突）
echo -e "${YELLOW}安装依赖（这可能需要几分钟）...${NC}"
# 确保React相关依赖正确安装
npm install --legacy-peer-deps --no-audit --no-fund --force

# 验证关键依赖
echo -e "${YELLOW}验证关键依赖...${NC}"
if [ ! -d "node_modules/react" ]; then
    echo -e "${RED}React 未正确安装！${NC}"
    exit 1
fi
if [ ! -d "node_modules/react-dom" ]; then
    echo -e "${RED}React-DOM 未正确安装！${NC}"
    exit 1
fi

# 检查是否有多个 React 实例（这会导致 ForwardRef 错误）
echo -e "${YELLOW}检查 React 实例...${NC}"
REACT_INSTANCES=$(find node_modules -name "react" -type d | grep -v ".bin" | wc -l)
if [ "$REACT_INSTANCES" -gt 1 ]; then
    echo -e "${YELLOW}警告: 发现多个 React 实例 ($REACT_INSTANCES 个)，这可能导致 ForwardRef 错误${NC}"
    echo -e "${YELLOW}尝试修复...${NC}"
    # 查找所有 React 实例
    find node_modules -name "react" -type d | grep -v ".bin" | while read dir; do
        if [ "$dir" != "node_modules/react" ]; then
            echo -e "${YELLOW}发现额外的 React 实例: $dir${NC}"
            # 创建符号链接指向主 React 实例
            rm -rf "$dir"
            ln -s "$(pwd)/node_modules/react" "$dir"
        fi
    done
    echo -e "${GREEN}已尝试修复多个 React 实例问题${NC}"
fi

echo -e "${GREEN}关键依赖验证通过${NC}"

if [ $? -ne 0 ]; then
    echo -e "${RED}依赖安装失败！${NC}"
    exit 1
fi

echo -e "${GREEN}依赖安装完成${NC}"

# ==================== 步骤4: 创建生产环境配置 ====================
echo -e "${BLUE}[4/7] 创建生产环境配置...${NC}"

# 创建 .env.production 文件
cat > "${FRONTEND_SOURCE}/.env.production" <<EOF
# 生产环境配置
# API 基础 URL 配置（使用相对路径，通过 nginx 代理）
VITE_API_BASE_URL=

# 构建模式
NODE_ENV=production
EOF

echo -e "${GREEN}生产环境配置文件已创建${NC}"

# ==================== 步骤5: 构建项目 ====================
echo -e "${BLUE}[5/7] 构建前端项目...${NC}"

cd "${FRONTEND_SOURCE}"

# 清理 Vite 缓存和所有构建缓存
echo -e "${YELLOW}清理 Vite 缓存...${NC}"
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
# 清理所有可能的缓存目录
rm -rf node_modules/.cache
rm -rf .cache

# 确保React版本正确
echo -e "${YELLOW}检查React版本...${NC}"
REACT_VERSION=$(node -p "require('./node_modules/react/package.json').version")
REACT_DOM_VERSION=$(node -p "require('./node_modules/react-dom/package.json').version")
echo -e "${GREEN}React: ${REACT_VERSION}, React-DOM: ${REACT_DOM_VERSION}${NC}"

# 构建项目（使用详细输出以便调试）
echo -e "${YELLOW}开始构建（这可能需要几分钟）...${NC}"
BUILD_LOG="${FRONTEND_SOURCE}/build.log"
npm run build 2>&1 | tee "${BUILD_LOG}"
BUILD_EXIT_CODE=${PIPESTATUS[0]}

# 检查构建是否成功
if [ $BUILD_EXIT_CODE -ne 0 ]; then
    echo -e "${RED}构建失败！退出码: ${BUILD_EXIT_CODE}${NC}"
    echo -e "${YELLOW}查看构建日志: ${BUILD_LOG}${NC}"
    tail -50 "${BUILD_LOG}"
    exit 1
fi

# 检查构建日志中的严重错误（警告可以忽略）
if grep -iE "error|fail" "${BUILD_LOG}" | grep -vE "warn|warning" | head -10; then
    echo -e "${YELLOW}构建过程中可能有错误，但构建已完成，继续检查构建产物...${NC}"
fi

# 检查构建产物
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    echo -e "${RED}构建产物不存在或为空！${NC}"
    exit 1
fi

echo -e "${GREEN}构建完成${NC}"

# ==================== 步骤6: 部署到生产目录 ====================
echo -e "${BLUE}[6/7] 部署到生产目录...${NC}"

# 创建生产目录
mkdir -p "${FRONTEND_DIR}"
chown -R ${APP_USER}:${APP_USER} "${FRONTEND_DIR}"

# 复制构建产物
echo -e "${YELLOW}复制构建产物...${NC}"
cp -r dist/* "${FRONTEND_DIR}/"

# 复制环境配置文件
cp "${FRONTEND_SOURCE}/.env.production" "${FRONTEND_DIR}/.env.production"

# 设置权限
chown -R ${APP_USER}:${APP_USER} "${FRONTEND_DIR}"
chmod -R 755 "${FRONTEND_DIR}"

echo -e "${GREEN}部署完成${NC}"

# ==================== 步骤7: 验证和重启服务 ====================
echo -e "${BLUE}[7/7] 验证部署...${NC}"

# 检查关键文件
if [ ! -f "${FRONTEND_DIR}/index.html" ]; then
    echo -e "${RED}警告: index.html 不存在！${NC}"
fi

# 检查是否有 localhost 硬编码（不应该有）
if grep -r "localhost:8081" "${FRONTEND_DIR}" 2>/dev/null | grep -v ".map" | head -5; then
    echo -e "${YELLOW}警告: 发现 localhost:8081 硬编码，可能存在问题${NC}"
else
    echo -e "${GREEN}未发现 localhost 硬编码${NC}"
fi

# 检查 Nginx 配置
if [ -f "${NGINX_CONF}" ]; then
    echo -e "${YELLOW}检查 Nginx 配置...${NC}"
    if nginx -t 2>/dev/null; then
        echo -e "${GREEN}Nginx 配置有效${NC}"
        echo -e "${YELLOW}是否重新加载 Nginx? (y/n)${NC}"
        read -p "> " reload_nginx
        if [ "$reload_nginx" = "y" ] || [ "$reload_nginx" = "Y" ]; then
            systemctl reload nginx
            echo -e "${GREEN}Nginx 已重新加载${NC}"
        fi
    else
        echo -e "${YELLOW}Nginx 配置检查失败，请手动检查${NC}"
    fi
else
    echo -e "${YELLOW}Nginx 配置文件不存在: ${NGINX_CONF}${NC}"
fi

# ==================== 完成 ====================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}前端重新部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}部署信息：${NC}"
echo -e "  源码目录: ${FRONTEND_SOURCE}"
echo -e "  生产目录: ${FRONTEND_DIR}"
echo -e "  构建产物大小: $(du -sh ${FRONTEND_DIR} | cut -f1)"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo -e "  1. 访问网站检查是否正常"
echo -e "  2. 打开浏览器控制台检查是否有错误"
echo -e "  3. 如果仍有问题，查看构建日志: ${FRONTEND_SOURCE}/build.log"
echo ""
echo -e "${GREEN}完成！${NC}"
