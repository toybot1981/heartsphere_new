#!/bin/bash
# 测试管理员回复功能
# 需要先运行 test-chronos-letter-interactive.sh 创建用户反馈

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
echo -e "${BLUE}管理员回复功能测试${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 获取最新的用户反馈ID
echo -e "${YELLOW}[步骤 1] 获取最新的用户反馈...${NC}"
LETTER_ID=$(mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -sN -e "
SELECT id 
FROM chronos_letters 
WHERE user_id = (SELECT id FROM users WHERE username='tongyexin')
  AND type = 'user_feedback'
ORDER BY timestamp DESC 
LIMIT 1;
" 2>/dev/null)

if [ -z "$LETTER_ID" ]; then
    echo -e "${RED}错误: 未找到用户反馈，请先运行 test-chronos-letter-interactive.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 找到反馈信件 ID: ${LETTER_ID}${NC}"
echo ""

# 2. 管理员登录
echo -e "${YELLOW}[步骤 2] 管理员登录...${NC}"
read -p "请输入管理员用户名 [默认: admin]: " ADMIN_USER
ADMIN_USER=${ADMIN_USER:-admin}
read -sp "请输入管理员密码: " ADMIN_PASS
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${ADMIN_USER}\",\"password\":\"${ADMIN_PASS}\"}")

ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo -e "${RED}✗ 管理员登录失败${NC}"
    echo "响应: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ 管理员登录成功${NC}"
echo ""

# 3. 发送管理员回复
echo -e "${YELLOW}[步骤 3] 发送管理员回复...${NC}"
REPLY_CONTENT="感谢您的反馈！我们已经收到您的来信。\n\n我们会认真考虑您的建议，并在后续版本中改进。\n\n如有其他问题，欢迎随时联系我们。\n\n祝好，\n管理员团队"

REPLY_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/admin/chronos-letters/${LETTER_ID}/reply" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -d "{\"content\":\"${REPLY_CONTENT}\"}")

REPLY_ID=$(echo $REPLY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$REPLY_ID" ]; then
    echo -e "${RED}✗ 回复失败${NC}"
    echo "响应: $REPLY_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ 管理员回复发送成功${NC}"
echo -e "${GREEN}回复ID: ${REPLY_ID}${NC}"
echo ""

# 4. 数据库验证
echo -e "${YELLOW}[步骤 4] 数据库验证...${NC}"
echo ""
echo -e "${BLUE}--- 原始反馈和回复 ---${NC}"
mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -e "
SELECT 
    cl.id,
    cl.subject,
    cl.type,
    cl.sender_name,
    FROM_UNIXTIME(cl.timestamp/1000) as send_time,
    cl.parent_letter_id
FROM chronos_letters cl
WHERE cl.id = '${LETTER_ID}' OR cl.id = '${REPLY_ID}' OR cl.parent_letter_id = '${LETTER_ID}'
ORDER BY cl.timestamp ASC;
" 2>/dev/null

echo ""
echo -e "${BLUE}--- 统计信息（更新后） ---${NC}"
mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -e "
SELECT 
    type as '类型',
    COUNT(*) as '总数',
    SUM(CASE WHEN is_read=0 THEN 1 ELSE 0 END) as '未读',
    SUM(CASE WHEN is_read=1 THEN 1 ELSE 0 END) as '已读'
FROM chronos_letters
WHERE user_id = (SELECT id FROM users WHERE username='tongyexin')
GROUP BY type;
" 2>/dev/null

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}验证步骤:${NC}"
echo "  1. 在管理后台查看用户反馈列表"
echo "  2. 查看回复是否显示在信件详情中"
echo "  3. 用户端查看是否收到管理员回复"
echo ""
