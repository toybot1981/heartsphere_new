#!/bin/bash
# 后端开发环境部署脚本
# 本地构建后直接启动
# 使用方法: ./deploy-backend-dev.sh

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
BACKEND_DIR="${PROJECT_ROOT}/main/backend"
TARGET_DIR="${BACKEND_DIR}/target"
JAR_NAME="heartsphere-service-0.0.1-SNAPSHOT.jar"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端开发环境部署脚本 - HeartSphere${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 1. 检查环境
echo -e "${YELLOW}[1/4] 检查环境...${NC}"

# 检查 Java
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到 Java${NC}"
    echo "请安装 Java 17 或更高版本"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -1)
echo -e "${GREEN}Java: ${JAVA_VERSION}${NC}"

# 检查 Maven
if ! command -v mvn &> /dev/null; then
    echo -e "${RED}错误: 未找到 Maven${NC}"
    echo "请安装 Maven"
    exit 1
fi
MVN_VERSION=$(mvn -version | head -1)
echo -e "${GREEN}Maven: ${MVN_VERSION}${NC}"

# 2. 构建项目
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
        echo -e "${YELLOW}开始构建（使用 dev profile）...${NC}"
        # 注意：所有依赖都在主 dependencies 中，dev profile 仅用于配置 Spring Profile
        mvn clean package -DskipTests -Pdev
    else
        echo -e "${YELLOW}跳过构建，使用现有 JAR 文件${NC}"
    fi
else
    echo -e "${YELLOW}开始构建（使用 dev profile）...${NC}"
    # 注意：所有依赖都在主 dependencies 中，dev profile 仅用于配置 Spring Profile
    mvn clean package -DskipTests -Pdev
fi

if [ ! -f "${TARGET_DIR}/${JAR_NAME}" ]; then
    echo -e "${RED}构建失败，未找到 JAR 文件！${NC}"
    exit 1
fi

JAR_SIZE=$(du -h "${TARGET_DIR}/${JAR_NAME}" | cut -f1)
echo -e "${GREEN}构建完成: ${TARGET_DIR}/${JAR_NAME} (${JAR_SIZE})${NC}"

# 3. 停止现有进程
echo ""
echo -e "${YELLOW}[3/4] 检查并停止现有进程...${NC}"

# 查找并停止运行中的进程
EXISTING_PID=$(ps aux | grep "$JAR_NAME" | grep -v grep | awk '{print $2}' | head -1)
if [ -n "$EXISTING_PID" ]; then
    echo -e "${YELLOW}发现运行中的进程 (PID: ${EXISTING_PID})，正在停止...${NC}"
    kill "$EXISTING_PID" 2>/dev/null || true
    sleep 2
    
    # 如果还在运行，强制停止
    if ps -p "$EXISTING_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}强制停止进程...${NC}"
        kill -9 "$EXISTING_PID" 2>/dev/null || true
    fi
    echo -e "${GREEN}进程已停止${NC}"
else
    echo -e "${GREEN}没有运行中的进程${NC}"
fi

# 4. 启动应用
echo ""
echo -e "${YELLOW}[4/4] 启动应用...${NC}"

# 4.1 加载环境变量文件（.env）
ENV_FILE="${BACKEND_DIR}/.env"
if [ ! -f "$ENV_FILE" ]; then
    # 尝试在项目根目录查找
    ENV_FILE="${PROJECT_ROOT}/.env"
    if [ ! -f "$ENV_FILE" ]; then
        ENV_FILE=""
    fi
fi

if [ -n "$ENV_FILE" ] && [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}加载环境变量文件: ${ENV_FILE}${NC}"
    set -a  # 自动export所有变量
    source "$ENV_FILE" 2>/dev/null || true
    set +a  # 关闭自动export
else
    echo -e "${YELLOW}未找到.env文件，使用默认配置或系统环境变量${NC}"
fi

# 4.2 打印数据库连接参数（用于诊断）
echo ""
echo -e "${BLUE}========== 数据库连接配置 ==========${NC}"
if [ -n "${DB_HOST:-}" ]; then
    echo -e "数据库主机 (DB_HOST): ${GREEN}${DB_HOST}${NC}"
else
    echo -e "数据库主机 (DB_HOST): ${YELLOW}未设置${NC} (将使用默认值: localhost)"
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
    echo -e "数据库用户 (DB_USER): ${YELLOW}未设置${NC} (将使用默认值: root)"
    DB_USER="root"
fi

