#!/bin/bash

# 直接通过Java执行Graph测试的脚本

cd /Users/admin/Workspace/heartsphere_new/backend

echo "=== Graph流程执行测试 ==="
echo ""

# 编译测试类
echo "1. 编译测试类..."
mvn test-compile -Dtest=GraphExecutionTest -DskipTests > /tmp/test_compile.log 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    tail -20 /tmp/test_compile.log
    exit 1
fi

echo "✅ 编译成功"
echo ""

# 运行测试
echo "2. 运行Graph执行测试..."
mvn test -Dtest=GraphExecutionTest 2>&1 | grep -A 100 "Graph流程执行测试" | head -100
