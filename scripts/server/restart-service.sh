#!/bin/bash
# 重启服务脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SERVICE="${1:-}"

echo "=========================================="
echo "重启服务"
echo "=========================================="
echo "服务: $SERVICE"
echo ""

cd "$PROJECT_ROOT"

# 先停止服务
"$SCRIPT_DIR/stop-service.sh" "$SERVICE"

# 等待一下
sleep 2

# 再启动服务
"$SCRIPT_DIR/start-service.sh" "$SERVICE" "dev"

echo ""
echo "=========================================="
echo "服务重启完成"
echo "=========================================="
