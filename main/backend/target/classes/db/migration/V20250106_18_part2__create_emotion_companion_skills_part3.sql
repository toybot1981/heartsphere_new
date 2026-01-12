-- 心小暖技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_18_part2__create_emotion_companion_skills_part3.sql
-- 
-- 说明：本文件包含心小暖的第5-6个技能
-- 5. 积极心理学干预（Positive Psychology Intervention）
-- 6. 情绪日记（Emotion Journal）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：积极心理学干预（Positive Psychology Intervention）
-- ============================================

-- 5.1 插入技能定义（Level 1）
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
    'positive_psychology_intervention',
    '积极心理学干预',
    '运用积极心理学方法，培养积极情绪和心态。通过感恩练习、优势发现、乐观培养等方法，帮助用户提升幸福感，建立积极的生活态度。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "interventionType": {
                "type": "string",
                "enum": ["gratitude", "strengths", "optimism", "kindness", "savoring", "all"],
                "description": "干预类型：gratitude(感恩), strengths(优势), optimism(乐观), kindness(善行), savoring(品味), all(全部)"
            },
            "goal": {
                "type": "string",
                "enum": ["happiness", "resilience", "wellbeing", "positive_emotions", "general"],
                "description": "目标：happiness(幸福感), resilience(韧性), wellbeing(幸福感), positive_emotions(积极情绪), general(一般)"
            },
            "action": {
                "type": "string",
                "enum": ["teach", "practice", "track", "review"],
                "default": "teach",
                "description": "操作类型：teach(教授), practice(练习), track(追踪), review(回顾)"
            }
        },
        "required": ["interventionType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的积极心理学干预"
    }',
    '积极心理学,感恩,乐观,幸福感,积极情绪,积极心态',
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

-- 5.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'positive_psychology_intervention',
    2,
    '## 积极心理学干预技能使用说明

### 功能描述
积极心理学干预技能运用积极心理学方法，培养用户的积极情绪和心态，提升幸福感，建立积极的生活态度。

### 核心功能
1. **方法教授**：教授积极心理学干预方法
2. **练习引导**：引导用户进行积极心理学练习
3. **效果追踪**：追踪干预效果
4. **习惯建立**：帮助建立积极的思维习惯
5. **幸福感提升**：提升用户的幸福感
6. **韧性培养**：培养心理韧性

### 参数说明
- **interventionType** (必填): 干预类型
  - `gratitude`: 感恩练习
  - `strengths`: 优势发现
  - `optimism`: 乐观培养
  - `kindness`: 善行练习
  - `savoring`: 品味练习
  - `all`: 全部干预
- **goal** (可选): 目标
  - `happiness`: 提升幸福感
  - `resilience`: 培养韧性
  - `wellbeing`: 提升幸福感
  - `positive_emotions`: 培养积极情绪
  - `general`: 一般目标
- **action** (可选): 操作类型
  - `teach`: 教授方法
  - `practice`: 进行练习
  - `track`: 追踪效果
  - `review`: 回顾进展

### 使用场景
- 想要提升幸福感
- 需要培养积极心态
- 想要建立积极的思维习惯
- 需要提升心理韧性

### 执行流程
1. 了解用户的目标和需求
2. 选择合适的积极心理学干预方法
3. 教授干预方法
4. 引导用户进行练习
5. 追踪干预效果
6. 帮助建立积极的思维习惯
7. 定期回顾和调整

### 积极心理学干预方法
- **感恩练习**：每天记录3件感恩的事
- **优势发现**：发现和运用个人优势
- **乐观培养**：培养乐观的解释风格
- **善行练习**：每天做一件善事
- **品味练习**：品味生活中的美好时刻

