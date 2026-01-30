#!/bin/bash
# 停止所有服务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 加载端口管理工具
source "$SCRIPT_DIR/../utils/port-utils.sh"

echo "========================================="
echo "停止所有服务"
echo "========================================="
echo ""

# 定义端口列表（后端和前端）
BACKEND_PORTS=(8081 8084 8085 8082 8083)
FRONTEND_PORTS=(3000 3001 3005 3002 3003)

# 停止后端服务
echo "停止后端服务..."
for port in "${BACKEND_PORTS[@]}"; do
    if ! check_port_available "$port"; then
        echo -e "${YELLOW}停止端口 $port 上的后端服务...${NC}"
        kill_port_process "$port"
    fi
done

# 停止前端服务
echo ""
echo "停止前端服务..."
for port in "${FRONTEND_PORTS[@]}"; do
    if ! check_port_available "$port"; then
        echo -e "${YELLOW}停止端口 $port 上的前端服务...${NC}"
        kill_port_process "$port"
    fi
done

# 清理 PID 文件
echo ""
echo "清理 PID 文件..."
rm -f "$PROJECT_ROOT"/backend-backend.pid
rm -f "$PROJECT_ROOT"/backend-frontend.pid
rm -f "$PROJECT_ROOT"/edu-backend.pid
rm -f "$PROJECT_ROOT"/edu-frontend.pid
rm -f "$PROJECT_ROOT"/admin-backend.pid
rm -f "$PROJECT_ROOT"/admin-frontend.pid
rm -f "$PROJECT_ROOT"/mentis-backend.pid
rm -f "$PROJECT_ROOT"/mentis-frontend.pid
rm -f "$PROJECT_ROOT"/company-backend.pid
rm -f "$PROJECT_ROOT"/company-frontend.pid

echo ""
echo "========================================="
echo "所有服务已停止"
echo "========================================="
echo ""
