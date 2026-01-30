#!/bin/bash

# 生成测试覆盖率报告脚本

set -e

echo "=========================================="
echo "生成多智能体框架测试覆盖率报告"
echo "=========================================="

cd main/backend

echo "1. 清理之前的构建..."
mvn clean

echo "2. 运行测试并生成覆盖率报告..."
mvn test jacoco:report -Dtest=com.heartsphere.multiagent.*,com.heartsphere.character.multiagent.*

echo "3. 生成 Surefire 测试报告..."
mvn surefire-report:report

echo "4. 检查覆盖率..."
mvn jacoco:check || echo "警告: 覆盖率检查未通过，请查看报告"

echo "=========================================="
echo "报告生成完成！"
echo "=========================================="
echo ""
echo "测试报告: target/site/surefire-report.html"
echo "覆盖率报告: target/site/jacoco/index.html"
echo ""
echo "打开报告:"
echo "  macOS: open target/site/jacoco/index.html"
echo "  Linux: xdg-open target/site/jacoco/index.html"
echo ""
