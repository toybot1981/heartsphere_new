#!/bin/bash

# 日常生活助手技能测试启动脚本

echo "========================================="
echo "日常生活助手技能测试"
echo "========================================="
echo ""

# 检查环境变量
if [ -z "$TEST_USER_TOKEN" ]; then
    echo "❌ 错误: 未设置 TEST_USER_TOKEN 环境变量"
    echo ""
    echo "请先设置环境变量:"
    echo "  export TEST_USER_TOKEN=your_token_here"
    echo ""
    exit 1
fi

# 检查API服务
echo "🔍 检查后端服务..."
if curl -s -f -o /dev/null http://localhost:8081/api/health 2>/dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "⚠️  警告: 无法连接到后端服务 (http://localhost:8081)"
    echo "   请确保后端服务正在运行"
    read -p "是否继续? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 检查前端应用
echo "🔍 检查前端应用..."
if curl -s -f -o /dev/null http://localhost:3000 2>/dev/null; then
    echo "✅ 前端应用运行正常"
else
    echo "⚠️  警告: 无法连接到前端应用 (http://localhost:3000)"
    echo "   请确保前端应用正在运行"
fi

echo ""
echo "========================================="
echo "准备执行测试"
echo "========================================="
echo ""

# 检查测试用例文件
TEST_CASES_FILE="scripts/test-skills/data/test-cases.json"
if [ -f "$TEST_CASES_FILE" ]; then
    # 检查是否有未替换的角色ID
    if grep -q "REPLACE_WITH_ACTUAL_ID" "$TEST_CASES_FILE"; then
        echo "⚠️  警告: 测试用例文件中包含未替换的角色ID"
        echo ""
        echo "请先更新 $TEST_CASES_FILE 中的角色ID："
        echo ""
        echo "获取角色ID的方法："
        echo "1. 通过数据库查询："
        echo "   SELECT id, name FROM characters WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳');"
        echo ""
        echo "2. 通过API查询（需要Token）："
        echo "   curl -H \"Authorization: Bearer \$TEST_USER_TOKEN\" http://localhost:8081/api/characters"
        echo ""
        read -p "是否继续执行测试? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    else
        echo "✅ 测试用例文件已准备就绪"
    fi
else
    echo "❌ 错误: 测试用例文件不存在: $TEST_CASES_FILE"
    exit 1
fi

echo ""
echo "========================================="
echo "开始执行测试"
echo "========================================="
echo ""

# 执行测试脚本
python3 scripts/test-skills/test-skill-api.py

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "========================================="
    echo "✅ 测试执行完成"
    echo "========================================="
    echo ""
    echo "测试结果已保存到: scripts/test-skills/data/results/"
    echo ""
    echo "下一步："
    echo "1. 查看测试结果文件"
    echo "2. 生成测试报告"
    echo "3. 分析问题和改进建议"
else
    echo "========================================="
    echo "❌ 测试执行失败"
    echo "========================================="
    echo ""
    echo "请检查："
    echo "1. API服务是否正常运行"
    echo "2. Token是否有效"
    echo "3. 角色ID是否正确"
fi

exit $EXIT_CODE
