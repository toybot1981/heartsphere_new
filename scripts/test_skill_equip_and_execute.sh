#!/bin/bash

# 测试技能装备和执行
# 使用方法: ./scripts/test_skill_equip_and_execute.sh [CHARACTER_ID] [TOKEN]

CHARACTER_ID=${1:-1}
TOKEN=${2:-""}

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== 技能装备和执行测试 ===${NC}"
echo ""

# 检查参数
if [ -z "$TOKEN" ]; then
    echo -e "${YELLOW}⚠${NC} 未提供 Token"
    echo "   使用方法: $0 [CHARACTER_ID] [TOKEN]"
    echo "   示例: $0 1 'your-token-here'"
    echo ""
    echo "   或者从浏览器获取 Token："
    echo "   1. 打开浏览器开发者工具 (F12)"
    echo "   2. 切换到 Application/Storage 标签页"
    echo "   3. 找到 localStorage 中的 'token' 值"
    exit 1
fi

API_BASE="http://localhost:8080"
SKILL_ID="test-skill"

echo -e "${BLUE}配置信息:${NC}"
echo "  角色ID: $CHARACTER_ID"
echo "  技能ID: $SKILL_ID"
echo "  API地址: $API_BASE"
echo ""

# 测试 1: 检查技能是否存在
echo -e "${BLUE}测试 1: 检查技能是否存在${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/skills/$SKILL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 技能存在"
    SKILL_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   技能名称: $SKILL_NAME"
else
    echo -e "${RED}✗${NC} 技能不存在 (HTTP $HTTP_CODE)"
    echo "   提示: 请先创建测试技能或检查技能ID"
    exit 1
fi

# 测试 2: 装备技能
echo ""
echo -e "${BLUE}测试 2: 装备技能${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/characters/$CHARACTER_ID/skills/$SKILL_ID/equip" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "isEnabled": true,
    "autoTrigger": false,
    "priority": 0
  }' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 技能装备成功"
    IS_ENABLED=$(echo "$BODY" | grep -o '"isEnabled":[^,}]*' | cut -d':' -f2)
    echo "   启用状态: $IS_ENABLED"
else
    echo -e "${YELLOW}⚠${NC} 技能装备失败 (HTTP $HTTP_CODE)"
    if echo "$BODY" | grep -q "already equipped"; then
        echo "   提示: 技能已装备，继续测试..."
    else
        echo "   响应: $BODY"
        exit 1
    fi
fi

# 测试 3: 查询已装备技能
echo ""
echo -e "${BLUE}测试 3: 查询已装备技能${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "$API_BASE/api/characters/$CHARACTER_ID/skills" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 查询成功"
    SKILL_COUNT=$(echo "$BODY" | grep -o '"skillId"' | wc -l | tr -d ' ')
    echo "   已装备技能数: $SKILL_COUNT"
    if echo "$BODY" | grep -q "$SKILL_ID"; then
        echo -e "${GREEN}✓${NC} 测试技能在已装备列表中"
    else
        echo -e "${YELLOW}⚠${NC} 测试技能不在已装备列表中"
    fi
else
    echo -e "${RED}✗${NC} 查询失败 (HTTP $HTTP_CODE)"
fi

# 测试 4: 执行技能 - echo
echo ""
echo -e "${BLUE}测试 4: 执行技能 - echo${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/skills/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"skillId\": \"$SKILL_ID\",
    \"characterId\": $CHARACTER_ID,
    \"parameters\": {
      \"input\": \"Hello World\",
      \"action\": \"echo\"
    }
  }" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 技能执行成功"
    SUCCESS=$(echo "$BODY" | grep -o '"success":[^,}]*' | cut -d':' -f2)
    echo "   执行结果: $SUCCESS"
    echo "   响应: $(echo "$BODY" | head -c 200)..."
else
    echo -e "${RED}✗${NC} 技能执行失败 (HTTP $HTTP_CODE)"
    echo "   响应: $BODY"
fi

# 测试 5: 执行技能 - uppercase
echo ""
echo -e "${BLUE}测试 5: 执行技能 - uppercase${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/skills/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"skillId\": \"$SKILL_ID\",
    \"characterId\": $CHARACTER_ID,
    \"parameters\": {
      \"input\": \"hello world\",
      \"action\": \"uppercase\"
    }
  }" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 技能执行成功"
    echo "   响应: $(echo "$BODY" | head -c 200)..."
else
    echo -e "${RED}✗${NC} 技能执行失败 (HTTP $HTTP_CODE)"
fi

# 测试 6: 执行技能 - reverse
echo ""
echo -e "${BLUE}测试 6: 执行技能 - reverse${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE/api/skills/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"skillId\": \"$SKILL_ID\",
    \"characterId\": $CHARACTER_ID,
    \"parameters\": {
      \"input\": \"Test\",
      \"action\": \"reverse\"
    }
  }" 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓${NC} 技能执行成功"
    echo "   响应: $(echo "$BODY" | head -c 200)..."
else
    echo -e "${RED}✗${NC} 技能执行失败 (HTTP $HTTP_CODE)"
fi

# 总结
echo ""
echo -e "${BLUE}=== 测试总结 ===${NC}"
echo ""
echo "测试完成！"
echo ""
echo "下一步操作:"
echo "1. 在浏览器中打开角色对话页面"
echo "2. 选择已装备技能的角色"
echo "3. 尝试对话触发技能："
echo "   - '请帮我测试一下技能，把 hello 转成大写'"
echo "   - '请把 Test 反转一下'"
echo ""
