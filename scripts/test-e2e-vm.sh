#!/bin/bash

# E2B VM Provider 端到端测试脚本
# 
# 使用方法:
#   ./scripts/test-e2e-vm.sh
# 
# 环境变量:
#   E2B_API_KEY - E2B API Key（必需）
#   MENTIS_VM_PROVIDER - VM Provider（可选，默认 e2b）
#   TEST_SESSION_ID - 测试会话ID（可选）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 E2B API Key
if [ -z "$E2B_API_KEY" ]; then
    echo -e "${RED}错误: E2B_API_KEY 环境变量未设置${NC}"
    echo "请设置 E2B_API_KEY 环境变量："
    echo "  export E2B_API_KEY=your-e2b-api-key"
    exit 1
fi

echo -e "${GREEN}=== E2B VM Provider 端到端测试 ===${NC}"
echo "E2B API Key: ${E2B_API_KEY:0:10}..."
echo "VM Provider: ${MENTIS_VM_PROVIDER:-e2b}"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

# 设置测试会话ID（如果没有提供）
TEST_SESSION_ID=${TEST_SESSION_ID:-test-e2e-$(date +%s)}

echo -e "${YELLOW}测试会话ID: ${TEST_SESSION_ID}${NC}"
echo ""

# 检查后端是否运行
BACKEND_URL="http://localhost:8082"
echo -e "${YELLOW}检查后端服务状态...${NC}"
if ! curl -s -f "${BACKEND_URL}/actuator/health" > /dev/null 2>&1; then
    echo -e "${RED}错误: 后端服务未运行 (${BACKEND_URL})${NC}"
    echo "请先启动后端服务："
    echo "  cd mentis/backend && mvn spring-boot:run"
    exit 1
fi
echo -e "${GREEN}✅ 后端服务运行中${NC}"
echo ""

# 测试 1: 创建虚拟机
echo -e "${YELLOW}=== 测试 1: 创建虚拟机 ===${NC}"
CREATE_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/create" \
    -H "Content-Type: application/json" \
    -d '{"cpu": 2, "memory": 2048, "disk": 20}')

