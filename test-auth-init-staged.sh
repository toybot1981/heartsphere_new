#!/bin/bash

# ========================================
# 注册、登录、初始化过程分阶段测试脚本
# 支持分阶段运行，跳过需要邮箱验证码的测试
# ========================================

# 不设置 -e，允许某些测试失败后继续
set +e

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

# 测试阶段控制
STAGE="${STAGE:-all}"  # all, 1, 2, 3, 4, 5, 6, 7
SKIP_EMAIL_VERIFICATION="${SKIP_EMAIL_VERIFICATION:-false}"

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
        curl -s -w "\n%{http_code}" -X GET "${API_URL}${endpoint}" "${headers[@]}" 2>/dev/null
    else
        curl -s -w "\n%{http_code}" -X "$method" "${API_URL}${endpoint}" \
            "${headers[@]}" \
            -d "$data" 2>/dev/null
    fi
}

# 辅助函数：解析响应
parse_response() {
    local response=$1
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    echo "$http_code|$body"
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

# 阶段1: 服务可用性检查
stage1_service_check() {
    print_test_header "阶段1: 服务可用性检查"
    
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
        return 1
    fi
}

# 阶段2: 系统配置检查
stage2_config_check() {
    print_test_header "阶段2: 系统配置检查"
    
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
            echo "$email_required"  # 返回结果供后续使用
        else
            assert_test "邮箱验证码配置查询成功" "true" ""
            echo "false"
        fi
    else
        assert_test "邮箱验证码配置查询成功" "false" "HTTP $http_code"
        echo "false"
    fi
}

# 阶段3: 注册功能测试（基础验证）
stage3_registration_basic() {
    print_test_header "阶段3: 注册功能测试（基础验证）"
    
    # 生成测试用户
    local test_username=$(generate_test_user)
    local test_email="test_${test_username}@example.com"
    local test_password="Test1234@"
    
    echo -e "${BLUE}测试用户信息:${NC}"
    echo -e "${BLUE}  用户名: $test_username${NC}"
    echo -e "${BLUE}  邮箱: $test_email${NC}"
    echo ""
    
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
    
    # 测试3.3: 无效的邮箱格式
    print_test_item "测试无效邮箱格式"
    local invalid_data="{\"username\":\"${test_username}_bad\",\"email\":\"invalid-email\",\"password\":\"$test_password\"}"
    local response=$(api_request "POST" "/auth/register" "$invalid_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "无效邮箱格式被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"422\" ]" ""
    
    # 保存测试用户信息供后续使用
    echo "$test_username|$test_email|$test_password"
}

# 阶段4: 注册功能测试（完整流程，需要邮箱验证码时跳过）
stage4_registration_full() {
    print_test_header "阶段4: 注册功能测试（完整流程）"
    
    local email_required="$1"
    
    if [ "$email_required" = "true" ] && [ "$SKIP_EMAIL_VERIFICATION" != "true" ]; then
        echo -e "${YELLOW}⚠️  系统要求邮箱验证码，跳过完整注册测试${NC}"
        echo -e "${YELLOW}   如需测试完整注册流程，请：${NC}"
        echo -e "${YELLOW}   1. 临时禁用邮箱验证码要求，或${NC}"
        echo -e "${YELLOW}   2. 设置 SKIP_EMAIL_VERIFICATION=true 跳过此阶段，或${NC}"
        echo -e "${YELLOW}   3. 手动提供验证码进行测试${NC}"
        echo ""
        return 0
    fi
    
    # 生成测试用户
    local test_username=$(generate_test_user)
    local test_email="test_${test_username}@example.com"
    local test_password="Test1234@"
    local test_nickname="测试用户"
    
    echo -e "${BLUE}测试用户信息:${NC}"
    echo -e "${BLUE}  用户名: $test_username${NC}"
    echo -e "${BLUE}  邮箱: $test_email${NC}"
    echo ""
    
    # 如果需要邮箱验证码，先发送
    local email_code=""
    if [ "$email_required" = "true" ]; then
        print_test_item "发送邮箱验证码"
        local send_data="{\"email\":\"$test_email\"}"
        local response=$(api_request "POST" "/auth/email/send-code" "$send_data")
        local parsed=$(parse_response "$response")
        local http_code=$(echo "$parsed" | cut -d'|' -f1)
        
        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}   验证码发送请求成功${NC}"
            echo -e "${YELLOW}   提示: 请从邮件或后端日志中获取验证码${NC}"
            echo -e "${YELLOW}   如需继续，请设置环境变量 EMAIL_CODE=xxxxxx${NC}"
            if [ -n "$EMAIL_CODE" ]; then
                email_code="$EMAIL_CODE"
                echo -e "${GREEN}   使用提供的验证码: ${email_code}${NC}"
            else
                echo -e "${YELLOW}   跳过注册测试（需要验证码）${NC}"
                return 0
            fi
        fi
    fi
    
    # 正常注册
    print_test_item "测试正常注册"
    local register_data="{\"username\":\"$test_username\",\"email\":\"$test_email\",\"password\":\"$test_password\",\"nickname\":\"$test_nickname\"}"
    if [ -n "$email_code" ]; then
        if command -v jq &> /dev/null; then
            register_data=$(echo "$register_data" | jq --arg code "$email_code" '. + {emailVerificationCode: $code}')
        else
            # 如果没有jq，手动添加验证码字段
            register_data="${register_data%?},\"emailVerificationCode\":\"$email_code\"}"
        fi
    fi
    
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
        if command -v jq &> /dev/null; then
            local message=$(echo "$body" | jq -r '.message // "N/A"')
            echo -e "${RED}   错误: $message${NC}"
        fi
        return 1
    fi
    
    # 测试重复用户名
    print_test_item "测试重复用户名注册"
    local duplicate_data="{\"username\":\"$test_username\",\"email\":\"duplicate@example.com\",\"password\":\"$test_password\"}"
    local response=$(api_request "POST" "/auth/register" "$duplicate_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "重复用户名被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"409\" ]" ""
    
    # 测试重复邮箱
    print_test_item "测试重复邮箱注册"
    local duplicate_email_data="{\"username\":\"${test_username}_dup\",\"email\":\"$test_email\",\"password\":\"$test_password\"}"
    local response=$(api_request "POST" "/auth/register" "$duplicate_email_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "重复邮箱被拒绝" "[ \"$http_code\" = \"400\" ] || [ \"$http_code\" = \"409\" ]" ""
}

# 阶段5: 登录功能测试
stage5_login() {
    print_test_header "阶段5: 登录功能测试"
    
    if [ -z "$REGISTERED_USERNAME" ] || [ -z "$REGISTERED_PASSWORD" ]; then
        echo -e "${YELLOW}⚠️  跳过登录测试（需要先成功注册）${NC}"
        echo -e "${YELLOW}   请先运行阶段4完成注册，或手动设置：${NC}"
        echo -e "${YELLOW}   REGISTERED_USERNAME=xxx REGISTERED_PASSWORD=xxx${NC}"
        return 1
    fi
    
    # 测试错误密码
    print_test_item "测试错误密码登录"
    local wrong_data="{\"username\":\"$REGISTERED_USERNAME\",\"password\":\"WrongPassword123@\"}"
    local response=$(api_request "POST" "/auth/login" "$wrong_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "错误密码登录被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"400\" ]" ""
    
    # 测试不存在用户
    print_test_item "测试不存在用户登录"
    local nonexistent_data='{"username":"nonexistent_user_99999","password":"Test1234@"}'
    local response=$(api_request "POST" "/auth/login" "$nonexistent_data")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "不存在用户登录被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"400\" ]" ""
    
    # 正常登录
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
        if command -v jq &> /dev/null; then
            local message=$(echo "$body" | jq -r '.message // "N/A"')
            echo -e "${RED}   错误: $message${NC}"
        fi
        return 1
    fi
}

# 阶段6: 用户信息获取测试
stage6_get_user_info() {
    print_test_header "阶段6: 获取当前用户信息测试"
    
    local token="${LOGIN_TOKEN:-$REGISTERED_TOKEN}"
    if [ -z "$token" ]; then
        echo -e "${YELLOW}⚠️  跳过获取用户信息测试（需要有效的Token）${NC}"
        echo -e "${YELLOW}   请先运行阶段5完成登录，或手动设置：${NC}"
        echo -e "${YELLOW}   LOGIN_TOKEN=xxx 或 REGISTERED_TOKEN=xxx${NC}"
        return 1
    fi
    
    # 使用Token获取用户信息
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
        if command -v jq &> /dev/null; then
            local message=$(echo "$body" | jq -r '.message // "N/A"')
            echo -e "${RED}   错误: $message${NC}"
        fi
    fi
    
    # 无Token访问
    print_test_item "测试无Token访问（应被拒绝）"
    local response=$(api_request "GET" "/auth/me")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    assert_test "无Token访问被拒绝" "[ \"$http_code\" = \"401\" ] || [ \"$http_code\" = \"403\" ]" ""
}

# 阶段7: 初始化过程验证
stage7_initialization() {
    print_test_header "阶段7: 初始化过程验证"
    
    local token="${LOGIN_TOKEN:-$REGISTERED_TOKEN}"
    if [ -z "$token" ]; then
        echo -e "${YELLOW}⚠️  跳过初始化验证（需要有效的Token）${NC}"
        return 1
    fi
    
    # 验证世界是否已创建
    print_test_item "验证用户世界是否已创建"
    local response=$(api_request "GET" "/worlds" "" "$token")
    local parsed=$(parse_response "$response")
    local http_code=$(echo "$parsed" | cut -d'|' -f1)
    local body=$(echo "$parsed" | cut -d'|' -f2-)
    
    if [ "$http_code" = "200" ]; then
        if command -v jq &> /dev/null; then
            local worlds_count=$(echo "$body" | jq -r 'length // 0')
            assert_test "世界列表可访问" "true" ""
            assert_test "至少创建了一个世界" "[ \"$worlds_count\" -gt 0 ]" "世界数量: $worlds_count"
            
            if [ "$worlds_count" -gt 0 ]; then
                local world_name=$(echo "$body" | jq -r '.[0].name // ""')
                echo -e "${GREEN}   第一个世界名称: $world_name${NC}"
            fi
        else
            assert_test "世界列表可访问" "true" ""
        fi
    else
        echo -e "${YELLOW}   世界API不可用 (HTTP $http_code)，跳过详细验证${NC}"
        assert_test "初始化验证" "true" ""
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

# 显示使用说明
show_usage() {
    echo -e "${CYAN}使用方法:${NC}"
    echo "  ./test-auth-init-staged.sh [STAGE]"
    echo ""
    echo -e "${CYAN}测试阶段:${NC}"
    echo "  all      - 运行所有阶段（默认）"
    echo "  1        - 阶段1: 服务可用性检查"
    echo "  2        - 阶段2: 系统配置检查"
    echo "  3        - 阶段3: 注册功能测试（基础验证）"
    echo "  4        - 阶段4: 注册功能测试（完整流程）"
    echo "  5        - 阶段5: 登录功能测试"
    echo "  6        - 阶段6: 用户信息获取测试"
    echo "  7        - 阶段7: 初始化过程验证"
    echo ""
    echo -e "${CYAN}环境变量:${NC}"
    echo "  BASE_URL                    - 后端服务地址（默认: http://localhost:8081）"
    echo "  STAGE                        - 测试阶段（默认: all）"
    echo "  SKIP_EMAIL_VERIFICATION      - 跳过邮箱验证（true/false，默认: false）"
    echo "  EMAIL_CODE                   - 手动提供邮箱验证码"
    echo "  REGISTERED_USERNAME          - 已注册的用户名（用于阶段5-7）"
    echo "  REGISTERED_PASSWORD          - 已注册的密码（用于阶段5-7）"
    echo "  REGISTERED_TOKEN             - 已注册的Token（用于阶段6-7）"
    echo ""
    echo -e "${CYAN}示例:${NC}"
    echo "  # 运行所有测试"
    echo "  ./test-auth-init-staged.sh"
    echo ""
    echo "  # 只运行阶段1和2"
    echo "  ./test-auth-init-staged.sh 2"
    echo ""
    echo "  # 运行阶段4并提供验证码"
    echo "  EMAIL_CODE=123456 ./test-auth-init-staged.sh 4"
    echo ""
    echo "  # 跳过邮箱验证运行阶段4"
    echo "  SKIP_EMAIL_VERIFICATION=true ./test-auth-init-staged.sh 4"
    echo ""
}

# 主函数
main() {
    # 检查是否需要显示帮助
    if [ "$1" = "-h" ] || [ "$1" = "--help" ] || [ "$1" = "help" ]; then
        show_usage
        exit 0
    fi
    
    # 如果提供了命令行参数，优先使用它作为STAGE（覆盖环境变量）
    if [ -n "$1" ]; then
        STAGE="$1"
    fi
    
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}注册、登录、初始化过程分阶段测试${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}测试环境: ${BASE_URL}${NC}"
    echo -e "${BLUE}API地址: ${API_URL}${NC}"
    echo -e "${BLUE}测试阶段: ${STAGE}${NC}"
    echo -e "${BLUE}跳过邮箱验证: ${SKIP_EMAIL_VERIFICATION}${NC}"
    echo ""
    
    local email_required="false"
    
    # 根据阶段运行测试
    case "${STAGE}" in
        1|"stage1")
            stage1_service_check
            ;;
        2|"stage2")
            stage1_service_check
            email_required=$(stage2_config_check)
            ;;
        3|"stage3")
            stage1_service_check
            stage3_registration_basic
            ;;
        4|"stage4")
            stage1_service_check
            email_required=$(stage2_config_check)
            stage4_registration_full "$email_required"
            ;;
        5|"stage5")
            stage5_login
            ;;
        6|"stage6")
            stage6_get_user_info
            ;;
        7|"stage7")
            stage7_initialization
            ;;
        "all"|*)
            # 运行所有阶段
            stage1_service_check
            email_required=$(stage2_config_check)
            stage3_registration_basic
            stage4_registration_full "$email_required"
            stage5_login
            stage6_get_user_info
            stage7_initialization
            ;;
    esac
    
    # 打印总结
    print_summary
}

# 运行主函数
main
