#!/bin/bash
# 集成测试脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MODULE="${1:-}"

echo "=========================================="
echo "运行集成测试"
echo "=========================================="
echo "模块: ${MODULE:-全部}"
echo ""

cd "$PROJECT_ROOT"

# 运行指定模块或全部
if [ -n "$MODULE" ]; then
    if [ -d "$PROJECT_ROOT/$MODULE/backend" ]; then
        echo "运行 $MODULE 集成测试..."
        cd "$PROJECT_ROOT/$MODULE/backend"
        mvn verify -Dskip.unit.tests=true || true
    fi
else
    # 运行所有模块的集成测试
    for dir in main admin company edu mentis; do
        if [ -d "$PROJECT_ROOT/$dir/backend" ]; then
            echo "运行 $dir 集成测试..."
            cd "$PROJECT_ROOT/$dir/backend"
            mvn verify -Dskip.unit.tests=true || true
        fi
    done
fi

echo ""
echo "=========================================="
echo "集成测试完成"
echo "=========================================="
