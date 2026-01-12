#!/bin/bash
# 后端生产环境启动脚本
# 支持两种启动方式：systemd服务管理 或 直接启动JAR
# 使用方法: ./start-backend-prod.sh [--direct|--systemd]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/../main/backend" && pwd)"
JAR_NAME="heartsphere-service-0.0.1-SNAPSHOT.jar"
JAR_PATH="${BACKEND_DIR}/${JAR_NAME}"
SERVICE_NAME="heartsphere-backend"
LOCAL_SERVICE_FILE="${BACKEND_DIR}/${SERVICE_NAME}.service"
SYSTEMD_SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端生产环境启动脚本 - HeartSphere${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 解析启动方式参数
START_MODE="${1:-}"
if [ -z "$START_MODE" ]; then
    echo -e "${YELLOW}请选择启动方式:${NC}"
    echo -e "  1) systemd服务管理（推荐，生产环境）"
    echo -e "  2) 直接启动JAR（测试/调试使用）"
    echo -ne "${YELLOW}请选择 [1-2] (默认: 1): ${NC}"
    read choice
    choice="${choice:-1}"
    
    if [ "$choice" = "2" ]; then
        START_MODE="--direct"
    else
        START_MODE="--systemd"
    fi
fi

# 标准化参数（支持 --direct, -d, direct 等格式）
case "$START_MODE" in
    --direct|-d|direct|2)
        START_MODE="direct"
        ;;
    --systemd|-s|systemd|1)
        START_MODE="systemd"
        ;;
    *)
        echo -e "${RED}错误: 无效的启动方式: ${START_MODE}${NC}"
        echo -e "${YELLOW}使用方法:${NC}"
        echo -e "  ${BLUE}./start-backend-prod.sh --systemd${NC}  (使用systemd服务管理)"
        echo -e "  ${BLUE}./start-backend-prod.sh --direct${NC}   (直接启动JAR)"
        exit 1
        ;;
esac

# 检查JAR文件是否存在
if [ ! -f "$JAR_PATH" ]; then
    echo -e "${RED}错误: JAR文件不存在: ${JAR_PATH}${NC}"
    exit 1
fi

echo -e "${BLUE}========== 配置信息 ==========${NC}"
echo -e "JAR文件路径: ${GREEN}${JAR_PATH}${NC}"
echo -e "后端目录: ${GREEN}${BACKEND_DIR}${NC}"
if [ "$START_MODE" = "systemd" ]; then
    echo -e "服务名称: ${GREEN}${SERVICE_NAME}${NC}"
    echo -e "启动方式: ${GREEN}systemd服务管理${NC}"
else
    echo -e "启动方式: ${GREEN}直接启动JAR${NC}"
fi
echo ""

# 检查Java环境
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未安装 Java${NC}"
    echo -e "${YELLOW}请安装 Java 17 或更高版本${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | head -1)
JAVA_PATH=$(which java)
echo -e "${GREEN}Java版本: ${JAVA_VERSION}${NC}"
echo -e "${GREEN}Java路径: ${JAVA_PATH}${NC}"

# 获取服务端口（从环境变量或使用默认值）
SERVER_PORT="${BACKEND_PORT:-8081}"
echo -e "服务端口: ${GREEN}${SERVER_PORT}${NC}"

# 检查.env文件（优先使用backend目录，然后是上级目录）
ENV_FILE="${BACKEND_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
    # 尝试在上级目录查找
    PARENT_ENV_FILE="$(dirname "$BACKEND_DIR")/.env"
    if [ -f "$PARENT_ENV_FILE" ]; then
        ENV_FILE="$PARENT_ENV_FILE"
    else
        echo -e "${YELLOW}警告: 未找到.env文件${NC}"
        echo -e "${YELLOW}将从以下位置查找:${NC}"
        echo -e "  - ${BACKEND_DIR}/.env"
        echo -e "  - $(dirname "$BACKEND_DIR")/.env"
        echo ""
        echo -e "${YELLOW}建议创建.env文件并配置数据库连接信息${NC}"
        ENV_FILE=""  # 如果没有找到，不设置EnvironmentFile
    fi
fi

# 加载环境变量
if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
    echo -e "环境变量文件: ${GREEN}${ENV_FILE}${NC}"
    # 加载环境变量以便验证和使用
    set -a
    source "$ENV_FILE" 2>/dev/null || true
    set +a
