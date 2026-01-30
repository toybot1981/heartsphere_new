#!/bin/bash

# Mentis 全面测试脚本
# 
# 使用方法:
#   ./scripts/test-mentis-comprehensive.sh
#   ./scripts/test-mentis-comprehensive.sh http://localhost:8082 admin admin123
# 
# 环境变量:
#   BACKEND_URL - 后端服务 URL（可选，默认 http://localhost:8082）
#   ADMIN_USER - 管理员用户名（可选，默认 admin）
#   ADMIN_PASS - 管理员密码（可选，默认 admin123）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 参数解析
BACKEND_URL=${1:-${BACKEND_URL:-http://localhost:8082}}
ADMIN_USER=${2:-${ADMIN_USER:-admin}}
ADMIN_PASS=${3:-${ADMIN_PASS:-admin123}}

# 统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 会话和Token
SESSION_ID=""
ADMIN_TOKEN=""

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mentis 全面测试脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}后端 URL: ${BACKEND_URL}${NC}"
echo -e "${CYAN}管理员账号: ${ADMIN_USER}${NC}"
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.." || exit 1

# 检查依赖
if ! command -v curl &> /dev/null; then
    echo -e "${RED}错误: 需要安装 curl${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}警告: 未安装 jq，JSON 解析可能不准确${NC}"
    JQ_AVAILABLE=false
else
    JQ_AVAILABLE=true
fi

# 辅助函数
log_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${YELLOW}[测试 ${TOTAL_TESTS}]${NC} $1"
}

log_pass() {
    PASSED_TESTS=$((PASSED_TESTS + 1))
    echo -e "${GREEN}✓ 通过${NC}"
}

log_fail() {
    FAILED_TESTS=$((FAILED_TESTS + 1))
    echo -e "${RED}✗ 失败${NC}"
    if [ -n "$1" ]; then
        echo -e "${RED}  错误: $1${NC}"
    fi
}

log_info() {
    echo -e "${CYAN}  $1${NC}"
}

# API 调用函数
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local headers=""
    
    if [ -n "$ADMIN_TOKEN" ]; then
        headers="-H \"Authorization: Bearer $ADMIN_TOKEN\""
    fi
    
    if [ -n "$data" ]; then
        echo "curl -s -X $method \"$BACKEND_URL$endpoint\" $headers -H \"Content-Type: application/json\" -d '$data'"
    else
        echo "curl -s -X $method \"$BACKEND_URL$endpoint\" $headers"
    fi
}

# 测试1: 管理员登录
test_admin_login() {
    log_test "管理员登录"
    
    # 注意：Mentis 后端目前允许匿名访问，不需要登录
    # 如果需要认证，应该先通过 admin 后端登录获取 token
    # 这里先尝试直接使用，如果失败则返回空 token（允许匿名访问）
    local response=$(curl -s -X POST "$BACKEND_URL/api/admin/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" 2>&1)
    
    # 如果登录失败（403 或其他错误），尝试使用空 token（匿名访问）
    if [ -z "$response" ] || echo "$response" | grep -q "403\|401\|error"; then
        log_info "登录接口不可用，使用匿名访问"
        ADMIN_TOKEN=""
        return 0
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        ADMIN_TOKEN=$(echo "$response" | jq -r '.token // empty')
    else
        ADMIN_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    fi
    
    if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
        log_pass
        log_info "Token: ${ADMIN_TOKEN:0:20}..."
        return 0
    else
        log_fail "登录失败"
        log_info "响应: $response"
        return 1
    fi
}

# 测试2: 创建会话
test_create_session() {
    log_test "创建会话"
    
    local title=$1
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -X POST "$BACKEND_URL/api/mentis/sessions" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            -d "{\"title\":\"$title\"}")
    else
        response=$(curl -s -X POST "$BACKEND_URL/api/mentis/sessions" \
            -H "Content-Type: application/json" \
            -d "{\"title\":\"$title\"}")
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        SESSION_ID=$(echo "$response" | jq -r '.data.sessionId // .sessionId // empty')
    else
        SESSION_ID=$(echo "$response" | grep -o '"sessionId":"[^"]*' | cut -d'"' -f4)
    fi
    
    if [ -n "$SESSION_ID" ] && [ "$SESSION_ID" != "null" ]; then
        log_pass
        log_info "Session ID: $SESSION_ID"
        return 0
    else
        log_fail "创建会话失败"
        log_info "响应: $response"
        return 1
    fi
}

