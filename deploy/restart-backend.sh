#!/bin/bash

# HeartSphere 后端服务重启脚本
# 使用方法: bash deploy/restart-backend.sh

set -e  # 遇到错误立即退出

echo "===== HeartSphere 后端服务重启脚本 ====="

# 配置变量
PROJECT_DIR="/Users/admin/Workspace/heartsphere_new"  # 项目实际路径
BACKEND_DIR="$PROJECT_DIR/backend"
JAR_FILE="$BACKEND_DIR/target/heartsphere-backend-0.0.1-SNAPSHOT.jar"
SERVICE_NAME="heartsphere-backend"
LOG_DIR="$BACKEND_DIR/logs"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    log_error "项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 创建日志目录
mkdir -p "$LOG_DIR"

cd "$PROJECT_DIR"

# 1. 拉取最新代码
log_info "拉取最新代码..."
git pull origin master

# 2. 进入后端目录
cd "$BACKEND_DIR"

# 3. 停止当前服务
log_info "停止当前服务..."

# 使用 systemd 停止服务（如果配置了）
if systemctl is-active --quiet $SERVICE_NAME 2>/dev/null; then
    sudo systemctl stop $SERVICE_NAME
    log_info "已通过 systemd 停止服务"
else
    # 手动停止 Java 进程
    PID=$(ps aux | grep "[h]eartsphere-backend" | awk '{print $2}')
    if [ -n "$PID" ]; then
        log_info "发现运行中的进程 PID: $PID，正在停止..."
        kill $PID
        sleep 3
        # 如果进程仍在运行，强制停止
        if ps -p $PID > /dev/null; then
            log_warn "进程未响应，强制停止..."
            kill -9 $PID
        fi
    else
        log_info "未发现运行中的服务"
    fi
fi

# 4. Maven 构建
log_info "开始构建项目..."
mvn clean package -DskipTests

if [ $? -ne 0 ]; then
    log_error "构建失败！"
    exit 1
fi

# 检查 jar 文件
if [ ! -f "$JAR_FILE" ]; then
    log_error "构建后的 jar 文件不存在: $JAR_FILE"
    exit 1
fi

log_info "构建成功: $JAR_FILE"

# 5. 启动服务
log_info "启动服务..."

# 检查是否配置了 systemd 服务
if [ -f "/etc/systemd/system/$SERVICE_NAME.service" ]; then
    # 使用 systemd 启动
    sudo systemctl start $SERVICE_NAME
    sudo systemctl status $SERVICE_NAME --no-pager
else
    # 直接运行 jar 包
    nohup java -jar "$JAR_FILE" \
        --spring.profiles.active=prod \
        > "$LOG_DIR/backend-$(date +%Y%m%d_%H%M%S).log" 2>&1 &

    PID=$!
    log_info "服务已在后台启动，PID: $PID"
    echo $PID > backend.pid
fi

# 6. 等待服务启动
log_info "等待服务启动..."
sleep 10

# 7. 检查服务状态
log_info "检查服务状态..."

# 检查端口
if command -v netstat &> /dev/null; then
    if netstat -tuln | grep -q ":8080 "; then
        log_info "✓ 端口 8080 已监听"
    else
        log_warn "✗ 端口 8080 未监听，请检查日志"
    fi
elif command -v ss &> /dev/null; then
    if ss -tuln | grep -q ":8080 "; then
        log_info "✓ 端口 8080 已监听"
    else
        log_warn "✗ 端口 8080 未监听，请检查日志"
    fi
fi

# 8. 查看最近的日志
log_info "最近的日志："
tail -n 20 "$LOG_DIR/backend-$(ls -t $LOG_DIR/backend-*.log 2>/dev/null | head -1)"

echo ""
log_info "===== 服务重启完成 ====="
log_info "查看完整日志: tail -f $LOG_DIR/backend-$(ls -t $LOG_DIR/backend-*.log 2>/dev/null | head -1)"
log_info "检查服务状态: sudo systemctl status $SERVICE_NAME (如果使用 systemd)"
