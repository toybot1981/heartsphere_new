#!/bin/bash
# 启动服务脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SERVICE="${1:-}"
ENVIRONMENT="${2:-dev}"

echo "=========================================="
echo "启动服务"
echo "=========================================="
echo "服务: $SERVICE"
echo "环境: $ENVIRONMENT"
echo ""

cd "$PROJECT_ROOT"

# 启动指定服务
case "$SERVICE" in
    main-backend)
        ./scripts/start-main-backend.sh
        ;;
    admin-backend)
        ./scripts/start-admin-backend.sh
        ;;
    company-backend)
        ./scripts/start-company-backend.sh
        ;;
    edu-backend)
        ./scripts/start-edu-backend.sh
        ;;
    mentis-backend)
        ./scripts/start-mentis-backend.sh
        ;;
    main-frontend)
        ./scripts/start-main-frontend.sh
        ;;
    admin-frontend)
        ./scripts/start-admin-frontend.sh
        ;;
    company-frontend)
        ./scripts/start-company-frontend.sh
        ;;
    edu-frontend)
        ./scripts/start-edu-frontend.sh
        ;;
    mentis-frontend)
        ./scripts/start-mentis-frontend.sh
        ;;
    *)
        echo "错误: 未知服务: $SERVICE"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "服务启动完成"
echo "=========================================="