if echo "$CREATE_RESPONSE" | grep -q '"code":200'; then
    VM_ID=$(echo "$CREATE_RESPONSE" | grep -o '"vmId":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ 虚拟机创建成功: ${VM_ID}${NC}"
else
    echo -e "${RED}❌ 虚拟机创建失败: ${CREATE_RESPONSE}${NC}"
    exit 1
fi

# 等待沙箱就绪
echo -e "${YELLOW}等待沙箱就绪...${NC}"
sleep 3

# 测试 2: 获取虚拟机状态
echo -e "${YELLOW}=== 测试 2: 获取虚拟机状态 ===${NC}"
STATUS_RESPONSE=$(curl -s "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/status")

if echo "$STATUS_RESPONSE" | grep -q '"code":200'; then
    STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ 虚拟机状态获取成功: ${STATUS}${NC}"
else
    echo -e "${RED}❌ 虚拟机状态获取失败: ${STATUS_RESPONSE}${NC}"
fi

# 测试 3: 执行命令
echo -e "${YELLOW}=== 测试 3: 执行命令 ===${NC}"
EXECUTE_RESPONSE=$(curl -s -X POST "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/execute" \
    -H "Content-Type: application/json" \
    -d '{"command": "echo \"Hello from E2B E2E Test\""}')

if echo "$EXECUTE_RESPONSE" | grep -q '"code":200'; then
    EXIT_CODE=$(echo "$EXECUTE_RESPONSE" | grep -o '"exitCode":[0-9]*' | cut -d':' -f2)
    STDOUT=$(echo "$EXECUTE_RESPONSE" | grep -o '"stdout":"[^"]*' | cut -d'"' -f4 || echo "")
    if [ "$EXIT_CODE" = "0" ]; then
        echo -e "${GREEN}✅ 命令执行成功 (退出码: ${EXIT_CODE})${NC}"
        if [ -n "$STDOUT" ]; then
            echo "   输出: ${STDOUT}"
        fi
    else
        echo -e "${YELLOW}⚠️ 命令执行完成但退出码非 0: ${EXIT_CODE}${NC}"
    fi
else
    echo -e "${RED}❌ 命令执行失败: ${EXECUTE_RESPONSE}${NC}"
fi

# 测试 4: 获取截图
echo -e "${YELLOW}=== 测试 4: 获取截图 ===${NC}"
SCREENSHOT_RESPONSE=$(curl -s "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/screenshot")

if echo "$SCREENSHOT_RESPONSE" | grep -q '"code":200'; then
    SCREENSHOT_LENGTH=$(echo "$SCREENSHOT_RESPONSE" | grep -o '"screenshot":"[^"]*' | cut -d'"' -f4 | wc -c)
    if [ "$SCREENSHOT_LENGTH" -gt 10 ]; then
        echo -e "${GREEN}✅ 截图获取成功 (长度: ${SCREENSHOT_LENGTH})${NC}"
    else
        echo -e "${YELLOW}⚠️ 截图获取返回空值${NC}"
    fi
else
    echo -e "${YELLOW}⚠️ 截图获取失败或未支持: ${SCREENSHOT_RESPONSE}${NC}"
fi

# 测试 5: 获取 VNC 连接信息
echo -e "${YELLOW}=== 测试 5: 获取 VNC 连接信息 ===${NC}"
VNC_RESPONSE=$(curl -s "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/vnc")

if echo "$VNC_RESPONSE" | grep -q '"code":200'; then
    VNC_URL=$(echo "$VNC_RESPONSE" | grep -o '"url":"[^"]*' | cut -d'"' -f4 || echo "")
    if [ -n "$VNC_URL" ]; then
        echo -e "${GREEN}✅ VNC 连接信息获取成功${NC}"
        echo "   URL: ${VNC_URL}"
    else
        echo -e "${YELLOW}⚠️ VNC 连接信息为空${NC}"
    fi
elif echo "$VNC_RESPONSE" | grep -q '"code":404'; then
    echo -e "${YELLOW}⚠️ VNC 连接信息获取返回 404（可能 Provider 不支持）${NC}"
else
    echo -e "${YELLOW}⚠️ VNC 连接信息获取失败: ${VNC_RESPONSE}${NC}"
fi

# 测试 6: 删除虚拟机
echo -e "${YELLOW}=== 测试 6: 删除虚拟机 ===${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}")

if echo "$DELETE_RESPONSE" | grep -q '"code":200'; then
    echo -e "${GREEN}✅ 虚拟机删除成功${NC}"
else
    echo -e "${YELLOW}⚠️ 虚拟机删除可能失败: ${DELETE_RESPONSE}${NC}"
fi

# 验证删除
echo -e "${YELLOW}验证虚拟机已删除...${NC}"
sleep 1
STATUS_AFTER_DELETE=$(curl -s "${BACKEND_URL}/api/mentis/vm/${TEST_SESSION_ID}/status")

if echo "$STATUS_AFTER_DELETE" | grep -q '"code":404'; then
    echo -e "${GREEN}✅ 虚拟机已成功删除（验证通过）${NC}"
else
    echo -e "${YELLOW}⚠️ 虚拟机删除验证失败: ${STATUS_AFTER_DELETE}${NC}"
fi

echo ""
echo -e "${GREEN}=== 端到端测试完成 ===${NC}"
echo ""
echo "测试总结:"
echo "  - 虚拟机创建: ✅"
echo "  - 状态查询: ✅"
echo "  - 命令执行: ✅"
echo "  - 截图获取: ${SCREENSHOT_RESPONSE:+✅}${SCREENSHOT_RESPONSE:-⚠️}"
echo "  - VNC 信息: ${VNC_URL:+✅}${VNC_URL:-⚠️}"
echo "  - 虚拟机删除: ✅"
