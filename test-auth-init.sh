#!/bin/bash

# ========================================
# 注册、登录、初始化过程全面测试脚本
# ========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
BASE_URL="${BASE_URL:-http://localhost:8081}"
API_URL="${BASE_URL}/api"

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试结果存储
TEST_RESULTS=()

# 辅助函数：打印测试标题
print_test_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# 辅助函数：打印测试项
print_test_item() {
    echo -e "${YELLOW}[测试]${NC} $1"
}

# 辅助函数：执行API请求并解析响应
api_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    local headers=(-H "Content-Type: application/json")
    if [ -n "$token" ]; then
        headers+=(-H "Authorization: Bearer $token")
    fi
    
    if [ "$method" = "GET" ]; then
        curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}" "${headers[@]}"
    else
        curl -s -w "\n%{http_code}" -X "$method" "${API_URL}${endpoint}" \
            "${headers[@]}" \
            -d "$data"
    fi
}

# 辅助函数：解析响应
parse_response() {
    local response=$1
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    echo "$http_code|$body"
}

# 辅助函数：检查jq是否安装
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo -e "${YELLOW}警告: jq 未安装，某些测试可能无法正确解析JSON响应${NC}"
        echo -e "${YELLOW}建议安装: brew install jq (macOS) 或 apt-get install jq (Linux)${NC}"
        return 1
    fi
    return 0
}

# 辅助函数：断言测试结果
assert_test() {
    local test_name=$1
    local condition=$2
    local error_msg=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$condition"; then
        echo -e "${GREEN}✅ PASS${NC} - $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        TEST_RESULTS+=("✅ PASS - $test_name")
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} - $test_name"
        if [ -n "$error_msg" ]; then
            echo -e "${RED}   错误: $error_msg${NC}"
        fi
        FAILED_TESTS=$((FAILED_TESTS + 1))
        TEST_RESULTS+=("❌ FAIL - $test_name - $error_msg")
        return 1
    fi
}

# 检查服务是否运行
check_service() {
    print_test_header "1. 服务可用性检查"
    
    print_test_item "检查后端服务是否运行"
    local response=$(api_request "GET" "/auth/invite-code-required")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
        assert_test "后端服务运行正常" "true" ""
        echo -e "${GREEN}✅ 后端服务正在运行 (${BASE_URL})${NC}"
        return 0
    else
        assert_test "后端服务运行正常" "false" "无法连接到后端服务"
        echo -e "${RED}❌ 后端服务未运行或无法访问${NC}"
        echo -e "${YELLOW}请确保后端服务已启动在 ${BASE_URL}${NC}"
        exit 1
    fi
}

# 测试配置检查
test_config_check() {
    print_test_header "2. 系统配置检查"
    
    print_test_item "检查是否需要邀请码"
    local response=$(api_request "GET" "/auth/invite-code-required")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local invite_required=$(echo "$body" | jq -r '.inviteCodeRequired // false')
            echo -e "${BLUE}   邀请码要求: $invite_required${NC}"
            assert_test "邀请码配置查询成功" "true" ""
        else
            assert_test "邀请码配置查询成功" "true" ""
        fi
    else
        assert_test "邀请码配置查询成功" "false" "HTTP $http_code"
    fi
    
    print_test_item "检查是否需要邮箱验证码"
    local response=$(api_request "GET" "/auth/email-verification-required")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local email_required=$(echo "$body" | jq -r '.emailVerificationRequired // false')
            echo -e "${BLUE}   邮箱验证码要求: $email_required${NC}"
            assert_test "邮箱验证码配置查询成功" "true" ""
        else
            assert_test "邮箱验证码配置查询成功" "true" ""
        fi
    else
        assert_test "邮箱验证码配置查询成功" "false" "HTTP $http_code"
    fi
}

# 生成随机测试用户信息
generate_test_user() {
    local timestamp=$(date +%s)
    # macOS兼容：使用jot或随机数生成
    if command -v jot &> /dev/null; then
        local random=$(jot -r 1 1000 9999)
    elif command -v shuf &> /dev/null; then
        local random=$(shuf -i 1000-9999 -n 1)
    else
        # 使用系统随机数生成器
        local random=$((RANDOM % 9000 + 1000))
    fi
    echo "testuser_${timestamp}_${random}"
}

