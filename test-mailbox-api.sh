#!/bin/bash

# 邮箱API全面测试脚本
# 测试用户：
# 1. tongyexin / 123456
# 2. ty1 / Tyx@1234
# 3. heartsphere / Tyx@1234

set -e

API_BASE="http://localhost:8081/api"
DB_HOST="localhost"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 测试结果存储
declare -A TEST_RESULTS
TEST_COUNT=0
PASS_COUNT=0
FAIL_COUNT=0

# 记录测试结果
record_test() {
    local test_name=$1
    local result=$2
    TEST_COUNT=$((TEST_COUNT + 1))
    TEST_RESULTS[$test_name]=$result
    if [ "$result" == "PASS" ]; then
        PASS_COUNT=$((PASS_COUNT + 1))
        log_success "$test_name"
    else
        FAIL_COUNT=$((FAIL_COUNT + 1))
        log_error "$test_name"
    fi
}

# 登录获取token
login() {
    local username=$1
    local password=$2
    log_info "登录用户: $username"
    
    local response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    local token=$(echo $response | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$token" ]; then
        log_error "登录失败: $username"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 1
    fi
    
    log_success "登录成功: $username (token: ${token:0:20}...)"
    echo "$token"
}

# 查询数据库
query_db() {
    local query=$1
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -e "$query" -N 2>/dev/null
}

# 获取用户ID
get_user_id() {
    local username=$1
    query_db "SELECT id FROM users WHERE username='$username' LIMIT 1"
}

# 测试API调用并验证数据库
test_api_and_db() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local token=$4
    local data=$5
    local db_check=$6
    local expected_status=${7:-200}
    
    log_info "测试: $test_name"
    log_info "请求: $method $endpoint"
    
    # 执行API调用
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json")
    elif [ "$method" == "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" == "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X PUT "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" == "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    # 检查HTTP状态码
    if [ "$http_code" != "$expected_status" ]; then
        log_error "HTTP状态码不匹配: 期望 $expected_status, 实际 $http_code"
        echo "响应体: $body" | jq '.' 2>/dev/null || echo "响应体: $body"
        record_test "$test_name" "FAIL"
        return 1
    fi
    
    log_success "HTTP状态码: $http_code"
    
    # 验证数据库（如果提供了验证查询）
    if [ -n "$db_check" ]; then
        log_info "验证数据库..."
        db_result=$(eval "$db_check")
        if [ $? -eq 0 ]; then
            log_success "数据库验证通过"
            record_test "$test_name" "PASS"
        else
            log_error "数据库验证失败"
            record_test "$test_name" "FAIL"
            return 1
        fi
    else
        record_test "$test_name" "PASS"
    fi
    
    # 返回响应体（用于后续测试）
    echo "$body"
}

# 打印测试摘要
print_summary() {
    echo ""
    echo "=========================================="
    echo "测试摘要"
    echo "=========================================="
    echo "总测试数: $TEST_COUNT"
    echo -e "${GREEN}通过: $PASS_COUNT${NC}"
    echo -e "${RED}失败: $FAIL_COUNT${NC}"
    echo ""
    
    if [ $FAIL_COUNT -gt 0 ]; then
        echo "失败的测试:"
        for test_name in "${!TEST_RESULTS[@]}"; do
            if [ "${TEST_RESULTS[$test_name]}" == "FAIL" ]; then
                echo -e "  ${RED}✗${NC} $test_name"
            fi
        done
    fi
    echo "=========================================="
}

# 主测试流程
main() {
    echo "=========================================="
    echo "邮箱API全面测试"
    echo "=========================================="
    echo ""
    
    # 阶段1: 登录并获取token
    log_info "阶段1: 用户登录"
    echo "----------------------------------------"
    
    TOKEN1=$(login "tongyexin" "123456")
    USER_ID1=$(get_user_id "tongyexin")
    log_info "用户1 ID: $USER_ID1"
    
    TOKEN2=$(login "ty1" "Tyx@1234")
    USER_ID2=$(get_user_id "ty1")
    log_info "用户2 ID: $USER_ID2"
    
    TOKEN3=$(login "heartsphere" "Tyx@1234")
    USER_ID3=$(get_user_id "heartsphere")
    log_info "用户3 ID: $USER_ID3"
    
    echo ""
    echo "按Enter继续阶段2测试..."
    read
    
    # 阶段2: 测试创建消息
    log_info "阶段2: 测试创建消息API"
    echo "----------------------------------------"
    
    # 用户1创建消息
    create_data1='{
        "senderType": "user",
        "senderId": '$USER_ID1',
        "senderName": "tongyexin",
        "messageType": "text",
        "messageCategory": "user_message",
        "title": "测试消息1",
        "content": "这是用户1创建的测试消息",
        "isRead": false,
        "isImportant": false,
        "isStarred": false
    }'
    
    response1=$(test_api_and_db \
        "用户1创建消息" \
        "POST" \
        "/mailbox/messages" \
        "$TOKEN1" \
        "$create_data1" \
        "query_db \"SELECT COUNT(*) FROM mailbox_messages WHERE receiver_id=$USER_ID1 AND title='测试消息1'\" | grep -q '1'")
    
    MESSAGE_ID1=$(echo "$response1" | jq -r '.id' 2>/dev/null || echo "")
    log_info "创建的消息ID: $MESSAGE_ID1"
    
    echo ""
    print_summary
}

# 执行主函数
main "$@"
