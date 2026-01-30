#!/bin/bash

# DevOps 工作台 API 全面测试脚本
# 测试所有 DevOps 工作台相关的 API 端点（包括脚本执行、定时任务、部署流程）

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 配置
BASE_URL="${1:-http://localhost:8085}"
ADMIN_USERNAME="${2:-admin}"
ADMIN_PASSWORD="${3:-admin123}"

API_BASE="${BASE_URL}/api/admin"
AUTH_TOKEN=""
SCRIPT_ID=""
EXECUTION_ID=""
PIPELINE_ID=""
TASK_ID=""

# 统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 打印测试标题
print_test() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 测试: $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# 打印成功
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
}

# 打印失败
print_failure() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
}

# 打印信息
print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# 执行 HTTP 请求
http_request() {
    local method=$1
    local url=$2
    local data=$3
    local expected_status=$4
    
    ((TOTAL_TESTS++))
    
    local response
    local status_code
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            -d "$data" \
            "$url" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$url" 2>/dev/null)
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        print_failure "期望状态码: $expected_status, 实际: $status_code"
        echo "响应: $body" | head -c 500
        return 1
    fi
}

# ==================== 认证测试 ====================

test_admin_login() {
    print_test "管理员登录"
    
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "${API_BASE}/auth/login" 2>/dev/null)
    
    AUTH_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$AUTH_TOKEN" ]; then
        print_success "登录成功"
        print_info "Token: ${AUTH_TOKEN:0:30}..."
        return 0
    else
        print_failure "登录失败"
        echo "响应: $response"
        exit 1
    fi
}

# ==================== 脚本管理 API 测试 ====================

test_get_all_scripts() {
    print_test "获取所有脚本列表"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scripts" "" "200")
    
    if [ $? -eq 0 ]; then
        local count=$(echo "$response" | grep -o '"id"' | wc -l)
        print_success "获取脚本列表成功，共 $count 个脚本"
        
        # 提取第一个脚本 ID
        SCRIPT_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        if [ -n "$SCRIPT_ID" ]; then
            print_info "使用脚本 ID: $SCRIPT_ID 进行后续测试"
        fi
        return 0
    else
        return 1
    fi
}

test_get_scripts_by_category() {
    print_test "根据分类获取脚本 (scan)"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scripts?category=scan" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取扫描类脚本成功"
        return 0
    else
        return 1
    fi
}

test_get_script_detail() {
    print_test "获取脚本详情"
    
    if [ -z "$SCRIPT_ID" ]; then
        print_info "跳过：没有可用的脚本 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scripts/$SCRIPT_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        local name=$(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
        print_success "获取脚本详情成功: $name"
        return 0
    else
        return 1
    fi
}

test_execute_script() {
    print_test "执行脚本"
    
    if [ -z "$SCRIPT_ID" ]; then
        print_info "跳过：没有可用的脚本 ID"
        return 0
    fi
    
    local execute_data='{"parameters": {}}'
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/scripts/$SCRIPT_ID/execute" "$execute_data" "200")
    
    if [ $? -eq 0 ]; then
        EXECUTION_ID=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        if [ -n "$EXECUTION_ID" ]; then
            print_success "脚本执行已启动 (执行ID: $EXECUTION_ID)"
            print_info "等待 2 秒后查询执行状态..."
            sleep 2
            return 0
        else
            print_failure "执行成功但未返回执行 ID"
            return 1
        fi
    else
        return 1
    fi
}

test_get_script_execution_status() {
    print_test "获取脚本执行状态"
    
    if [ -z "$EXECUTION_ID" ]; then
        print_info "跳过：没有执行 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/executions/$EXECUTION_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        local status=$(echo "$response" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        print_success "获取执行状态成功 (状态: $status)"
        return 0
    else
        return 1
    fi
}

test_get_script_execution_detail() {
    print_test "获取脚本执行详情"
    
    if [ -z "$EXECUTION_ID" ]; then
        print_info "跳过：没有执行 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/executions/$EXECUTION_ID/detail" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取执行详情成功"
        return 0
    else
        return 1
    fi
}

test_get_script_execution_history() {
    print_test "获取脚本执行历史"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/executions?page=0&size=10" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取执行历史成功"
        return 0
    else
        return 1
    fi
}

