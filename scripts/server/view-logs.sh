#!/bin/bash
# 查看服务日志脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SERVICE="${1:-}"
LINES="${2:-100}"
FOLLOW="${3:-false}"

echo "=========================================="
echo "查看服务日志"
echo "=========================================="
echo "服务: $SERVICE"
echo "行数: $LINES"
echo "实时跟踪: $FOLLOW"
echo ""

cd "$PROJECT_ROOT"

# 查找日志文件
get_log_file() {
    local service=$1
    local log_file=""
    
    case "$service" in
        main-backend)
            log_file="backend.log"
            ;;
        admin-backend)
            log_file="admin-backend.log"
            ;;
        company-backend)
            log_file="company-backend.log"
            ;;
        edu-backend)
            log_file="edu-backend.log"
            ;;
        mentis-backend)
            log_file="mentis-backend.log"
            ;;
        main-frontend)
            log_file="frontend.log"
            ;;
        admin-frontend)
            log_file="admin-frontend.log"
            ;;
        company-frontend)
            log_file="company-frontend.log"
            ;;
        edu-frontend)
            log_file="edu-frontend.log"
            ;;
        mentis-frontend)
            log_file="mentis-frontend.log"
            ;;
        *)
            echo "错误: 未知服务: $service"
            return 1
            ;;
    esac
    
    echo "$log_file"
}

LOG_FILE=$(get_log_file "$SERVICE")

if [ -f "$LOG_FILE" ]; then
    if [ "$FOLLOW" = "true" ]; then
        tail -f "$LOG_FILE"
    else
        tail -n "$LINES" "$LOG_FILE"
    fi
else
    echo "警告: 日志文件不存在: $LOG_FILE"
fi
