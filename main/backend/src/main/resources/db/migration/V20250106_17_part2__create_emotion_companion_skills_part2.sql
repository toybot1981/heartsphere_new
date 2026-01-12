-- 心小暖技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_17_part2__create_emotion_companion_skills_part2.sql
-- 
-- 说明：本文件包含心小暖的第3-4个技能
-- 3. 倾听与共情（Active Listening & Empathy）
-- 4. 正念练习引导（Mindfulness Practice Guidance）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：倾听与共情（Active Listening & Empathy）
-- ============================================

-- 3.1 插入技能定义（Level 1）
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
    'active_listening_empathy',
    '倾听与共情',
    '提供深度倾听和共情支持，让用户感到被理解。认真倾听用户的分享，理解用户的情感，给予共情回应，提供情感支持。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "userMessage": {
                "type": "string",
                "description": "用户的消息或分享"
            },
            "emotion": {
                "type": "string",
                "enum": ["sad", "angry", "anxious", "frustrated", "lonely", "confused", "other"],
                "description": "用户情绪"
            },
            "action": {
                "type": "string",
                "enum": ["listen", "empathize", "validate", "support"],
                "default": "listen",
                "description": "操作类型：listen(倾听), empathize(共情), validate(验证), support(支持)"
            }
        },
        "required": ["userMessage"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的倾听和共情"
    }',
    '倾听,共情,理解,陪伴,情感支持,被理解',
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

-- 3.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'active_listening_empathy',
    2,
    '## 倾听与共情技能使用说明

### 功能描述
倾听与共情技能提供深度倾听和共情支持，让用户感到被理解，提供情感支持和陪伴。

### 核心功能
1. **深度倾听**：认真倾听用户的分享，不打断、不评判
2. **情感理解**：理解用户的情感和感受
3. **共情回应**：给予共情回应，让用户感到被理解
4. **情感验证**：验证用户的情感是合理的
5. **情感支持**：提供情感支持，让用户感到被关心
6. **陪伴支持**：提供陪伴，减少孤独感

### 参数说明
- **userMessage** (必填): 用户的消息或分享
- **emotion** (可选): 用户情绪
  - `sad`: 悲伤
  - `angry`: 愤怒
  - `anxious`: 焦虑
  - `frustrated`: 沮丧
  - `lonely`: 孤独
  - `confused`: 困惑
  - `other`: 其他
- **action** (可选): 操作类型
  - `listen`: 倾听
  - `empathize`: 共情
  - `validate`: 验证情感
  - `support`: 提供支持

### 使用场景
- 用户想要倾诉和分享
- 感到不被理解，需要共情
- 需要情感支持和陪伴
- 想要被倾听和理解

### 执行流程
1. 认真倾听用户的分享
2. 理解用户的情感和感受
3. 给予共情回应
4. 验证用户的情感是合理的
5. 提供情感支持
6. 提供陪伴，减少孤独感

### 倾听和共情原则
- **不打断**：让用户完整表达
- **不评判**：不评判用户的情感和行为
- **理解感受**：理解用户的情感体验
- **共情回应**：表达理解和共情
- **情感验证**：验证用户的情感是合理的
- **提供支持**：提供情感支持和陪伴

