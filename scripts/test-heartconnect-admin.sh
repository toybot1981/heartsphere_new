#!/bin/bash

# 心域连接后台管理 API 测试脚本
# 使用方法: ./scripts/test-heartconnect-admin.sh [admin_username] [admin_password]

BASE_URL="http://localhost:8081/api"
ADMIN_USERNAME="${1:-admin}"
ADMIN_PASSWORD="${2:-admin}"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ $1${NC}"
}

# 检查服务是否运行
check_service() {
    print_info "检查后端服务..."
    # 尝试多个端点来检测服务
    if curl -s -f "$BASE_URL/admin/login" > /dev/null 2>&1 || \
       curl -s -f "http://localhost:8081" > /dev/null 2>&1; then
        print_success "后端服务运行正常"
        return 0
    else
        print_error "后端服务未运行，请先启动后端服务"
        print_info "启动命令: cd backend && mvn spring-boot:run"
        return 1
    fi
}

# 登录获取 Token
login() {
    print_info "正在登录..."
    RESPONSE=$(curl -s -X POST "$BASE_URL/admin/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"$ADMIN_PASSWORD\"}")
    
    TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        print_error "登录失败"
        echo "响应: $RESPONSE"
        return 1
    else
        print_success "登录成功"
        echo "Token: ${TOKEN:0:20}..."
        echo "$TOKEN"
        return 0
    fi
}

# 测试 API 端点
test_api() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    
    print_info "测试: $name"
    
    if [ "$method" = "GET" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token")
    elif [ "$method" = "POST" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    elif [ "$method" = "DELETE" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $token" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
        print_success "$name - HTTP $HTTP_CODE"
        if echo "$BODY" | grep -q '"success":true'; then
            print_success "$name - 响应成功"
        else
            print_error "$name - 响应失败"
            echo "响应: $BODY"
        fi
        return 0
    else
        print_error "$name - HTTP $HTTP_CODE"
        echo "响应: $BODY"
        return 1
    fi
}

# 主测试流程
main() {
    echo "=========================================="
    echo "心域连接后台管理 API 测试"
    echo "=========================================="
    echo ""
    
    # 检查服务
    if ! check_service; then
        exit 1
    fi
    
    # 登录
    TOKEN=$(login)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    echo ""
    echo "开始测试 API 端点..."
    echo ""
    
    # 测试计数器
    PASSED=0
    FAILED=0
    
    # 测试共享配置管理
    if test_api "获取共享配置列表" "GET" "/admin/heartsphere-connection/share-configs?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试连接请求管理
    if test_api "获取连接请求列表" "GET" "/admin/heartsphere-connection/connection-requests?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试访问记录管理
    if test_api "获取访问记录列表" "GET" "/admin/heartsphere-connection/access-records?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试留言管理
    if test_api "获取留言列表" "GET" "/admin/heartsphere-connection/warm-messages?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试数据统计
    if test_api "获取统计数据" "GET" "/admin/heartsphere-connection/statistics/overview" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试异常处理
    if test_api "获取异常列表" "GET" "/admin/heartsphere-connection/exceptions?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    # 测试投诉管理
    if test_api "获取投诉列表" "GET" "/admin/heartsphere-connection/complaints?page=0&size=20" "" "$TOKEN"; then
        ((PASSED++))
    else
        ((FAILED++))
    fi
    
    echo ""
    echo "=========================================="
    echo "测试完成"
    echo "=========================================="
    echo "通过: $PASSED"
    echo "失败: $FAILED"
    echo "总计: $((PASSED + FAILED))"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        print_success "所有测试通过！"
        exit 0
    else
        print_error "部分测试失败"
        exit 1
    fi
}

# 运行主函数
main

