#!/bin/bash
# ESLint 代码扫描脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MODULE="${1:-}"
FIX="${2:-false}"

echo "=========================================="
echo "ESLint 代码扫描"
echo "=========================================="
echo "模块: ${MODULE:-全部}"
echo "自动修复: ${FIX}"
echo ""

cd "$PROJECT_ROOT"

# 扫描指定模块或全部
if [ -n "$MODULE" ]; then
    if [ -d "$PROJECT_ROOT/$MODULE/frontend" ]; then
        echo "扫描 $MODULE 前端..."
        cd "$PROJECT_ROOT/$MODULE/frontend"
        if [ "$FIX" = "true" ]; then
            npm run lint -- --fix || true
        else
            npm run lint || true
        fi
    fi
else
    # 扫描所有前端模块
    for dir in main/frontend admin/frontend company/frontend edu/frontend mentis/frontend; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            echo "扫描 $dir..."
            cd "$PROJECT_ROOT/$dir"
            if [ "$FIX" = "true" ]; then
                npm run lint -- --fix || true
            else
                npm run lint || true
            fi
        fi
    done
fi

echo ""
echo "=========================================="
echo "ESLint 扫描完成"
echo "=========================================="
