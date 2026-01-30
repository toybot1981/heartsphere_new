#!/bin/bash
# 单元测试脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MODULE="${1:-}"
COVERAGE="${2:-true}"

echo "=========================================="
echo "运行单元测试"
echo "=========================================="
echo "模块: ${MODULE:-全部}"
echo "生成覆盖率: ${COVERAGE}"
echo ""

cd "$PROJECT_ROOT"

# 运行指定模块或全部
if [ -n "$MODULE" ]; then
    # 后端测试
    if [ -d "$PROJECT_ROOT/$MODULE/backend" ]; then
        echo "运行 $MODULE 后端单元测试..."
        cd "$PROJECT_ROOT/$MODULE/backend"
        if [ "$COVERAGE" = "true" ]; then
            mvn test jacoco:report || true
        else
            mvn test || true
        fi
    fi
    
    # 前端测试
    if [ -d "$PROJECT_ROOT/$MODULE/frontend" ]; then
        echo "运行 $MODULE 前端单元测试..."
        cd "$PROJECT_ROOT/$MODULE/frontend"
        if [ "$COVERAGE" = "true" ]; then
            npm run test:coverage || true
        else
            npm run test || true
        fi
    fi
else
    # 运行所有模块的单元测试
    for dir in main admin company edu mentis; do
        if [ -d "$PROJECT_ROOT/$dir/backend" ]; then
            echo "运行 $dir 后端单元测试..."
            cd "$PROJECT_ROOT/$dir/backend"
            mvn test || true
        fi
        
        if [ -d "$PROJECT_ROOT/$dir/frontend" ]; then
            echo "运行 $dir 前端单元测试..."
            cd "$PROJECT_ROOT/$dir/frontend"
            npm run test || true
        fi
    done
fi

echo ""
echo "=========================================="
echo "单元测试完成"
echo "=========================================="
