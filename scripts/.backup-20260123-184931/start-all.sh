#!/bin/bash
# 启动所有服务

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

echo "========================================="
echo "启动所有服务"
echo "========================================="
echo ""

# 启动所有后端服务
echo "启动后端服务..."
"$SCRIPT_DIR/start-main-backend.sh"
sleep 2
"$SCRIPT_DIR/start-edu-backend.sh"
sleep 2
"$SCRIPT_DIR/start-admin-backend.sh"
sleep 2
"$SCRIPT_DIR/start-mentis-backend.sh"
sleep 2
"$SCRIPT_DIR/start-company-backend.sh"
sleep 2

echo ""
echo "启动前端服务..."
"$SCRIPT_DIR/start-main-frontend.sh"
sleep 2
"$SCRIPT_DIR/start-edu-frontend.sh"
sleep 2
"$SCRIPT_DIR/start-admin-frontend.sh"
sleep 2
"$SCRIPT_DIR/start-mentis-frontend.sh"
sleep 2
"$SCRIPT_DIR/start-company-frontend.sh"
sleep 2

echo ""
echo "========================================="
echo "所有服务已启动"
echo "========================================="
echo ""
echo "服务访问地址："
echo "  主项目后端: http://localhost:8081"
echo "  主项目前端: http://localhost:3000"
echo "  教育版后端: http://localhost:8084"
echo "  教育版前端: http://localhost:3001"
echo "  管理后台后端: http://localhost:8085"
echo "  管理后台前端: http://localhost:3005"
echo "  Mentis 后端: http://localhost:8082"
echo "  Mentis 前端: http://localhost:3002"
echo "  公司网站后端: http://localhost:8083"
echo "  公司网站前端: http://localhost:3003"
echo ""
echo "查看日志: tail -f <项目名>-<backend|frontend>.log"
echo "停止服务: ./scripts/stop-all.sh"
echo ""
