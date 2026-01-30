#!/bin/bash
# 健康检查脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "服务健康检查"
echo "=========================================="
echo ""

cd "$PROJECT_ROOT"

# 检查服务健康状态
check_health() {
    local service=$1
    local port=$2
    
    if nc -z localhost "$port" 2>/dev/null; then
        echo "✅ $service: 健康 (端口 $port 可访问)"
        return 0
    else
        echo "❌ $service: 不健康 (端口 $port 不可访问)"
        return 1
    fi
}

# 检查各个服务的健康状态
echo "检查后端服务..."
check_health "main-backend" 8080 || true
check_health "admin-backend" 8081 || true
check_health "company-backend" 8082 || true
check_health "edu-backend" 8083 || true
check_health "mentis-backend" 8084 || true

echo ""
echo "检查前端服务..."
check_health "main-frontend" 3000 || true
check_health "admin-frontend" 3001 || true
check_health "company-frontend" 3002 || true
check_health "edu-frontend" 3003 || true
check_health "mentis-frontend" 3004 || true

echo ""
echo "=========================================="
echo "健康检查完成"
echo "=========================================="
