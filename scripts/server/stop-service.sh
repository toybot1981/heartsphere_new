#!/bin/bash
# 停止服务脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SERVICE="${1:-}"

echo "=========================================="
echo "停止服务"
echo "=========================================="
echo "服务: $SERVICE"
echo ""

cd "$PROJECT_ROOT"

# 停止指定服务
stop_service() {
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
            echo "错误: 未知服务: $service"
            return 1
            ;;
    esac
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file" 2>/dev/null || echo "")
        if [ -n "$pid" ] && ps -p "$pid" > /dev/null 2>&1; then
            echo "停止 $service (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
            sleep 2
            if ps -p "$pid" > /dev/null 2>&1; then
                kill -9 "$pid" 2>/dev/null || true
            fi
            rm -f "$pid_file"
            echo "✅ $service 已停止"
        else
            echo "⚠️  $service 未运行"
            rm -f "$pid_file"
        fi
    else
        echo "⚠️  $service 未运行"
    fi
}

stop_service "$SERVICE"

echo ""
echo "=========================================="
echo "服务停止完成"
echo "=========================================="
