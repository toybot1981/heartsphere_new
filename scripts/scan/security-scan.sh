#!/bin/bash
# 安全漏洞扫描脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SEVERITY="${1:-medium}"

echo "=========================================="
echo "安全漏洞扫描"
echo "=========================================="
echo "最低严重级别: $SEVERITY"
echo ""

cd "$PROJECT_ROOT"

# 前端依赖安全扫描
echo "扫描前端依赖..."
for dir in main/frontend admin/frontend company/frontend edu/frontend mentis/frontend; do
    if [ -d "$PROJECT_ROOT/$dir" ] && [ -f "$PROJECT_ROOT/$dir/package.json" ]; then
        echo "扫描 $dir..."
        cd "$PROJECT_ROOT/$dir"
        npm audit --audit-level="$SEVERITY" || true
    fi
done

# 后端依赖安全扫描
echo ""
echo "扫描后端依赖..."
for dir in main/backend admin/backend company/backend edu/backend mentis/backend; do
    if [ -d "$PROJECT_ROOT/$dir" ] && [ -f "$PROJECT_ROOT/$dir/pom.xml" ]; then
        echo "扫描 $dir..."
        cd "$PROJECT_ROOT/$dir"
        mvn org.owasp:dependency-check-maven:check || true
    fi
done

echo ""
echo "=========================================="
echo "安全扫描完成"
echo "=========================================="
