#!/bin/bash

# HeartSphere Edu 服务启动脚本

echo "🚀 启动 HeartSphere Edu 服务..."
echo ""

# 检查 Java 版本
echo "📋 检查环境..."
java -version
echo ""

# 检查 Node.js 版本
node -v
echo ""

# 启动后端服务
echo "🔧 启动 Edu 后端服务（端口 8084）..."
cd edu/backend
mvn spring-boot:run > ../../edu-backend.log 2>&1 &
BACKEND_PID=$!
echo "后端服务已启动，PID: $BACKEND_PID"
echo "日志文件: edu-backend.log"
echo "等待后端服务启动..."
sleep 10
echo ""

# 启动前端服务
echo "🎨 启动 Edu 前端服务..."
cd ../frontend
npm run dev > ../../edu-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端服务已启动，PID: $FRONTEND_PID"
echo "日志文件: edu-frontend.log"
echo ""

echo "✅ 服务启动完成！"
echo ""
echo "📊 服务信息："
echo "  - 后端服务: http://localhost:8084"
echo "  - API 文档: http://localhost:8084/swagger-ui.html"
echo "  - 前端服务: http://localhost:3000 (或查看日志获取实际端口)"
echo ""
echo "📝 查看日志："
echo "  - 后端日志: tail -f edu-backend.log"
echo "  - 前端日志: tail -f edu-frontend.log"
echo ""
echo "🛑 停止服务："
echo "  - 后端: kill $BACKEND_PID"
echo "  - 前端: kill $FRONTEND_PID"
echo "  - 或使用: pkill -f 'spring-boot:run' 和 pkill -f 'vite'"
echo ""

# 保存 PID 到文件
echo $BACKEND_PID > ../../edu-backend.pid
echo $FRONTEND_PID > ../../edu-frontend.pid

echo "PID 已保存到 edu-backend.pid 和 edu-frontend.pid"
