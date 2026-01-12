#!/bin/bash

# Web Search Service API 测试脚本

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8086/api"

echo -e "${BLUE}=================================${NC}"
echo -e "${BLUE}Web Search API 测试${NC}"
echo -e "${BLUE}=================================${NC}"
echo ""

# 测试1: 健康检查
echo -e "${YELLOW}测试1: 健康检查${NC}"
echo "GET ${BASE_URL}/search/health"
response=$(curl -s -X GET "${BASE_URL}/search/health")
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 健康检查完成${NC}"
echo ""

# 测试2: 快速搜索
echo -e "${YELLOW}测试2: 快速搜索${NC}"
echo "GET ${BASE_URL}/search/quick?query=HeartSphere%20AI"
response=$(curl -s -X GET "${BASE_URL}/search/quick?query=HeartSphere%20AI")
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 快速搜索完成${NC}"
echo ""

# 测试3: 高级搜索
echo -e "${YELLOW}测试3: 高级搜索${NC}"
echo "POST ${BASE_URL}/search/advanced"
response=$(curl -s -X POST "${BASE_URL}/search/advanced" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "人工智能最新进展",
    "maxResults": 5,
    "searchDepth": "basic",
    "includeAnswer": true
  }')
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 高级搜索完成${NC}"
echo ""

# 测试4: 新闻搜索
echo -e "${YELLOW}测试4: 新闻搜索${NC}"
echo "GET ${BASE_URL}/search/news?query=AI&daysRange=7"
response=$(curl -s -X GET "${BASE_URL}/search/news?query=AI&daysRange=7")
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 新闻搜索完成${NC}"
echo ""

# 测试5: 域名过滤搜索
echo -e "${YELLOW}测试5: 域名过滤搜索${NC}"
echo "GET ${BASE_URL}/search/filtered?query=python&includeDomains=wikipedia.org,github.com"
response=$(curl -s -X GET "${BASE_URL}/search/filtered?query=python&includeDomains=wikipedia.org,github.com")
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 域名过滤搜索完成${NC}"
echo ""

# 测试6: 缓存统计
echo -e "${YELLOW}测试6: 缓存统计${NC}"
echo "GET ${BASE_URL}/cache/stats"
response=$(curl -s -X GET "${BASE_URL}/cache/stats")
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""
echo -e "${GREEN}✓ 缓存统计完成${NC}"
echo ""

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}所有测试完成!${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""
echo "提示: 访问 http://localhost:8086/api/swagger-ui.html 查看完整API文档"