else
    echo -e "${YELLOW}警告: 未找到.env文件，环境变量可能未正确加载${NC}"
    echo -e "${YELLOW}建议创建.env文件: ${BLUE}./create-env-file.sh${NC}"
fi

# 打印数据库连接参数（用于诊断）
echo ""
echo -e "${BLUE}========== 数据库连接配置 ==========${NC}"
if [ -n "${DB_HOST:-}" ]; then
    echo -e "数据库主机 (DB_HOST): ${GREEN}${DB_HOST}${NC}"
else
    echo -e "数据库主机 (DB_HOST): ${RED}未设置${NC} (将使用默认值: localhost)"
    DB_HOST="localhost"
fi

if [ -n "${DB_PORT:-}" ]; then
    echo -e "数据库端口 (DB_PORT): ${GREEN}${DB_PORT}${NC}"
else
    echo -e "数据库端口 (DB_PORT): ${YELLOW}未设置${NC} (将使用默认值: 3306)"
    DB_PORT="3306"
fi

if [ -n "${DB_NAME:-}" ]; then
    echo -e "数据库名称 (DB_NAME): ${GREEN}${DB_NAME}${NC}"
else
    echo -e "数据库名称 (DB_NAME): ${YELLOW}未设置${NC} (将使用默认值: heartsphere)"
    DB_NAME="heartsphere"
fi

if [ -n "${DB_USER:-}" ]; then
    echo -e "数据库用户 (DB_USER): ${GREEN}${DB_USER}${NC}"
else
    echo -e "数据库用户 (DB_USER): ${RED}未设置${NC} (将使用默认值: root)"
    DB_USER="root"
fi

