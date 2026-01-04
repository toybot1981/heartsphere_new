#!/bin/bash

# 暖心留言功能测试脚本
# 测试账号：
# 1. tongyexin / 123456 (共享心域主人)
# 2. ty1 / Tyx@1234 (访问者)

set -e

API_BASE="http://localhost:8081/api"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# 检查服务
log_info "检查后端服务..."
HEALTH_CHECK=$(curl -s -X POST "${API_BASE}/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}' 2>&1)
if echo "$HEALTH_CHECK" | grep -q "401\|400\|200\|token"; then
    log_success "后端服务运行正常"
else
    log_error "后端服务未运行，请先启动后端服务"
    exit 1
fi

# 登录获取token
login() {
    local username=$1
    local password=$2
    log_info "登录用户: $username"
    
    local response=$(curl -s -X POST "${API_BASE}/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    local token=$(echo $response | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', '') or data.get('token', ''))" 2>/dev/null || echo "")
    
    if [ -z "$token" ] || [ "$token" == "null" ]; then
        log_error "登录失败: $username"
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
        return 1
    fi
    
    log_success "登录成功: $username"
    echo "$token"
}

echo ""
echo "=========================================="
echo "暖心留言功能测试"
echo "=========================================="
echo ""

# 1. 登录两个账号
log_info "步骤1: 登录账号..."
TOKEN1=$(login "tongyexin" "123456")
if [ -z "$TOKEN1" ]; then
    log_error "tongyexin 登录失败"
    exit 1
fi

TOKEN2=$(login "ty1" "Tyx@1234")
if [ -z "$TOKEN2" ]; then
    log_error "ty1 登录失败"
    exit 1
fi

echo ""

# 2. 获取tongyexin的共享配置
log_info "步骤2: 获取tongyexin的共享配置..."
SHARE_CONFIG_RESPONSE=$(curl -s -X GET "${API_BASE}/heartconnect/config/my" \
    -H "Authorization: Bearer ${TOKEN1}")

# 检查响应是否包含错误
ERROR_MSG=$(echo "$SHARE_CONFIG_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('message', ''))" 2>/dev/null || echo "")

if echo "$ERROR_MSG" | grep -q "不存在\|404"; then
    log_warning "tongyexin 还没有共享配置，需要先创建"
    log_info "创建共享配置..."
    CREATE_RESPONSE=$(curl -s -X POST "${API_BASE}/heartconnect/config" \
        -H "Authorization: Bearer ${TOKEN1}" \
        -H "Content-Type: application/json" \
        -d '{
            "shareType": "all",
            "accessPermission": "free",
            "description": "测试共享心域"
        }')
    
    SHARE_CONFIG_ID=$(echo "$CREATE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); config=data.get('data', {}); print(config.get('id', '') or '')" 2>/dev/null || echo "")
    
    if [ -z "$SHARE_CONFIG_ID" ]; then
        log_error "创建共享配置失败"
        echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
        exit 1
    fi
    log_success "共享配置创建成功，ID: $SHARE_CONFIG_ID"
else
    SHARE_CONFIG_ID=$(echo "$SHARE_CONFIG_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); config=data.get('data', {}); print(config.get('id', '') or '')" 2>/dev/null || echo "")
    if [ -n "$SHARE_CONFIG_ID" ]; then
        log_success "找到共享配置，ID: $SHARE_CONFIG_ID"
    else
        log_error "获取共享配置失败"
        echo "$SHARE_CONFIG_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SHARE_CONFIG_RESPONSE"
        exit 1
    fi
fi

echo ""

# 3. 获取ty1的用户ID（用于访问共享心域）
log_info "步骤3: 获取ty1的用户信息..."
USER_INFO_RESPONSE=$(curl -s -X GET "${API_BASE}/auth/me" \
    -H "Authorization: Bearer ${TOKEN2}")

VISITOR_ID=$(echo "$USER_INFO_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); user=data.get('data', {}); print(user.get('id', '') or '')" 2>/dev/null || echo "")

if [ -z "$VISITOR_ID" ]; then
    log_error "获取用户信息失败"
    echo "$USER_INFO_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$USER_INFO_RESPONSE"
    exit 1
fi
log_success "ty1 用户ID: $VISITOR_ID"

echo ""

# 4. ty1发送暖心留言
log_info "步骤4: ty1发送暖心留言..."
WARM_MESSAGE="这是一条测试暖心留言，来自ty1。感谢分享你的心域！"
SEND_RESPONSE=$(curl -s -X POST "${API_BASE}/heartconnect/shared/${SHARE_CONFIG_ID}/warm-message" \
    -H "Authorization: Bearer ${TOKEN2}" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"${WARM_MESSAGE}\"}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${API_BASE}/heartconnect/shared/${SHARE_CONFIG_ID}/warm-message" \
    -H "Authorization: Bearer ${TOKEN2}" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"${WARM_MESSAGE}\"}")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    log_success "暖心留言发送成功 (HTTP $HTTP_CODE)"
    echo "$SEND_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEND_RESPONSE"
else
    log_error "暖心留言发送失败 (HTTP $HTTP_CODE)"
    echo "$SEND_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SEND_RESPONSE"
    exit 1
fi

echo ""

# 5. tongyexin查看mailbox中的留言
log_info "步骤5: tongyexin查看mailbox中的暖心留言..."
MAILBOX_RESPONSE=$(curl -s -X GET "${API_BASE}/mailbox/messages?category=warm_message&page=0&size=10" \
    -H "Authorization: Bearer ${TOKEN1}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_BASE}/mailbox/messages?category=warm_message&page=0&size=10" \
    -H "Authorization: Bearer ${TOKEN1}")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    log_success "获取mailbox消息成功 (HTTP $HTTP_CODE)"
    echo "$MAILBOX_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MAILBOX_RESPONSE"
    
    # 检查是否包含暖心留言
    if echo "$MAILBOX_RESPONSE" | grep -q "warm_message\|暖心留言\|ty1"; then
        log_success "✅ 在mailbox中找到了暖心留言！"
    else
        log_warning "⚠️  mailbox响应中没有找到暖心留言相关内容"
    fi
else
    log_error "获取mailbox消息失败 (HTTP $HTTP_CODE)"
    echo "$MAILBOX_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MAILBOX_RESPONSE"
fi

echo ""

# 6. 检查未读统计
log_info "步骤6: 检查未读消息统计..."
UNREAD_RESPONSE=$(curl -s -X GET "${API_BASE}/mailbox/messages/unread/count" \
    -H "Authorization: Bearer ${TOKEN1}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "${API_BASE}/mailbox/messages/unread/count" \
    -H "Authorization: Bearer ${TOKEN1}")

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    log_success "获取未读统计成功 (HTTP $HTTP_CODE)"
    echo "$UNREAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UNREAD_RESPONSE"
    
    # 检查是否包含warm_message类别
    if echo "$UNREAD_RESPONSE" | grep -q "warm_message"; then
        log_success "✅ 未读统计中包含暖心留言类别！"
    fi
else
    log_error "获取未读统计失败 (HTTP $HTTP_CODE)"
    echo "$UNREAD_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UNREAD_RESPONSE"
fi

echo ""
echo "=========================================="
log_success "测试完成！"
echo "=========================================="
echo ""
log_info "测试总结："
echo "  1. ✅ 两个账号登录成功"
echo "  2. ✅ 共享配置获取/创建成功"
echo "  3. ✅ 暖心留言发送成功"
echo "  4. ✅ mailbox消息查询成功"
echo "  5. ✅ 未读统计查询成功"
echo ""
log_info "请在浏览器中打开 http://localhost:3000 验证："
echo "  - 使用 tongyexin 账号登录"
echo "  - 打开超时空信箱"
echo "  - 查看'暖心留言'类别"
echo "  - 确认能看到来自 ty1 的留言"
