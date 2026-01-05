#!/bin/bash

# CORS 配置验证脚本
# 用于验证共享心域 API 的 CORS 配置是否正确

BASE_URL="${1:-http://heartsphere.cn:8080}"
API_PATH="/api/heartconnect/shared/worlds"

echo "=========================================="
echo "CORS 配置验证脚本"
echo "=========================================="
echo "测试 URL: ${BASE_URL}${API_PATH}"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 测试 OPTIONS 预检请求
echo "1. 测试 OPTIONS 预检请求（Preflight Request）..."
echo "----------------------------------------"

OPTIONS_RESPONSE=$(curl -s -i -X OPTIONS "${BASE_URL}${API_PATH}" \
  -H "Origin: http://heartsphere.cn" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: x-share-config-id,x-shared-mode,x-visitor-id,authorization,content-type" \
  -H "Content-Type: application/json")

echo "$OPTIONS_RESPONSE"
echo ""

# 检查关键响应头
if echo "$OPTIONS_RESPONSE" | grep -qi "Access-Control-Allow-Origin"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Origin 存在${NC}"
else
  echo -e "${RED}✗ Access-Control-Allow-Origin 缺失${NC}"
fi

if echo "$OPTIONS_RESPONSE" | grep -qi "Access-Control-Allow-Methods"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Methods 存在${NC}"
else
  echo -e "${RED}✗ Access-Control-Allow-Methods 缺失${NC}"
fi

if echo "$OPTIONS_RESPONSE" | grep -qi "Access-Control-Allow-Headers"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Headers 存在${NC}"
  
  # 检查是否包含自定义请求头
  if echo "$OPTIONS_RESPONSE" | grep -qi "x-share-config-id"; then
    echo -e "${GREEN}  ✓ 包含 x-share-config-id${NC}"
  else
    echo -e "${RED}  ✗ 缺少 x-share-config-id${NC}"
  fi
  
  if echo "$OPTIONS_RESPONSE" | grep -qi "x-shared-mode"; then
    echo -e "${GREEN}  ✓ 包含 x-shared-mode${NC}"
  else
    echo -e "${RED}  ✗ 缺少 x-shared-mode${NC}"
  fi
  
  if echo "$OPTIONS_RESPONSE" | grep -qi "x-visitor-id"; then
    echo -e "${GREEN}  ✓ 包含 x-visitor-id${NC}"
  else
    echo -e "${RED}  ✗ 缺少 x-visitor-id${NC}"
  fi
else
  echo -e "${RED}✗ Access-Control-Allow-Headers 缺失${NC}"
fi

if echo "$OPTIONS_RESPONSE" | grep -qi "Access-Control-Allow-Credentials"; then
  echo -e "${GREEN}✓ Access-Control-Allow-Credentials 存在${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Allow-Credentials 缺失（如果不需要凭证，这是正常的）${NC}"
fi

if echo "$OPTIONS_RESPONSE" | grep -qi "Access-Control-Max-Age"; then
  echo -e "${GREEN}✓ Access-Control-Max-Age 存在${NC}"
else
  echo -e "${YELLOW}⚠ Access-Control-Max-Age 缺失（可选）${NC}"
fi

echo ""
echo "----------------------------------------"
echo ""

# 2. 测试实际 GET 请求（需要 token）
echo "2. 测试实际 GET 请求..."
echo "----------------------------------------"
echo -e "${YELLOW}注意：此请求需要有效的认证 token${NC}"
echo ""

# 尝试获取 token（如果提供了用户名和密码）
if [ -n "$2" ] && [ -n "$3" ]; then
  USERNAME="$2"
  PASSWORD="$3"
  
  echo "尝试登录获取 token..."
  LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ 登录成功，获取到 token${NC}"
    echo ""
    
    # 测试 GET 请求
    GET_RESPONSE=$(curl -s -i -X GET "${BASE_URL}${API_PATH}" \
      -H "Origin: http://heartsphere.cn" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "X-Share-Config-Id: 1" \
      -H "X-Shared-Mode: true" \
      -H "X-Visitor-Id: 1" \
      -H "Content-Type: application/json")
    
    echo "GET 请求响应："
    echo "$GET_RESPONSE" | head -20
    echo ""
    
    # 检查响应头
    if echo "$GET_RESPONSE" | grep -qi "Access-Control-Allow-Origin"; then
      echo -e "${GREEN}✓ GET 请求响应包含 CORS 头${NC}"
    else
      echo -e "${RED}✗ GET 请求响应缺少 CORS 头${NC}"
    fi
    
    HTTP_CODE=$(echo "$GET_RESPONSE" | head -1 | grep -o '[0-9]\{3\}')
    echo "HTTP 状态码: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ] || [ "$HTTP_CODE" = "401" ]; then
      echo -e "${GREEN}✓ 请求成功（状态码 $HTTP_CODE）${NC}"
    else
      echo -e "${RED}✗ 请求失败（状态码 $HTTP_CODE）${NC}"
    fi
  else
    echo -e "${RED}✗ 登录失败，无法获取 token${NC}"
    echo "响应: $LOGIN_RESPONSE"
  fi
else
  echo -e "${YELLOW}跳过实际请求测试（需要提供用户名和密码）${NC}"
  echo "用法: $0 <base_url> <username> <password>"
fi

echo ""
echo "=========================================="
echo "验证完成"
echo "=========================================="
echo ""
echo "前端验证步骤："
echo "1. 打开浏览器开发者工具（F12）"
echo "2. 切换到 Network（网络）标签"
echo "3. 尝试访问共享心域功能"
echo "4. 查看 OPTIONS 预检请求的响应头"
echo "5. 确认 Access-Control-Allow-Headers 包含 x-share-config-id"
echo "6. 确认没有 CORS 错误"
echo ""
