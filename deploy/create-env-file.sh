#!/bin/bash
# 创建或更新生产环境的.env文件
# 使用方法: ./create-env-file.sh
# 注意：此脚本应在远程服务器上运行

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}创建/更新 .env 环境变量文件${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 默认路径
DEFAULT_APP_HOME="/opt/heartsphere"
DEFAULT_ENV_FILE="${DEFAULT_APP_HOME}/.env"

# 询问.env文件位置
echo -e "${YELLOW}请输入.env文件路径${NC}"
read -p "路径 [${DEFAULT_ENV_FILE}]: " ENV_FILE
ENV_FILE="${ENV_FILE:-${DEFAULT_ENV_FILE}}"

# 获取目录路径
ENV_DIR=$(dirname "$ENV_FILE")
mkdir -p "$ENV_DIR"

# 如果.env文件已存在，询问是否覆盖
if [ -f "$ENV_FILE" ]; then
    echo ""
    echo -e "${YELLOW}警告: .env文件已存在${NC}"
    read -p "是否覆盖现有文件? [y/N]: " OVERWRITE
    if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}已取消，退出${NC}"
        exit 0
    fi
    echo ""
fi

echo ""
echo -e "${BLUE}========== 配置数据库连接 ==========${NC}"

read -p "数据库主机 [localhost]: " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

read -p "数据库端口 [3306]: " DB_PORT
DB_PORT="${DB_PORT:-3306}"

read -p "数据库名称 [heartsphere]: " DB_NAME
DB_NAME="${DB_NAME:-heartsphere}"

read -p "数据库用户名 [root]: " DB_USER
DB_USER="${DB_USER:-root}"

read -sp "数据库密码: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    echo -e "${RED}错误: 数据库密码不能为空${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}========== 配置JWT密钥 ==========${NC}"
read -p "JWT密钥（留空将自动生成）: " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    if command -v openssl &> /dev/null; then
        JWT_SECRET=$(openssl rand -base64 32)
        echo -e "${GREEN}已自动生成JWT密钥${NC}"
    else
        echo -e "${YELLOW}警告: 未安装openssl，请手动设置JWT_SECRET${NC}"
        JWT_SECRET="your-secret-key-change-in-production"
    fi
fi

echo ""
echo -e "${BLUE}========== 配置图片存储 ==========${NC}"
read -p "图片存储路径 [${DEFAULT_APP_HOME}/uploads/images]: " IMAGE_STORAGE_PATH
IMAGE_STORAGE_PATH="${IMAGE_STORAGE_PATH:-${DEFAULT_APP_HOME}/uploads/images}"

read -p "图片基础URL（例如: http://heartsphere.cn/images）: " IMAGE_BASE_URL
IMAGE_BASE_URL="${IMAGE_BASE_URL:-}"

echo ""
echo -e "${BLUE}========== 其他配置 ==========${NC}"
read -p "应用名称 [heartsphere]: " APP_NAME
APP_NAME="${APP_NAME:-heartsphere}"

read -p "应用主目录 [${DEFAULT_APP_HOME}]: " APP_HOME
APP_HOME="${APP_HOME:-${DEFAULT_APP_HOME}}"

read -p "后端端口 [8081]: " BACKEND_PORT
BACKEND_PORT="${BACKEND_PORT:-8081}"

# 创建.env文件
echo ""
echo -e "${YELLOW}正在创建.env文件...${NC}"

cat > "$ENV_FILE" <<EOF
# HeartSphere 环境变量配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')

# ==================== 数据库配置 ====================
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}

# ==================== JWT 配置 ====================
JWT_SECRET=${JWT_SECRET}

# ==================== 图片存储配置 ====================
IMAGE_STORAGE_PATH=${IMAGE_STORAGE_PATH}
IMAGE_BASE_URL=${IMAGE_BASE_URL}
IMAGE_MAX_SIZE=10485760

# ==================== 应用配置 ====================
APP_NAME=${APP_NAME}
APP_HOME=${APP_HOME}
BACKEND_PORT=${BACKEND_PORT}

# ==================== 微信登录配置（可选）====================
WECHAT_APP_ID=
WECHAT_APP_SECRET=
WECHAT_REDIRECT_URI=

# ==================== 大模型 API Key 配置 ====================
# Gemini (Google)
GEMINI_API_KEY=
GEMINI_MODEL_NAME=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
GEMINI_VIDEO_MODEL=veo-3.1-fast-generate-preview

# OpenAI (ChatGPT)
OPENAI_API_KEY=
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_NAME=gpt-4o
OPENAI_IMAGE_MODEL=dall-e-3

# 通义千问 (Qwen)
QWEN_API_KEY=
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
QWEN_MODEL_NAME=qwen-max
QWEN_IMAGE_MODEL=qwen-image-plus
QWEN_VIDEO_MODEL=wanx-video

# 豆包 (Doubao)
DOUBAO_API_KEY=
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
DOUBAO_MODEL_NAME=ep-2024...
DOUBAO_IMAGE_MODEL=doubao-image-v1
DOUBAO_VIDEO_MODEL=doubao-video-v1

# ==================== 大模型路由策略配置 ====================
# 可选值: gemini, openai, qwen, doubao
TEXT_PROVIDER=gemini
IMAGE_PROVIDER=gemini
VIDEO_PROVIDER=gemini
AUDIO_PROVIDER=gemini
ENABLE_FALLBACK=true

# ==================== 生产环境配置 ====================
SPRING_PROFILES_ACTIVE=production
NODE_ENV=production
EOF

# 设置文件权限（仅所有者可读写）
chmod 600 "$ENV_FILE"

echo -e "${GREEN}✓ .env文件已创建: ${ENV_FILE}${NC}"
echo ""
echo -e "${BLUE}========== 文件信息 ==========${NC}"
echo -e "文件路径: ${GREEN}${ENV_FILE}${NC}"
echo -e "文件权限: $(ls -l "$ENV_FILE" | awk '{print $1}')"
echo ""
echo -e "${YELLOW}重要提示:${NC}"
echo -e "1. .env文件已设置为仅所有者可读写（chmod 600）"
echo -e "2. 请确保.env文件包含正确的数据库连接信息"
echo -e "3. 如果.env文件在 ${DEFAULT_APP_HOME}/.env，systemd服务会自动加载"
echo -e "4. 如果.env文件在其他位置，请更新systemd服务文件中的EnvironmentFile路径"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "1. 检查.env文件内容: ${BLUE}cat ${ENV_FILE}${NC}"
echo -e "2. 更新systemd服务文件（如果.env文件位置变更）"
echo -e "3. 重启后端服务: ${BLUE}sudo systemctl restart heartsphere-backend${NC}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}配置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
