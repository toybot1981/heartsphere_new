#!/bin/bash

# DevOps 部署流程 API 全面测试脚本
# 测试所有部署流程相关的 API 端点

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
BASE_URL="${1:-http://localhost:8085}"
ADMIN_USERNAME="${2:-admin}"
ADMIN_PASSWORD="${3:-admin123}"

API_BASE="${BASE_URL}/api/admin"
AUTH_TOKEN=""
PIPELINE_ID=""
EXECUTION_ID=""

# 统计
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 打印测试标题
print_test() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}测试: $1${NC}"
    echo -e "${BLUE}========================================${NC}"
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
            "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Authorization: Bearer $AUTH_TOKEN" \
            "$url")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" = "$expected_status" ]; then
        echo "$body"
        return 0
    else
        print_failure "期望状态码: $expected_status, 实际: $status_code"
        echo "响应: $body"
        return 1
    fi
}

# 测试管理员登录
test_admin_login() {
    print_test "管理员登录"
    
    local response
    response=$(curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}" \
        "${API_BASE}/auth/login")
    
    AUTH_TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$AUTH_TOKEN" ]; then
        print_success "登录成功，获取到 token"
        print_info "Token: ${AUTH_TOKEN:0:20}..."
        return 0
    else
        print_failure "登录失败"
        echo "响应: $response"
        exit 1
    fi
}

# 测试获取所有流程模板
test_get_all_pipelines() {
    print_test "获取所有流程模板"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines" "" "200")
    
    if [ $? -eq 0 ]; then
        local count=$(echo "$response" | grep -o '"id"' | wc -l)
        print_success "获取流程模板成功，共 $count 个模板"
        echo "$response" | head -c 500
        echo "..."
        return 0
    else
        return 1
    fi
}

# 测试根据环境获取流程模板
test_get_pipelines_by_environment() {
    print_test "根据环境获取流程模板 (test)"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines?environment=test" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取测试环境流程模板成功"
        return 0
    else
        return 1
    fi
}

# 测试获取流程模板详情
test_get_pipeline_detail() {
    print_test "获取流程模板详情"
    
    # 先获取一个流程模板 ID
    local pipelines
    pipelines=$(http_request "GET" "${API_BASE}/devops/pipelines" "" "200")
    
    if [ $? -eq 0 ]; then
        PIPELINE_ID=$(echo "$pipelines" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        
        if [ -n "$PIPELINE_ID" ]; then
            local response
            response=$(http_request "GET" "${API_BASE}/devops/pipelines/$PIPELINE_ID" "" "200")
            
            if [ $? -eq 0 ]; then
                print_success "获取流程模板详情成功 (ID: $PIPELINE_ID)"
                print_info "流程名称: $(echo "$response" | grep -o '"name":"[^"]*' | cut -d'"' -f4)"
                return 0
            fi
        else
            print_failure "未找到流程模板 ID"
            return 1
        fi
    else
        return 1
    fi
}

# 测试创建流程模板
test_create_pipeline() {
    print_test "创建流程模板"
    
    local pipeline_data='{
        "name": "测试流程模板",
        "description": "这是一个测试流程模板",
        "environment": "test",
        "isTemplate": true,
        "steps": [
            {
                "name": "测试步骤1",
                "scriptId": "code-scan-eslint",
                "order": 1,
                "required": true,
                "parallel": false,
                "parameters": {
                    "module": ""
                }
            },
            {
                "name": "测试步骤2",
                "scriptId": "test-unit",
                "order": 2,
                "dependsOn": [1],
                "required": true,
                "parallel": false,
                "parameters": {
                    "module": ""
                }
            }
        ]
    }'
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/pipelines" "$pipeline_data" "200")
    
    if [ $? -eq 0 ]; then
        local new_id=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        if [ -n "$new_id" ]; then
            print_success "创建流程模板成功 (ID: $new_id)"
            PIPELINE_ID=$new_id
            return 0
        else
            print_failure "创建成功但未返回 ID"
            return 1
        fi
    else
        return 1
    fi
}

# 测试更新流程模板
test_update_pipeline() {
    print_test "更新流程模板"
    
    if [ -z "$PIPELINE_ID" ]; then
        print_failure "没有可用的流程模板 ID"
        return 1
    fi
    
    local update_data="{
        \"name\": \"更新后的测试流程模板\",
        \"description\": \"这是更新后的描述\",
        \"environment\": \"test\",
        \"isTemplate\": true,
        \"steps\": [
            {
                \"name\": \"更新后的步骤1\",
                \"scriptId\": \"code-scan-eslint\",
                \"order\": 1,
                \"required\": true,
                \"parallel\": false
            }
        ]
    }"
    
    local response
    response=$(http_request "PUT" "${API_BASE}/devops/pipelines/$PIPELINE_ID" "$update_data" "200")
    
    if [ $? -eq 0 ]; then
        print_success "更新流程模板成功"
        return 0
    else
        return 1
    fi
}

