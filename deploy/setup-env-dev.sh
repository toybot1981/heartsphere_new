#!/bin/bash
# 开发环境变量设置和检查脚本
# 功能：
# 1. 检查开发环境中的环境变量设置
# 2. 提示设置缺失的环境变量
# 3. 支持强制更新所有环境变量
# 使用方法: ./setup-env-dev.sh [--force] [--check-only]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
TEMPLATE_FILE="${SCRIPT_DIR}/env.template"
ENV_FILE="${PROJECT_ROOT}/backend/.env"

# 解析参数
FORCE_UPDATE=false
CHECK_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_UPDATE=true
            shift
            ;;
        --check-only)
            CHECK_ONLY=true
            shift
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            echo "使用方法: $0 [--force] [--check-only]"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开发环境变量设置和检查脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查模板文件是否存在
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}错误: 模板文件不存在: ${TEMPLATE_FILE}${NC}"
    exit 1
fi

# 从模板文件中提取环境变量名（排除注释和空行）
get_env_vars_from_template() {
    grep -v '^#' "$TEMPLATE_FILE" | grep -v '^$' | grep -E '^[A-Z_]+=' | cut -d'=' -f1 | sort -u
}

# 检查环境变量是否设置
check_env_var() {
    local var_name="$1"
    if [ -z "${!var_name}" ]; then
        return 1  # 未设置
    else
        return 0  # 已设置
    fi
}

# 从 .env 文件加载环境变量
load_env_file() {
    if [ -f "$ENV_FILE" ]; then
        set -a
        source "$ENV_FILE" 2>/dev/null || true
        set +a
    fi
}

# 读取用户输入（隐藏密码输入）
read_password() {
    local prompt="$1"
    local var_name="$2"
    local value
    
    echo -ne "${YELLOW}${prompt}: ${NC}"
    read -s value
    echo ""
    eval "$var_name='$value'"
}

# 读取用户输入
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local value
    
    if [ -n "$default" ]; then
        echo -ne "${YELLOW}${prompt} [${default}]: ${NC}"
    else
        echo -ne "${YELLOW}${prompt}: ${NC}"
    fi
    
    read value
    if [ -z "$value" ] && [ -n "$default" ]; then
        value="$default"
    fi
    eval "$var_name='$value'"
}

# 保存环境变量到 .env 文件
save_to_env_file() {
    local env_file="$1"
    
    echo -e "${YELLOW}保存环境变量到: ${env_file}${NC}"
    
    # 备份现有文件
    if [ -f "$env_file" ]; then
        cp "$env_file" "${env_file}.backup.$(date +%Y%m%d_%H%M%S)"
        echo -e "${GREEN}已备份现有配置文件${NC}"
    fi
    
    # 创建新的 .env 文件
    cat > "$env_file" << EOF
# HeartSphere 开发环境变量配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 注意: 此文件包含敏感信息，不要提交到版本控制系统

EOF
    
    # 按类别组织环境变量
    local categories=(
        "数据库配置:DB_NAME,DB_USER,DB_PASSWORD,DB_HOST,DB_PORT"
        "JWT 配置:JWT_SECRET"
        "微信登录配置:WECHAT_APP_ID,WECHAT_APP_SECRET,WECHAT_REDIRECT_URI"
        "图片存储配置:IMAGE_STORAGE_TYPE,IMAGE_STORAGE_PATH,IMAGE_BASE_URL,IMAGE_MAX_SIZE"
        "应用配置:APP_NAME,APP_HOME,BASE_URL,BACKEND_PORT,FRONTEND_PORT"
        "Gemini 配置:GEMINI_API_KEY,GEMINI_MODEL_NAME,GEMINI_IMAGE_MODEL,GEMINI_VIDEO_MODEL"
        "OpenAI 配置:OPENAI_API_KEY,OPENAI_BASE_URL,OPENAI_MODEL_NAME,OPENAI_IMAGE_MODEL"
        "通义千问配置:QWEN_API_KEY,QWEN_BASE_URL,QWEN_MODEL_NAME,QWEN_IMAGE_MODEL,QWEN_VIDEO_MODEL"
        "豆包配置:DOUBAO_API_KEY,DOUBAO_BASE_URL,DOUBAO_MODEL_NAME,DOUBAO_IMAGE_MODEL,DOUBAO_VIDEO_MODEL"
        "路由策略配置:TEXT_PROVIDER,IMAGE_PROVIDER,VIDEO_PROVIDER,AUDIO_PROVIDER,ENABLE_FALLBACK"
        "环境配置:SPRING_PROFILES_ACTIVE,NODE_ENV"
    )
    
    for category in "${categories[@]}"; do
        local title="${category%%:*}"
        local vars="${category#*:}"
        
        echo "" >> "$env_file"
        echo "# ==================== ${title} ====================" >> "$env_file"
        
        IFS=',' read -ra VAR_ARRAY <<< "$vars"
        for var_name in "${VAR_ARRAY[@]}"; do
            if [ -n "${!var_name}" ]; then
                # 如果是密码相关变量，添加注释说明
                if [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"API_KEY"* ]]; then
                    echo "${var_name}=${!var_name}" >> "$env_file"
                else
                    echo "${var_name}=${!var_name}" >> "$env_file"
                fi
            fi
        done
    done
    
    # 设置文件权限（仅所有者可读写）
    chmod 600 "$env_file"
    echo -e "${GREEN}环境变量已保存到 ${env_file}${NC}"
}

