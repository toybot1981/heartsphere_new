#!/bin/bash

echo "=========================================="
echo "检查后端服务状态"
echo "=========================================="

# 检查端口占用
PID=$(lsof -ti:8081 2>/dev/null)
if [ -n "$PID" ]; then
    echo "✓ 后端服务正在运行 (PID: $PID)"
    
    # 检查进程启动时间
    START_TIME=$(ps -p $PID -o lstart= 2>/dev/null)
    echo "  启动时间: $START_TIME"
    
    # 检查 class 文件修改时间
    CLASS_FILE="/Users/admin/Documents/trae_projects/heartsphere_new/backend/target/classes/com/heartsphere/admin/controller/AdminSystemDataController.class"
    if [ -f "$CLASS_FILE" ]; then
        COMPILE_TIME=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "$CLASS_FILE" 2>/dev/null || stat -c "%y" "$CLASS_FILE" 2>/dev/null | cut -d'.' -f1)
        echo "  Class 文件编译时间: $COMPILE_TIME"
        
        # 检查方法是否存在
        if javap -p "$CLASS_FILE" 2>/dev/null | grep -q "getAllUserScripts"; then
            echo "  ✓ getAllUserScripts 方法已存在于 class 文件中"
        else
            echo "  ✗ getAllUserScripts 方法不存在于 class 文件中"
        fi
    fi
    
    echo ""
    echo "⚠️  警告: 如果 class 文件比进程启动时间新，需要重启后端服务"
    echo ""
    echo "重启命令:"
    echo "  ./restart_backend_force.sh"
    echo "  或"
    echo "  kill -9 $PID && cd backend && mvn spring-boot:run"
else
    echo "✗ 后端服务未运行"
    echo ""
    echo "启动命令:"
    echo "  cd backend && mvn spring-boot:run"
fi

echo ""
echo "测试 API 端点:"
echo "  curl -X GET 'http://localhost:8081/api/admin/system/scripts' -H 'Authorization: Bearer YOUR_TOKEN'"





