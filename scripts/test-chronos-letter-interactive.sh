#!/bin/bash
# 超时空信箱交互式测试脚本
# 测试用户: tongyexin/123456

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
DB_USER="root"
DB_PASSWORD="123456"
DB_NAME="heartsphere"
API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}超时空信箱交互式测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 获取用户信息
echo -e "${YELLOW}[步骤 1] 获取用户信息...${NC}"
USER_ID=$(mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -sN -e "SELECT id FROM users WHERE username='tongyexin';" 2>/dev/null)

if [ -z "$USER_ID" ]; then
    echo -e "${RED}错误: 用户 tongyexin 不存在${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 用户ID: ${USER_ID}${NC}"
echo ""

# 2. 用户登录
echo -e "${YELLOW}[步骤 2] 用户登录...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"tongyexin","password":"123456"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ 登录失败${NC}"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ 登录成功${NC}"
echo ""

# 3. 创建多条测试反馈
echo -e "${YELLOW}[步骤 3] 创建测试反馈信件...${NC}"

for i in 1 2 3; do
    SUBJECT="测试反馈 #${i} - $(date '+%Y-%m-%d %H:%M:%S')"
    CONTENT="这是第 ${i} 条测试反馈。\n\n测试内容：\n- 测试用户反馈功能\n- 测试 E-Soul 邮件互动\n- 测试时间: $(date '+%Y-%m-%d %H:%M:%S')\n\n这是一条完整的测试反馈内容，用于验证超时空信箱功能是否正常工作。"
    
    RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/chronos-letters" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${TOKEN}" \
      -d "{
        \"subject\": \"${SUBJECT}\",
        \"content\": \"${CONTENT}\",
        \"senderId\": \"user\",
        \"senderName\": \"我\",
        \"themeColor\": \"indigo-500\"
      }")
    
    LETTER_ID=$(echo $RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$LETTER_ID" ]; then
        echo -e "${GREEN}✓ 反馈 #${i} 创建成功 (ID: ${LETTER_ID})${NC}"
    else
        echo -e "${RED}✗ 反馈 #${i} 创建失败${NC}"
        echo "响应: $RESPONSE"
    fi
    
    sleep 1
done

echo ""

# 4. 数据库验证
echo -e "${YELLOW}[步骤 4] 数据库验证...${NC}"
echo ""
echo -e "${BLUE}--- 用户 tongyexin 的所有信件 ---${NC}"
mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -e "
SELECT 
    id,
    subject,
    type,
    CASE WHEN is_read=0 THEN '未读' ELSE '已读' END as status,
    sender_name,
    FROM_UNIXTIME(timestamp/1000) as send_time
FROM chronos_letters 
WHERE user_id=${USER_ID}
ORDER BY timestamp DESC;
" 2>/dev/null

echo ""
echo -e "${BLUE}--- 统计信息 ---${NC}"
mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -e "
SELECT 
    type as '类型',
    COUNT(*) as '总数',
    SUM(CASE WHEN is_read=0 THEN 1 ELSE 0 END) as '未读',
    SUM(CASE WHEN is_read=1 THEN 1 ELSE 0 END) as '已读'
FROM chronos_letters
WHERE user_id=${USER_ID}
GROUP BY type;
" 2>/dev/null

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步操作:${NC}"
echo "  1. 在管理后台查看用户反馈"
echo "     - 访问: http://localhost:3000/admin.html"
echo "     - 菜单: 用户管理 > 超时空信箱"
echo ""
echo "  2. 测试管理员回复功能"
echo "     - 在管理后台选择一条反馈"
echo "     - 输入回复内容并发送"
echo ""
echo "  3. 验证回复记录"
echo "     - 运行: mysql -u root -p123456 heartsphere < scripts/verify-chronos-letters.sql"
echo ""
