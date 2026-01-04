#!/bin/bash
# 部署前设置 API Base URL 环境变量脚本
# 基于 frontend/services/api/config.ts 的配置逻辑
# 优先级: window.__API_BASE_URL__ > VITE_API_BASE_URL > 默认值('')
# 
# 使用方法:
#   ./set-api-env.sh                    # 交互式设置
#   ./set-api-env.sh production         # 设置为生产环境（相对路径）
#   ./set-api-env.sh production ""      # 明确设置为空字符串（相对路径）
#   ./set-api-env.sh production http://api.example.com  # 设置为绝对路径

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"

# 显示帮助信息
show_help() {
    echo -e "${CYAN}部署前设置 API Base URL 环境变量脚本${NC}"
    echo ""
    echo -e "${YELLOW}用途:${NC}"
    echo "  根据 frontend/services/api/config.ts 的配置逻辑，设置 VITE_API_BASE_URL 环境变量"
    echo ""
    echo -e "${YELLOW}配置优先级:${NC}"
    echo "  1. window.__API_BASE_URL__ (运行时注入，最高优先级)"
    echo "  2. VITE_API_BASE_URL (环境变量，构建时注入)"
    echo "  3. 默认值 '' (相对路径 /api)"
    echo ""
    echo -e "${YELLOW}使用方法:${NC}"
    echo "  $0 [环境] [API_BASE_URL]"
    echo ""
    echo -e "${YELLOW}参数:${NC}"
    echo "  环境          - production | development | staging (默认: production)"
    echo "  API_BASE_URL  - API 基础 URL (默认: 空字符串，使用相对路径)"
    echo ""
    echo -e "${YELLOW}示例:${NC}"
    echo "  $0                                    # 交互式设置"
    echo "  $0 production                         # 设置为生产环境（相对路径）"
    echo "  $0 production \"\"                     # 明确设置为空字符串（相对路径）"
    echo "  $0 production http://api.example.com # 设置为绝对路径"
    echo "  $0 development http://localhost:8081 # 开发环境，直接访问后端"
    echo ""
    echo -e "${YELLOW}推荐配置:${NC}"
    echo "  生产环境: 使用相对路径（空字符串），通过 nginx 代理"
    echo "  开发环境: 使用相对路径（空字符串），通过 Vite 代理"
    echo ""
}

