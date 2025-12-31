#!/bin/bash

# 系统预设事件物品端点测试脚本

echo "========================================="
echo "系统预设事件物品端点测试"
echo "========================================="
echo ""

BASE_URL="http://localhost:8081"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo -e "${YELLOW}测试: ${name}${NC}"
    echo "端点: ${endpoint}"
    echo ""
    
    response=$(curl -s -w "\n%{http_code}" -X GET "${endpoint}" \
        -H "Content-Type: application/json")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    echo "HTTP状态码: ${http_code}"
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✅ 请求成功${NC}"
        
        # 尝试解析JSON
        if command -v jq &> /dev/null; then
            code=$(echo "$body" | jq -r '.code // "N/A"')
            message=$(echo "$body" | jq -r '.message // "N/A"')
            data_length=$(echo "$body" | jq -r '.data | length // "N/A"')
            
            echo "响应代码: ${code}"
            echo "响应消息: ${message}"
            echo "数据数量: ${data_length}"
            
            if [ "$code" = "200" ] && [ "$data_length" != "N/A" ] && [ "$data_length" -gt 0 ]; then
                echo -e "${GREEN}✅ 数据格式正确，包含 ${data_length} 条记录${NC}"
            else
                echo -e "${RED}❌ 数据格式异常或数据为空${NC}"
            fi
        else
            echo "响应体（前200字符）:"
            echo "$body" | head -c 200
            echo ""
            echo ""
            echo "注意: 安装 jq 可以获得更详细的输出"
        fi
    else
        echo -e "${RED}❌ 请求失败${NC}"
        echo "响应体:"
        echo "$body"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# 检查服务是否运行
echo "检查后端服务是否运行..."
if curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/actuator/health" | grep -q "200\|404"; then
    echo -e "${GREEN}✅ 后端服务正在运行${NC}"
else
    echo -e "${RED}❌ 后端服务未运行或无法访问${NC}"
    echo "请确保后端服务已启动在 ${BASE_URL}"
    exit 1
fi

echo ""
echo "----------------------------------------"
echo ""

# 测试端点
test_endpoint "${BASE_URL}/api/scenario-events/system/all" "系统预设事件"
test_endpoint "${BASE_URL}/api/scenario-items/system/all" "系统预设物品"

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="



