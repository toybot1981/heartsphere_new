#!/bin/bash

# Mentis 模块测试运行脚本
# 用于运行 Mentis 相关的所有测试

set -e

echo "=========================================="
echo "Mentis 模块测试套件"
echo "=========================================="
echo ""

cd "$(dirname "$0")/.." || exit

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试配置
TEST_GROUP=${1:-"all"}  # all, unit, integration, performance

echo "选择测试类型: $TEST_GROUP"
echo ""

case $TEST_GROUP in
    "all")
        echo -e "${GREEN}运行所有 Mentis 测试...${NC}"
        mvn test -Dtest="com.heartsphere.mentis.**.*Test" -DfailIfNoTests=false
        ;;
    "unit")
        echo -e "${GREEN}运行单元测试...${NC}"
        mvn test -Dtest="com.heartsphere.mentis.service.*Test,com.heartsphere.mentis.util.*Test,com.heartsphere.mentis.executor.*Test,com.heartsphere.mentis.agent.*Test,com.heartsphere.mentis.vm.*Test" -DfailIfNoTests=false
        ;;
    "integration")
        echo -e "${GREEN}运行集成测试...${NC}"
        mvn test -Dtest="com.heartsphere.mentis.integration.*Test" -DfailIfNoTests=false
        ;;
    "performance")
        echo -e "${GREEN}运行性能测试...${NC}"
        mvn test -Dtest="MentisPerformanceTest" -DfailIfNoTests=false
        ;;
    "streaming")
        echo -e "${GREEN}运行流式响应测试...${NC}"
        mvn test -Dtest="MentisStreamingTest" -DfailIfNoTests=false
        ;;
    "full")
        echo -e "${GREEN}运行完整集成测试...${NC}"
        mvn test -Dtest="MentisFullIntegrationTest" -DfailIfNoTests=false
        ;;
    "controller")
        echo -e "${GREEN}运行控制器测试...${NC}"
        mvn test -Dtest="MentisControllerIntegrationTest,MentisChatControllerTest" -DfailIfNoTests=false
        ;;
    *)
        echo -e "${RED}未知的测试类型: $TEST_GROUP${NC}"
        echo ""
        echo "用法: $0 [test-type]"
        echo ""
        echo "测试类型:"
        echo "  all          - 运行所有测试（默认）"
        echo "  unit         - 仅运行单元测试"
        echo "  integration  - 仅运行集成测试"
        echo "  performance  - 仅运行性能测试"
        echo "  streaming    - 仅运行流式响应测试"
        echo "  full         - 仅运行完整集成测试"
        echo "  controller   - 仅运行控制器测试"
        exit 1
        ;;
esac

TEST_RESULT=$?

echo ""
echo "=========================================="
if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ 测试通过${NC}"
else
    echo -e "${RED}✗ 测试失败${NC}"
fi
echo "=========================================="

exit $TEST_RESULT
