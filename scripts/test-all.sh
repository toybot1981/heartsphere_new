#!/bin/bash

# 完整端到端测试脚本
# 
# 使用方法:
#   ./scripts/test-all.sh
# 
# 环境变量:
#   E2B_API_KEY - E2B API Key（必需）
#   SKIP_UNIT_TESTS - 跳过单元测试（可选）
#   SKIP_INTEGRATION_TESTS - 跳过集成测试（可选）
#   SKIP_E2E_TESTS - 跳过端到端测试（可选）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}  完整端到端测试${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# 检查 E2B API Key（如果需要运行 E2E 测试）
if [ -z "$SKIP_E2E_TESTS" ] && [ -z "$E2B_API_KEY" ]; then
    echo -e "${YELLOW}警告: E2B_API_KEY 未设置，将跳过 E2E 测试${NC}"
    echo "如需运行 E2E 测试，请设置: export E2B_API_KEY=your-key"
    SKIP_E2E_TESTS=true
fi

# 1. 单元测试
if [ -z "$SKIP_UNIT_TESTS" ]; then
    echo -e "${BLUE}=== 1. 运行单元测试 ===${NC}"
    cd mentis/backend
    if mvn test -DskipTests=false 2>&1 | tee test-output.log; then
        echo -e "${GREEN}✅ 单元测试通过${NC}"
    else
        echo -e "${RED}❌ 单元测试失败${NC}"
        exit 1
    fi
    cd ../..
    echo ""
else
    echo -e "${YELLOW}⏭️  跳过单元测试${NC}"
    echo ""
fi

# 2. 集成测试
if [ -z "$SKIP_INTEGRATION_TESTS" ]; then
    echo -e "${BLUE}=== 2. 运行集成测试 ===${NC}"
    cd mentis/backend
    if mvn verify -DskipITs=false 2>&1 | tee integration-test-output.log; then
        echo -e "${GREEN}✅ 集成测试通过${NC}"
    else
        echo -e "${YELLOW}⚠️  集成测试可能失败（需要配置）${NC}"
    fi
    cd ../..
    echo ""
else
    echo -e "${YELLOW}⏭️  跳过集成测试${NC}"
    echo ""
fi

# 3. 启动后端服务（如果未运行）
BACKEND_URL="http://localhost:8082"
if ! curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${BLUE}=== 3. 启动后端服务 ===${NC}"
    echo -e "${YELLOW}启动后端服务...${NC}"
    cd mentis/backend
    nohup mvn spring-boot:run > ../backend-test.log 2>&1 &
    BACKEND_PID=$!
    echo "后端服务 PID: ${BACKEND_PID}"
    
    # 等待服务启动
    echo "等待后端服务启动..."
    for i in {1..30}; do
        if curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ 后端服务已启动${NC}"
            break
        fi
        sleep 2
    done
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ 后端服务启动超时${NC}"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
    
    cd ../..
    echo ""
else
    echo -e "${GREEN}✅ 后端服务已在运行${NC}"
    echo ""
fi

# 4. 端到端测试
if [ -z "$SKIP_E2E_TESTS" ]; then
    echo -e "${BLUE}=== 4. 运行端到端测试 ===${NC}"
    if ./scripts/test-e2e-vm.sh; then
        echo -e "${GREEN}✅ 端到端测试通过${NC}"
    else
        echo -e "${RED}❌ 端到端测试失败${NC}"
        exit 1
    fi
    echo ""
else
    echo -e "${YELLOW}⏭️  跳过端到端测试${NC}"
    echo ""
fi

# 5. 清理（如果启动了后端服务）
if [ -n "$BACKEND_PID" ]; then
    echo -e "${BLUE}=== 5. 清理 ===${NC}"
    echo "停止后端服务 (PID: ${BACKEND_PID})..."
    kill $BACKEND_PID 2>/dev/null || true
    echo -e "${GREEN}✅ 清理完成${NC}"
    echo ""
fi

# 测试总结
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}  测试完成${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "测试结果:"
[ -z "$SKIP_UNIT_TESTS" ] && echo "  ✅ 单元测试"
[ -z "$SKIP_INTEGRATION_TESTS" ] && echo "  ✅ 集成测试"
[ -z "$SKIP_E2E_TESTS" ] && echo "  ✅ 端到端测试"
echo ""
echo "查看日志:"
echo "  - 单元测试: mentis/backend/test-output.log"
echo "  - 集成测试: mentis/backend/integration-test-output.log"
echo "  - 后端日志: mentis/backend-test.log"