test_get_statistics() {
    print_test "获取 DevOps 统计信息"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/statistics" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取统计信息成功"
        return 0
    else
        return 1
    fi
}

# ==================== 定时任务 API 测试 ====================

test_get_scheduled_tasks() {
    print_test "获取定时任务列表"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scheduled-tasks" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取定时任务列表成功"
        return 0
    else
        return 1
    fi
}

test_create_scheduled_task() {
    print_test "创建定时任务"
    
    if [ -z "$SCRIPT_ID" ]; then
        print_info "跳过：没有可用的脚本 ID"
        return 0
    fi
    
    local task_data="{
        \"name\": \"测试定时任务\",
        \"scriptId\": \"$SCRIPT_ID\",
        \"cronExpression\": \"0 0 2 * * ?\",
        \"enabled\": false,
        \"parameters\": {}
    }"
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/scheduled-tasks" "$task_data" "200")
    
    if [ $? -eq 0 ]; then
        TASK_ID=$(echo "$response" | grep -o '"id":[0-9]*' | cut -d':' -f2)
        if [ -n "$TASK_ID" ]; then
            print_success "创建定时任务成功 (ID: $TASK_ID)"
            return 0
        else
            print_failure "创建成功但未返回 ID"
            return 1
        fi
    else
        return 1
    fi
}

test_update_scheduled_task() {
    print_test "更新定时任务"
    
    if [ -z "$TASK_ID" ]; then
        print_info "跳过：没有可用的任务 ID"
        return 0
    fi
    
    local update_data="{
        \"name\": \"更新后的测试定时任务\",
        \"cronExpression\": \"0 0 3 * * ?\",
        \"enabled\": false
    }"
    
    local response
    response=$(http_request "PUT" "${API_BASE}/devops/scheduled-tasks/$TASK_ID" "$update_data" "200")
    
    if [ $? -eq 0 ]; then
        print_success "更新定时任务成功"
        return 0
    else
        return 1
    fi
}

test_get_scheduled_task_detail() {
    print_test "获取定时任务详情"
    
    if [ -z "$TASK_ID" ]; then
        print_info "跳过：没有可用的任务 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scheduled-tasks/$TASK_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取定时任务详情成功"
        return 0
    else
        return 1
    fi
}

test_enable_scheduled_task() {
    print_test "启用定时任务"
    
    if [ -z "$TASK_ID" ]; then
        print_info "跳过：没有可用的任务 ID"
        return 0
    fi
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/scheduled-tasks/$TASK_ID/enable" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "启用定时任务成功"
        return 0
    else
        return 1
    fi
}

test_disable_scheduled_task() {
    print_test "禁用定时任务"
    
    if [ -z "$TASK_ID" ]; then
        print_info "跳过：没有可用的任务 ID"
        return 0
    fi
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/scheduled-tasks/$TASK_ID/disable" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "禁用定时任务成功"
        return 0
    else
        return 1
    fi
}

