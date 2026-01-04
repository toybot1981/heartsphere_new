#!/bin/bash
# 使用 SCP 部署前端到远程服务器
# 使用方法: ./deploy-frontend-scp.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
DIST_DIR="${FRONTEND_DIR}/dist"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SCP 部署前端到远程服务器${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 加载配置（如果存在）
CONFIG_FILE="${SCRIPT_DIR}/.deploy-config"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# 交互式输入函数
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

# ==================== 配置信息 ====================
echo -e "${BLUE}========== 配置远程服务器 ==========${NC}"

# 1. 服务器地址
read_input "请输入远程服务器地址（IP或域名）" "${REMOTE_HOST:-heartsphere.cn}" REMOTE_HOST

# 2. SSH 端口
read_input "请输入SSH端口" "${REMOTE_PORT:-22}" REMOTE_PORT

# 3. 用户名
read_input "请输入SSH用户名" "${REMOTE_USER:-root}" REMOTE_USER

# 4. 远程部署路径
read_input "请输入远程部署路径" "${REMOTE_PATH:-/opt/heartsphere/frontend}" REMOTE_PATH

# 5. SSH密钥路径（可选）
read_input "请输入SSH私钥路径（留空使用默认）" "${SSH_KEY:-}" SSH_KEY

# 6. 是否保存配置
echo ""
read -p "是否保存配置以便下次使用? [y/N]: " save_config
if [[ "$save_config" =~ ^[Yy]$ ]]; then
    cat > "$CONFIG_FILE" <<EOF
# 远程服务器部署配置
REMOTE_HOST="${REMOTE_HOST}"
REMOTE_PORT="${REMOTE_PORT}"
REMOTE_USER="${REMOTE_USER}"
REMOTE_PATH="${REMOTE_PATH}"
SSH_KEY="${SSH_KEY}"
EOF
    chmod 600 "$CONFIG_FILE"
    echo -e "${GREEN}配置已保存到 ${CONFIG_FILE}${NC}"
fi

# 7. 确认配置
echo ""
echo -e "${BLUE}========== 配置确认 ==========${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_HOST}${NC}"
echo -e "SSH端口: ${GREEN}${REMOTE_PORT}${NC}"
echo -e "用户名: ${GREEN}${REMOTE_USER}${NC}"
echo -e "远程路径: ${GREEN}${REMOTE_PATH}${NC}"
if [ -n "$SSH_KEY" ]; then
    echo -e "SSH密钥: ${GREEN}${SSH_KEY}${NC}"
fi
echo ""
read -p "确认配置是否正确? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 0
fi

# ==================== 开始部署 ====================
echo ""
echo -e "${GREEN}开始部署流程...${NC}"

# 1. 检查前端目录
echo -e "${YELLOW}[1/5] 检查前端目录...${NC}"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}错误: 前端目录不存在: ${FRONTEND_DIR}${NC}"
    exit 1
fi
cd "$FRONTEND_DIR" || {
    echo -e "${RED}错误: 无法进入前端目录${NC}"
    exit 1
}

