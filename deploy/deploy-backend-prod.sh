#!/bin/bash
# 后端生产环境部署脚本
# 通过 SCP 上传到服务器（不启动服务）
# 使用方法: ./deploy-backend-prod.sh
# 启动服务请使用: ./start-backend-prod.sh

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
BACKEND_DIR="${PROJECT_ROOT}/backend"
TARGET_DIR="${BACKEND_DIR}/target"
JAR_NAME="heartsphere-service-0.0.1-SNAPSHOT.jar"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端生产环境部署脚本 - HeartSphere${NC}"
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

# 1. 配置远程服务器
echo -e "${BLUE}========== 配置远程服务器 ==========${NC}"

# 服务器地址
read_input "请输入远程服务器地址（IP或域名）" "${REMOTE_HOST:-heartsphere.cn}" REMOTE_HOST

# SSH 端口
read_input "请输入SSH端口" "${REMOTE_PORT:-22}" REMOTE_PORT

# 用户名
read_input "请输入SSH用户名" "${REMOTE_USER:-root}" REMOTE_USER

# 远程部署路径
REMOTE_PATH="${REMOTE_PATH:-/opt/heartsphere/backend}"
read_input "请输入远程部署路径" "$REMOTE_PATH" REMOTE_PATH

# SSH密钥路径
read_input "请输入SSH私钥路径（留空使用密码认证）" "${SSH_KEY:-}" SSH_KEY

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

# 后端端口
read_input "请输入后端端口" "${BACKEND_PORT:-8081}" BACKEND_PORT

# 保存配置
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
BACKEND_PORT="${BACKEND_PORT}"
EOF
    chmod 600 "$CONFIG_FILE"
    echo -e "${GREEN}配置已保存到 ${CONFIG_FILE}${NC}"
fi

# 确认配置
echo ""
echo -e "${BLUE}========== 配置确认 ==========${NC}"
echo -e "服务器地址: ${GREEN}${REMOTE_HOST}${NC}"
echo -e "SSH端口: ${GREEN}${REMOTE_PORT}${NC}"
echo -e "用户名: ${GREEN}${REMOTE_USER}${NC}"
echo -e "远程路径: ${GREEN}${REMOTE_PATH}${NC}"
echo -e "后端端口: ${GREEN}${BACKEND_PORT}${NC}"
if [ -n "$SSH_KEY" ]; then
    echo -e "SSH密钥: ${GREEN}${SSH_KEY}${NC}"
fi
echo ""
read -p "确认配置是否正确? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}部署已取消${NC}"
    exit 0
fi

# 2. 构建SSH选项和密码处理
# SSH选项用于ssh命令
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

# 3. 检查本地环境
echo ""
echo -e "${YELLOW}[1/4] 检查本地环境...${NC}"

if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到 Maven${NC}"
    exit 1
fi
MVN_VERSION=$(mvn -version | head -1)
echo -e "${GREEN}Maven: ${MVN_VERSION}${NC}"

# 4. 构建项目
echo ""
echo -e "${YELLOW}[2/4] 构建项目...${NC}"
cd "$BACKEND_DIR" || {
    echo -e "${RED}错误: 无法进入后端目录${NC}"
    exit 1
}

