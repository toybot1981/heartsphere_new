#!/usr/bin/env bash

# 邮箱API测试 - 阶段1: 用户登录和基础验证

set -e

API_BASE="http://localhost:8081/api"
DB_HOST="localhost"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_phase() { echo -e "${CYAN}[PHASE]${NC} $1"; }

# 测试结果
PASS_COUNT=0
FAIL_COUNT=0

# 记录测试结果
record_test() {
    local name=$1
    local passed=$2
    local msg=$3
    if [ "$passed" == "1" ]; then
        PASS_COUNT=$((PASS_COUNT + 1))
        log_success "✓ $name: $msg"
    else
        FAIL_COUNT=$((FAIL_COUNT + 1))
        log_error "✗ $name: $msg"
    fi
}

# 登录获取token
login() {
    local username=$1
    local password=$2
    log_info "登录用户: $username"
    
    local response=$(curl -s -X POST "$API_BASE/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$username\",\"password\":\"$password\"}")
    
    local token=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -z "$token" ]; then
        log_error "登录失败: $username"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        echo ""
        return 1
    fi
    
    log_success "登录成功: $username (token: ${token:0:30}...)"
    echo "$token"
}

# 查询数据库
query_db() {
    local query=$1
    mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -N -e "$query" 2>/dev/null
}

# 获取用户ID
get_user_id() {
    local username=$1
    query_db "SELECT id FROM users WHERE username='$username' LIMIT 1"
}

echo "=========================================="
echo "邮箱API全面测试 - 阶段1: 用户登录"
echo "=========================================="
echo ""

# 用户信息数组
USERNAMES=("tongyexin" "ty1" "heartsphere")
PASSWORDS=("123456" "Tyx@1234" "Tyx@1234")

# 存储token和user_id
TOKEN_TONGYEXIN=""
TOKEN_TY1=""
TOKEN_HEARTSPHERE=""
USER_ID_TONGYEXIN=""
USER_ID_TY1=""
USER_ID_HEARTSPHERE=""

# 测试每个用户的登录
for i in "${!USERNAMES[@]}"; do
    username="${USERNAMES[$i]}"
    password="${PASSWORDS[$i]}"
    token=$(login "$username" "$password")
    
    if [ -n "$token" ]; then
        # 保存token
        case "$username" in
            "tongyexin") TOKEN_TONGYEXIN="$token" ;;
            "ty1") TOKEN_TY1="$token" ;;
            "heartsphere") TOKEN_HEARTSPHERE="$token" ;;
        esac
        
        user_id=$(get_user_id "$username")
        if [ -n "$user_id" ]; then
            # 保存user_id
            case "$username" in
                "tongyexin") USER_ID_TONGYEXIN="$user_id" ;;
                "ty1") USER_ID_TY1="$user_id" ;;
                "heartsphere") USER_ID_HEARTSPHERE="$user_id" ;;
            esac
            
            log_info "用户 $username 的ID: $user_id"
            
            # 验证数据库中的用户
            db_check=$(query_db "SELECT COUNT(*) FROM users WHERE id=$user_id AND username='$username'")
            if [ "$db_check" == "1" ]; then
                record_test "登录 $username" "1" "Token获取成功, UserID: $user_id, 数据库验证通过"
            else
                record_test "登录 $username" "0" "Token获取成功但数据库验证失败"
            fi
        else
            record_test "登录 $username" "0" "Token获取成功但无法获取UserID"
        fi
    else
        record_test "登录 $username" "0" "登录失败"
    fi
    echo ""
done

# 打印摘要
echo "=========================================="
echo "阶段1测试摘要"
echo "=========================================="
echo "通过: $PASS_COUNT"
echo "失败: $FAIL_COUNT"
echo "=========================================="
echo ""

# 保存token和user_id到文件供后续阶段使用
cat > /tmp/mailbox_test_data.json << EOF
{
  "tokens": {
    "tongyexin": "${TOKEN_TONGYEXIN}",
    "ty1": "${TOKEN_TY1}",
    "heartsphere": "${TOKEN_HEARTSPHERE}"
  },
  "user_ids": {
    "tongyexin": "${USER_ID_TONGYEXIN}",
    "ty1": "${USER_ID_TY1}",
    "heartsphere": "${USER_ID_HEARTSPHERE}"
  }
}
EOF

log_success "测试数据已保存到 /tmp/mailbox_test_data.json"
echo ""