# 2. 检查是否需要构建
echo -e "${YELLOW}[2/5] 检查是否需要构建...${NC}"
if [ ! -d "$DIST_DIR" ] || [ -z "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
    echo -e "${YELLOW}dist 目录不存在或为空，需要构建...${NC}"
    BUILD_NEEDED=true
else
    read -p "dist 目录已存在，是否重新构建? [y/N]: " rebuild
    if [[ "$rebuild" =~ ^[Yy]$ ]]; then
        BUILD_NEEDED=true
    else
        BUILD_NEEDED=false
    fi
fi

# 3. 设置 API Base URL 环境变量（如果需要构建）
if [ "$BUILD_NEEDED" = true ]; then
    echo -e "${YELLOW}[3/6] 设置 API Base URL 环境变量...${NC}"
    
    # 检查是否已有 .env.production 文件
    if [ -f ".env.production" ]; then
        echo -e "${YELLOW}检测到已有 .env.production 文件${NC}"
        read -p "是否重新设置 API Base URL? [y/N]: " reset_api_url
        if [[ ! "$reset_api_url" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}使用现有配置${NC}"
        else
            API_ENV_SETUP=true
        fi
    else
        API_ENV_SETUP=true
    fi
    
    # 设置 API Base URL
    if [ "$API_ENV_SETUP" = true ]; then
        echo ""
        echo -e "${BLUE}========== API Base URL 配置 ==========${NC}"
        echo -e "${YELLOW}请选择部署环境:${NC}"
        echo "  1) production (生产环境，推荐使用相对路径)"
        echo "  2) development (开发环境)"
        echo "  3) staging (预发布环境)"
        read -p "请选择 [1-3] (默认: 1): " env_choice
        env_choice="${env_choice:-1}"
        
        case $env_choice in
            1) DEPLOY_ENV="production" ;;
            2) DEPLOY_ENV="development" ;;
            3) DEPLOY_ENV="staging" ;;
            *)
                echo -e "${RED}无效选择，使用默认值: production${NC}"
                DEPLOY_ENV="production"
                ;;
        esac
        
        echo ""
        echo -e "${YELLOW}请选择 API 访问方式:${NC}"
        echo "  1) 相对路径 /api (推荐，通过 nginx/Vite 代理)"
        echo "  2) 绝对 URL (直接访问后端，需要配置 CORS)"
        echo "  3) 快速设置: http://heartsphere.cn:8080 (生产环境直接访问后端)"
        read -p "请选择 [1-3] (默认: 1): " api_choice
        api_choice="${api_choice:-1}"
        
        if [ "$api_choice" = "3" ]; then
            # 快速设置生产地址
            API_BASE_URL="http://heartsphere.cn:8080"
            echo -e "${GREEN}将设置 API_BASE_URL=${API_BASE_URL}${NC}"
            echo -e "${YELLOW}注意: 使用绝对 URL 直接访问后端，需要确保后端配置了 CORS${NC}"
        elif [ "$api_choice" = "2" ]; then
            read -p "请输入 API Base URL (例如: http://api.example.com): " API_BASE_URL
            API_BASE_URL="${API_BASE_URL%/}"  # 移除末尾斜杠
            
            if [ -z "$API_BASE_URL" ]; then
                echo -e "${RED}错误: API Base URL 不能为空${NC}"
                exit 1
            fi
            
            # 验证 URL 格式
            if [[ ! "$API_BASE_URL" =~ ^https?:// ]]; then
                echo -e "${RED}错误: API Base URL 格式不正确，应该是完整的 URL (如 http://api.example.com)${NC}"
                exit 1
            fi
            
            echo -e "${GREEN}将设置 API_BASE_URL=${API_BASE_URL}${NC}"
        else
            API_BASE_URL=""
            echo -e "${GREEN}将使用相对路径（通过 nginx/Vite 代理）${NC}"
        fi
        echo ""
        
        # 调用 set-api-env.sh 脚本设置环境变量
        SET_ENV_SCRIPT="${SCRIPT_DIR}/set-api-env.sh"
        if [ -f "$SET_ENV_SCRIPT" ] && [ -x "$SET_ENV_SCRIPT" ]; then
            echo -e "${YELLOW}使用 set-api-env.sh 脚本设置环境变量...${NC}"
            "$SET_ENV_SCRIPT" "$DEPLOY_ENV" "$API_BASE_URL"
        else
            # 如果脚本不存在，直接创建 .env.production 文件
            echo -e "${YELLOW}直接创建 .env.${DEPLOY_ENV} 文件...${NC}"
            
            # 读取现有的环境变量（如果有）
            # 环境变量将从 PROJECT_ROOT/.env 读取（如果有）
            
            if [ -f "${PROJECT_ROOT}/.env" ]; then
                set -a
                source "${PROJECT_ROOT}/.env" 2>/dev/null || true
                set +a
            fi
            
            cat > ".env.${DEPLOY_ENV}" <<EOF
# 部署环境
VITE_DEPLOY_ENV=${DEPLOY_ENV}

# API 基础URL配置
# 如果设置为空字符串，使用相对路径 /api（通过 nginx/Vite 代理）
# 如果设置为绝对 URL，直接访问该地址（需要后端配置 CORS）
VITE_API_BASE_URL=${API_BASE_URL}

# 大模型 API Key 配置（从主环境变量文件读取）
VITE_GEMINI_API_KEY=${GEMINI_API_KEY:-}
VITE_OPENAI_API_KEY=${OPENAI_API_KEY:-}
VITE_OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://api.openai.com/v1}
VITE_QWEN_API_KEY=${QWEN_API_KEY:-}
VITE_QWEN_BASE_URL=${QWEN_BASE_URL:-https://dashscope.aliyuncs.com/compatible-mode/v1}
VITE_DOUBAO_API_KEY=${DOUBAO_API_KEY:-}
VITE_DOUBAO_BASE_URL=${DOUBAO_BASE_URL:-https://ark.cn-beijing.volces.com/api/v3}

# 模型名称配置
VITE_GEMINI_MODEL_NAME=${GEMINI_MODEL_NAME:-gemini-2.5-flash}
VITE_GEMINI_IMAGE_MODEL=${GEMINI_IMAGE_MODEL:-gemini-2.5-flash-image}
VITE_GEMINI_VIDEO_MODEL=${GEMINI_VIDEO_MODEL:-veo-3.1-fast-generate-preview}
VITE_OPENAI_MODEL_NAME=${VITE_OPENAI_MODEL_NAME:-gpt-4o}
VITE_OPENAI_IMAGE_MODEL=${VITE_OPENAI_IMAGE_MODEL:-dall-e-3}
VITE_QWEN_MODEL_NAME=${VITE_QWEN_MODEL_NAME:-qwen-max}
VITE_QWEN_IMAGE_MODEL=${VITE_QWEN_IMAGE_MODEL:-qwen-image-plus}
VITE_QWEN_VIDEO_MODEL=${VITE_QWEN_VIDEO_MODEL:-wanx-video}
VITE_DOUBAO_MODEL_NAME=${VITE_DOUBAO_MODEL_NAME:-ep-2024...}
VITE_DOUBAO_IMAGE_MODEL=${VITE_DOUBAO_IMAGE_MODEL:-doubao-image-v1}
VITE_DOUBAO_VIDEO_MODEL=${VITE_DOUBAO_VIDEO_MODEL:-doubao-video-v1}

# 路由策略配置
VITE_TEXT_PROVIDER=${TEXT_PROVIDER:-gemini}
VITE_IMAGE_PROVIDER=${IMAGE_PROVIDER:-gemini}
VITE_VIDEO_PROVIDER=${VIDEO_PROVIDER:-gemini}
VITE_AUDIO_PROVIDER=${AUDIO_PROVIDER:-gemini}
VITE_ENABLE_FALLBACK=${ENABLE_FALLBACK:-true}
EOF
            chmod 600 ".env.${DEPLOY_ENV}"
            echo -e "${GREEN}环境变量文件已创建: .env.${DEPLOY_ENV}${NC}"
        fi
        echo ""
    fi
fi

# 4. 构建前端项目
if [ "$BUILD_NEEDED" = true ]; then
    echo -e "${YELLOW}[4/6] 构建前端项目...${NC}"
    
    # 检查 node_modules
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}安装前端依赖...${NC}"
        npm install
    fi
    
    # 构建
    echo -e "${YELLOW}开始构建...${NC}"
    npm run build
    
    if [ ! -d "dist" ]; then
        echo -e "${RED}构建失败，未找到 dist 目录！${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}构建完成${NC}"
else
    echo -e "${YELLOW}[4/6] 跳过构建，使用现有 dist 目录${NC}"
fi

# 5. 准备 SCP 命令
echo -e "${YELLOW}[5/6] 准备上传文件...${NC}"

# 构建 SSH 选项
SSH_OPTS="-p ${REMOTE_PORT}"
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="${SSH_OPTS} -i ${SSH_KEY}"
fi

# 测试 SSH 连接
echo -e "${YELLOW}测试 SSH 连接...${NC}"
if ssh $SSH_OPTS -o ConnectTimeout=5 -o BatchMode=yes "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${GREEN}SSH连接成功${NC}"
elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}使用密钥认证，可能需要输入密钥密码...${NC}"
else
    echo -e "${YELLOW}需要输入SSH密码...${NC}"
fi

# 6. 上传文件
echo -e "${YELLOW}[6/6] 上传文件到远程服务器...${NC}"

# 创建远程目录（如果不存在）
echo -e "${YELLOW}创建远程目录...${NC}"
ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}" || {
    echo -e "${RED}无法创建远程目录${NC}"
    exit 1
}

