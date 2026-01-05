#!/bin/bash
# SCP文件上传脚本 - 支持多种上传模式
# 支持：1. 指定单个文件  2. 从列表中选择  3. 批量上传所有prod文件
# 使用方法: ./scp-prod-file.sh [文件路径] [远程路径]

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

# 1. 确定要上传的文件
PROD_FILES=()

# 如果提供了命令行参数，使用指定的文件
if [ -n "$1" ] && [ -f "$1" ]; then
    # 方式1：指定单个文件
    FILE_PATH=$(realpath "$1")
    PROD_FILES=("$FILE_PATH")
    echo -e "${GREEN}使用指定的文件: $(basename "$FILE_PATH")${NC}"
elif [ -n "$1" ]; then
    echo -e "${RED}错误: 指定的文件不存在: $1${NC}"
    exit 1
else
    # 方式2：查找所有包含"prod"的文件
    echo -e "${BLUE}========== 查找PROD文件 ==========${NC}"
    echo -e "${YELLOW}正在扫描 ${SCRIPT_DIR} 目录...${NC}"
    
    # 查找所有包含"prod"的文件（不区分大小写）
    TEMP_FILES=()
    while IFS= read -r -d '' file; do
        TEMP_FILES+=("$file")
    done < <(find "$SCRIPT_DIR" -maxdepth 1 -type f -iname "*prod*" -print0 2>/dev/null)
    
    if [ ${#TEMP_FILES[@]} -eq 0 ]; then
        echo -e "${RED}错误: 未找到包含'prod'的文件${NC}"
        exit 1
    fi
    
    # 显示找到的文件列表
    echo -e "${GREEN}找到 ${#TEMP_FILES[@]} 个文件:${NC}"
    for i in "${!TEMP_FILES[@]}"; do
        file="${TEMP_FILES[$i]}"
        file_name=$(basename "$file")
        file_size=$(du -h "$file" | cut -f1)
        echo -e "  $((i+1)). ${CYAN}${file_name}${NC} (${file_size})"
    done
    
    echo ""
    echo -e "${YELLOW}请选择上传方式:${NC}"
    echo -e "  1) 上传所有文件（默认）"
    echo -e "  2) 选择单个文件"
    echo -ne "${YELLOW}请选择 [1-2] (默认: 1): ${NC}"
    read upload_mode
    upload_mode="${upload_mode:-1}"
    
    if [ "$upload_mode" = "2" ]; then
        # 方式3：从列表中选择单个文件
        echo ""
        echo -ne "${YELLOW}请输入文件编号 [1-${#TEMP_FILES[@]}]: ${NC}"
        read file_num
        
        if ! [[ "$file_num" =~ ^[0-9]+$ ]] || [ "$file_num" -lt 1 ] || [ "$file_num" -gt ${#TEMP_FILES[@]} ]; then
            echo -e "${RED}错误: 无效的文件编号${NC}"
            exit 1
        fi
        
        SELECTED_FILE="${TEMP_FILES[$((file_num-1))]}"
        PROD_FILES=("$SELECTED_FILE")
        echo -e "${GREEN}已选择: $(basename "$SELECTED_FILE")${NC}"
    else
        # 上传所有文件
        PROD_FILES=("${TEMP_FILES[@]}")
        echo -e "${GREEN}将上传所有 ${#PROD_FILES[@]} 个文件${NC}"
    fi
fi

# 2. 获取远程路径（默认 /opt/heartsphere/deploy）
echo ""
if [ -n "$2" ]; then
    REMOTE_PATH="$2"
else
    # 默认路径固定为 /opt/heartsphere/deploy
    REMOTE_PATH="/opt/heartsphere/deploy"
fi

# 移除尾部斜杠
REMOTE_PATH="${REMOTE_PATH%/}"
echo -e "${GREEN}远程路径: ${REMOTE_PATH}${NC}"

# 3. 配置远程服务器
echo ""
echo -e "${BLUE}========== 配置远程服务器 ==========${NC}"

read_input "远程服务器地址（IP或域名）" "${REMOTE_HOST:-heartsphere.cn}" REMOTE_HOST
read_input "SSH端口" "${REMOTE_PORT:-22}" REMOTE_PORT
read_input "SSH用户名" "${REMOTE_USER:-root}" REMOTE_USER

# SSH密钥配置（优先使用密钥，避免重复输入密码）
echo ""
echo -e "${YELLOW}SSH认证方式:${NC}"
if [ -f "${HOME}/.ssh/id_rsa" ] || [ -f "${HOME}/.ssh/id_ed25519" ]; then
    DEFAULT_SSH_KEY="${HOME}/.ssh/id_rsa"
    if [ ! -f "$DEFAULT_SSH_KEY" ]; then
        DEFAULT_SSH_KEY="${HOME}/.ssh/id_ed25519"
    fi
    echo -e "${GREEN}检测到默认SSH密钥: ${DEFAULT_SSH_KEY}${NC}"
    read_input "SSH私钥路径（直接回车使用默认密钥，留空使用密码认证）" "${SSH_KEY:-${DEFAULT_SSH_KEY}}" SSH_KEY
else
    read_input "SSH私钥路径（留空使用密码认证，建议配置SSH密钥）" "${SSH_KEY:-}" SSH_KEY
fi

# 如果没有提供密钥，检查sshpass并提示
if [ -z "$SSH_KEY" ]; then
    echo ""
    echo -e "${YELLOW}使用密码认证${NC}"
    # 检查是否安装了 sshpass
    if ! command -v sshpass &> /dev/null; then
        echo -e "${YELLOW}未检测到 sshpass 工具，无法自动传递密码${NC}"
        echo -e "${YELLOW}安装方法:${NC}"
        echo -e "${BLUE}  macOS: brew install hudochenkov/sshpass/sshpass${NC}"
        echo -e "${BLUE}  Linux: sudo apt-get install sshpass 或 sudo yum install sshpass${NC}"
        echo ""
        echo -e "${YELLOW}如果不安装 sshpass，将需要在每次操作时手动输入密码${NC}"
        echo -ne "${YELLOW}是否继续？[y/N]: ${NC}"
        read continue_choice
        if [[ ! "$continue_choice" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}已取消${NC}"
            exit 0
        fi
    fi
    echo ""
fi

# 4. 确认配置
echo ""
echo -e "${BLUE}========== 上传配置确认 ==========${NC}"
echo -e "本地目录: ${GREEN}${SCRIPT_DIR}${NC}"
echo -e "文件数量: ${GREEN}${#PROD_FILES[@]}${NC}"
echo -e "远程路径: ${GREEN}${REMOTE_PATH}${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}${NC}"
if [ -n "$SSH_KEY" ]; then
    echo -e "SSH密钥: ${GREEN}${SSH_KEY}${NC}"
fi
echo ""
echo -e "${YELLOW}将要上传的文件:${NC}"
for file in "${PROD_FILES[@]}"; do
    file_name=$(basename "$file")
    echo -e "  • ${CYAN}${file_name}${NC}"
done
echo ""
read -p "确认上传? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}上传已取消${NC}"
    exit 0
fi

# 5. 构建SSH/SCP选项和密码处理
SSH_OPTS="-p ${REMOTE_PORT}"
SCP_OPTS="-P ${REMOTE_PORT}"
SSH_PASSWORD=""
USE_PASSWORD_AUTH=false

if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    SSH_OPTS="${SSH_OPTS} -i ${SSH_KEY}"
    SCP_OPTS="${SCP_OPTS} -i ${SSH_KEY}"
else
    USE_PASSWORD_AUTH=true
fi

# 如果使用密码认证，获取密码（只输入一次）
if [ "$USE_PASSWORD_AUTH" = true ]; then
    if command -v sshpass &> /dev/null; then
        # 获取密码（只输入一次）
        echo -ne "${YELLOW}请输入SSH密码: ${NC}"
        read -s SSH_PASSWORD
        echo ""
        echo -e "${GREEN}密码已保存（仅在本次脚本运行期间有效）${NC}"
    fi
fi

# 6. 测试SSH连接
echo ""
echo -e "${YELLOW}[1/4] 测试SSH连接...${NC}"

# 如果使用密钥，设置正确的权限
if [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    # 确保密钥文件权限正确
    chmod 600 "$SSH_KEY" 2>/dev/null || true
    
    # 检查密钥是否已添加到ssh-agent
    if command -v ssh-add &> /dev/null; then
        # 尝试添加密钥到ssh-agent（如果尚未添加）
        ssh-add -l 2>/dev/null | grep -q "$SSH_KEY" || ssh-add "$SSH_KEY" 2>/dev/null || true
    fi
fi

# 测试连接
if ssh $SSH_OPTS -o ConnectTimeout=5 -o BatchMode=yes "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${GREEN}SSH连接成功（使用密钥认证）${NC}"
elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}使用密钥认证，可能需要输入密钥密码（仅需输入一次）...${NC}"
    # 测试连接，让用户输入密钥密码（如果设置了）
    ssh $SSH_OPTS -o ConnectTimeout=10 "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" || {
        echo -e "${RED}SSH连接失败，请检查密钥和服务器配置${NC}"
        exit 1
    }
    echo -e "${GREEN}SSH连接成功${NC}"
else
    # 使用密码认证
    if command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
        echo -e "${YELLOW}使用密码认证（使用已保存的密码）...${NC}"
        if sshpass -p "$SSH_PASSWORD" ssh $SSH_OPTS -o ConnectTimeout=10 -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" 2>/dev/null; then
            echo -e "${GREEN}SSH连接成功${NC}"
        else
            echo -e "${RED}SSH连接失败，请检查密码和服务器配置${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}使用密码认证（将提示输入密码）...${NC}"
        ssh $SSH_OPTS -o ConnectTimeout=10 "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" || {
            echo -e "${RED}SSH连接失败${NC}"
            exit 1
        }
        echo -e "${GREEN}SSH连接成功${NC}"
    fi
fi

# 7. 创建远程目录
echo ""
echo -e "${YELLOW}[2/4] 创建远程目录...${NC}"
if [ "$USE_PASSWORD_AUTH" = true ] && command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
    sshpass -p "$SSH_PASSWORD" ssh $SSH_OPTS -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}" || {
        echo -e "${RED}无法创建远程目录${NC}"
        exit 1
    }
else
    ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}" || {
        echo -e "${RED}无法创建远程目录${NC}"
        exit 1
    }
fi
echo -e "${GREEN}远程目录已创建: ${REMOTE_PATH}${NC}"

# 8. 上传文件
echo ""
echo -e "${YELLOW}[3/4] 上传文件...${NC}"
echo -e "${BLUE}这可能需要一些时间，请稍候...${NC}"
echo ""

UPLOADED_COUNT=0
FAILED_FILES=()

for file in "${PROD_FILES[@]}"; do
    file_name=$(basename "$file")
    file_path="$file"
    
    echo -e "${CYAN}上传: ${file_name}${NC}"
    
    # 使用 scp 上传
    if [ "$USE_PASSWORD_AUTH" = true ] && command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
        if sshpass -p "$SSH_PASSWORD" scp ${SCP_OPTS} -o StrictHostKeyChecking=no "${file_path}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" 2>/dev/null; then
            echo -e "${GREEN}  ✓ ${file_name} 上传成功${NC}"
            ((UPLOADED_COUNT++))
        else
            echo -e "${RED}  ✗ ${file_name} 上传失败${NC}"
            FAILED_FILES+=("$file_name")
        fi
    else
        if scp ${SCP_OPTS} "${file_path}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" 2>/dev/null; then
            echo -e "${GREEN}  ✓ ${file_name} 上传成功${NC}"
            ((UPLOADED_COUNT++))
        else
            echo -e "${RED}  ✗ ${file_name} 上传失败${NC}"
            FAILED_FILES+=("$file_name")
        fi
    fi
    echo ""
done

# 9. 上传结果统计
echo ""
echo -e "${YELLOW}[4/4] 上传结果统计...${NC}"
echo -e "总文件数: ${#PROD_FILES[@]}"
echo -e "成功上传: ${GREEN}${UPLOADED_COUNT}${NC}"
if [ ${#FAILED_FILES[@]} -gt 0 ]; then
    echo -e "上传失败: ${RED}${#FAILED_FILES[@]}${NC}"
    echo -e "${RED}失败的文件:${NC}"
    for failed_file in "${FAILED_FILES[@]}"; do
        echo -e "  • ${failed_file}"
    done
else
    echo -e "上传失败: ${GREEN}0${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
if [ ${#FAILED_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}所有文件上传成功！${NC}"
else
    echo -e "${YELLOW}部分文件上传失败，请检查错误信息${NC}"
fi
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}========== 文件信息 ==========${NC}"
echo -e "远程目录: ${GREEN}${REMOTE_PATH}${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_USER}@${REMOTE_HOST}${NC}"
echo ""
echo -e "${YELLOW}常用命令:${NC}"
echo -e "  查看文件: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} 'ls -lh ${REMOTE_PATH}/*prod*'${NC}"
echo -e "  删除文件: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST} 'rm ${REMOTE_PATH}/*prod*'${NC}"
echo -e "  SSH登录: ${BLUE}ssh ${SSH_OPTS} ${REMOTE_USER}@${REMOTE_HOST}${NC}"

# 清除密码变量（安全考虑）
SSH_PASSWORD=""
unset SSH_PASSWORD

# 如果有失败的文件，返回非零退出码
if [ ${#FAILED_FILES[@]} -gt 0 ]; then
    exit 1
fi