if [ -n "${DB_PASSWORD:-}" ]; then
    # 隐藏密码，只显示前3个字符和长度
    PWD_LEN=${#DB_PASSWORD}
    PWD_DISPLAY="${DB_PASSWORD:0:3}*** (长度: ${PWD_LEN})"
    echo -e "数据库密码 (DB_PASSWORD): ${GREEN}${PWD_DISPLAY}${NC}"
else
    echo -e "数据库密码 (DB_PASSWORD): ${RED}未设置${NC}"
fi

# 构建JDBC URL用于显示（不包含密码）
JDBC_URL_DISPLAY="jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai"
echo -e "JDBC URL: ${CYAN}${JDBC_URL_DISPLAY}${NC}"

# 检查关键环境变量
echo ""
if [ -z "${DB_HOST:-}" ] || [ -z "${DB_USER:-}" ] || [ -z "${DB_PASSWORD:-}" ]; then
    echo -e "${YELLOW}警告: 数据库配置不完整${NC}"
    echo -e "${YELLOW}需要设置: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME${NC}"
    echo ""
    echo -e "${YELLOW}建议运行: ${BLUE}./test-db-connection.sh${NC} 测试数据库连接${NC}"
else
    echo -e "${GREEN}✓ 数据库配置参数已加载${NC}"
fi
echo ""

# 根据启动方式执行不同的启动逻辑
if [ "$START_MODE" = "systemd" ]; then
    # ========== systemd服务管理模式 ==========
    echo -e "${YELLOW}生成systemd服务文件...${NC}"
    
    # 构建服务文件内容
    SERVICE_CONTENT="[Unit]
Description=HeartSphere Backend Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${BACKEND_DIR}
ExecStart=${JAVA_PATH} -jar ${JAR_PATH} --server.port=${SERVER_PORT} --spring.profiles.active=prod
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=${SERVICE_NAME}"

    # 如果有.env文件，添加EnvironmentFile
    if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
        SERVICE_CONTENT="${SERVICE_CONTENT}

# 加载环境变量文件
EnvironmentFile=${ENV_FILE}"
    fi

    # 添加Java选项和其他配置
    SERVICE_CONTENT="${SERVICE_CONTENT}

# Java选项（可选，根据需要调整内存）
#Environment=\"JAVA_OPTS=-Xms512m -Xmx1024m\"

[Install]
WantedBy=multi-user.target"

    # 写入服务文件
    echo "$SERVICE_CONTENT" > "$LOCAL_SERVICE_FILE"

    echo -e "${GREEN}✓ 服务文件已生成: ${LOCAL_SERVICE_FILE}${NC}"

    # 检查systemd服务文件是否存在，如果不存在则复制
    if [ ! -f "$SYSTEMD_SERVICE_FILE" ]; then
        echo ""
        echo -e "${YELLOW}systemd服务文件不存在，正在安装...${NC}"
        sudo cp "$LOCAL_SERVICE_FILE" "$SYSTEMD_SERVICE_FILE"
        echo -e "${GREEN}✓ 服务文件已复制到: ${SYSTEMD_SERVICE_FILE}${NC}"
    else
        # 比较文件，如果不同则更新
        if ! cmp -s "$LOCAL_SERVICE_FILE" "$SYSTEMD_SERVICE_FILE"; then
            echo ""
            echo -e "${YELLOW}检测到服务文件有更新，正在更新...${NC}"
            sudo cp "$LOCAL_SERVICE_FILE" "$SYSTEMD_SERVICE_FILE"
            echo -e "${GREEN}✓ 服务文件已更新${NC}"
        else
            echo -e "${GREEN}✓ 服务文件已是最新${NC}"
        fi
    fi

    # 重新加载systemd配置
    echo ""
    echo -e "${YELLOW}[1/2] 重新加载systemd配置...${NC}"
    sudo systemctl daemon-reload
    echo -e "${GREEN}✓ systemd配置已重新加载${NC}"

    # 重启服务
    echo ""
    echo -e "${YELLOW}[2/2] 重启服务...${NC}"
    sudo systemctl restart "${SERVICE_NAME}"

    # 等待服务启动
    sleep 2

    # 检查服务状态
    echo ""
    echo -e "${YELLOW}检查服务状态...${NC}"

    if sudo systemctl is-active --quiet "${SERVICE_NAME}"; then
        echo -e "${GREEN}✓ 服务启动成功${NC}"
        echo ""
        echo -e "${BLUE}========== 服务信息 ==========${NC}"
        sudo systemctl status "${SERVICE_NAME}" --no-pager -l | head -20
        echo ""
        echo -e "${YELLOW}常用命令:${NC}"
        echo -e "  查看状态: ${BLUE}sudo systemctl status ${SERVICE_NAME}${NC}"
        echo -e "  查看日志: ${BLUE}sudo journalctl -u ${SERVICE_NAME} -f${NC}"
        echo -e "  停止服务: ${BLUE}sudo systemctl stop ${SERVICE_NAME}${NC}"
        echo -e "  重启服务: ${BLUE}sudo systemctl restart ${SERVICE_NAME}${NC}"
        echo -e "  开机自启: ${BLUE}sudo systemctl enable ${SERVICE_NAME}${NC}"
    else
        echo -e "${RED}✗ 服务启动失败${NC}"
        echo ""
        echo -e "${YELLOW}查看服务状态:${NC}"
        sudo systemctl status "${SERVICE_NAME}" --no-pager -l | tail -30
        echo ""
        echo -e "${YELLOW}查看日志:${NC}"
        sudo journalctl -u "${SERVICE_NAME}" -n 50 --no-pager
        exit 1
    fi

else
    # ========== 直接启动JAR模式 ==========
    echo -e "${YELLOW}准备直接启动JAR文件...${NC}"
    
    # 检查是否有正在运行的进程
    EXISTING_PID=$(pgrep -f "heartsphere-service.*jar" || true)
    if [ -n "$EXISTING_PID" ]; then
        echo -e "${YELLOW}发现已有运行中的进程 (PID: ${EXISTING_PID})${NC}"
        read -p "是否停止现有进程? [y/N]: " stop_existing
        if [[ "$stop_existing" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}正在停止进程 ${EXISTING_PID}...${NC}"
            kill "$EXISTING_PID" 2>/dev/null || true
            sleep 2
            # 如果还在运行，强制杀死
            if kill -0 "$EXISTING_PID" 2>/dev/null; then
                kill -9 "$EXISTING_PID" 2>/dev/null || true
            fi
            echo -e "${GREEN}✓ 进程已停止${NC}"
        else
            echo -e "${YELLOW}已取消启动${NC}"
            exit 0
        fi
    fi
    
    # 构建启动命令
    LOG_FILE="${BACKEND_DIR}/backend-direct.log"
    JAVA_OPTS="${JAVA_OPTS:--Xms512m -Xmx1024m}"
    
    # 如果.env文件存在，使用环境变量
    if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
        # 确保环境变量已加载
        set -a
        source "$ENV_FILE" 2>/dev/null || true
        set +a
    fi
    
    START_CMD="${JAVA_PATH} ${JAVA_OPTS} -jar ${JAR_PATH} --server.port=${SERVER_PORT} --spring.profiles.active=prod"
    
    echo ""
    echo -e "${BLUE}========== 启动信息 ==========${NC}"
    echo -e "启动命令: ${CYAN}${START_CMD}${NC}"
    echo -e "日志文件: ${GREEN}${LOG_FILE}${NC}"
    echo -e "工作目录: ${GREEN}${BACKEND_DIR}${NC}"
    echo ""
    
    # 再次打印数据库配置（确保环境变量已加载到启动环境中）
    echo -e "${BLUE}========== 数据库连接参数（启动时使用） ==========${NC}"
    echo -e "DB_HOST=${DB_HOST:-localhost}"
    echo -e "DB_PORT=${DB_PORT:-3306}"
    echo -e "DB_NAME=${DB_NAME:-heartsphere}"
    echo -e "DB_USER=${DB_USER:-root}"
    if [ -n "${DB_PASSWORD:-}" ]; then
        PWD_LEN=${#DB_PASSWORD}
        echo -e "DB_PASSWORD=${DB_PASSWORD:0:3}*** (长度: ${PWD_LEN})"
    else
        echo -e "DB_PASSWORD=未设置"
    fi
    JDBC_URL_DISPLAY="jdbc:mysql://${DB_HOST:-localhost}:${DB_PORT:-3306}/${DB_NAME:-heartsphere}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai"
    echo -e "JDBC URL: ${JDBC_URL_DISPLAY}"
    echo ""
    
    # 询问启动方式（前台/后台）
    echo -e "${YELLOW}选择运行方式:${NC}"
    echo -e "  1) 后台运行（推荐，使用nohup）"
    echo -e "  2) 前台运行（可以看到实时日志，Ctrl+C停止）"
    echo -ne "${YELLOW}请选择 [1-2] (默认: 1): ${NC}"
    read run_mode
    run_mode="${run_mode:-1}"
    
    cd "$BACKEND_DIR"
    
    if [ "$run_mode" = "2" ]; then
        # 前台运行
        echo ""
        echo -e "${GREEN}正在前台启动应用...${NC}"
        echo -e "${YELLOW}提示: 按 Ctrl+C 可以停止应用${NC}"
        echo ""
        exec $START_CMD
    else
        # 后台运行
        echo ""
        echo -e "${YELLOW}正在后台启动应用...${NC}"
        nohup $START_CMD > "$LOG_FILE" 2>&1 &
        APP_PID=$!
        
        sleep 3
        
        # 检查进程是否还在运行
        if kill -0 "$APP_PID" 2>/dev/null; then
            echo -e "${GREEN}✓ 应用启动成功${NC}"
            echo ""
            echo -e "${BLUE}========== 进程信息 ==========${NC}"
            echo -e "进程ID (PID): ${GREEN}${APP_PID}${NC}"
            echo -e "日志文件: ${GREEN}${LOG_FILE}${NC}"
            echo ""
            echo -e "${YELLOW}常用命令:${NC}"
            echo -e "  查看日志: ${BLUE}tail -f ${LOG_FILE}${NC}"
            echo -e "  查看进程: ${BLUE}ps aux | grep ${APP_PID}${NC}"
            echo -e "  停止应用: ${BLUE}kill ${APP_PID}${NC}"
            echo -e "  查看实时日志: ${BLUE}tail -f ${LOG_FILE}${NC}"
            echo ""
            echo -e "${CYAN}正在查看启动日志（最后20行）...${NC}"
            echo ""
            tail -n 20 "$LOG_FILE"
        else
            echo -e "${RED}✗ 应用启动失败${NC}"
            echo ""
            echo -e "${YELLOW}查看日志文件:${NC}"
            tail -n 50 "$LOG_FILE"
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}启动完成！${NC}"
echo -e "${GREEN}========================================${NC}"
