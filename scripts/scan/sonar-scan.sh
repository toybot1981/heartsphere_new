#!/bin/bash
# SonarQube 代码扫描脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

MODULE="${1:-}"

echo "=========================================="
echo "SonarQube 代码扫描"
echo "=========================================="
echo "模块: ${MODULE:-全部}"
echo ""

cd "$PROJECT_ROOT"

# 检查 SonarQube 是否配置
if ! command -v sonar-scanner &> /dev/null; then
    echo "警告: SonarQube Scanner 未安装，跳过扫描"
    echo "请安装 SonarQube Scanner 或配置环境变量"
    exit 0
fi

# 扫描指定模块或全部
if [ -n "$MODULE" ]; then
    if [ -d "$PROJECT_ROOT/$MODULE/backend" ]; then
        echo "扫描 $MODULE 后端..."
        cd "$PROJECT_ROOT/$MODULE/backend"
        mvn sonar:sonar || echo "SonarQube 扫描失败，请检查配置"
    fi
else
    # 扫描所有后端模块
    for dir in main/backend admin/backend company/backend edu/backend mentis/backend; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            echo "扫描 $dir..."
            cd "$PROJECT_ROOT/$dir"
            mvn sonar:sonar || echo "SonarQube 扫描失败，请检查配置"
        fi
    done
fi

echo ""
echo "=========================================="
echo "SonarQube 扫描完成"
echo "=========================================="