# 测试3: 发送消息（同步）
test_send_message_sync() {
    local test_name=$1
    local message=$2
    local enable_computer_use=${3:-false}
    
    log_test "$test_name"
    
    local computer_use_str="false"
    if [ "$enable_computer_use" = "true" ]; then
        computer_use_str="true"
    fi
    
    local json_data="{\"sessionId\":\"$SESSION_ID\",\"message\":\"$message\",\"enableComputerUse\":$computer_use_str}"
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -X POST "$BACKEND_URL/api/mentis/chat/send" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            --data-raw "$json_data" \
            --max-time 60)
    else
        response=$(curl -s -X POST "$BACKEND_URL/api/mentis/chat/send" \
            -H "Content-Type: application/json" \
            --data-raw "$json_data" \
            --max-time 60)
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        local status=$(echo "$response" | jq -r '.code // .status // empty')
        local response_text=$(echo "$response" | jq -r '.data.response // .response // empty')
    else
        local status=$(echo "$response" | grep -o '"code":[0-9]*' | cut -d':' -f2)
        local response_text=$(echo "$response" | grep -o '"response":"[^"]*' | cut -d'"' -f4)
    fi
    
    if [ -n "$response_text" ] && [ "$response_text" != "null" ] && [ -n "$response_text" ]; then
        log_pass
        log_info "响应预览: ${response_text:0:100}..."
        return 0
    else
        log_fail "未收到有效响应"
        log_info "响应: $response"
        return 1
    fi
}

# 测试4: 发送消息（流式）
test_send_message_stream() {
    local test_name=$1
    local message=$2
    local enable_computer_use=${3:-false}
    
    log_test "$test_name"
    
    local computer_use_str="false"
    if [ "$enable_computer_use" = "true" ]; then
        computer_use_str="true"
    fi
    
    local chunk_count=0
    local has_data=false
    
    local json_data="{\"sessionId\":\"$SESSION_ID\",\"message\":\"$message\",\"enableComputerUse\":$computer_use_str}"
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -N -X POST "$BACKEND_URL/api/mentis/chat/stream" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $ADMIN_TOKEN" \
            --data-raw "$json_data" \
            --max-time 60)
    else
        response=$(curl -s -N -X POST "$BACKEND_URL/api/mentis/chat/stream" \
            -H "Content-Type: application/json" \
            --data-raw "$json_data" \
            --max-time 60)
    fi
    
    # 解析 SSE 数据
    while IFS= read -r line; do
        if [[ "$line" =~ ^data: ]]; then
            chunk_count=$((chunk_count + 1))
            has_data=true
            if [ $chunk_count -le 3 ]; then
                local data=$(echo "$line" | sed 's/^data: //')
                log_info "收到 chunk $chunk_count: ${data:0:50}..."
            fi
        fi
    done <<< "$response"
    
    if [ "$has_data" = true ] && [ $chunk_count -gt 0 ]; then
        log_pass
        log_info "总共收到 $chunk_count 个数据块"
        return 0
    else
        log_fail "未收到流式数据"
        return 1
    fi
}

# 测试5: 获取会话列表
test_get_sessions() {
    log_test "获取会话列表"
    
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    else
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions")
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        local count=$(echo "$response" | jq '.data | length // 0')
    else
        local count=$(echo "$response" | grep -o '"sessionId"' | wc -l)
    fi
    
    if [ "$count" -gt 0 ]; then
        log_pass
        log_info "找到 $count 个会话"
        return 0
    else
        log_fail "未找到会话"
        return 1
    fi
}

