#!/bin/bash
# 现实世界日记与记忆提取自动化测试执行脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SKILL_DIR="$PROJECT_ROOT/.claude/skills/web-automation-testing"
TEST_PLAN="$SCRIPT_DIR/test_plan.json"
REPORT_JSON="$SCRIPT_DIR/report.json"
REPORT_HTML="$SCRIPT_DIR/report.html"

echo "=========================================="
echo "现实世界日记与记忆提取自动化测试"
echo "=========================================="
echo ""

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 python3，请先安装 Python 3.8+"
    exit 1
fi

echo "✅ Python 版本: $(python3 --version)"

# 检查 Playwright
if ! python3 -c "import playwright" 2>/dev/null; then
    echo "⚠️  Playwright 未安装，正在安装..."
    cd "$SKILL_DIR"
    pip3 install -r requirements.txt
    playwright install
    echo "✅ Playwright 安装完成"
fi

# 检查测试计划文件
if [ ! -f "$TEST_PLAN" ]; then
    echo "❌ 错误: 测试计划文件不存在: $TEST_PLAN"
    exit 1
fi

echo "✅ 测试计划文件: $TEST_PLAN"
echo ""

# 检查服务是否运行
echo "检查服务状态..."
FRONTEND_RUNNING=$(curl -s http://localhost:5173 > /dev/null 2>&1 && echo "yes" || echo "no")
BACKEND_RUNNING=$(curl -s http://localhost:8081/actuator/health > /dev/null 2>&1 && echo "yes" || echo "no")

if [ "$FRONTEND_RUNNING" = "no" ]; then
    echo "⚠️  前端服务未运行 (http://localhost:5173)"
    echo "   请先启动前端: cd main/frontend && npm run dev"
    read -p "是否继续执行测试? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ 前端服务运行中 (http://localhost:5173)"
fi

if [ "$BACKEND_RUNNING" = "no" ]; then
    echo "⚠️  后端服务未运行 (http://localhost:8081)"
    echo "   请先启动后端: cd main/backend && mvn spring-boot:run"
    read -p "是否继续执行测试? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ 后端服务运行中 (http://localhost:8081)"
fi

echo ""
echo "=========================================="
echo "开始执行测试..."
echo "=========================================="
echo ""

# 执行测试
cd "$PROJECT_ROOT"
python3 "$SKILL_DIR/scripts/test_runner.py" \
    "$TEST_PLAN" \
    --max-iterations 5 \
    --report "$REPORT_JSON"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 测试执行失败"
    exit 1
fi

echo ""
echo "=========================================="
echo "生成测试报告..."
echo "=========================================="
echo ""

# 生成 HTML 报告
if [ -f "$REPORT_JSON" ]; then
    python3 "$SKILL_DIR/scripts/report_generator.py" \
        "$REPORT_JSON" \
        html \
        "$REPORT_HTML"
    
    if [ $? -eq 0 ] && [ -f "$REPORT_HTML" ]; then
        echo "✅ 测试报告已生成: $REPORT_HTML"
        echo ""
        echo "可以在浏览器中打开报告查看详细结果"
    else
        echo "⚠️  HTML 报告生成失败，但 JSON 报告可用: $REPORT_JSON"
    fi
else
    echo "⚠️  未找到测试结果文件: $REPORT_JSON"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