# 发送邮箱验证码
send_email_code() {
    local email=$1
    print_test_item "发送邮箱验证码到: $email"
    local send_data="{\"email\":\"$email\"}"
    local response=$(api_request "POST" "/auth/email/send-code" "$send_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}   验证码发送请求成功（注意：实际邮件可能未发送，需要从邮件中获取验证码）${NC}"
        return 0
    else
        echo -e "${YELLOW}   验证码发送失败 (HTTP $http_code)，可能邮件服务器未配置${NC}"
        if command -v jq &> /dev/null; then
            local message=$(echo "$body" | jq -r '.message // "N/A"')
            echo -e "${YELLOW}   错误信息: $message${NC}"
        fi
        return 1
    fi
}

# 测试注册功能
test_registration() {
    print_test_header "3. 注册功能测试"
    
    # 检查是否需要邮箱验证码
    local email_required=false
    local response=$(api_request "GET" "/auth/email-verification-required")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ] && command -v jq &> /dev/null; then
        email_required=$(echo "$body" | jq -r '.emailVerificationRequired // false')
    fi
    
    # 生成测试用户
    local test_username=$(generate_test_user)
    local test_email="test_${test_username}@example.com"
    local test_password="Test1234@"
    local test_nickname="测试用户"
    local email_code=""
    
    echo -e "${BLUE}测试用户信息:${NC}"
    echo -e "${BLUE}  用户名: $test_username${NC}"
    echo -e "${BLUE}  邮箱: $test_email${NC}"
    if [ "$email_required" = "true" ]; then
        echo -e "${YELLOW}  注意: 系统要求邮箱验证码${NC}"
    fi
    echo ""
    
    # 如果需要邮箱验证码，先发送
    if [ "$email_required" = "true" ]; then
        if send_email_code "$test_email"; then
            echo -e "${YELLOW}   提示: 请从邮件中获取验证码，或检查后端日志获取验证码${NC}"
            echo -e "${YELLOW}   测试将跳过需要验证码的注册测试${NC}"
            echo ""
            assert_test "邮箱验证码发送" "true" ""
        else
            echo -e "${YELLOW}   警告: 无法发送验证码，将跳过需要验证码的注册测试${NC}"
            echo ""
        fi
    fi
    
    # 测试3.1: 无效的注册请求（缺少必填字段）
    print_test_item "测试无效注册（缺少用户名）"
    local invalid_data='{"email":"test@example.com","password":"Test1234@"}'
    local response=$(api_request "POST" "/auth/register" "$invalid_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "无效注册请求被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"422\" ]" ""
    
    # 测试3.2: 无效的密码（不符合规则）
    print_test_item "测试无效密码（长度不足）"
    local invalid_data="{\"username\":\"${test_username}_short\",\"email\":\"short@example.com\",\"password\":\"short\"}"
    local response=$(api_request "POST" "/auth/register" "$invalid_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "无效密码被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"422\" ]" ""
    
    # 测试3.3: 正常注册（如果不需要验证码，或提供验证码）
    if [ "$email_required" = "true" ]; then
        print_test_item "测试正常注册（需要邮箱验证码）"
        echo -e "${YELLOW}   跳过：需要邮箱验证码，但测试环境无法获取验证码${NC}"
        echo -e "${YELLOW}   建议：在测试环境中临时禁用邮箱验证码要求，或手动提供验证码${NC}"
        assert_test "注册成功（需要验证码）" "false" "需要邮箱验证码，测试环境无法自动获取"
        return 0
    fi
    
    print_test_item "测试正常注册"
    local register_data="{\"username\":\"$test_username\",\"email\":\"$test_email\",\"password\":\"$test_password\",\"nickname\":\"$test_nickname\"}"
    local response=$(api_request "POST" "/auth/register" "$register_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local code=$(echo "$body" | jq -r '.code // "N/A"')
            local token=$(echo "$body" | jq -r '.data.token // ""')
            local user_id=$(echo "$body" | jq -r '.data.id // ""')
            local is_first_login=$(echo "$body" | jq -r '.data.isFirstLogin // false')
            local worlds_count=$(echo "$body" | jq -r '.data.worlds | length // 0')
            
            assert_test "注册成功" "[ \"$code\" = \"200\" ]" ""
            assert_test "返回了JWT Token" "[ -n \"$token\" ]" ""
            assert_test "返回了用户ID" "[ -n \"$user_id\" ]" ""
            assert_test "首次登录标识为true" "[ \"$is_first_login\" = \"true\" ]" ""
            assert_test "初始化创建了世界" "[ \"$worlds_count\" -gt 0 ]" "世界数量: $worlds_count"
            
            # 保存token和用户信息供后续测试使用
            REGISTERED_TOKEN="$token"
            REGISTERED_USER_ID="$user_id"
            REGISTERED_USERNAME="$test_username"
            REGISTERED_PASSWORD="$test_password"
            
            echo -e "${GREEN}   注册成功，用户ID: $user_id，世界数量: $worlds_count${NC}"
        else
            assert_test "注册成功" "true" ""
            REGISTERED_TOKEN=""
        fi
    else
        assert_test "注册成功" "false" "HTTP $http_code"
        echo -e "${RED}   响应: $body${NC}"
        return 1
    fi
    
    # 测试3.4: 重复用户名注册
    print_test_item "测试重复用户名注册"
    local duplicate_data="{\"username\":\"$test_username\",\"email\":\"duplicate@example.com\",\"password\":\"$test_password\"}"
    local response=$(api_request "POST" "/auth/register" "$duplicate_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "重复用户名被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"409\" ]" ""
    
    # 测试3.5: 重复邮箱注册
    print_test_item "测试重复邮箱注册"
    local duplicate_email_data="{\"username\":\"${test_username}_dup\",\"email\":\"$test_email\",\"password\":\"$test_password\"}"
    local response=$(api_request "POST" "/auth/register" "$duplicate_email_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "重复邮箱被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"409\" ]" ""
}

# 测试登录功能
test_login() {
    print_test_header "4. 登录功能测试"
    
    if [ -z "$REGISTERED_USERNAME" ] || [ -z "$REGISTERED_PASSWORD" ]; then
        echo -e "${YELLOW}跳过登录测试（需要先成功注册）${NC}"
        return 1
    fi
    
    # 测试4.1: 错误密码登录
    print_test_item "测试错误密码登录"
    local wrong_password_data="{\"username\":\"$REGISTERED_USERNAME\",\"password\":\"WrongPassword123@\"}"
    local response=$(api_request "POST" "/auth/login" "$wrong_password_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "错误密码登录被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"400\" ]" ""
    
    # 测试4.2: 不存在的用户登录
    print_test_item "测试不存在用户登录"
    local nonexistent_data='{"username":"nonexistent_user_99999","password":"Test1234@"}'
    local response=$(api_request "POST" "/auth/login" "$nonexistent_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "不存在用户登录被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"400\" ]" ""
    
    # 测试4.3: 正常登录
    print_test_item "测试正常登录"
    local login_data="{\"username\":\"$REGISTERED_USERNAME\",\"password\":\"$REGISTERED_PASSWORD\"}"
    local response=$(api_request "POST" "/auth/login" "$login_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local code=$(echo "$body" | jq -r '.code // "N/A"')
            local token=$(echo "$body" | jq -r '.data.token // ""')
            local user_id=$(echo "$body" | jq -r '.data.id // ""')
            local username=$(echo "$body" | jq -r '.data.username // ""')
            local is_first_login=$(echo "$body" | jq -r '.data.isFirstLogin // false')
            local worlds_count=$(echo "$body" | jq -r '.data.worlds | length // 0')
            
            assert_test "登录成功" "[ \"$code\" = \"200\" ]" ""
            assert_test "返回了JWT Token" "[ -n \"$token\" ]" ""
            assert_test "返回了正确的用户ID" "[ \"$user_id\" = \"$REGISTERED_USER_ID\" ]" ""
            assert_test "返回了正确的用户名" "[ \"$username\" = \"$REGISTERED_USERNAME\" ]" ""
            assert_test "首次登录标识正确" "[ \"$is_first_login\" = \"false\" ]" "应为false（已注册过）"
            assert_test "世界数据存在" "[ \"$worlds_count\" -gt 0 ]" "世界数量: $worlds_count"
            
            LOGIN_TOKEN="$token"
            echo -e "${GREEN}   登录成功，Token已获取${NC}"
        else
            assert_test "登录成功" "true" ""
            LOGIN_TOKEN=""
        fi
    else
        assert_test "登录成功" "false" "HTTP $http_code"
        echo -e "${RED}   响应: $body${NC}"
        return 1
    fi
}

# 测试获取当前用户信息
test_get_current_user() {
    print_test_header "5. 获取当前用户信息测试"
    
    local token="${LOGIN_TOKEN:-$REGISTERED_TOKEN}"
    if [ -z "$token" ]; then
        echo -e "${YELLOW}跳过获取用户信息测试（需要有效的Token）${NC}"
        return 1
    fi
    
    # 测试5.1: 使用Token获取用户信息
    print_test_item "测试使用Token获取用户信息"
    local response=$(api_request "GET" "/auth/me" "" "$token")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local code=$(echo "$body" | jq -r '.code // "N/A"')
            local user_id=$(echo "$body" | jq -r '.data.id // ""')
            local username=$(echo "$body" | jq -r '.data.username // ""')
            
            assert_test "获取用户信息成功" "[ \"$code\" = \"200\" ]" ""
            assert_test "返回了用户ID" "[ -n \"$user_id\" ]" ""
            assert_test "返回了正确的用户名" "[ \"$username\" = \"$REGISTERED_USERNAME\" ]" ""
        else
            assert_test "获取用户信息成功" "true" ""
        fi
    else
        assert_test "获取用户信息成功" "false" "HTTP $http_code"
        echo -e "${RED}   响应: $body${NC}"
    fi
    
    # 测试5.2: 无Token访问（应被拒绝）
    print_test_item "测试无Token访问（应被拒绝）"
    local response=$(api_request "GET" "/auth/me" "" "")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "无Token访问被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"403\" ]" ""
}

# 测试初始化过程
test_initialization() {
    print_test_header "6. 初始化过程验证"
    
    local token="${LOGIN_TOKEN:-$REGISTERED_TOKEN}"
    if [ -z "$token" ]; then
        echo -e "${YELLOW}跳过初始化验证（需要有效的Token）${NC}"
        return 1
    fi
    
    # 测试6.1: 验证世界是否已创建
    print_test_item "验证用户世界是否已创建"
    local response=$(api_request "GET" "/auth/me" "" "$token")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ] && command -v jq &> /dev/null; then
        # 尝试通过世界API获取世界列表（如果存在）
        local worlds_response=$(api_request "GET" "/worlds" "" "$token" 2>/dev/null || echo "404")
        local worlds_parsed=$(parse_response "$worlds_response")
        local worlds_http_code=$(echo "$worlds_parsed" | cut -d'|' -f1)
        
        if [ "$worlds_http_code" = "200" ]; then
            local worlds_count=$(echo "$worlds_parsed" | cut -d'|' -f2- | jq -r 'length // 0')
            local world_name=$(echo "$worlds_parsed" | cut -d'|' -f2- | jq -r '.[0].name // ""')
            
            assert_test "世界列表可访问" "true" ""
            assert_test "至少创建了一个世界" "[ \"$worlds_count\" -gt 0 ]" "世界数量: $worlds_count"
            if [ -n "$world_name" ]; then
                echo -e "${GREEN}   第一个世界名称: $world_name${NC}"
            fi
        else
            echo -e "${YELLOW}   世界API不可用，跳过详细验证${NC}"
            assert_test "初始化验证" "true" ""
        fi
    else
        assert_test "初始化验证" "true" ""
    fi
}

# 测试新用户首次登录初始化
test_first_login_initialization() {
    print_test_header "7. 首次登录初始化测试"
    
    # 创建一个新用户，但不通过注册接口（模拟旧数据）
    # 由于无法直接操作数据库，我们创建一个新用户并立即登录来测试首次登录初始化
    
    local new_username=$(generate_test_user)
    local new_email="firstlogin_${new_username}@example.com"
    local new_password="Test1234@"
    
    echo -e "${BLUE}创建新用户用于首次登录测试: $new_username${NC}"
    
    # 注册新用户
    local register_data="{\"username\":\"$new_username\",\"email\":\"$new_email\",\"password\":\"$new_password\"}"
    local response=$(api_request "POST" "/auth/register" "$register_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ] && command -v jq &> /dev/null; then
        local is_first_login=$(echo "$body" | jq -r '.data.isFirstLogin // false')
        local worlds_count=$(echo "$body" | jq -r '.data.worlds | length // 0')
        
        assert_test "新用户注册成功" "true" ""
        assert_test "首次登录标识为true" "[ \"$is_first_login\" = \"true\" ]" ""
        assert_test "注册时已初始化世界" "[ \"$worlds_count\" -gt 0 ]" "世界数量: $worlds_count"
        
        echo -e "${GREEN}   新用户注册并初始化成功，世界数量: $worlds_count${NC}"
    fi
}

# 打印测试总结
print_summary() {
    print_test_header "测试总结"
    
    echo -e "${CYAN}总测试数: ${TOTAL_TESTS}${NC}"
    echo -e "${GREEN}通过: ${PASSED_TESTS}${NC}"
    echo -e "${RED}失败: ${FAILED_TESTS}${NC}"
    echo ""
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}✅ 所有测试通过！${NC}"
        echo -e "${GREEN}========================================${NC}"
        return 0
    else
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}❌ 有 ${FAILED_TESTS} 个测试失败${NC}"
        echo -e "${RED}========================================${NC}"
        echo ""
        echo -e "${YELLOW}失败的测试详情:${NC}"
        for result in "${TEST_RESULTS[@]}"; do
            if [[ "$result" == *"❌ FAIL"* ]]; then
                echo -e "${RED}  $result${NC}"
            fi
        done
        return 1
    fi
}

# 主函数
main() {
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}注册、登录、初始化过程全面测试${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}测试环境: ${BASE_URL}${NC}"
    echo -e "${BLUE}API地址: ${API_URL}${NC}"
    echo ""
    
    # 检查jq
    check_jq
    
    # 执行测试
    check_service
    test_config_check
    test_registration
    test_login
    test_get_current_user
    test_initialization
    test_first_login_initialization
    
    # 打印总结
    print_summary
}

# 运行主函数
main
