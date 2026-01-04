#!/bin/bash
# 检查生产环境 API 配置
# 用于诊断 API Base URL 配置问题

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
APP_HOME="/opt/heartsphere"
PROD_FRONTEND_DIR="${APP_HOME}/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}检查生产环境 API 配置${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查 .env.production 文件
echo -e "${BLUE}[1/5] 检查 .env.production 文件${NC}"
if [ -f "${FRONTEND_DIR}/.env.production" ]; then
    echo -e "${GREEN}文件存在: ${FRONTEND_DIR}/.env.production${NC}"
    echo -e "${YELLOW}内容：${NC}"
    cat "${FRONTEND_DIR}/.env.production" | grep -E "VITE_API_BASE_URL|VITE_DEPLOY_ENV" || echo "  未找到相关配置"
    
    API_BASE_URL_VALUE=$(grep "^VITE_API_BASE_URL=" "${FRONTEND_DIR}/.env.production" | cut -d'=' -f2 || echo "")
    if [ -z "$API_BASE_URL_VALUE" ]; then
        echo -e "${GREEN}✅ VITE_API_BASE_URL 为空（正确，使用相对路径）${NC}"
    elif [[ "$API_BASE_URL_VALUE" == *"localhost"* ]]; then
        echo -e "${RED}❌ VITE_API_BASE_URL 包含 localhost（错误！）${NC}"
        echo -e "${RED}   当前值: ${API_BASE_URL_VALUE}${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_API_BASE_URL=${API_BASE_URL_VALUE}${NC}"
    fi
else
    echo -e "${RED}❌ 文件不存在: ${FRONTEND_DIR}/.env.production${NC}"
fi
echo ""

# 2. 检查构建产物
echo -e "${BLUE}[2/5] 检查构建产物中的 API 配置${NC}"
if [ -d "${FRONTEND_DIR}/dist" ]; then
    echo -e "${GREEN}构建目录存在: ${FRONTEND_DIR}/dist${NC}"
    
    # 检查是否包含 localhost:8081
    if grep -r "localhost:8081" "${FRONTEND_DIR}/dist/assets"/*.js 2>/dev/null | head -1; then
        echo -e "${RED}❌ 构建产物中包含 localhost:8081（错误！）${NC}"
        echo -e "${YELLOW}找到的文件：${NC}"
        grep -r "localhost:8081" "${FRONTEND_DIR}/dist/assets"/*.js 2>/dev/null | head -3
    else
        echo -e "${GREEN}✅ 构建产物中不包含 localhost:8081${NC}"
    fi
    
    # 检查是否包含 /api
    if grep -r '"/api' "${FRONTEND_DIR}/dist/assets"/*.js 2>/dev/null | head -1; then
        echo -e "${GREEN}✅ 构建产物中包含相对路径 /api${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  构建目录不存在: ${FRONTEND_DIR}/dist${NC}"
fi
echo ""

# 3. 检查生产环境部署文件
echo -e "${BLUE}[3/5] 检查生产环境部署文件${NC}"
if [ -d "${PROD_FRONTEND_DIR}" ]; then
    echo -e "${GREEN}生产目录存在: ${PROD_FRONTEND_DIR}${NC}"
    
    # 检查 HTML 文件中是否有 window.__API_BASE_URL__
    if [ -f "${PROD_FRONTEND_DIR}/index.html" ]; then
        if grep -q "__API_BASE_URL__" "${PROD_FRONTEND_DIR}/index.html"; then
            echo -e "${YELLOW}⚠️  index.html 中包含 __API_BASE_URL__${NC}"
            grep "__API_BASE_URL__" "${PROD_FRONTEND_DIR}/index.html"
        else
            echo -e "${GREEN}✅ index.html 中不包含 __API_BASE_URL__${NC}"
        fi
    fi
    
    # 检查 JS 文件中是否包含 localhost:8081
    if find "${PROD_FRONTEND_DIR}/assets" -name "*.js" 2>/dev/null | head -1 | xargs grep -l "localhost:8081" 2>/dev/null | head -1; then
        echo -e "${RED}❌ 生产环境 JS 文件中包含 localhost:8081（错误！）${NC}"
    else
        echo -e "${GREEN}✅ 生产环境 JS 文件中不包含 localhost:8081${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  生产目录不存在: ${PROD_FRONTEND_DIR}${NC}"
fi
echo ""

# 4. 检查 nginx 配置
echo -e "${BLUE}[4/5] 检查 nginx 配置${NC}"
NGINX_CONF="/etc/nginx/conf.d/heartsphere.conf"
if [ -f "${NGINX_CONF}" ]; then
    echo -e "${GREEN}Nginx 配置存在: ${NGINX_CONF}${NC}"
    
    # 检查 API 代理配置
    if grep -q "location.*api" "${NGINX_CONF}"; then
        echo -e "${GREEN}✅ 找到 API 代理配置：${NC}"
        grep -A 5 "location.*api" "${NGINX_CONF}" | head -10
    else
        echo -e "${RED}❌ 未找到 API 代理配置${NC}"
    fi
    
    # 检查是否有 sub_filter 注入 API_BASE_URL
    if grep -q "__API_BASE_URL__" "${NGINX_CONF}"; then
        echo -e "${YELLOW}⚠️  Nginx 配置中包含 __API_BASE_URL__ 注入${NC}"
        grep "__API_BASE_URL__" "${NGINX_CONF}"
    fi
else
    echo -e "${YELLOW}⚠️  Nginx 配置文件不存在: ${NGINX_CONF}${NC}"
fi
echo ""

# 5. 检查环境变量
echo -e "${BLUE}[5/5] 检查环境变量${NC}"
if [ -f "${APP_HOME}/.env" ]; then
    echo -e "${GREEN}环境变量文件存在: ${APP_HOME}/.env${NC}"
    if grep -q "API_BASE_URL" "${APP_HOME}/.env"; then
        echo -e "${YELLOW}找到 API_BASE_URL 配置：${NC}"
        grep "API_BASE_URL" "${APP_HOME}/.env"
    fi
else
    echo -e "${YELLOW}⚠️  环境变量文件不存在: ${APP_HOME}/.env${NC}"
fi
echo ""

# 总结
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}检查完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}修复建议：${NC}"
echo -e "  1. 确保 .env.production 中 VITE_API_BASE_URL 为空字符串"
echo -e "  2. 重新构建前端项目（npm run build）"
echo -e "  3. 重新部署到生产环境"
echo -e "  4. 清除浏览器缓存"
echo ""
echo -e "${YELLOW}如果问题仍然存在，运行修复脚本：${NC}"
echo -e "  ${GREEN}sudo ${SCRIPT_DIR}/fix-production-api-url.sh${NC}"