# 备份现有文件（如果存在）
echo -e "${YELLOW}备份现有文件...${NC}"
BACKUP_DIR="${REMOTE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "
    if [ -d '${REMOTE_PATH}' ] && [ -n \"\$(ls -A '${REMOTE_PATH}' 2>/dev/null)\" ]; then
        echo '备份现有文件到 ${BACKUP_DIR}'
        mkdir -p '${BACKUP_DIR}'
        cp -r '${REMOTE_PATH}'/* '${BACKUP_DIR}'/ 2>/dev/null || true
    fi
"

# 上传 dist 目录内容
echo -e "${YELLOW}上传文件...${NC}"
echo -e "${BLUE}这可能需要一些时间，请稍候...${NC}"

# 使用 rsync（如果可用）进行更高效的上传，否则使用 scp
USE_SCP=false
if command -v rsync &> /dev/null; then
    # 先测试远程服务器是否有 rsync
    echo -e "${YELLOW}检查远程服务器 rsync 支持...${NC}"
    if ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "command -v rsync >/dev/null 2>&1" 2>/dev/null; then
        echo -e "${YELLOW}使用 rsync 上传（更高效）...${NC}"
        
        # 构建 SSH 命令
        if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
            SSH_CMD="ssh -p ${REMOTE_PORT} -i ${SSH_KEY} -o StrictHostKeyChecking=no"
        else
            SSH_CMD="ssh -p ${REMOTE_PORT} -o StrictHostKeyChecking=no"
        fi
        
        # 使用 rsync 上传
        rsync -avz --delete --progress \
            -e "${SSH_CMD}" \
            "${DIST_DIR}/" \
            "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" 2>&1
        
        RSYNC_EXIT_CODE=$?
        if [ $RSYNC_EXIT_CODE -ne 0 ]; then
            echo -e "${RED}rsync 上传失败 (退出码: ${RSYNC_EXIT_CODE})${NC}"
            echo -e "${YELLOW}是否改用 scp 上传? [y/N]: ${NC}"
            read use_scp_fallback
            if [[ "$use_scp_fallback" =~ ^[Yy]$ ]]; then
                USE_SCP=true
            else
                echo -e "${RED}上传已取消${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}远程服务器未安装 rsync，使用 scp 上传...${NC}"
        USE_SCP=true
    fi
else
    echo -e "${YELLOW}本地未安装 rsync，使用 scp 上传...${NC}"
    USE_SCP=true
fi

# 使用 scp 上传
if [ "$USE_SCP" = true ]; then
    echo -e "${YELLOW}使用 scp 上传...${NC}"
    # 先删除远程目录内容（可选）
    read -p "是否清空远程目录后再上传? [y/N]: " clear_remote
    if [[ "$clear_remote" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}清空远程目录...${NC}"
        ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "rm -rf ${REMOTE_PATH}/* ${REMOTE_PATH}/.* 2>/dev/null || true"
    fi
    
    # 创建远程目录（确保存在）
    echo -e "${YELLOW}确保远程目录存在...${NC}"
    ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"
    
    # 上传文件（使用 tar 压缩传输，提高效率）
    echo -e "${YELLOW}打包并上传文件...${NC}"
    cd "$(dirname "$DIST_DIR")" || exit 1
    tar czf - -C "$(basename "$DIST_DIR")" . | ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "
        mkdir -p ${REMOTE_PATH}
        cd ${REMOTE_PATH}
        tar xzf -
    " || {
        echo -e "${RED}上传失败${NC}"
        echo -e "${YELLOW}尝试使用直接 scp 方式...${NC}"
        # 如果 tar 方式失败，尝试直接 scp
        scp $SSH_OPTS -r "${DIST_DIR}"/* "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || {
            echo -e "${RED}scp 上传也失败${NC}"
            exit 1
        }
    }
fi

# 6. 设置权限
echo -e "${YELLOW}设置文件权限...${NC}"
ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "
    chown -R ${REMOTE_USER}:${REMOTE_USER} '${REMOTE_PATH}' 2>/dev/null || true
    find '${REMOTE_PATH}' -type f -exec chmod 644 {} \;
    find '${REMOTE_PATH}' -type d -exec chmod 755 {} \;
"

# 7. 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "远程路径: ${GREEN}${REMOTE_PATH}${NC}"
echo -e "备份位置: ${GREEN}${BACKUP_DIR}${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  1. 如果使用 Nginx，可能需要重新加载配置: ${BLUE}sudo systemctl reload nginx${NC}"
echo -e "  2. 检查部署结果: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} 'ls -la ${REMOTE_PATH}'${NC}"
echo ""