### 返回格式
```json
{
  "success": true,
  "action": "empathize",
  "emotion": "sad",
  "understanding": "我理解你现在的感受，这确实不容易",
  "empathy": "我能感受到你的难过，你的感受是完全可以理解的",
  "validation": "你的情感是合理的，有这样的感受很正常",
  "support": "我会一直在这里陪伴你，支持你",
  "response": "你想继续聊聊吗？我在这里倾听"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能4：正念练习引导（Mindfulness Practice Guidance）
-- ============================================

-- 4.1 插入技能定义（Level 1）
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
    'mindfulness_practice_guidance',
    '正念练习引导',
    '引导正念练习，帮助用户活在当下，减少焦虑。教授正念冥想、身体扫描等正念练习方法，帮助用户培养正念能力，提高情绪调节能力。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "practiceType": {
                "type": "string",
                "enum": ["breathing", "body_scan", "walking", "eating", "loving_kindness", "all"],
                "description": "练习类型：breathing(呼吸), body_scan(身体扫描), walking(正念行走), eating(正念饮食), loving_kindness(慈心), all(全部)"
            },
            "duration": {
                "type": "integer",
                "description": "练习时长（分钟）"
            },
            "goal": {
                "type": "string",
                "enum": ["reduce_anxiety", "improve_focus", "emotional_regulation", "stress_relief", "general"],
                "description": "练习目标"
            },
            "action": {
                "type": "string",
                "enum": ["guide", "practice", "teach", "remind"],
                "default": "guide",
                "description": "操作类型：guide(引导), practice(练习), teach(教授), remind(提醒)"
            }
        },
        "required": ["practiceType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的正念练习引导"
    }',
    '正念,冥想,正念练习,放松,正念冥想,身体扫描',
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

-- 4.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'mindfulness_practice_guidance',
    2,
    '## 正念练习引导技能使用说明

### 功能描述
正念练习引导技能引导用户进行正念练习，帮助用户活在当下，减少焦虑，提高情绪调节能力。

### 核心功能
1. **练习引导**：引导用户进行正念练习
2. **方法教授**：教授正念练习方法
3. **练习指导**：提供详细的练习指导
4. **习惯建立**：帮助建立正念练习习惯
5. **效果追踪**：追踪练习效果
6. **个性化建议**：根据用户情况提供个性化建议

### 参数说明
- **practiceType** (必填): 练习类型
  - `breathing`: 正念呼吸
  - `body_scan`: 身体扫描
  - `walking`: 正念行走
  - `eating`: 正念饮食
  - `loving_kindness`: 慈心练习
  - `all`: 全部练习
- **duration** (可选): 练习时长（分钟），默认10分钟
- **goal** (可选): 练习目标
  - `reduce_anxiety`: 减少焦虑
  - `improve_focus`: 提高专注力
  - `emotional_regulation`: 情绪调节
  - `stress_relief`: 压力缓解
  - `general`: 一般练习
- **action** (可选): 操作类型
  - `guide`: 引导练习
  - `practice`: 进行练习
  - `teach`: 教授方法
  - `remind`: 提醒练习

### 使用场景
- 感到焦虑，想要放松
- 想要提高专注力
- 需要情绪调节
- 想要培养正念能力

### 执行流程
1. 了解用户的练习目标和需求
2. 选择合适的正念练习类型
3. 引导用户进行正念练习
4. 提供详细的练习指导
5. 帮助用户建立正念练习习惯
6. 追踪练习效果
7. 提供个性化建议

### 正念练习方法
- **正念呼吸**：专注于呼吸，观察呼吸的起伏
- **身体扫描**：从脚到头扫描身体，观察身体感受
- **正念行走**：在行走中保持正念，观察每一步
- **正念饮食**：在进食中保持正念，感受食物的味道
- **慈心练习**：培养对自己和他人的慈心

### 返回格式
```json
{
  "success": true,
  "action": "guide",
  "practiceType": "breathing",
  "practiceName": "正念呼吸",
  "duration": 10,
  "goal": "reduce_anxiety",
  "steps": [
    "找一个安静舒适的地方坐下",
    "闭上眼睛，放松身体",
    "将注意力集中在呼吸上",
    "观察呼吸的自然流动",
    "当注意力分散时，温柔地回到呼吸",
    "持续10分钟"
  ],
  "tips": [
    "不要强迫自己，保持自然",
    "当思绪飘走时，温柔地回到呼吸",
    "每天坚持练习，效果会更好"
  ],
  "benefits": [
    "减少焦虑",
    "提高专注力",
    "改善情绪"
  ]
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

-- 绑定技能3：倾听与共情
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
    'active_listening_empathy',
    true,
    false,
    3,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能4：正念练习引导
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
    'mindfulness_practice_guidance',
    true,
    false,
    4,
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
WHERE skill_id IN ('active_listening_empathy', 'mindfulness_practice_guidance')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('active_listening_empathy', 'mindfulness_practice_guidance')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('active_listening_empathy', 'mindfulness_practice_guidance')
    AND character_id = @character_id;
