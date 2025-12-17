#!/bin/bash
# 大模型 API Key 配置脚本

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_HOME="/opt/heartsphere"
ENV_FILE="${APP_HOME}/.env"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}大模型 API Key 配置工具${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查环境文件是否存在
if [ ! -f "${ENV_FILE}" ]; then
    echo -e "${RED}环境配置文件不存在: ${ENV_FILE}${NC}"
    echo -e "${YELLOW}请先运行部署脚本${NC}"
    exit 1
fi

# 读取现有配置
source ${ENV_FILE} 2>/dev/null || true

echo -e "\n${YELLOW}当前配置:${NC}"
echo -e "Gemini API Key: ${GEMINI_API_KEY:+已配置（隐藏）}${GEMINI_API_KEY:-未配置}"
echo -e "OpenAI API Key: ${OPENAI_API_KEY:+已配置（隐藏）}${OPENAI_API_KEY:-未配置}"
echo -e "Qwen API Key: ${QWEN_API_KEY:+已配置（隐藏）}${QWEN_API_KEY:-未配置}"
echo -e "Doubao API Key: ${DOUBAO_API_KEY:+已配置（隐藏）}${DOUBAO_API_KEY:-未配置}"

echo -e "\n${YELLOW}请选择要配置的 API Key:${NC}"
echo -e "1) Gemini (Google)"
echo -e "2) OpenAI (ChatGPT)"
echo -e "3) 通义千问 (Qwen)"
echo -e "4) 豆包 (Doubao)"
echo -e "5) 配置所有"
echo -e "6) 查看当前配置"
read -p "请输入选项 (1-6): " choice

configure_gemini() {
    read -p "请输入 Gemini API Key: " api_key
    if [ -n "$api_key" ]; then
        # 使用 sed 更新或添加配置
        if grep -q "^GEMINI_API_KEY=" ${ENV_FILE}; then
            sed -i "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=${api_key}|" ${ENV_FILE}
        else
            echo "GEMINI_API_KEY=${api_key}" >> ${ENV_FILE}
        fi
        echo -e "${GREEN}Gemini API Key 已配置${NC}"
    fi
}

configure_openai() {
    read -p "请输入 OpenAI API Key: " api_key
    if [ -n "$api_key" ]; then
        if grep -q "^OPENAI_API_KEY=" ${ENV_FILE}; then
            sed -i "s|^OPENAI_API_KEY=.*|OPENAI_API_KEY=${api_key}|" ${ENV_FILE}
        else
            echo "OPENAI_API_KEY=${api_key}" >> ${ENV_FILE}
        fi
        echo -e "${GREEN}OpenAI API Key 已配置${NC}"
    fi
    
    read -p "请输入 OpenAI Base URL (默认: https://api.openai.com/v1): " base_url
    if [ -n "$base_url" ]; then
        if grep -q "^OPENAI_BASE_URL=" ${ENV_FILE}; then
            sed -i "s|^OPENAI_BASE_URL=.*|OPENAI_BASE_URL=${base_url}|" ${ENV_FILE}
        else
            echo "OPENAI_BASE_URL=${base_url}" >> ${ENV_FILE}
        fi
    fi
}

configure_qwen() {
    read -p "请输入 Qwen (DashScope) API Key: " api_key
    if [ -n "$api_key" ]; then
        if grep -q "^QWEN_API_KEY=" ${ENV_FILE}; then
            sed -i "s|^QWEN_API_KEY=.*|QWEN_API_KEY=${api_key}|" ${ENV_FILE}
        else
            echo "QWEN_API_KEY=${api_key}" >> ${ENV_FILE}
        fi
        echo -e "${GREEN}Qwen API Key 已配置${NC}"
    fi
}

configure_doubao() {
    read -p "请输入 Doubao API Key: " api_key
    if [ -n "$api_key" ]; then
        if grep -q "^DOUBAO_API_KEY=" ${ENV_FILE}; then
            sed -i "s|^DOUBAO_API_KEY=.*|DOUBAO_API_KEY=${api_key}|" ${ENV_FILE}
        else
            echo "DOUBAO_API_KEY=${api_key}" >> ${ENV_FILE}
        fi
        echo -e "${GREEN}Doubao API Key 已配置${NC}"
    fi
    
    read -p "请输入 Doubao Base URL (默认: https://ark.cn-beijing.volces.com/api/v3): " base_url
    if [ -n "$base_url" ]; then
        if grep -q "^DOUBAO_BASE_URL=" ${ENV_FILE}; then
            sed -i "s|^DOUBAO_BASE_URL=.*|DOUBAO_BASE_URL=${base_url}|" ${ENV_FILE}
        else
            echo "DOUBAO_BASE_URL=${base_url}" >> ${ENV_FILE}
        fi
    fi
}

show_config() {
    echo -e "\n${BLUE}当前配置:${NC}"
    echo -e "${YELLOW}Gemini:${NC}"
    echo -e "  API Key: ${GEMINI_API_KEY:+已配置（${#GEMINI_API_KEY} 字符）}${GEMINI_API_KEY:-未配置}"
    echo -e "  Model: ${GEMINI_MODEL_NAME:-gemini-2.5-flash}"
    echo -e "${YELLOW}OpenAI:${NC}"
    echo -e "  API Key: ${OPENAI_API_KEY:+已配置（${#OPENAI_API_KEY} 字符）}${OPENAI_API_KEY:-未配置}"
    echo -e "  Base URL: ${OPENAI_BASE_URL:-https://api.openai.com/v1}"
    echo -e "  Model: ${OPENAI_MODEL_NAME:-gpt-4o}"
    echo -e "${YELLOW}Qwen:${NC}"
    echo -e "  API Key: ${QWEN_API_KEY:+已配置（${#QWEN_API_KEY} 字符）}${QWEN_API_KEY:-未配置}"
    echo -e "  Model: ${QWEN_MODEL_NAME:-qwen-max}"
    echo -e "${YELLOW}Doubao:${NC}"
    echo -e "  API Key: ${DOUBAO_API_KEY:+已配置（${#DOUBAO_API_KEY} 字符）}${DOUBAO_API_KEY:-未配置}"
    echo -e "  Base URL: ${DOUBAO_BASE_URL:-https://ark.cn-beijing.volces.com/api/v3}"
    echo -e "  Model: ${DOUBAO_MODEL_NAME:-ep-2024...}"
    echo -e "\n${YELLOW}路由策略:${NC}"
    echo -e "  文本生成: ${TEXT_PROVIDER:-gemini}"
    echo -e "  图片生成: ${IMAGE_PROVIDER:-gemini}"
    echo -e "  视频生成: ${VIDEO_PROVIDER:-gemini}"
    echo -e "  音频生成: ${AUDIO_PROVIDER:-gemini}"
    echo -e "  自动降级: ${ENABLE_FALLBACK:-true}"
}

case $choice in
    1)
        configure_gemini
        ;;
    2)
        configure_openai
        ;;
    3)
        configure_qwen
        ;;
    4)
        configure_doubao
        ;;
    5)
        configure_gemini
        configure_openai
        configure_qwen
        configure_doubao
        ;;
    6)
        show_config
        exit 0
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac

# 询问是否重新构建前端
if [ "$choice" != "6" ]; then
    echo -e "\n${YELLOW}是否重新构建前端以应用新的 API Key 配置？(y/n)${NC}"
    read -p "> " rebuild
    if [ "$rebuild" = "y" ] || [ "$rebuild" = "Y" ]; then
        echo -e "${YELLOW}重新构建前端...${NC}"
        cd /root/heartsphere_new/frontend 2>/dev/null || cd $(dirname "$0")/frontend
        if [ -f ".env.production" ]; then
            rm .env.production
        fi
        bash $(dirname "$0")/deploy-frontend.sh
    fi
fi

echo -e "\n${GREEN}配置完成！${NC}"
echo -e "${YELLOW}提示: 如果修改了 API Key，需要重新构建前端才能生效${NC}"
echo -e "${YELLOW}运行: ./update.sh 选择更新前端${NC}"





