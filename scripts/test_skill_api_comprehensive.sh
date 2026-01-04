#!/bin/bash

# Skill API 全面测试脚本
# 分步骤测试所有 skill 相关 API，并通过数据库验证结果
# 使用方法: ./test_skill_api_comprehensive.sh [username] [password] [characterId]

set -e

# 配置
BASE_URL="http://localhost:8081"
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="heartsphere"
DB_USER="root"
DB_PASS="123456"
USERNAME="${1:-admin}"
PASSWORD="${2:-123456}"
CHARACTER_ID="${3:-1}"
TOKEN="${4:-}"  # 可选的token，如果提供则跳过登录

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试数据
TEST_SKILL_ID="test-skill-api-$(date +%s)"
TEST_SKILL_NAME="测试技能API"
TEST_SKILL_DESC="用于API测试的技能"

# 辅助函数
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

log_step() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}步骤 $1: $2${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# 数据库查询函数
db_query() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" -N -e "$1" 2>/dev/null
}

# 验证数据库中的技能
verify_skill_in_db() {
    local skill_id=$1
    log_info "验证数据库中的技能: $skill_id"
    
    local count=$(db_query "SELECT COUNT(*) FROM skill_definitions WHERE skill_id = '$skill_id'")
    if [ "$count" -eq 1 ]; then
        log_success "技能在数据库中存在"
        db_query "SELECT id, skill_id, name, description, category, execution_type, is_system_skill FROM skill_definitions WHERE skill_id = '$skill_id'"
        return 0
    else
        log_error "技能在数据库中不存在或存在多条记录 (count: $count)"
        return 1
    fi
}

# 验证角色技能绑定
verify_character_skill_binding() {
    local character_id=$1
    local skill_id=$2
    log_info "验证角色技能绑定: characterId=$character_id, skillId=$skill_id"
    
    local count=$(db_query "SELECT COUNT(*) FROM character_skill_bindings WHERE character_id = $character_id AND skill_id = '$skill_id'")
    if [ "$count" -eq 1 ]; then
        log_success "角色技能绑定在数据库中存在"
        db_query "SELECT id, character_id, skill_id, is_enabled, auto_trigger, priority, usage_count FROM character_skill_bindings WHERE character_id = $character_id AND skill_id = '$skill_id'"
        return 0
    else
        log_error "角色技能绑定在数据库中不存在或存在多条记录 (count: $count)"
        return 1
    fi
}

# 获取技能执行记录
get_skill_executions() {
    local skill_id=$1
    log_info "查询技能执行记录: $skill_id"
    
    local count=$(db_query "SELECT COUNT(*) FROM skill_executions WHERE skill_id = '$skill_id'")
    log_info "执行记录数量: $count"
    if [ "$count" -gt 0 ]; then
        db_query "SELECT id, skill_id, character_id, success, execution_time_ms, created_at FROM skill_executions WHERE skill_id = '$skill_id' ORDER BY created_at DESC LIMIT 5"
    fi
}

# ========================================
# 步骤 0: 准备阶段
# ========================================
log_step "0" "准备阶段 - 登录获取Token并查询数据库初始状态"

log_info "检查后端服务..."
if ! curl -s -f "$BASE_URL/api/skills" > /dev/null 2>&1; then
    log_error "后端服务未运行，请先启动服务"
    exit 1
fi
log_success "后端服务运行中"

if [ -n "$TOKEN" ]; then
    log_info "使用提供的Token，跳过登录..."
    log_success "Token已设置: ${TOKEN:0:50}..."
else
    log_info "登录获取Token..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

    TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('data', {}).get('token', ''))" 2>/dev/null || echo "")

    if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ] || [ "$TOKEN" == "None" ]; then
        log_error "登录失败！"
        echo "响应: $LOGIN_RESPONSE"
        log_warning "提示: 如果已有Token，可以使用: ./test_skill_api_comprehensive.sh username password characterId token"
        exit 1
    fi

    log_success "登录成功"
    echo "Token: ${TOKEN:0:50}..."
fi