# 检查是否需要重新构建
if [ -f "${TARGET_DIR}/${JAR_NAME}" ]; then
    read -p "JAR 文件已存在，是否重新构建? [y/N]: " rebuild
    if [[ "$rebuild" =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}开始构建（使用 prod profile）...${NC}"
        # 注意：所有依赖都在主 dependencies 中，prod profile 仅用于配置 Spring Profile
        mvn clean package -DskipTests -Pprod
    else
        echo -e "${YELLOW}跳过构建，使用现有 JAR 文件${NC}"
    fi
else
    echo -e "${YELLOW}开始构建（使用 prod profile）...${NC}"
    # 注意：所有依赖都在主 dependencies 中，prod profile 仅用于配置 Spring Profile
    mvn clean package -DskipTests -Pprod
fi

if [ ! -f "${TARGET_DIR}/${JAR_NAME}" ]; then
    echo -e "${RED}构建失败，未找到 JAR 文件！${NC}"
    exit 1
fi

JAR_SIZE=$(du -h "${TARGET_DIR}/${JAR_NAME}" | cut -f1)
echo -e "${GREEN}构建完成: ${TARGET_DIR}/${JAR_NAME} (${JAR_SIZE})${NC}"

# 5. 测试SSH连接
echo ""
echo -e "${YELLOW}[3/4] 测试SSH连接...${NC}"
if ssh $SSH_OPTS -o ConnectTimeout=5 -o BatchMode=yes "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" 2>/dev/null; then
    echo -e "${GREEN}SSH连接成功（使用密钥认证）${NC}"
elif [ -n "$SSH_KEY" ] && [ -f "$SSH_KEY" ]; then
    echo -e "${YELLOW}使用密钥认证，可能需要输入密钥密码...${NC}"
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
        echo -e "${YELLOW}需要输入SSH密码...${NC}"
        ssh $SSH_OPTS -o ConnectTimeout=10 "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH连接成功'" || {
            echo -e "${RED}SSH连接失败${NC}"
            exit 1
        }
        echo -e "${GREEN}SSH连接成功${NC}"
    fi
fi

# 6. 上传文件到服务器
echo ""
echo -e "${YELLOW}[4/4] 上传文件到服务器...${NC}"

# 创建远程目录
echo -e "${YELLOW}创建远程目录...${NC}"
if [ "$USE_PASSWORD_AUTH" = true ] && command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
    sshpass -p "$SSH_PASSWORD" ssh $SSH_OPTS -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "
        mkdir -p ${REMOTE_PATH}
        mkdir -p ${REMOTE_PATH}/logs
        mkdir -p ${REMOTE_PATH}/uploads
    " || {
        echo -e "${RED}无法创建远程目录${NC}"
        exit 1
    }
else
    ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "
        mkdir -p ${REMOTE_PATH}
        mkdir -p ${REMOTE_PATH}/logs
        mkdir -p ${REMOTE_PATH}/uploads
    " || {
        echo -e "${RED}无法创建远程目录${NC}"
        exit 1
    }
fi

# 备份现有JAR文件
echo -e "${YELLOW}备份现有文件...${NC}"
BACKUP_DIR="${REMOTE_PATH}.backup.$(date +%Y%m%d_%H%M%S)"
if [ "$USE_PASSWORD_AUTH" = true ] && command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
    sshpass -p "$SSH_PASSWORD" ssh $SSH_OPTS -o StrictHostKeyChecking=no "${REMOTE_USER}@${REMOTE_HOST}" "
        if [ -f '${REMOTE_PATH}/${JAR_NAME}' ]; then
            echo '备份现有 JAR 文件到 ${BACKUP_DIR}'
            mkdir -p '${BACKUP_DIR}'
            cp '${REMOTE_PATH}/${JAR_NAME}' '${BACKUP_DIR}/' 2>/dev/null || true
        fi
    "
else
    ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" "
        if [ -f '${REMOTE_PATH}/${JAR_NAME}' ]; then
            echo '备份现有 JAR 文件到 ${BACKUP_DIR}'
            mkdir -p '${BACKUP_DIR}'
            cp '${REMOTE_PATH}/${JAR_NAME}' '${BACKUP_DIR}/' 2>/dev/null || true
        fi
    "
fi

# 上传JAR文件
echo -e "${YELLOW}上传JAR文件...${NC}"
echo -e "${BLUE}这可能需要一些时间，请稍候...${NC}"

# 使用 scp 上传
# scp 使用 -P 选项指定端口（而不是 -p）
if [ "$USE_PASSWORD_AUTH" = true ] && command -v sshpass &> /dev/null && [ -n "$SSH_PASSWORD" ]; then
    sshpass -p "$SSH_PASSWORD" scp ${SCP_OPTS} -o StrictHostKeyChecking=no "${TARGET_DIR}/${JAR_NAME}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || {
        echo -e "${RED}上传失败${NC}"
        exit 1
    }
else
    scp ${SCP_OPTS} "${TARGET_DIR}/${JAR_NAME}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/" || {
        echo -e "${RED}上传失败${NC}"
        exit 1
    }
fi

echo -e "${GREEN}文件上传成功${NC}"

# 清除密码变量（安全考虑）
SSH_PASSWORD=""
unset SSH_PASSWORD

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}文件上传完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}下一步操作:${NC}"
echo -e "  启动服务: ${BLUE}./start-backend-prod.sh${NC}"
echo -e "  远程路径: ${GREEN}${REMOTE_PATH}/${JAR_NAME}${NC}"
if [ -n "$BACKUP_DIR" ]; then
    echo -e "  备份位置: ${GREEN}${BACKUP_DIR}${NC}"
fi
echo ""