# 测试执行流程
test_execute_pipeline() {
    print_test "执行流程"
    
    if [ -z "$PIPELINE_ID" ]; then
        print_failure "没有可用的流程模板 ID"
        return 1
    fi
    
    local execute_data='{
        "parameters": {},
        "skipSteps": []
    }'
    
    local response
    response=$(http_request "POST" "${API_BASE}/devops/pipelines/$PIPELINE_ID/execute" "$execute_data" "200")
    
    if [ $? -eq 0 ]; then
        EXECUTION_ID=$(echo "$response" | grep -o '"executionId":[0-9]*' | cut -d':' -f2)
        if [ -n "$EXECUTION_ID" ]; then
            print_success "流程执行已启动 (执行ID: $EXECUTION_ID)"
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

# 测试获取流程执行状态
test_get_execution_status() {
    print_test "获取流程执行状态"
    
    if [ -z "$EXECUTION_ID" ]; then
        print_info "跳过：没有执行 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions/$EXECUTION_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        local status=$(echo "$response" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        print_success "获取执行状态成功 (状态: $status)"
        print_info "执行详情: $(echo "$response" | head -c 300)..."
        return 0
    else
        return 1
    fi
}

# 测试获取流程执行详情
test_get_execution_detail() {
    print_test "获取流程执行详情"
    
    if [ -z "$EXECUTION_ID" ]; then
        print_info "跳过：没有执行 ID"
        return 0
    fi
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions/$EXECUTION_ID/detail" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取执行详情成功"
        local total_steps=$(echo "$response" | grep -o '"totalSteps":[0-9]*' | cut -d':' -f2)
        local completed_steps=$(echo "$response" | grep -o '"completedSteps":[0-9]*' | cut -d':' -f2)
        print_info "总步骤数: $total_steps, 已完成: $completed_steps"
        return 0
    else
        return 1
    fi
}

# 测试获取流程执行历史
test_get_execution_history() {
    print_test "获取流程执行历史"
    
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions?page=0&size=10" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "获取执行历史成功"
        return 0
    else
        return 1
    fi
}

