#!/bin/bash

# 体验模式数据隔离功能测试脚本
# 使用方法: ./test-experience-mode.sh

echo "=========================================="
echo "体验模式数据隔离功能测试"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查后端是否运行
echo "1. 检查后端服务..."
if curl -s http://localhost:8081/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务运行中${NC}"
else
    echo -e "${RED}✗ 后端服务未运行，请先启动后端服务${NC}"
    echo "  启动命令: cd backend && mvn spring-boot:run"
    exit 1
fi

# 检查前端是否运行
echo "2. 检查前端服务..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端服务运行中${NC}"
else
    echo -e "${YELLOW}⚠ 前端服务未运行（可选）${NC}"
fi

echo ""
echo "=========================================="
echo "测试步骤："
echo "=========================================="
echo ""
echo "1. 打开浏览器，访问 http://localhost:5173"
echo "2. 打开浏览器开发者工具（F12）"
echo "3. 切换到 Console 标签"
echo "4. 执行以下命令设置体验模式："
echo ""
echo -e "${YELLOW}sessionStorage.setItem('experience_mode', JSON.stringify({"
echo "  shareConfigId: 1,"
echo "  visitorId: 2,"
echo "  startTime: Date.now()"
echo "}));${NC}"
echo ""
echo "5. 切换到 Network 标签"
echo "6. 在应用中执行会保存数据的操作（如发送消息）"
echo "7. 检查请求头是否包含："
echo "   - X-Experience-Mode: true"
echo "   - X-Share-Config-Id: 1"
echo ""
echo "8. 查看后端日志，应该看到："
echo "   - '设置体验模式上下文'"
echo "   - '体验模式：保存消息到临时存储'"
echo ""
echo "=========================================="
echo "cURL 测试命令："
echo "=========================================="
echo ""
echo "测试1: 正常模式保存消息"
echo -e "${YELLOW}curl -X POST http://localhost:8081/api/memory/v1/sessions/test/messages \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  -d '{\"role\": \"user\", \"content\": \"正常模式测试\"}'${NC}"
echo ""
echo "测试2: 体验模式保存消息"
echo -e "${YELLOW}curl -X POST http://localhost:8081/api/memory/v1/sessions/test/messages \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer VISITOR_TOKEN' \\"
echo "  -H 'X-Experience-Mode: true' \\"
echo "  -H 'X-Share-Config-Id: 1' \\"
echo "  -d '{\"role\": \"user\", \"content\": \"体验模式测试\"}'${NC}"
echo ""
echo "=========================================="
echo "验证检查清单："
echo "=========================================="
echo ""
echo "前端验证："
echo "  [ ] 请求头包含 X-Experience-Mode: true"
echo "  [ ] 请求头包含 X-Share-Config-Id: {id}"
echo "  [ ] 体验模式标识栏显示"
echo ""
echo "后端验证："
echo "  [ ] 拦截器日志显示体验模式"
echo "  [ ] 上下文正确设置"
echo "  [ ] 数据保存到临时存储（不保存到数据库）"
echo ""
echo "=========================================="