if [ -n "${DB_PASSWORD:-}" ]; then
    # 隐藏密码，只显示前3个字符和长度
    PWD_LEN=${#DB_PASSWORD}
    PWD_DISPLAY="${DB_PASSWORD:0:3}*** (长度: ${PWD_LEN})"
    echo -e "数据库密码 (DB_PASSWORD): ${GREEN}${PWD_DISPLAY}${NC}"
else
    echo -e "数据库密码 (DB_PASSWORD): ${YELLOW}未设置${NC} (将使用空密码)"
fi

# 构建完整的JDBC连接串（程序中实际使用的）
JDBC_URL_FULL="jdbc:mysql://${DB_HOST:-localhost}:${DB_PORT:-3306}/${DB_NAME:-heartsphere}?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai"
echo -e "JDBC连接串: ${CYAN}${JDBC_URL_FULL}${NC}"
echo -e "数据库用户: ${GREEN}${DB_USER:-root}${NC}"
if [ -n "${DB_PASSWORD:-}" ]; then
    PWD_LEN=${#DB_PASSWORD}
    echo -e "数据库密码: ${GREEN}${DB_PASSWORD:0:3}*** (长度: ${PWD_LEN})${NC}"
else
    echo -e "数据库密码: ${YELLOW}未设置（空密码）${NC}"
fi
echo ""

# 4.3 读取端口配置
# 注意：不使用环境变量，让用户明确输入，避免配置文件中8081覆盖用户输入
read -p "请输入后端端口 [8081]: " input_port
if [ -z "$input_port" ]; then
    BACKEND_PORT="8081"
else
    BACKEND_PORT="$input_port"
fi

# 验证端口是否为数字
if ! [[ "$BACKEND_PORT" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}错误: 端口必须是数字${NC}"
    exit 1
fi

echo -e "${GREEN}使用端口: ${BACKEND_PORT}${NC}"

# 读取配置文件
APPLICATION_YML="${BACKEND_DIR}/src/main/resources/application.yml"
if [ -f "$APPLICATION_YML" ]; then
    echo -e "${YELLOW}使用配置文件: ${APPLICATION_YML}${NC}"
fi

# 启动命令
echo ""
echo -e "${BLUE}启动命令:${NC}"
echo -e "${BLUE}SPRING_APPLICATION_JSON='{\"server\":{\"port\":${BACKEND_PORT}}}' java -jar ${TARGET_DIR}/${JAR_NAME} --server.port=${BACKEND_PORT} --spring.profiles.active=dev${NC}"
echo -e "${YELLOW}注意: 命令行参数 --server.port=${BACKEND_PORT} 会覆盖配置文件中的端口设置${NC}"
echo -e "${YELLOW}注意: 所有依赖都在主 dependencies 中，dev profile 仅用于配置 Spring Profile${NC}"
echo ""

# 在后台启动
# 使用 SPRING_APPLICATION_JSON 环境变量和命令行参数确保端口设置生效
# Spring Boot 优先级：命令行参数 > SPRING_APPLICATION_JSON > 配置文件
SPRING_APPLICATION_JSON="{\"server\":{\"port\":${BACKEND_PORT}}}" \
nohup java -jar "${TARGET_DIR}/${JAR_NAME}" \
    --server.port="${BACKEND_PORT}" \
    --spring.profiles.active=dev \
    > "${BACKEND_DIR}/backend.log" 2>&1 &

PID=$!
echo -e "${GREEN}应用已启动 (PID: ${PID})${NC}"
echo -e "${YELLOW}日志文件: ${BACKEND_DIR}/backend.log${NC}"
echo ""

# 保存 PID
echo "$PID" > "${BACKEND_DIR}/backend.pid"
echo -e "${GREEN}PID 文件: ${BACKEND_DIR}/backend.pid${NC}"

# 等待启动
echo -e "${YELLOW}等待应用启动...${NC}"
sleep 8  # 增加等待时间，让应用有时间初始化数据库连接

# 检查进程是否还在运行
if ps -p "$PID" > /dev/null 2>&1; then
    # 检查日志中是否有数据库连接错误
    if [ -f "${BACKEND_DIR}/backend.log" ]; then
        # 查找数据库相关的错误
        DB_ERRORS=$(grep -iE "error|exception|fail|unable|cannot" "${BACKEND_DIR}/backend.log" 2>/dev/null | grep -iE "database|datasource|jdbc|mysql|connection|hibernate|jpa" | tail -5)
        if [ -n "$DB_ERRORS" ]; then
            echo -e "${RED}⚠ 检测到数据库连接错误:${NC}"
            echo -e "${RED}${DB_ERRORS}${NC}"
            echo ""
            echo -e "${YELLOW}建议:${NC}"
            echo -e "  1. 检查数据库配置是否正确"
            echo -e "  2. 检查数据库服务是否运行"
            echo -e "  3. 查看完整日志: ${BLUE}tail -f ${BACKEND_DIR}/backend.log${NC}"
            echo ""
        fi
        
        # 检查是否有启动成功的标志（Spring Boot启动完成）
        if grep -q "Started.*Application.*seconds" "${BACKEND_DIR}/backend.log" 2>/dev/null; then
            echo -e "${GREEN}✓ 应用启动成功${NC}"
        else
            echo -e "${YELLOW}⚠ 应用进程运行中，但未检测到启动完成标志${NC}"
            echo -e "${YELLOW}  请查看日志确认: ${BLUE}tail -f ${BACKEND_DIR}/backend.log${NC}"
        fi
    else
        echo -e "${YELLOW}⚠ 日志文件尚未生成，应用可能正在启动中${NC}"
    fi
    echo ""
    echo -e "${BLUE}========== 服务信息 ==========${NC}"
    echo -e "服务地址: ${GREEN}http://localhost:${BACKEND_PORT}${NC}"
    echo -e "进程 PID: ${GREEN}${PID}${NC}"
    echo -e "日志文件: ${GREEN}${BACKEND_DIR}/backend.log${NC}"
    echo -e "PID 文件: ${GREEN}${BACKEND_DIR}/backend.pid${NC}"
    echo ""
    echo -e "${YELLOW}常用命令:${NC}"
    echo -e "  查看日志: ${BLUE}tail -f ${BACKEND_DIR}/backend.log${NC}"
    echo -e "  停止应用: ${BLUE}kill ${PID}${NC}"
    echo -e "  检查进程: ${BLUE}ps aux | grep ${JAR_NAME}${NC}"
    echo -e "  测试服务: ${BLUE}curl http://localhost:${BACKEND_PORT}/api/health${NC}"
else
    echo -e "${RED}✗ 应用启动失败，请查看日志:${NC}"
    tail -20 "${BACKEND_DIR}/backend.log"
    exit 1
fi

echo ""
echo -e "${GREEN}开发环境部署完成！${NC}"
