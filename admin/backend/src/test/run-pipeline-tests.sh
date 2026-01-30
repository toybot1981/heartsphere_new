#!/bin/bash

# 部署流程测试运行脚本
# 用于快速运行部署流程相关的测试

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  部署流程测试运行脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

# 检查参数
TEST_CLASS=""
TEST_METHOD=""
COVERAGE=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --class)
            TEST_CLASS="$2"
            shift 2
            ;;
        --method)
            TEST_METHOD="$2"
            shift 2
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --help|-h)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  --class <类名>      运行指定的测试类"
            echo "  --method <方法名>   运行指定的测试方法（需要配合 --class 使用）"
            echo "  --coverage          生成测试覆盖率报告"
            echo "  --verbose, -v       显示详细输出"
            echo "  --help, -h          显示此帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                                    # 运行所有部署流程测试"
            echo "  $0 --class DeploymentPipelineControllerTest  # 运行指定测试类"
            echo "  $0 --class DeploymentPipelineControllerTest --method testGetAllPipelines  # 运行指定测试方法"
            echo "  $0 --coverage                        # 生成覆盖率报告"
            exit 0
            ;;
        *)
            echo "未知选项: $1"
            echo "使用 --help 查看帮助信息"
            exit 1
            ;;
    esac
done

# 构建测试命令
TEST_CMD="mvn test"

if [ -n "$TEST_CLASS" ]; then
    if [ -n "$TEST_METHOD" ]; then
        TEST_CMD="$TEST_CMD -Dtest=${TEST_CLASS}#${TEST_METHOD}"
    else
        TEST_CMD="$TEST_CMD -Dtest=${TEST_CLASS}"
    fi
else
    TEST_CMD="$TEST_CMD -Dtest=DeploymentPipeline*Test"
fi

if [ "$COVERAGE" = true ]; then
    echo "📊 将生成测试覆盖率报告..."
    TEST_CMD="$TEST_CMD jacoco:report"
fi

if [ "$VERBOSE" = false ]; then
    TEST_CMD="$TEST_CMD -q"
fi

echo "🚀 开始运行测试..."
echo ""

# 运行测试
eval $TEST_CMD

TEST_EXIT_CODE=$?

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ 测试通过！"
    
    if [ "$COVERAGE" = true ]; then
        echo ""
        echo "📊 测试覆盖率报告已生成："
        echo "   target/site/jacoco/index.html"
    fi
else
    echo "❌ 测试失败！退出码: $TEST_EXIT_CODE"
    echo ""
    echo "💡 提示:"
    echo "   • 查看详细错误信息: target/surefire-reports/"
    echo "   • 运行单个测试: $0 --class <类名> --method <方法名>"
    echo "   • 查看测试指南: src/test/TESTING_GUIDE.md"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $TEST_EXIT_CODE
