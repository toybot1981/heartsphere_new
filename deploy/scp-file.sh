#!/bin/bash
# 灵活的SCP文件上传脚本
# 支持上传单个文件到远程服务器
# 使用方法: ./scp-file.sh [本地文件] [远程路径]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}SCP文件上传脚本 - HeartSphere${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 加载配置（如果存在）
CONFIG_FILE="${SCRIPT_DIR}/.deploy-backend-config"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    echo -e "${GREEN}已加载保存的配置${NC}"
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

# 1. 获取本地文件路径（支持命令行参数或交互式输入）
if [ -n "$1" ]; then
    LOCAL_FILE="$1"
else
    read_input "请输入本地文件路径" "" LOCAL_FILE
fi

# 验证本地文件是否存在
if [ ! -f "$LOCAL_FILE" ]; then
    echo -e "${RED}错误: 本地文件不存在: ${LOCAL_FILE}${NC}"
    exit 1
fi

LOCAL_FILE=$(realpath "$LOCAL_FILE")
LOCAL_FILE_NAME=$(basename "$LOCAL_FILE")
echo -e "${GREEN}本地文件: ${LOCAL_FILE}${NC}"
echo -e "${GREEN}文件名: ${LOCAL_FILE_NAME}${NC}"

# 2. 获取远程路径（支持命令行参数或交互式输入）
if [ -n "$2" ]; then
    REMOTE_PATH="$2"
else
    read_input "请输入远程路径" "${REMOTE_PATH:-/opt/heartsphere/deploy}" REMOTE_PATH
fi

# 移除尾部斜杠
REMOTE_PATH="${REMOTE_PATH%/}"

# 3. 配置远程服务器
echo ""
echo -e "${BLUE}========== 配置远程服务器 ==========${NC}"

read_input "远程服务器地址（IP或域名）" "${REMOTE_HOST:-heartsphere.cn}" REMOTE_HOST
read_input "SSH端口" "${REMOTE_PORT:-22}" REMOTE_PORT
read_input "SSH用户名" "${REMOTE_USER:-root}" REMOTE_USER
read_input "SSH私钥路径（留空使用默认）" "${SSH_KEY:-}" SSH_KEY

# 4. 确认配置
echo ""
echo -e "${BLUE}========== 上传配置确认 ==========${NC}"
echo -e "本地文件: ${GREEN}${LOCAL_FILE}${NC}"
echo -e "文件大小: ${GREEN}$(du -h "$LOCAL_FILE" | cut -f1)${NC}"
echo -e "远程路径: ${GREEN}${REMOTE_PATH}/${LOCAL_FILE_NAME}${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}${NC}"
if [ -n "$SSH_KEY" ]; then
    echo -e "SSH密钥: ${GREEN}${SSH_KEY}${NC}"
fi
echo ""
read -p "确认上传? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}上传已取消${NC}"
    exit 0
fi

# 5. 构建SSH/SCP选项
SSH_OPTS="-p ${REMOTE_PORT}"
SCP_OPTS="-P ${REMOTE_PORT}"
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="${SSH_OPTS} -i ${SSH_KEY}"
    SCP_OPTS="${SCP_OPTS} -i ${SSH_KEY}"
fi

# 6. 测试SSH连接
echo ""
echo -e "${YELLOW}[1/3] 测试SSH连接...${NC}"
if ssh $SSH_OPTS -o ConnectTimeout=5 -o BatchMode=yes "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${GREEN}SSH连接成功${NC}"
elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}使用密钥认证，可能需要输入密钥密码...${NC}"
else
    echo -e "${YELLOW}需要输入SSH密码...${NC}"
fi

# 7. 创建远程目录
echo ""
echo -e "${YELLOW}[2/3] 创建远程目录...${NC}"
ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}" || {
    echo -e "${RED}无法创建远程目录${NC}"
    exit 1
}
echo -e "${GREEN}远程目录已创建: ${REMOTE_PATH}${NC}"

# 8. 上传文件
echo ""
echo -e "${YELLOW}[3/3] 上传文件...${NC}"
echo -e "${BLUE}上传: ${LOCAL_FILE_NAME} → ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/${NC}"
echo -e "${BLUE}这可能需要一些时间，请稍候...${NC}"

# 使用 scp 上传
scp ${SCP_OPTS} "${LOCAL_FILE}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || {
    echo -e "${RED}上传失败${NC}"
    exit 1
}

echo -e "${GREEN}✓ 文件上传成功${NC}"

# 9. 验证上传（可选）
echo ""
read -p "是否验证远程文件? [y/N]: " verify
if [[ "$verify" =~ ^[Yy]$ ]]; then
    REMOTE_FILE_SIZE=$(ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "stat -f%z ${REMOTE_PATH}/${LOCAL_FILE_NAME} 2>/dev/null || stat -c%s ${REMOTE_PATH}/${LOCAL_FILE_NAME} 2>/dev/null || echo '0'")
    LOCAL_FILE_SIZE=$(stat -f%z "${LOCAL_FILE}" 2>/dev/null || stat -c%s "${LOCAL_FILE}" 2>/dev/null || echo '0')
    
    if [ "$REMOTE_FILE_SIZE" = "$LOCAL_FILE_SIZE" ] && [ "$REMOTE_FILE_SIZE" != "0" ]; then
        echo -e "${GREEN}✓ 文件大小验证通过 (${REMOTE_FILE_SIZE} 字节)${NC}"
    else
        echo -e "${YELLOW}⚠ 文件大小不匹配或无法验证${NC}"
        echo -e "   本地: ${LOCAL_FILE_SIZE} 字节"
        echo -e "   远程: ${REMOTE_FILE_SIZE} 字节"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}上传完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}========== 文件信息 ==========${NC}"
echo -e "远程文件路径: ${GREEN}${REMOTE_PATH}/${LOCAL_FILE_NAME}${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_USER}@${REMOTE_HOST}${NC}"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo -e "  查看文件: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} 'ls -lh ${REMOTE_PATH}/${LOCAL_FILE_NAME}'${NC}"
echo -e "  删除文件: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} 'rm ${REMOTE_PATH}/${LOCAL_FILE_NAME}'${NC}"
echo -e "  SSH登录: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST}${NC}"
