#!/usr/bin/env bash
# 使用 ty1 / Tyx@1234 调用登录接口获取 token，再运行 API 自动化测试
# 用法：在项目根目录执行 ./scripts/test/run-api-tests-with-login.sh
# 默认 Admin 账号：admin / Tyx@19811009；Main 账号：ty1 / Tyx@1234（可设 ADMIN_TEST_USER/PASSWORD、MAIN_TEST_USER/PASSWORD 覆盖）
# 需先启动 Admin 后端(8085)、Main 后端(8081)

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

ADMIN_USER="${ADMIN_TEST_USER:-admin}"
ADMIN_PASS="${ADMIN_TEST_PASSWORD:-Tyx@19811009}"
MAIN_USER="${MAIN_TEST_USER:-ty1}"
MAIN_PASS="${MAIN_TEST_PASSWORD:-Tyx@1234}"
ADMIN_URL="${ADMIN_BASE_URL:-http://localhost:8085}"
MAIN_URL="${MAIN_BASE_URL:-http://localhost:8081}"

echo "========== 使用账号登录并获取 token =========="
echo "Admin 账号: $ADMIN_USER @ $ADMIN_URL"
echo "Main 账号:  $MAIN_USER @ $MAIN_URL"
echo ""

# 解析 JSON 中的 token（兼容 Admin 直接 {token} 或 Main 的 {data: {token}}）
get_token_from_json() {
  local json="$1"
  local key="${2:-token}"
  python3 -c "
import sys, json
key = sys.argv[2] if len(sys.argv) > 2 else 'token'
try:
    d = json.loads(sys.argv[1])
    if 'data' in d and isinstance(d.get('data'), dict) and key in d['data']:
        print(d['data'][key] or '')
    elif key in d:
        print(d[key] or '')
    else:
        print('')
except Exception:
    print('', file=sys.stderr)
    sys.exit(1)
" "$json" "$key"
}

# 1. Admin 登录
echo ">>> Admin 登录..."
ADMIN_RESP=$(curl -s -X POST "$ADMIN_URL/api/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" 2>/dev/null) || true

ADMIN_TOKEN=$(get_token_from_json "$ADMIN_RESP" "token")
if [ -z "$ADMIN_TOKEN" ]; then
  echo "Admin 登录失败或服务未启动($ADMIN_URL)。响应: ${ADMIN_RESP:0:200}"
  echo "请先启动 Admin 后端: ./scripts/start/start-admin-backend.sh"
  exit 1
fi
echo "Admin token 已获取 (长度 ${#ADMIN_TOKEN})"

# 2. Main 登录
echo ">>> Main 登录..."
MAIN_RESP=$(curl -s -X POST "$MAIN_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$MAIN_USER\",\"password\":\"$MAIN_PASS\"}" 2>/dev/null) || true

MAIN_TOKEN=$(get_token_from_json "$MAIN_RESP" "token")
if [ -z "$MAIN_TOKEN" ]; then
  echo "Main 登录失败或服务未启动($MAIN_URL)，将跳过 Main 测试。响应: ${MAIN_RESP:0:200}"
  echo ""
else
  echo "Main token 已获取 (长度 ${#MAIN_TOKEN})"
  echo ""
fi

# 3. 运行 Admin 技能管理 API 测试
echo "========== 运行 Admin 技能管理 API 测试 =========="
export API_TEST_TOKEN="$ADMIN_TOKEN"
python3 .claude/skills/api-automation-testing/scripts/api_test_executor.py \
  admin/backend/api-tests/skills/api_test_plan.json \
  --output admin/backend/api-tests/skills/results.json
ADMIN_EXIT=$?

# 4. 运行 Main 技能执行 API 测试（若已获取 Main token）
if [ -n "$MAIN_TOKEN" ]; then
  echo ""
  echo "========== 运行 Main 技能执行 API 测试 =========="
  export API_TEST_TOKEN="$MAIN_TOKEN"
  python3 .claude/skills/api-automation-testing/scripts/api_test_executor.py \
    main/backend/api-tests/skill-execution/api_test_plan.json \
    --output main/backend/api-tests/skill-execution/results.json
  MAIN_EXIT=$?
else
  MAIN_EXIT=2
fi

echo ""
echo "========== 结果 =========="
echo "Admin 技能管理: $([ $ADMIN_EXIT -eq 0 ] && echo '通过' || echo '失败')"
if [ -n "$MAIN_TOKEN" ]; then
  echo "Main 技能执行:  $([ $MAIN_EXIT -eq 0 ] && echo '通过' || echo '失败')"
else
  echo "Main 技能执行:  已跳过（未获取 Main token）"
fi
[ $ADMIN_EXIT -eq 0 ] && [ ${MAIN_EXIT:-0} -ne 1 ] && exit 0 || exit 1