# 测试取消流程执行
test_cancel_execution() {
    print_test "取消流程执行"
    
    if [ -z "$EXECUTION_ID" ]; then
        print_info "跳过：没有执行 ID"
        return 0
    fi
    
    # 先检查执行状态
    local status_response
    status_response=$(http_request "GET" "${API_BASE}/devops/pipelines/executions/$EXECUTION_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        local status=$(echo "$status_response" | grep -o '"status":"[^"]*' | cut -d'"' -f4)
        
        if [ "$status" = "RUNNING" ]; then
            local response
            response=$(http_request "POST" "${API_BASE}/devops/pipelines/executions/$EXECUTION_ID/cancel" "" "200")
            
            if [ $? -eq 0 ]; then
                print_success "取消执行成功"
                return 0
            else
                return 1
            fi
        else
            print_info "执行已完成或已取消，跳过取消测试"
            return 0
        fi
    else
        return 1
    fi
}

# 测试删除流程模板
test_delete_pipeline() {
    print_test "删除流程模板"
    
    if [ -z "$PIPELINE_ID" ]; then
        print_failure "没有可用的流程模板 ID"
        return 1
    fi
    
    local response
    response=$(http_request "DELETE" "${API_BASE}/devops/pipelines/$PIPELINE_ID" "" "200")
    
    if [ $? -eq 0 ]; then
        print_success "删除流程模板成功"
        PIPELINE_ID=""
        return 0
    else
        return 1
    fi
}

# 测试 DevOps 工作台脚本相关 API
test_devops_scripts() {
    print_test "测试 DevOps 工作台脚本 API"
    
    # 获取脚本列表
    local scripts
    scripts=$(http_request "GET" "${API_BASE}/devops/scripts" "" "200")
    
    if [ $? -eq 0 ]; then
        local count=$(echo "$scripts" | grep -o '"id"' | wc -l)
        print_success "获取脚本列表成功，共 $count 个脚本"
        
        # 获取脚本详情
        local script_id=$(echo "$scripts" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
        if [ -n "$script_id" ]; then
            local script_detail
            script_detail=$(http_request "GET" "${API_BASE}/devops/scripts/$script_id" "" "200")
            
            if [ $? -eq 0 ]; then
                print_success "获取脚本详情成功 (ID: $script_id)"
            fi
        fi
    fi
}

# 测试错误处理
test_error_handling() {
    print_test "测试错误处理"
    
    # 测试不存在的流程模板
    local response
    response=$(http_request "GET" "${API_BASE}/devops/pipelines/99999" "" "500")
    
    if [ $? -eq 0 ]; then
        print_success "错误处理测试通过（不存在的流程模板）"
    else
        # 如果返回 404 也是可以的
        response=$(http_request "GET" "${API_BASE}/devops/pipelines/99999" "" "404")
        if [ $? -eq 0 ]; then
            print_success "错误处理测试通过（返回 404）"
        fi
    fi
    
    # 测试无效的 token
    local old_token=$AUTH_TOKEN
    AUTH_TOKEN="invalid_token"
    response=$(http_request "GET" "${API_BASE}/devops/pipelines" "" "500")
    AUTH_TOKEN=$old_token
    
    if [ $? -eq 0 ]; then
        print_success "错误处理测试通过（无效 token）"
    fi
}

# 打印测试总结
print_summary() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}测试总结${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "总测试数: $TOTAL_TESTS"
    echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
    echo -e "${RED}失败: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 所有测试通过！${NC}"
        exit 0
    else
        echo -e "\n${RED}⚠️  有 $FAILED_TESTS 个测试失败${NC}"
        exit 1
    fi
}

# 主函数
main() {
    echo -e "${BLUE}"
    echo "=========================================="
    echo "  DevOps 部署流程 API 全面测试"
    echo "=========================================="
    echo -e "${NC}"
    echo "Base URL: $BASE_URL"
    echo "Username: $ADMIN_USERNAME"
    echo ""
    
    # 执行测试
    test_admin_login || exit 1
    
    # 流程模板测试
    test_get_all_pipelines
    test_get_pipelines_by_environment
    test_get_pipeline_detail
    
    # 创建和更新测试（使用新创建的模板）
    test_create_pipeline
    test_update_pipeline
    
    # 执行测试
    test_execute_pipeline
    test_get_execution_status
    test_get_execution_detail
    test_get_execution_history
    
    # 取消测试（如果执行还在运行）
    test_cancel_execution
    
    # 清理测试
    test_delete_pipeline
    
    # DevOps 脚本 API 测试
    test_devops_scripts
    
    # 错误处理测试
    test_error_handling
    
    # 打印总结
    print_summary
}

# 运行主函数
main
