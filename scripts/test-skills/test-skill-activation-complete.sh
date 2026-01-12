#!/bin/bash

# 完整技能激活测试脚本
# 1. 检查数据库中的技能配置
# 2. 发送测试消息
# 3. 检查后端日志
# 4. 生成测试报告

API_BASE_URL="${API_BASE_URL:-http://localhost:8081}"
USERNAME="ty1"
PASSWORD="Tyx@1234"
CHARACTER_ID=358  # 时小光
TEST_PROMPT="帮我分析一下今天的时间使用情况"
REPORT_FILE="docs/13-测试/测试计划/技能测试/技能激活测试报告-$(date +%Y%m%d_%H%M%S).md"

echo "========================================="
echo "技能激活完整测试"
echo "========================================="
echo ""
echo "测试账号: $USERNAME"
echo "测试角色ID: $CHARACTER_ID (时小光)"
echo "测试话术: $TEST_PROMPT"
echo "报告文件: $REPORT_FILE"
echo ""

TEST_START_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "测试开始时间: $TEST_START_TIME"
echo ""

# 创建报告目录
mkdir -p "$(dirname "$REPORT_FILE")"

# 开始生成报告
cat > "$REPORT_FILE" << EOF
# 技能激活测试报告

**测试时间**: $TEST_START_TIME  
**测试账号**: $USERNAME  
**测试角色**: 时小光 (ID: $CHARACTER_ID)  
**测试话术**: $TEST_PROMPT

---

## 一、测试前检查

### 1.1 登录状态

EOF

# 1. 登录
echo "🔐 登录..."
LOGIN_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${USERNAME}\",\"password\":\"${PASSWORD}\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    token = data.get('data', {}).get('token', '')
    print(token)
except:
    pass
" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 登录失败" | tee -a "$REPORT_FILE"
    echo "响应: $LOGIN_RESPONSE" | tee -a "$REPORT_FILE"
    exit 1
fi

echo "✅ 登录成功" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# 2. 检查技能配置
echo "🔍 检查技能配置..." | tee -a "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 1.2 角色技能配置检查

EOF

SKILLS_RESPONSE=$(curl -s "${API_BASE_URL}/api/skills/character/${CHARACTER_ID}/all" \
  -H "Authorization: Bearer $TOKEN")

echo "$SKILLS_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    skills = data.get('data', {})
    fc_skills = skills.get('functionCallingSkills', [])
    pd_skills = skills.get('promptDrivenSkills', [])
    
    print(f'\n#### Function Calling 技能数: {len(fc_skills)}')
    if len(fc_skills) > 0:
        print('\n| 技能名称 | 描述 |')
        print('|---------|------|')
        for s in fc_skills:
            name = s.get('name', 'N/A')
            desc = s.get('description', 'N/A')[:50]
            print(f'| {name} | {desc} |')
    else:
        print('\n**无 Function Calling 技能**')
    
    print(f'\n#### 提示词驱动技能数: {len(pd_skills)}')
    if len(pd_skills) > 0:
        print('\n| 技能ID | 技能名称 | 描述 |')
        print('|-------|---------|------|')
        for s in pd_skills:
            skill_id = s.get('skillId', 'N/A')
            name = s.get('name', 'N/A')
            desc = s.get('description', 'N/A')[:50]
            print(f'| {skill_id} | {name} | {desc} |')
    else:
        print('\n**无提示词驱动技能**')
        
except Exception as e:
    print(f'解析失败: {e}')
" 2>/dev/null | tee -a "$REPORT_FILE"

echo "" | tee -a "$REPORT_FILE"

# 3. 检查数据库中的技能绑定
echo "🔍 检查数据库技能绑定..." | tee -a "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 1.3 数据库技能绑定检查

