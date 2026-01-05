#!/bin/bash
# 超时空信箱测试脚本
# 测试用户: tongyexin/123456

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 配置
DB_USER="root"
DB_PASSWORD="123456"
DB_NAME="heartsphere"
API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}超时空信箱测试脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. 获取用户信息
echo -e "${YELLOW}[1/5] 获取用户信息...${NC}"
USER_INFO=$(mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -sN -e "
SELECT CONCAT(id, '|', username, '|', COALESCE(nickname, ''), '|', COALESCE(email, ''))
FROM users 
WHERE username='tongyexin';
" 2>/dev/null)

if [ -z "$USER_INFO" ]; then
    echo -e "${RED}错误: 用户 tongyexin 不存在${NC}"
    exit 1
fi

USER_ID=$(echo $USER_INFO | cut -d'|' -f1)
USERNAME=$(echo $USER_INFO | cut -d'|' -f2)
NICKNAME=$(echo $USER_INFO | cut -d'|' -f3)
EMAIL=$(echo $USER_INFO | cut -d'|' -f4)

echo -e "${GREEN}用户ID: ${USER_ID}${NC}"
echo -e "${GREEN}用户名: ${USERNAME}${NC}"
echo -e "${GREEN}昵称: ${NICKNAME:-未设置}${NC}"
echo -e "${GREEN}邮箱: ${EMAIL:-未设置}${NC}"
echo ""

# 2. 用户登录获取 Token
echo -e "${YELLOW}[2/5] 用户登录获取 Token...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"tongyexin\",\"password\":\"123456\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}登录失败，响应: ${LOGIN_RESPONSE}${NC}"
    exit 1
fi

echo -e "${GREEN}登录成功，Token 已获取${NC}"
echo ""

# 3. 创建用户反馈信件
echo -e "${YELLOW}[3/5] 创建用户反馈信件...${NC}"
TIMESTAMP=$(date +%s)000
FEEDBACK_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/chronos-letters" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TOKEN}" \
  -d "{
    \"subject\": \"测试反馈 - $(date '+%Y-%m-%d %H:%M:%S')\",
    \"content\": \"这是一条测试反馈内容。\\n\\n用户 tongyexin 通过测试脚本创建。\\n\\n测试时间: $(date '+%Y-%m-%d %H:%M:%S')\",
    \"senderId\": \"user\",
    \"senderName\": \"我\",
    \"senderAvatarUrl\": null,
    \"themeColor\": \"indigo-500\"
  }")

LETTER_ID=$(echo $FEEDBACK_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -z "$LETTER_ID" ]; then
    echo -e "${RED}创建反馈失败，响应: ${FEEDBACK_RESPONSE}${NC}"
    exit 1
fi

echo -e "${GREEN}反馈信件创建成功${NC}"
echo -e "${GREEN}信件ID: ${LETTER_ID}${NC}"
echo ""

# 4. 验证数据库中的记录
echo -e "${YELLOW}[4/5] 验证数据库中的记录...${NC}"
DB_CHECK=$(mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -sN -e "
SELECT 
    id,
    subject,
    type,
    is_read,
    sender_name,
    FROM_UNIXTIME(timestamp/1000) as send_time,
    LEFT(content, 50) as content_preview
FROM chronos_letters 
WHERE id='${LETTER_ID}';
" 2>/dev/null)

if [ -z "$DB_CHECK" ]; then
    echo -e "${RED}数据库验证失败: 未找到信件记录${NC}"
    exit 1
fi

echo -e "${GREEN}数据库验证成功:${NC}"
echo "$DB_CHECK" | while IFS=$'\t' read -r id subject type is_read sender_name send_time content_preview; do
    echo "  信件ID: $id"
    echo "  主题: $subject"
    echo "  类型: $type"
    echo "  已读: $is_read"
    echo "  发件人: $sender_name"
    echo "  发送时间: $send_time"
    echo "  内容预览: $content_preview..."
done
echo ""

# 5. 统计信息
echo -e "${YELLOW}[5/5] 统计信息...${NC}"
STATS=$(mysql -u ${DB_USER} -p${DB_PASSWORD} -D ${DB_NAME} -sN -e "
SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN type='user_feedback' THEN 1 ELSE 0 END) as user_feedbacks,
    SUM(CASE WHEN type='admin_reply' THEN 1 ELSE 0 END) as admin_replies,
    SUM(CASE WHEN is_read=0 THEN 1 ELSE 0 END) as unread
FROM chronos_letters
WHERE user_id=${USER_ID};
" 2>/dev/null)

echo -e "${GREEN}用户 ${USERNAME} 的信件统计:${NC}"
echo "$STATS" | while IFS=$'\t' read -r total user_feedbacks admin_replies unread; do
    echo "  总信件数: $total"
    echo "  用户反馈: $user_feedbacks"
    echo "  管理员回复: $admin_replies"
    echo "  未读信件: $unread"
done
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步:${NC}"
echo "  1. 在管理后台查看用户反馈"
echo "  2. 测试管理员回复功能"
echo "  3. 在数据库中验证回复记录"
echo ""
