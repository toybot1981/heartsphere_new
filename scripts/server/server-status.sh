#!/bin/bash
# 服务器状态检查脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SERVICE="${1:-}"

echo "=========================================="
echo "服务器状态检查"
echo "=========================================="
echo "服务: ${SERVICE:-全部}"
echo ""

cd "$PROJECT_ROOT"

# 检查指定服务或全部服务
check_service() {
    local service=$1
    local pid_file=""
    
    case "$service" in
        main-backend)
            pid_file="backend.pid"
            ;;
        admin-backend)
            pid_file="admin-backend.pid"
            ;;
        company-backend)
            pid_file="company-backend.pid"
            ;;
        edu-backend)
            pid_file="edu-backend.pid"
            ;;
        mentis-backend)
            pid_file="mentis-backend.pid"
            ;;
        main-frontend)
            pid_file="frontend.pid"
            ;;
        admin-frontend)
            pid_file="admin-frontend.pid"
            ;;
        company-frontend)
            pid_file="company-frontend.pid"
            ;;
        edu-frontend)
            pid_file="edu-frontend.pid"
            ;;
        mentis-frontend)
            pid_file="mentis-frontend.pid"
            ;;
        *)
            echo "未知服务: $service"
            return 1
            ;;
    esac
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null || echo "")
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
            echo "✅ $service: 运行中 (PID: $pid)"
            return 0
        else
            echo "❌ $service: 已停止 (PID 文件存在但进程不存在)"
            return 1
        fi
    else
        echo "⏸️  $service: 未启动"
        return 1
    fi
}

if [ -n "$SERVICE" ]; then
    check_service "$SERVICE"
else
    # 检查所有服务
    for service in main-backend admin-backend company-backend edu-backend mentis-backend \
                   main-frontend admin-frontend company-frontend edu-frontend mentis-frontend; do
        check_service "$service"
    done
fi

echo ""
echo "=========================================="
echo "状态检查完成"
echo "=========================================="