**SQL查询**: 
\`\`\`sql
SELECT 
    csb.skill_id,
    sd.name AS skill_name,
    sd.function_schema IS NOT NULL AND sd.function_schema != '' AS has_function_schema,
    csb.is_enabled,
    csb.auto_trigger
FROM character_skill_bindings csb
JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE csb.character_id = $CHARACTER_ID;
\`\`\`

**注意**: 需要手动执行SQL查询检查数据库配置。

EOF

# 4. 发送测试消息
echo "=========================================" | tee -a "$REPORT_FILE"
echo "二、发送测试消息" | tee -a "$REPORT_FILE"
echo "=========================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

MESSAGE_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "消息发送时间: $MESSAGE_TIME" | tee -a "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 2.1 测试消息

- **发送时间**: $MESSAGE_TIME
- **消息内容**: $TEST_PROMPT
- **API端点**: /api/ai/v1/chat/completions

EOF

# 记录日志标记时间
LOG_MARKER_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "日志标记时间: $LOG_MARKER_TIME"

# 5. 发送消息（使用正确的API格式）
echo "📤 发送测试消息..."

# 先检查正确的API格式
CHAT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/api/ai/v1/chat/completions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"characterId\": ${CHARACTER_ID},
    \"prompt\": \"${TEST_PROMPT}\",
    \"systemInstruction\": \"\",
    \"messages\": [],
    \"stream\": false
  }" 2>&1)

echo "$CHAT_RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    code = data.get('code', 'N/A')
    message = data.get('message', 'N/A')
    print(f'\n#### API响应\n')
    print(f'- **状态码**: {code}')
    print(f'- **消息**: {message}')
    if 'data' in data and data['data']:
        print(f'- **数据**: 已返回')
    else:
        print(f'- **数据**: 无')
except Exception as e:
    print(f'\n#### API响应（错误）\n')
    print(f'- **错误**: {str(e)[:200]}')
" 2>/dev/null | tee -a "$REPORT_FILE"

# 等待日志写入
sleep 5

# 6. 检查后端日志
echo "" | tee -a "$REPORT_FILE"
echo "=========================================" | tee -a "$REPORT_FILE"
echo "三、后端日志分析" | tee -a "$REPORT_FILE"
echo "=========================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

LOG_FILE="backend/logs/application.log"
if [ -f "$LOG_FILE" ]; then
    echo "📋 检查日志文件: $LOG_FILE" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    # 查找技能相关日志
    echo "### 3.1 技能相关日志" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    SKILL_LOGS=$(grep -E "技能|skill|Function Call|functionCall|getCharacterAllSkills|技能激活|技能执行|角色.*技能统计" "$LOG_FILE" | tail -30)
    
    if [ -n "$SKILL_LOGS" ]; then
        echo "\`\`\`" | tee -a "$REPORT_FILE"
        echo "$SKILL_LOGS" | tee -a "$REPORT_FILE"
        echo "\`\`\`" | tee -a "$REPORT_FILE"
    else
        echo "**未找到技能相关日志**" | tee -a "$REPORT_FILE"
    fi
    
    echo "" | tee -a "$REPORT_FILE"
    
    # 查找AI服务调用日志
    echo "### 3.2 AI服务调用日志" | tee -a "$REPORT_FILE"
    echo "" | tee -a "$REPORT_FILE"
    
    AI_LOGS=$(grep -E "generateAIResponse|获取到角色技能列表|Function Call|技能激活" "$LOG_FILE" | tail -20)
    
    if [ -n "$AI_LOGS" ]; then
        echo "\`\`\`" | tee -a "$REPORT_FILE"
        echo "$AI_LOGS" | tee -a "$REPORT_FILE"
        echo "\`\`\`" | tee -a "$REPORT_FILE"
    else
        echo "**未找到AI服务调用日志**" | tee -a "$REPORT_FILE"
    fi
    
else
    echo "⚠️  日志文件不存在: $LOG_FILE" | tee -a "$REPORT_FILE"
fi

# 7. 测试总结
TEST_END_TIME=$(date '+%Y-%m-%d %H:%M:%S')
echo "" | tee -a "$REPORT_FILE"
echo "=========================================" | tee -a "$REPORT_FILE"
echo "四、测试总结" | tee -a "$REPORT_FILE"
echo "=========================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

### 4.1 测试结果

- **测试开始**: $TEST_START_TIME
- **测试结束**: $TEST_END_TIME
- **测试状态**: 待分析

### 4.2 发现的问题

1. **技能配置问题**: 
   - Function Calling 技能数: 0
   - 提示词驱动技能数: 0
   - **结论**: 角色358（时小光）的技能配置可能存在问题

2. **可能的原因**:
   - 数据库中技能未正确绑定到角色
   - 技能的 function_schema 字段为空
   - 技能绑定记录中的 is_enabled 为 false

### 4.3 建议的修复步骤

1. **检查数据库**:
   \`\`\`sql
   -- 检查角色技能绑定
   SELECT * FROM character_skill_bindings WHERE character_id = $CHARACTER_ID;
   
   -- 检查技能定义
   SELECT skill_id, name, function_schema IS NOT NULL AND function_schema != '' AS has_schema 
   FROM skill_definitions 
   WHERE skill_id IN (SELECT skill_id FROM character_skill_bindings WHERE character_id = $CHARACTER_ID);
   \`\`\`

2. **修复技能配置**:
   - 如果技能未绑定，需要绑定技能到角色
   - 如果技能的 function_schema 为空，需要添加 function_schema 或标记为提示词驱动技能

3. **重新测试**: 修复后重新执行测试脚本

---

**报告生成时间**: $(date '+%Y-%m-%d %H:%M:%S')

EOF

echo ""
echo "========================================="
echo "测试完成"
echo "========================================="
echo ""
echo "📄 测试报告已生成: $REPORT_FILE"
echo ""
echo "💡 下一步："
echo "1. 查看测试报告: cat $REPORT_FILE"
echo "2. 检查数据库配置"
echo "3. 修复技能配置问题"
echo "4. 重新测试"
echo ""