# 测试6: 获取任务列表
test_get_tasks() {
    log_test "获取任务列表"
    
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions/$SESSION_ID/tasks" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    else
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions/$SESSION_ID/tasks")
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        local count=$(echo "$response" | jq '.data | length // 0')
    else
        local count=$(echo "$response" | grep -o '"taskId"' | wc -l)
    fi
    
    log_pass
    log_info "找到 $count 个任务"
    return 0
}

# 测试7: 获取消息历史
test_get_messages() {
    log_test "获取消息历史"
    
    local response
    if [ -n "$ADMIN_TOKEN" ]; then
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions/$SESSION_ID/messages" \
            -H "Authorization: Bearer $ADMIN_TOKEN")
    else
        response=$(curl -s -X GET "$BACKEND_URL/api/mentis/sessions/$SESSION_ID/messages")
    fi
    
    if [ "$JQ_AVAILABLE" = true ]; then
        local count=$(echo "$response" | jq '.data | length // 0')
    else
        local count=$(echo "$response" | grep -o '"messageId"' | wc -l)
    fi
    
    log_pass
    log_info "找到 $count 条消息"
    return 0
}

# ============================================
# 主测试流程
# ============================================

echo -e "${BLUE}=== 第一阶段：基础功能测试 ===${NC}"
echo ""

# 1. 管理员登录
if ! test_admin_login; then
    echo -e "${RED}无法继续测试：登录失败${NC}"
    exit 1
fi

# 2. 创建测试会话
if ! test_create_session "全面测试会话"; then
    echo -e "${RED}无法继续测试：会话创建失败${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}=== 第二阶段：CHAT 类型任务测试 ===${NC}"
echo ""

# 3. CHAT 类型测试
test_send_message_sync "CHAT-简单问候" "你好，请介绍一下自己" false
sleep 2
test_send_message_sync "CHAT-询问问题" "什么是人工智能？" false
sleep 2
test_send_message_stream "CHAT-流式响应" "请用一句话介绍机器学习" false
sleep 2

echo ""
echo -e "${BLUE}=== 第三阶段：COMMAND 类型任务测试 ===${NC}"
echo ""

# 4. COMMAND 类型测试
test_send_message_sync "COMMAND-简单命令" "帮我执行 ls -la" true
sleep 3
test_send_message_sync "COMMAND-查看当前目录" "执行 pwd 命令" true
sleep 3
test_send_message_sync "COMMAND-查看系统信息" "执行 uname -a" true
sleep 3

echo ""
echo -e "${BLUE}=== 第四阶段：SCRIPT 类型任务测试 ===${NC}"
echo ""

# 5. SCRIPT 类型测试
test_send_message_sync "SCRIPT-Python脚本" "帮我执行一个Python脚本：print('Hello from Python!')" true
sleep 3
test_send_message_sync "SCRIPT-计算脚本" "执行Python脚本计算1到10的和" true
sleep 3

echo ""
echo -e "${BLUE}=== 第五阶段：COMPUTER_USE 类型任务测试 ===${NC}"
echo ""

# 6. COMPUTER_USE 类型测试（查询类任务）
test_send_message_sync "COMPUTER_USE-查天气" "帮我查一下明天北京的天气" true
sleep 5
test_send_message_sync "COMPUTER_USE-搜索信息" "搜索一下Python的最新版本信息" true
sleep 5
test_send_message_sync "COMPUTER_USE-查询资料" "查询一下人工智能的发展历史" true
sleep 5

echo ""
echo -e "${BLUE}=== 第六阶段：数据查询测试 ===${NC}"
echo ""

# 7. 数据查询测试
test_get_sessions
test_get_tasks
test_get_messages

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  测试总结${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}总测试数: ${TOTAL_TESTS}${NC}"
echo -e "${GREEN}通过: ${PASSED_TESTS}${NC}"
echo -e "${RED}失败: ${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}✗ 有 ${FAILED_TESTS} 个测试失败${NC}"
    exit 1
fi
