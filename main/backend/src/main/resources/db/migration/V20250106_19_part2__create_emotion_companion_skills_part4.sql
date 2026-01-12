-- 心小暖技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_19_part2__create_emotion_companion_skills_part4.sql
-- 
-- 说明：本文件包含心小暖的第7-8个技能
-- 7. 危机支持（Crisis Support）
-- 8. 陪伴与鼓励（Companionship & Encouragement）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：危机支持（Crisis Support）
-- ============================================

-- 7.1 插入技能定义（Level 1）
INSERT INTO skill_definitions (
    skill_id,
    name,
    description,
    category,
    skill_type,
    execution_type,
    function_schema,
    execution_config,
    auto_trigger_keywords,
    required_permissions,
    max_usage_per_day,
    version,
    author,
    is_system_skill,
    created_at,
    updated_at
) VALUES (
    'crisis_support',
    '危机支持',
    '在情绪危机时提供及时支持和引导。识别危机信号，提供紧急支持，引导用户寻求专业帮助，提供危机资源，帮助用户度过情绪危机。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "crisisType": {
                "type": "string",
                "enum": ["suicidal", "self_harm", "severe_depression", "panic", "trauma", "other"],
                "description": "危机类型：suicidal(自杀), self_harm(自伤), severe_depression(严重抑郁), panic(恐慌), trauma(创伤), other(其他)"
            },
            "riskLevel": {
                "type": "string",
                "enum": ["low", "medium", "high", "critical"],
                "description": "风险等级：low(低), medium(中), high(高), critical(紧急)"
            },
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "危机症状"
            },
            "action": {
                "type": "string",
                "enum": ["assess", "support", "guide", "resources"],
                "default": "assess",
                "description": "操作类型：assess(评估), support(支持), guide(引导), resources(资源)"
            }
        },
        "required": ["crisisType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的危机支持"
    }',
    '危机,紧急,情绪危机,支持,危机干预,紧急帮助',
    NULL,
    -1,
    '1.0.0',
    'HeartSphere Team',
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    function_schema = VALUES(function_schema),
    execution_config = VALUES(execution_config),
    version = VALUES(version),
    updated_at = NOW();

-- 7.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'crisis_support',
    2,
    '## 危机支持技能使用说明

### 功能描述
危机支持技能在情绪危机时提供及时支持和引导，帮助用户度过情绪危机，引导用户寻求专业帮助。

### 核心功能
1. **危机识别**：识别危机信号和风险
2. **风险评估**：评估危机风险等级
3. **紧急支持**：提供紧急情感支持
4. **专业引导**：引导用户寻求专业帮助
5. **资源提供**：提供危机资源（热线、医院等）
6. **安全计划**：制定安全计划

### 参数说明
- **crisisType** (必填): 危机类型
  - `suicidal`: 自杀风险
  - `self_harm`: 自伤风险
  - `severe_depression`: 严重抑郁
  - `panic`: 恐慌发作
  - `trauma`: 创伤反应
  - `other`: 其他危机
- **riskLevel** (可选): 风险等级
- **symptoms** (可选): 危机症状数组
- **action** (可选): 操作类型
  - `assess`: 评估风险
  - `support`: 提供支持
  - `guide`: 引导帮助
  - `resources`: 提供资源

### 使用场景
- 用户处于情绪危机
- 有自杀或自伤风险
- 需要紧急支持
- 需要专业帮助引导

### 执行流程
1. 识别危机信号和风险
2. 评估危机风险等级
3. 提供紧急情感支持
4. 引导用户寻求专业帮助
5. 提供危机资源
6. 制定安全计划
7. 持续关注和支持

### 重要提醒
- **紧急情况**：如果风险等级为critical，必须立即引导用户寻求专业帮助
- **专业帮助**：提供心理危机干预热线、医院急诊等资源
- **安全第一**：确保用户安全是第一要务
- **持续关注**：危机后持续关注用户状态