# 检查必需的环境变量
check_required_env_vars() {
    local missing_vars=()
    local required_vars=(
        "DB_HOST"
        "DB_PORT"
        "DB_NAME"
        "DB_USER"
        "DB_PASSWORD"
        "JWT_SECRET"
    )
    
    for var in "${required_vars[@]}"; do
        if ! check_env_var "$var"; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        return 1
    else
        return 0
    fi
}

# 加载现有环境变量
load_env_file

# 获取模板中的所有环境变量
TEMPLATE_VARS=($(get_env_vars_from_template))

if [ "$CHECK_ONLY" = true ]; then
    # 仅检查模式
    echo -e "${BLUE}========== 环境变量检查模式 ==========${NC}"
    echo ""
    
    local missing_count=0
    local missing_vars=()
    local set_count=0
    
    for var_name in "${TEMPLATE_VARS[@]}"; do
        if check_env_var "$var_name"; then
            # 如果是密码相关，显示星号
            if [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"API_KEY"* ]]; then
                echo -e "${GREEN}✓${NC} ${var_name}=${RED}******${NC}"
            else
                echo -e "${GREEN}✓${NC} ${var_name}=${!var_name}"
            fi
            set_count=$((set_count + 1))
        else
            echo -e "${RED}✗${NC} ${var_name} ${YELLOW}(未设置)${NC}"
            missing_vars+=("$var_name")
            missing_count=$((missing_count + 1))
        fi
    done
    
    echo ""
    echo -e "${BLUE}========== 检查结果 ==========${NC}"
    echo -e "已设置: ${GREEN}${set_count}${NC}"
    echo -e "缺失: ${RED}${missing_count}${NC}"
    
    if [ $missing_count -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}缺失的环境变量:${NC}"
        for var in "${missing_vars[@]}"; do
            echo "  - ${var}"
        done
        echo ""
        echo -e "${YELLOW}运行以下命令设置环境变量:${NC}"
        echo "  ${CYAN}${SCRIPT_DIR}/setup-env-dev.sh${NC}"
        exit 1
    else
        echo ""
        echo -e "${GREEN}✓ 所有环境变量已设置${NC}"
        exit 0
    fi
fi

# 交互式设置模式
echo -e "${BLUE}========== 环境变量设置（开发环境）==========${NC}"
echo ""

if [ "$FORCE_UPDATE" = true ]; then
    echo -e "${YELLOW}强制更新模式: 将重新设置所有环境变量${NC}"
    echo ""
else
    # 检查必需变量
    if check_required_env_vars; then
        echo -e "${GREEN}✓ 必需的环境变量已设置${NC}"
        echo ""
        read -p "是否检查所有环境变量？[y/N]: " check_all
        if [[ ! "$check_all" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}已取消${NC}"
            exit 0
        fi
    else
        echo -e "${RED}⚠ 检测到缺失的必需环境变量${NC}"
        echo ""
    fi
fi

# 设置环境变量
echo -e "${BLUE}========== 数据库配置 ==========${NC}"
read_input "数据库主机" "${DB_HOST:-localhost}" "DB_HOST"
read_input "数据库端口" "${DB_PORT:-3306}" "DB_PORT"
read_input "数据库名称" "${DB_NAME:-heartsphere}" "DB_NAME"
read_input "数据库用户" "${DB_USER:-root}" "DB_USER"
read_password "数据库密码" "DB_PASSWORD"

echo ""
echo -e "${BLUE}========== JWT 配置 ==========${NC}"
if [ -z "$JWT_SECRET" ] || [ "$FORCE_UPDATE" = true ]; then
    read_input "JWT Secret (留空将自动生成)" "" "JWT_SECRET_INPUT"
    if [ -z "$JWT_SECRET_INPUT" ]; then
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s)$RANDOM" | sha256sum | head -c 64)
        echo -e "${GREEN}已自动生成 JWT_SECRET${NC}"
    else
        JWT_SECRET="$JWT_SECRET_INPUT"
    fi