### 返回格式
```json
{
  "success": true,
  "action": "practice",
  "interventionType": "gratitude",
  "interventionName": "感恩练习",
  "goal": "happiness",
  "practice": {
    "task": "记录今天3件感恩的事",
    "steps": [
      "回想今天发生的事情",
      "找出3件值得感恩的事",
      "写下为什么感恩",
      "感受感恩的情绪"
    ],
    "duration": "10分钟"
  },
  "benefits": [
    "提升幸福感",
    "改善情绪",
    "增强人际关系"
  ],
  "tips": [
    "每天坚持练习",
    "具体描述感恩的原因",
    "感受感恩的情绪"
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
-- 技能6：情绪日记（Emotion Journal）
-- ============================================

-- 6.1 插入技能定义（Level 1）
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
    'emotion_journal',
    '情绪日记',
    '记录情绪日记，追踪情绪变化，发现情绪模式。帮助用户记录每日情绪，分析情绪变化规律，识别情绪触发因素，提高情绪觉察能力。',
    'healthcare',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "date": {
                "type": "string",
                "format": "date",
                "description": "日期（ISO格式：YYYY-MM-DD）"
            },
            "emotions": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "emotion": {"type": "string"},
                        "intensity": {"type": "integer", "minimum": 1, "maximum": 10},
                        "trigger": {"type": "string"},
                        "thoughts": {"type": "string"}
                    }
                },
                "description": "情绪记录列表"
            },
            "action": {
                "type": "string",
                "enum": ["record", "query", "analyze", "pattern"],
                "default": "record",
                "description": "操作类型：record(记录), query(查询), analyze(分析), pattern(模式识别)"
            },
            "timeRange": {
                "type": "string",
                "enum": ["week", "month", "custom"],
                "description": "时间范围"
            }
        },
        "required": ["date"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的情绪日记"
    }',
    '情绪日记,情绪记录,情绪追踪,情绪模式,情绪觉察',
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

-- 6.2 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'emotion_journal',
    2,
    '## 情绪日记技能使用说明

### 功能描述
情绪日记技能帮助用户记录情绪日记，追踪情绪变化，发现情绪模式，提高情绪觉察能力。

### 核心功能
1. **情绪记录**：记录每日情绪
2. **情绪追踪**：追踪情绪变化
3. **模式识别**：识别情绪模式
4. **触发分析**：分析情绪触发因素
5. **趋势分析**：分析情绪趋势
6. **觉察提升**：提高情绪觉察能力

### 参数说明
- **date** (必填): 日期（ISO格式）
- **emotions** (可选): 情绪记录列表
  - `emotion`: 情绪名称
  - `intensity`: 情绪强度（1-10）
  - `trigger`: 触发因素
  - `thoughts`: 相关想法
- **action** (可选): 操作类型
  - `record`: 记录情绪
  - `query`: 查询情绪记录
  - `analyze`: 分析情绪
  - `pattern`: 识别模式
- **timeRange** (可选): 时间范围

### 使用场景
- 想要追踪情绪变化
- 需要发现情绪模式
- 想要提高情绪觉察能力
- 需要分析情绪触发因素

### 执行流程
1. 引导用户记录每日情绪
2. 记录情绪的强度、触发因素和相关想法
3. 追踪情绪变化
4. 分析情绪模式
5. 识别情绪触发因素
6. 分析情绪趋势
7. 提供情绪管理建议

### 情绪日记要素
- **情绪名称**：准确描述情绪
- **情绪强度**：1-10分评分
- **触发因素**：什么引发了情绪
- **相关想法**：当时的想法
- **身体感受**：身体的感觉
- **行为反应**：如何应对

### 返回格式
```json
{
  "success": true,
  "action": "analyze",
  "date": "2025-01-07",
  "emotions": [
    {
      "emotion": "anxiety",
      "intensity": 7,
      "trigger": "工作压力",
      "thoughts": "担心完不成任务"
    }
  ],
  "patterns": {
    "mostCommon": "anxiety",
    "triggers": ["工作压力", "时间紧迫"],
    "timePattern": "下午3-5点情绪波动较大"
  },
  "trends": {
    "thisWeek": "情绪波动较大，焦虑情绪较多",
    "suggestions": [
      "注意工作压力管理",
      "在情绪波动大的时间段安排轻松任务"
    ]
  }
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

-- 绑定技能5：积极心理学干预
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
    'positive_psychology_intervention',
    true,
    false,
    5,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能6：情绪日记
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
    'emotion_journal',
    true,
    true,
    6,
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
WHERE skill_id IN ('positive_psychology_intervention', 'emotion_journal')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('positive_psychology_intervention', 'emotion_journal')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('positive_psychology_intervention', 'emotion_journal')
    AND character_id = @character_id;