test_delete_scheduled_task() {
    print_test "删除定时任务"
    
    if [ -z "$TASK_ID" ]; then
        print_info "跳过：没有可用的任务 ID"
        return 0
    fi
    
    local response
    response=$(http_request "DELETE" "${API_BASE}/devops/scheduled-tasks/$TASK_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "删除定时任务成功"
        TASK_ID=""
        return 0
    else
        return 1
    fi
}

# ==================== 部署流程 API 测试 ====================

test_get_all_pipelines() {
    print_test "获取所有流程模板"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines" "" "200")
    
    if [ $? -eq 0 ]; then
        local count=$(echo "$response" | grep -o '"id"' | wc -l)
        print_success "获取流程模板成功，共 $count 个模板"
        
        # 提取第一个流程模板 ID
        PIPELINE_ID=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$PIPELINE_ID" ]; then
            print_info "使用流程模板 ID: $PIPELINE_ID 进行后续测试"
        fi
        return 0
    else
        return 1
    fi
}

test_get_pipeline_detail() {
    print_test "获取流程模板详情"
    
    if [ -z "$PIPELINE_ID" ]; then
        print_info "跳过：没有可用的流程模板 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/$PIPELINE_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        local name=$(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)
        print_success "获取流程模板详情成功: $name"
        return 0
    else
        return 1
    fi
}

test_execute_pipeline() {
    print_test "执行流程"
    
    if [ -z "$PIPELINE_ID" ]; then
        print_info "跳过：没有可用的流程模板 ID"
        return 0
    fi
    
    local execute_data='{"parameters": {}, "skipSteps": []}'
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/pipelines/$PIPELINE_ID/execute" "$execute_data" "200")
    
    if [ $? -eq 0 ]; then
        local pipeline_execution_id=$(echo "$response" | grep -o '"executionId":[0-9]*' | cut -d':' -f2)
        if [ -n "$pipeline_execution_id" ]; then
            print_success "流程执行已启动 (执行ID: $pipeline_execution_id)"
            print_info "等待 3 秒后查询执行状态..."
            sleep 3
            return 0
        else
            print_failure "执行成功但未返回执行 ID"
            return 1
        fi
    else
        return 1
    fi
}

test_get_pipeline_execution_status() {
    print_test "获取流程执行状态"
    
    # 先获取一个执行 ID
    local history
    history=$(http_request "GET" "${API_BASE}/devops/pipelines/executions?page=0&size=1" "" "200")
    
    if [ $? -eq 0 ]; then
        local execution_id=$(echo "$history" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$execution_id" ]; then
            local response
            response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions/$execution_id" "" "200")
            
            if [ $? -eq 0 ]; then
                local status=$(echo "$response" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
                print_success "获取流程执行状态成功 (状态: $status)"
                return 0
            fi
        else
            print_info "没有可用的执行记录"
            return 0
        fi
    else
        return 1
    fi
}

test_get_pipeline_execution_history() {
    print_test "获取流程执行历史"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions?page=0&size=10" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取流程执行历史成功"
        return 0
    else
        return 1
    fi
}

# ==================== 错误处理测试 ====================

test_error_handling() {
    print_test "测试错误处理"
    
    # 测试无效 token
    local old_token=$AUTH_TOKEN
    AUTH_TOKEN="invalid_token_12345"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/scripts" "" "500")
    AUTH_TOKEN=$old_token
    
    if [ $? -eq 0 ]; then
        print_success "错误处理测试通过（无效 token）"
    fi
    
    # 测试不存在的资源
    response=$(http_request "GET" "${API_BASE}/devops/scripts/non_existent_script" "" "404")
    if [ $? -eq 0 ]; then
        print_success "错误处理测试通过（不存在的脚本）"
    fi
}

# ==================== 打印测试总结 ====================

print_summary() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📊 测试总结${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "总测试数: ${BLUE}$TOTAL_TESTS${NC}"
    echo -e "${GREEN}✅ 通过: $PASSED_TESTS${NC}"
    echo -e "${RED}❌ 失败: $FAILED_TESTS${NC}"
    
    local success_rate=$(echo "scale=1; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)
    echo -e "成功率: ${BLUE}${success_rate}%${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 所有测试通过！${NC}"
        exit 0
    else
        echo -e "\n${YELLOW}⚠️  有 $FAILED_TESTS 个测试失败${NC}"
        exit 1
    fi
}

# ==================== 主函数 ====================

main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════╗"
    echo "║   DevOps 工作台 API 全面测试                  ║"
    echo "╚════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo "Base URL: $BASE_URL"
    echo "Username: $ADMIN_USERNAME"
    echo ""
    
    # 认证
    test_admin_login || exit 1
    
    # 脚本管理 API
    echo -e "\n${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}脚本管理 API 测试${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    test_get_all_scripts
    test_get_scripts_by_category
    test_get_script_detail
    test_execute_script
    test_get_script_execution_status
    test_get_script_execution_detail
    test_get_script_execution_history
    test_get_statistics
    test_download_log
    test_cancel_script_execution
    
    # 定时任务 API
    echo -e "\n${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}定时任务 API 测试${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    test_get_scheduled_tasks
    test_create_scheduled_task
    test_get_scheduled_task_detail
    test_update_scheduled_task
    test_enable_scheduled_task
    test_disable_scheduled_task
    test_delete_scheduled_task
    
    # 部署流程 API
    echo -e "\n${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}部署流程 API 测试${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    test_get_all_pipelines
    test_get_pipeline_detail
    test_execute_pipeline
    test_get_pipeline_execution_status
    test_get_pipeline_execution_history
    
    # 错误处理
    echo -e "\n${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${YELLOW}错误处理测试${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    test_error_handling
    
    # 打印总结
    print_summary
}

# 运行主函数
main