else
    JWT_SECRET="$JWT_SECRET"
    echo -e "${GREEN}使用现有 JWT_SECRET${NC}"
fi

echo ""
echo -e "${BLUE}========== 微信登录配置（可选）==========${NC}"
read_input "微信 App ID" "${WECHAT_APP_ID:-}" "WECHAT_APP_ID"
read_input "微信 App Secret" "${WECHAT_APP_SECRET:-}" "WECHAT_APP_SECRET"
read_input "微信回调 URI" "${WECHAT_REDIRECT_URI:-}" "WECHAT_REDIRECT_URI"

echo ""
echo -e "${BLUE}========== 应用配置 ==========${NC}"
read_input "应用名称" "${APP_NAME:-heartsphere}" "APP_NAME"
read_input "应用主目录" "${APP_HOME:-${PROJECT_ROOT}/main/backend}" "APP_HOME"
# 开发环境默认BASE_URL
BASE_URL="${BASE_URL:-http://localhost:8080}"
read_input "应用基础URL（用于图片等服务，多项目统一访问入口）" "${BASE_URL}" "BASE_URL"
echo -e "${CYAN}多项目路径路由说明:${NC}"
echo -e "  - main (PC): ${BASE_URL}/"
echo -e "  - main (Mobile): ${BASE_URL}/mobile.html"
echo -e "  - admin: ${BASE_URL}/admin.html"
echo -e "  - edu: ${BASE_URL}/edu.html"
echo -e "  - mentis: ${BASE_URL}/mentis"
read_input "后端端口（main项目）" "${BACKEND_PORT:-8081}" "BACKEND_PORT"
read_input "前端端口（Nginx监听端口）" "${FRONTEND_PORT:-8080}" "FRONTEND_PORT"

echo ""
echo -e "${BLUE}========== 图片存储配置 ==========${NC}"
read_input "图片存储类型 (local/oss/s3)" "${IMAGE_STORAGE_TYPE:-local}" "IMAGE_STORAGE_TYPE"
read_input "图片存储路径" "${IMAGE_STORAGE_PATH:-./uploads/images}" "IMAGE_STORAGE_PATH"
# IMAGE_BASE_URL 自动设置为 BASE_URL + "/images"
IMAGE_BASE_URL="${BASE_URL}/images"
echo -e "${GREEN}图片服务基础URL: ${IMAGE_BASE_URL}${NC} (自动设置为 BASE_URL + '/images')"
read_input "图片最大大小（字节）" "${IMAGE_MAX_SIZE:-10485760}" "IMAGE_MAX_SIZE"

echo ""
echo -e "${BLUE}========== 大模型 API Key 配置（可选）==========${NC}"
read_input "Gemini API Key" "${GEMINI_API_KEY:-}" "GEMINI_API_KEY"
read_input "OpenAI API Key" "${OPENAI_API_KEY:-}" "OPENAI_API_KEY"
read_input "通义千问 API Key" "${QWEN_API_KEY:-}" "QWEN_API_KEY"
read_input "豆包 API Key" "${DOUBAO_API_KEY:-}" "DOUBAO_API_KEY"

echo ""
echo -e "${BLUE}========== 确认保存 ==========${NC}"
echo -e "${YELLOW}环境变量将保存到: ${ENV_FILE}${NC}"
read -p "确认保存？[Y/n]: " confirm
if [[ "$confirm" =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}已取消${NC}"
    exit 0
fi

# 保存到文件
save_to_env_file "$ENV_FILE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开发环境变量设置完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}下一步:${NC}"
echo -e "  1. 检查环境变量: ${CYAN}${SCRIPT_DIR}/setup-env-dev.sh --check-only${NC}"
echo -e "  2. 加载环境变量: ${CYAN}source ${ENV_FILE}${NC}"
echo -e "  3. 开始部署: ${CYAN}${SCRIPT_DIR}/deploy-backend-dev.sh${NC}"
echo ""