# 验证 API Base URL 格式
validate_api_base_url() {
    local url="$1"
    
    # 空字符串是有效的（表示使用相对路径）
    if [ -z "$url" ]; then
        return 0
    fi
    
    # 检查是否是有效的 URL
    if [[ "$url" =~ ^https?:// ]]; then
        return 0
    fi
    
    echo -e "${RED}错误: API Base URL 格式不正确${NC}"
    echo -e "${YELLOW}提示: 应该是完整的 URL (如 http://api.example.com) 或空字符串（使用相对路径）${NC}"
    return 1
}

# 设置环境变量文件
set_env_file() {
    local env="$1"
    local api_base_url="$2"
    local env_file="${FRONTEND_DIR}/.env.${env}"
    
    echo -e "${BLUE}[设置环境变量]${NC}"
    echo -e "  环境: ${GREEN}${env}${NC}"
    
    if [ -z "$api_base_url" ]; then
        echo -e "  API_BASE_URL: ${GREEN}（空字符串，使用相对路径 /api）${NC}"
    else
        echo -e "  API_BASE_URL: ${GREEN}${api_base_url}${NC}"
    fi
    echo ""
    
    # 检查前端目录
    if [ ! -d "${FRONTEND_DIR}" ]; then
        echo -e "${RED}错误: 前端目录不存在: ${FRONTEND_DIR}${NC}"
        exit 1
    fi
    
    cd "${FRONTEND_DIR}" || exit 1
    
    # 读取现有的环境变量（如果有）
    local gemini_key=""
    local openai_key=""
    local openai_url=""
    local qwen_key=""
    local qwen_url=""
    local doubao_key=""
    local doubao_url=""
    
    # 尝试从项目根目录的 .env 文件读取
    if [ -f "${PROJECT_ROOT}/.env" ]; then
        set -a
        source "${PROJECT_ROOT}/.env" 2>/dev/null || true
        set +a
    fi
    
    # 尝试从现有的环境变量文件读取
    if [ -f "$env_file" ]; then
        set -a
        source "$env_file" 2>/dev/null || true
        set +a
    fi
    
    # 创建环境变量文件
    cat > "$env_file" <<EOF
# 部署环境
VITE_DEPLOY_ENV=${env}

# API 基础URL配置
# 根据 frontend/services/api/config.ts 的配置逻辑：
# - 优先级1: window.__API_BASE_URL__ (运行时注入)
# - 优先级2: VITE_API_BASE_URL (环境变量，构建时注入) ← 这里设置
# - 优先级3: 默认值 '' (相对路径 /api)
#
# 如果设置为空字符串，使用相对路径 /api（通过 nginx/Vite 代理）
# 如果设置为绝对 URL，直接访问该地址（需要后端配置 CORS）
VITE_API_BASE_URL=${api_base_url}

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
    
    chmod 600 "$env_file"
    echo -e "${GREEN}✅ 环境变量文件已创建: ${env_file}${NC}"
    echo ""
    
    # 显示配置摘要
    echo -e "${CYAN}配置摘要:${NC}"
    echo -e "  文件: ${YELLOW}${env_file}${NC}"
    echo -e "  VITE_API_BASE_URL: ${GREEN}${api_base_url:-（空字符串）}${NC}"
    if [ -z "$api_base_url" ]; then
        echo -e "  最终 API_BASE_URL: ${GREEN}/api${NC} (相对路径)"
        echo -e "  说明: ${YELLOW}使用相对路径，通过 nginx/Vite 代理转发${NC}"
    else
        echo -e "  最终 API_BASE_URL: ${GREEN}${api_base_url}/api${NC} (绝对路径)"
        echo -e "  说明: ${YELLOW}直接访问后端，需要后端配置 CORS${NC}"
    fi
    echo ""
}

# 主函数
main() {
    # 显示帮助
    if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
        show_help
        exit 0
    fi
    
    local env="${1:-}"
    local api_base_url="${2:-}"
    
    # 如果没有提供参数，交互式设置
    if [ -z "$env" ]; then
        echo -e "${CYAN}========================================${NC}"
        echo -e "${CYAN}部署前设置 API Base URL 环境变量${NC}"
        echo -e "${CYAN}========================================${NC}"
        echo ""
        
        # 选择环境
        echo -e "${YELLOW}请选择环境:${NC}"
        echo "  1) production (生产环境)"
        echo "  2) development (开发环境)"
        echo "  3) staging (预发布环境)"
        read -p "请选择 [1-3] (默认: 1): " env_choice
        env_choice="${env_choice:-1}"
        
        case $env_choice in
            1) env="production" ;;
            2) env="development" ;;
            3) env="staging" ;;
            *) 
                echo -e "${RED}无效选择，使用默认值: production${NC}"
                env="production"
                ;;
        esac
        echo ""
        
        # 选择 API 访问方式
        echo -e "${YELLOW}请选择 API 访问方式:${NC}"
        echo "  1) 相对路径 /api (推荐，通过 nginx/Vite 代理)"
        echo "  2) 绝对 URL (直接访问后端，需要配置 CORS)"
        read -p "请选择 [1-2] (默认: 1): " api_choice
        api_choice="${api_choice:-1}"
        echo ""
        
        if [ "$api_choice" = "2" ]; then
            read -p "请输入 API Base URL (例如: http://api.example.com): " api_base_url
            api_base_url="${api_base_url%/}"  # 移除末尾斜杠
            
            if ! validate_api_base_url "$api_base_url"; then
                exit 1
            fi
        else
            api_base_url=""
        fi
        echo ""
    else
        # 验证环境参数
        if [[ ! "$env" =~ ^(production|development|staging)$ ]]; then
            echo -e "${RED}错误: 无效的环境参数: ${env}${NC}"
            echo -e "${YELLOW}有效值: production, development, staging${NC}"
            exit 1
        fi
        
        # 验证 API Base URL
        if [ -n "$api_base_url" ] && ! validate_api_base_url "$api_base_url"; then
            exit 1
        fi
    fi
    
    # 设置环境变量文件
    set_env_file "$env" "$api_base_url"
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}设置完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "  1. 检查配置: ${CYAN}cat ${FRONTEND_DIR}/.env.${env}${NC}"
    echo "  2. 构建项目: ${CYAN}cd ${FRONTEND_DIR} && npm run build${NC}"
    echo ""
}

# 执行主函数
main "$@"
