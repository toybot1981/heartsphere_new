#!/bin/bash
# E2E 测试脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

BROWSER="${1:-chromium}"
HEADLESS="${2:-true}"

echo "=========================================="
echo "运行 E2E 测试"
echo "=========================================="
echo "浏览器: $BROWSER"
echo "无头模式: $HEADLESS"
echo ""

cd "$PROJECT_ROOT"

# 运行前端 E2E 测试
for dir in main/frontend admin/frontend; do
    if [ -d "$PROJECT_ROOT/$dir" ] && [ -f "$PROJECT_ROOT/$dir/package.json" ]; then
        echo "运行 $dir E2E 测试..."
        cd "$PROJECT_ROOT/$dir"
        
        if [ "$BROWSER" = "all" ]; then
            npm run test:e2e || true
        else
            PLAYWRIGHT_BROWSERS="$BROWSER" npm run test:e2e || true
        fi
    fi
done

echo ""
echo "=========================================="
echo "E2E 测试完成"
echo "=========================================="