log_info "查询数据库初始状态..."
INITIAL_SKILL_COUNT=$(db_query "SELECT COUNT(*) FROM skill_definitions")
INITIAL_BINDING_COUNT=$(db_query "SELECT COUNT(*) FROM character_skill_bindings WHERE character_id = $CHARACTER_ID")
log_info "初始技能数量: $INITIAL_SKILL_COUNT"
log_info "角色 $CHARACTER_ID 的初始技能绑定数量: $INITIAL_BINDING_COUNT"

# ========================================
# 步骤 1: 技能管理 API 测试
# ========================================
log_step "1" "技能管理 API 测试"

# 1.1 获取所有技能
log_info "1.1 获取所有技能..."
ALL_SKILLS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/skills" \
  -H "Authorization: Bearer $TOKEN")
echo "$ALL_SKILLS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$ALL_SKILLS_RESPONSE"
SKILL_COUNT=$(echo "$ALL_SKILLS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_success "获取到 $SKILL_COUNT 个技能"

# 1.2 获取可用技能
log_info "1.2 获取可用技能..."
AVAILABLE_SKILLS_RESPONSE=$(curl -s -X GET "$BASE_URL/api/skills/available" \
  -H "Authorization: Bearer $TOKEN")
echo "$AVAILABLE_SKILLS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$AVAILABLE_SKILLS_RESPONSE"
AVAILABLE_COUNT=$(echo "$AVAILABLE_SKILLS_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_success "获取到 $AVAILABLE_COUNT 个可用技能"

# 1.3 创建测试技能
log_info "1.3 创建测试技能: $TEST_SKILL_ID"
CREATE_SKILL_BODY=$(cat <<EOF
{
  "skillId": "$TEST_SKILL_ID",
  "name": "$TEST_SKILL_NAME",
  "description": "$TEST_SKILL_DESC",
  "category": "test",
  "skillType": "ACTIVE",
  "executionType": "RULE_BASED",
  "functionSchema": "{\"type\":\"object\",\"properties\":{\"text\":{\"type\":\"string\",\"description\":\"输入文本\"}},\"required\":[\"text\"]}",
  "executionConfig": "{\"rule\":\"echo\"}",
  "maxUsagePerDay": 100,
  "version": "1.0.0",
  "author": "test-script",
  "isSystemSkill": false
}
EOF
)

CREATE_SKILL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$CREATE_SKILL_BODY")

echo "$CREATE_SKILL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_SKILL_RESPONSE"

CREATE_CODE=$(echo "$CREATE_SKILL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$CREATE_CODE" == "200" ]; then
    log_success "技能创建成功"
    verify_skill_in_db "$TEST_SKILL_ID"
else
    log_error "技能创建失败"
    echo "$CREATE_SKILL_RESPONSE"
    exit 1
fi

# 1.4 根据ID获取技能
log_info "1.4 根据ID获取技能: $TEST_SKILL_ID"
GET_SKILL_RESPONSE=$(curl -s -X GET "$BASE_URL/api/skills/$TEST_SKILL_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_SKILL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_SKILL_RESPONSE"
GET_CODE=$(echo "$GET_SKILL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$GET_CODE" == "200" ]; then
    log_success "获取技能成功"
else
    log_error "获取技能失败"
fi

# 1.5 更新技能
log_info "1.5 更新技能: $TEST_SKILL_ID"
UPDATE_SKILL_BODY=$(cat <<EOF
{
  "name": "${TEST_SKILL_NAME} (已更新)",
  "description": "${TEST_SKILL_DESC} - 已更新",
  "maxUsagePerDay": 200
}
EOF
)

UPDATE_SKILL_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/skills/$TEST_SKILL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$UPDATE_SKILL_BODY")

echo "$UPDATE_SKILL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_SKILL_RESPONSE"

UPDATE_CODE=$(echo "$UPDATE_SKILL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$UPDATE_CODE" == "200" ]; then
    log_success "技能更新成功"
    verify_skill_in_db "$TEST_SKILL_ID"
    UPDATED_NAME=$(db_query "SELECT name FROM skill_definitions WHERE skill_id = '$TEST_SKILL_ID'")
    if echo "$UPDATED_NAME" | grep -q "已更新"; then
        log_success "数据库验证：技能名称已更新"
    else
        log_error "数据库验证失败：技能名称未更新"
    fi
else
    log_error "技能更新失败"
fi

# ========================================
# 步骤 2: 角色技能装备 API 测试
# ========================================
log_step "2" "角色技能装备 API 测试"

# 2.1 获取角色已装备技能（初始状态）
log_info "2.1 获取角色已装备技能（初始状态）..."
GET_EQUIPPED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/characters/$CHARACTER_ID/skills" \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_EQUIPPED_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_EQUIPPED_RESPONSE"
INITIAL_EQUIPPED_COUNT=$(echo "$GET_EQUIPPED_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_info "初始已装备技能数量: $INITIAL_EQUIPPED_COUNT"

# 2.2 装备技能
log_info "2.2 装备技能: $TEST_SKILL_ID 到角色 $CHARACTER_ID"
EQUIP_SKILL_BODY=$(cat <<EOF
{
  "isEnabled": true,
  "autoTrigger": false,
  "priority": 10
}
EOF
)

EQUIP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/equip" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EQUIP_SKILL_BODY")

echo "$EQUIP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$EQUIP_RESPONSE"

EQUIP_CODE=$(echo "$EQUIP_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$EQUIP_CODE" == "200" ]; then
    log_success "技能装备成功"
    verify_character_skill_binding "$CHARACTER_ID" "$TEST_SKILL_ID"
    
    # 验证装备参数
    BINDING_IS_ENABLED=$(db_query "SELECT is_enabled FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    BINDING_PRIORITY=$(db_query "SELECT priority FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$BINDING_IS_ENABLED" == "1" ] && [ "$BINDING_PRIORITY" == "10" ]; then
        log_success "数据库验证：装备参数正确 (isEnabled=true, priority=10)"
    else
        log_error "数据库验证失败：装备参数不正确 (isEnabled=$BINDING_IS_ENABLED, priority=$BINDING_PRIORITY)"
    fi
else
    log_error "技能装备失败"
    echo "$EQUIP_RESPONSE"
fi

# 2.3 获取角色已装备技能（装备后）
log_info "2.3 获取角色已装备技能（装备后）..."
GET_EQUIPPED_AFTER_RESPONSE=$(curl -s -X GET "$BASE_URL/api/characters/$CHARACTER_ID/skills" \
  -H "Authorization: Bearer $TOKEN")
EQUIPPED_AFTER_COUNT=$(echo "$GET_EQUIPPED_AFTER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_info "装备后已装备技能数量: $EQUIPPED_AFTER_COUNT"
if [ "$EQUIPPED_AFTER_COUNT" -gt "$INITIAL_EQUIPPED_COUNT" ]; then
    log_success "已装备技能数量增加，验证通过"
else
    log_warning "已装备技能数量未增加"
fi

# 2.4 获取角色已启用技能
log_info "2.4 获取角色已启用技能..."
GET_ENABLED_RESPONSE=$(curl -s -X GET "$BASE_URL/api/characters/$CHARACTER_ID/skills/enabled" \
  -H "Authorization: Bearer $TOKEN")
ENABLED_COUNT=$(echo "$GET_ENABLED_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_info "已启用技能数量: $ENABLED_COUNT"

# 2.5 设置自动触发
log_info "2.5 设置自动触发: $TEST_SKILL_ID"
SET_AUTO_TRIGGER_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/auto-trigger?autoTrigger=true" \
  -H "Authorization: Bearer $TOKEN")
echo "$SET_AUTO_TRIGGER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SET_AUTO_TRIGGER_RESPONSE"
SET_AUTO_CODE=$(echo "$SET_AUTO_TRIGGER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$SET_AUTO_CODE" == "200" ]; then
    log_success "设置自动触发成功"
    AUTO_TRIGGER_VALUE=$(db_query "SELECT auto_trigger FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$AUTO_TRIGGER_VALUE" == "1" ]; then
        log_success "数据库验证：自动触发已设置 (autoTrigger=true)"
    else
        log_error "数据库验证失败：自动触发未设置 (autoTrigger=$AUTO_TRIGGER_VALUE)"
    fi
else
    log_error "设置自动触发失败"
fi

# 2.6 设置优先级
log_info "2.6 设置优先级: $TEST_SKILL_ID -> 20"
SET_PRIORITY_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/priority?priority=20" \
  -H "Authorization: Bearer $TOKEN")
echo "$SET_PRIORITY_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SET_PRIORITY_RESPONSE"
SET_PRIORITY_CODE=$(echo "$SET_PRIORITY_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$SET_PRIORITY_CODE" == "200" ]; then
    log_success "设置优先级成功"
    PRIORITY_VALUE=$(db_query "SELECT priority FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$PRIORITY_VALUE" == "20" ]; then
        log_success "数据库验证：优先级已设置 (priority=20)"
    else
        log_error "数据库验证失败：优先级未设置 (priority=$PRIORITY_VALUE)"
    fi
else
    log_error "设置优先级失败"
fi

# 2.7 启用/禁用技能
log_info "2.7 禁用技能: $TEST_SKILL_ID"
TOGGLE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/toggle?enabled=false" \
  -H "Authorization: Bearer $TOKEN")
echo "$TOGGLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TOGGLE_RESPONSE"
TOGGLE_CODE=$(echo "$TOGGLE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$TOGGLE_CODE" == "200" ]; then
    log_success "禁用技能成功"
    IS_ENABLED_VALUE=$(db_query "SELECT is_enabled FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$IS_ENABLED_VALUE" == "0" ]; then
        log_success "数据库验证：技能已禁用 (isEnabled=false)"
    else
        log_error "数据库验证失败：技能未禁用 (isEnabled=$IS_ENABLED_VALUE)"
    fi
else
    log_error "禁用技能失败"
fi

log_info "2.8 重新启用技能: $TEST_SKILL_ID"
TOGGLE_ENABLE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/toggle?enabled=true" \
  -H "Authorization: Bearer $TOKEN")
TOGGLE_ENABLE_CODE=$(echo "$TOGGLE_ENABLE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$TOGGLE_ENABLE_CODE" == "200" ]; then
    log_success "启用技能成功"
    IS_ENABLED_VALUE=$(db_query "SELECT is_enabled FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$IS_ENABLED_VALUE" == "1" ]; then
        log_success "数据库验证：技能已启用 (isEnabled=true)"
    else
        log_error "数据库验证失败：技能未启用 (isEnabled=$IS_ENABLED_VALUE)"
    fi
else
    log_error "启用技能失败"
fi

# ========================================
# 步骤 3: 技能执行 API 测试
# ========================================
log_step "3" "技能执行 API 测试"

# 3.1 执行技能
log_info "3.1 执行技能: $TEST_SKILL_ID"
EXECUTE_SKILL_BODY=$(cat <<EOF
{
  "skillId": "$TEST_SKILL_ID",
  "characterId": $CHARACTER_ID,
  "parameters": {
    "text": "Hello, Skill API Test!"
  },
  "additionalContext": {}
}
EOF
)

EXECUTE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills/execute" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$EXECUTE_SKILL_BODY")

echo "$EXECUTE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$EXECUTE_RESPONSE"

EXECUTE_CODE=$(echo "$EXECUTE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$EXECUTE_CODE" == "200" ]; then
    log_success "技能执行成功"
    get_skill_executions "$TEST_SKILL_ID"
    
    # 验证使用次数增加
    USAGE_COUNT=$(db_query "SELECT usage_count FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    log_info "技能使用次数: $USAGE_COUNT"
    if [ "$USAGE_COUNT" -gt 0 ]; then
        log_success "数据库验证：使用次数已更新"
    else
        log_warning "数据库验证：使用次数未更新"
    fi
else
    log_error "技能执行失败"
    echo "$EXECUTE_RESPONSE"
fi

# 3.2 获取角色可用技能（用于 Function Calling）
log_info "3.2 获取角色可用技能（用于 Function Calling）..."
GET_CHARACTER_AVAILABLE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/skills/character/$CHARACTER_ID/available" \
  -H "Authorization: Bearer $TOKEN")
echo "$GET_CHARACTER_AVAILABLE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GET_CHARACTER_AVAILABLE_RESPONSE"
CHARACTER_AVAILABLE_COUNT=$(echo "$GET_CHARACTER_AVAILABLE_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_info "角色可用技能数量: $CHARACTER_AVAILABLE_COUNT"

# 3.3 检查自动触发技能
log_info "3.3 检查自动触发技能..."
CHECK_AUTO_TRIGGER_BODY=$(cat <<EOF
{
  "input": "测试自动触发关键词"
}
EOF
)

CHECK_AUTO_TRIGGER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/skills/character/$CHARACTER_ID/auto-trigger" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$CHECK_AUTO_TRIGGER_BODY")
echo "$CHECK_AUTO_TRIGGER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CHECK_AUTO_TRIGGER_RESPONSE"
AUTO_TRIGGER_COUNT=$(echo "$CHECK_AUTO_TRIGGER_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null || echo "0")
log_info "自动触发技能数量: $AUTO_TRIGGER_COUNT"

# ========================================
# 步骤 4: 清理和验证
# ========================================
log_step "4" "清理和最终验证"

# 4.1 卸载技能
log_info "4.1 卸载技能: $TEST_SKILL_ID"
UNEQUIP_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/characters/$CHARACTER_ID/skills/$TEST_SKILL_ID/unequip" \
  -H "Authorization: Bearer $TOKEN")
echo "$UNEQUIP_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UNEQUIP_RESPONSE"

UNEQUIP_CODE=$(echo "$UNEQUIP_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$UNEQUIP_CODE" == "200" ]; then
    log_success "技能卸载成功"
    BINDING_COUNT=$(db_query "SELECT COUNT(*) FROM character_skill_bindings WHERE character_id = $CHARACTER_ID AND skill_id = '$TEST_SKILL_ID'")
    if [ "$BINDING_COUNT" == "0" ]; then
        log_success "数据库验证：技能绑定已删除"
    else
        log_error "数据库验证失败：技能绑定未删除 (count: $BINDING_COUNT)"
    fi
else
    log_error "技能卸载失败"
fi

# 4.2 删除技能
log_info "4.2 删除技能: $TEST_SKILL_ID"
DELETE_SKILL_RESPONSE=$(curl -s -X DELETE "$BASE_URL/api/skills/$TEST_SKILL_ID" \
  -H "Authorization: Bearer $TOKEN")
echo "$DELETE_SKILL_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$DELETE_SKILL_RESPONSE"

DELETE_CODE=$(echo "$DELETE_SKILL_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('code', 0))" 2>/dev/null || echo "0")
if [ "$DELETE_CODE" == "200" ]; then
    log_success "技能删除成功"
    SKILL_COUNT=$(db_query "SELECT COUNT(*) FROM skill_definitions WHERE skill_id = '$TEST_SKILL_ID'")
    if [ "$SKILL_COUNT" == "0" ]; then
        log_success "数据库验证：技能已删除"
    else
        log_error "数据库验证失败：技能未删除 (count: $SKILL_COUNT)"
    fi
else
    log_error "技能删除失败"
fi

# 4.3 最终数据库状态
log_info "4.3 最终数据库状态..."
FINAL_SKILL_COUNT=$(db_query "SELECT COUNT(*) FROM skill_definitions")
FINAL_BINDING_COUNT=$(db_query "SELECT COUNT(*) FROM character_skill_bindings WHERE character_id = $CHARACTER_ID")
log_info "最终技能数量: $FINAL_SKILL_COUNT (初始: $INITIAL_SKILL_COUNT)"
log_info "最终技能绑定数量: $FINAL_BINDING_COUNT (初始: $INITIAL_BINDING_COUNT)"

# ========================================
# 测试总结
# ========================================
log_step "总结" "测试完成"

log_success "所有测试步骤已完成！"
log_info "测试的技能ID: $TEST_SKILL_ID"
log_info "测试的角色ID: $CHARACTER_ID"
log_info "请查看上述输出确认所有测试是否通过"