### 返回格式
```json
{
  "success": true,
  "action": "assess",
  "crisisType": "suicidal",
  "riskLevel": "high",
  "assessment": "您目前处于高风险状态，需要立即寻求专业帮助",
  "immediateSupport": "我理解您现在的痛苦，您不是一个人，有人可以帮助您",
  "professionalHelp": {
    "urgent": true,
    "resources": [
      {"type": "hotline", "name": "心理危机干预热线", "number": "400-xxx-xxxx"},
      {"type": "hospital", "name": "就近医院急诊科", "action": "立即前往"}
    ]
  },
  "safetyPlan": {
    "steps": [
      "联系信任的人",
      "前往医院急诊",
      "拨打危机热线"
    ]
  },
  "followUp": "我会持续关注您，请务必寻求专业帮助"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能8：陪伴与鼓励（Companionship & Encouragement）
-- ============================================

-- 8.1 插入技能定义（Level 1）
INSERT INTO skill_definitions (
    skill_id,
    name,
    description,
    category,
    skill_type,
    execution_type,
    function_schema,
    execution_config,
    auto_trigger_keywords,
    required_permissions,
    max_usage_per_day,
    version,
    author,
    is_system_skill,
    created_at,
    updated_at
) VALUES (
    'companionship_encouragement',
    '陪伴与鼓励',
    '提供日常陪伴和鼓励，减少孤独感。通过日常对话、关心问候、鼓励支持等方式，让用户感到被关注和被关心，提供情感陪伴。',
    'healthcare',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "situation": {
                "type": "string",
                "enum": ["daily", "difficulty", "achievement", "lonely", "other"],
                "description": "情境：daily(日常), difficulty(困难), achievement(成就), lonely(孤独), other(其他)"
            },
            "userState": {
                "type": "string",
                "description": "用户当前状态"
            },
            "action": {
                "type": "string",
                "enum": ["companion", "encourage", "care", "support"],
                "default": "companion",
                "description": "操作类型：companion(陪伴), encourage(鼓励), care(关心), support(支持)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的陪伴和鼓励"
    }',
    '陪伴,鼓励,支持,关心,情感陪伴,减少孤独',
    NULL,
    -1,
    '1.0.0',
    'HeartSphere Team',
    true,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    function_schema = VALUES(function_schema),
    execution_config = VALUES(execution_config),
    version = VALUES(version),
    updated_at = NOW();

-- 8.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'companionship_encouragement',
    2,
    '## 陪伴与鼓励技能使用说明

### 功能描述
陪伴与鼓励技能提供日常陪伴和鼓励，减少用户的孤独感，让用户感到被关注和被关心。

### 核心功能
1. **日常陪伴**：提供日常陪伴和对话
2. **关心问候**：关心用户的日常生活
3. **鼓励支持**：在困难时提供鼓励和支持
4. **成就庆祝**：庆祝用户的成就
5. **情感支持**：提供情感支持
6. **减少孤独**：减少用户的孤独感

### 参数说明
- **situation** (可选): 情境
  - `daily`: 日常陪伴
  - `difficulty`: 遇到困难
  - `achievement`: 取得成就
  - `lonely`: 感到孤独
  - `other`: 其他情境
- **userState** (可选): 用户当前状态
- **action** (可选): 操作类型
  - `companion`: 陪伴
  - `encourage`: 鼓励
  - `care`: 关心
  - `support`: 支持

### 使用场景
- 感到孤独，需要陪伴
- 遇到困难，需要鼓励
- 取得成就，想要分享
- 需要日常关心和支持

### 执行流程
1. 了解用户的当前状态和需求
2. 根据情境提供相应的陪伴和鼓励
3. 关心用户的日常生活
4. 在困难时提供鼓励和支持
5. 庆祝用户的成就
6. 提供情感支持
7. 减少用户的孤独感

### 陪伴和鼓励方式
- **日常对话**：像朋友一样自然对话
- **关心问候**：关心用户的日常生活
- **鼓励支持**：在困难时给予鼓励
- **成就庆祝**：庆祝用户的成就
- **情感共鸣**：理解用户的情感
- **持续陪伴**：提供持续的陪伴

### 返回格式
```json
{
  "success": true,
  "action": "companion",
  "situation": "daily",
  "companionship": "今天过得怎么样？有什么想分享的吗？",
  "care": "记得照顾好自己，注意休息",
  "encouragement": "你做得很好，继续保持！",
  "support": "我会一直在这里陪伴你，支持你",
  "response": "无论什么时候，我都在这里。你想聊聊什么吗？"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到心小暖角色
-- ============================================

-- 获取心小暖的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '心小暖' LIMIT 1);

-- 绑定技能7：危机支持
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'crisis_support',
    true,
    true,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能8：陪伴与鼓励
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'companionship_encouragement',
    true,
    true,
    8,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 验证插入结果
SELECT 
    '技能定义' as type,
    COUNT(*) as count
FROM skill_definitions 
WHERE skill_id IN ('crisis_support', 'companionship_encouragement')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('crisis_support', 'companionship_encouragement')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('crisis_support', 'companionship_encouragement')
    AND character_id = @character_id;
