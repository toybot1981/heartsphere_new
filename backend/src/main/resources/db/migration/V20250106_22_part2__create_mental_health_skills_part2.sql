-- 心小安技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_22_part2__create_mental_health_skills_part2.sql
-- 
-- 说明：本文件包含心小安的第3-4个技能
-- 3. 认知扭曲识别（Cognitive Distortion Identification）
-- 4. 睡眠健康指导（Sleep Health Guidance）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：认知扭曲识别（Cognitive Distortion Identification）
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
    'cognitive_distortion_identification',
    '认知扭曲识别',
    '识别用户的认知扭曲，提供认知重构技巧。帮助用户识别不合理的思维模式，如全有全无思维、过度概括、灾难化等，提供认知重构方法，改善思维模式。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "thought": {
                "type": "string",
                "description": "用户的思维或想法"
            },
            "distortionType": {
                "type": "string",
                "enum": ["all_or_nothing", "overgeneralization", "mental_filter", "catastrophizing", "emotional_reasoning", "should_statements", "labeling", "personalization", "unknown"],
                "description": "扭曲类型：all_or_nothing(全有全无), overgeneralization(过度概括), mental_filter(心理过滤), catastrophizing(灾难化), emotional_reasoning(情绪推理), should_statements(应该陈述), labeling(标签化), personalization(个人化), unknown(未知)"
            },
            "action": {
                "type": "string",
                "enum": ["identify", "reframe", "challenge", "practice"],
                "default": "identify",
                "description": "操作类型：identify(识别), reframe(重构), challenge(挑战), practice(练习)"
            }
        },
        "required": ["thought"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的认知扭曲识别和重构"
    }',
    '认知扭曲,负面思维,认知重构,思维模式,不合理思维',
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
    'cognitive_distortion_identification',
    2,
    '## 认知扭曲识别技能使用说明

### 功能描述
认知扭曲识别技能帮助用户识别不合理的思维模式（认知扭曲），提供认知重构技巧，改善思维模式，提升心理健康。

### 核心功能
1. **扭曲识别**：识别用户的认知扭曲
2. **类型判断**：判断认知扭曲的类型
3. **影响分析**：分析认知扭曲对情绪和行为的影响
4. **认知重构**：提供认知重构方法
5. **思维挑战**：帮助挑战不合理的思维
6. **习惯建立**：帮助建立合理的思维习惯

### 参数说明
- **thought** (必填): 用户的思维或想法
- **distortionType** (可选): 扭曲类型
  - `all_or_nothing`: 全有全无思维（非黑即白）
  - `overgeneralization`: 过度概括（以偏概全）
  - `mental_filter`: 心理过滤（只关注负面）
  - `catastrophizing`: 灾难化（夸大后果）
  - `emotional_reasoning`: 情绪推理（以情绪为事实）
  - `should_statements`: 应该陈述（过度要求）
  - `labeling`: 标签化（给自己贴标签）
  - `personalization`: 个人化（过度归因）
  - `unknown`: 未知类型
- **action** (可选): 操作类型
  - `identify`: 识别扭曲
  - `reframe`: 认知重构
  - `challenge`: 挑战思维
  - `practice`: 练习重构

### 使用场景
- 感到负面思维困扰
- 想要改善思维模式
- 需要识别不合理的思维
- 想要学习认知重构技巧

### 执行流程
1. 了解用户的思维或想法
2. 识别认知扭曲
3. 判断认知扭曲的类型
4. 分析认知扭曲对情绪和行为的影响
5. 提供认知重构方法
6. 帮助挑战不合理的思维
7. 帮助建立合理的思维习惯

### 常见认知扭曲
- **全有全无思维**：非黑即白，没有中间地带
- **过度概括**：从一次经历得出普遍结论
- **心理过滤**：只关注负面，忽略正面
- **灾难化**：夸大事情的负面后果
- **情绪推理**：认为情绪反映的就是事实
- **应该陈述**：对自己或他人过度要求
- **标签化**：给自己或他人贴负面标签
- **个人化**：过度将事情归因于自己

### 返回格式
```json
{
  "success": true,
  "action": "identify",
  "thought": "我这次考试没考好，我永远都学不好",
  "distortionType": "overgeneralization",
  "distortionName": "过度概括",
  "explanation": "从一次考试失败得出永远学不好的结论，这是过度概括",
  "impact": {
    "emotion": "沮丧、绝望",
    "behavior": "可能放弃学习"
  },
  "reframe": {
    "original": "我这次考试没考好，我永远都学不好",
    "reframed": "我这次考试没考好，但这只是一次考试，我可以分析原因，改进学习方法",
    "rationale": "将一次失败视为学习机会，而不是永久性的失败"
  },
  "practice": "下次遇到类似思维时，尝试问自己：这是事实还是我的想法？"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能4：睡眠健康指导（Sleep Health Guidance）
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
    'sleep_health_guidance',
    '睡眠健康指导',
    '提供睡眠健康知识和指导，帮助用户改善睡眠质量。分析睡眠问题，提供睡眠卫生建议，制定睡眠改善计划，追踪睡眠改善效果。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "sleepIssues": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "睡眠问题（如：失眠、早醒、多梦等）"
            },
            "sleepData": {
                "type": "object",
                "properties": {
                    "bedtime": {"type": "string", "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},
                    "wakeTime": {"type": "string", "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},
                    "sleepDuration": {"type": "number"},
                    "sleepQuality": {"type": "integer", "minimum": 1, "maximum": 10}
                },
                "description": "睡眠数据"
            },
            "action": {
                "type": "string",
                "enum": ["assess", "advice", "plan", "track"],
                "default": "assess",
                "description": "操作类型：assess(评估), advice(建议), plan(计划), track(追踪)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的睡眠健康指导"
    }',
    '睡眠健康,睡眠知识,睡眠改善,睡眠指导,睡眠习惯,睡眠质量',
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
    'sleep_health_guidance',
    2,
    '## 睡眠健康指导技能使用说明

### 功能描述
睡眠健康指导技能提供睡眠健康知识和指导，帮助用户改善睡眠质量，建立健康的睡眠习惯。

### 核心功能
1. **睡眠评估**：评估用户的睡眠质量和问题
2. **问题分析**：分析睡眠问题的原因
3. **知识提供**：提供睡眠健康知识
4. **建议提供**：提供睡眠卫生建议
5. **计划制定**：制定睡眠改善计划
6. **效果追踪**：追踪睡眠改善效果

### 参数说明
- **sleepIssues** (可选): 睡眠问题数组
- **sleepData** (可选): 睡眠数据
  - `bedtime`: 就寝时间
  - `wakeTime`: 起床时间
  - `sleepDuration`: 睡眠时长（小时）
  - `sleepQuality`: 睡眠质量（1-10）
- **action** (可选): 操作类型
  - `assess`: 评估睡眠
  - `advice`: 提供建议
  - `plan`: 制定计划
  - `track`: 追踪效果

### 使用场景
- 睡眠质量不好，想要改善
- 经常失眠或早醒
- 想要了解睡眠健康知识
- 需要睡眠改善指导

### 执行流程
1. 了解用户的睡眠问题和数据
2. 评估睡眠质量和问题
3. 分析睡眠问题的原因
4. 提供睡眠健康知识
5. 提供睡眠卫生建议
6. 制定睡眠改善计划
7. 追踪睡眠改善效果

### 睡眠健康知识
- **睡眠时长**：成人建议7-9小时
- **睡眠周期**：包括浅睡、深睡、REM睡眠
- **睡眠环境**：安静、黑暗、凉爽
- **睡前准备**：睡前1小时避免屏幕，放松身心
- **规律作息**：每天固定时间睡觉和起床

### 返回格式
```json
{
  "success": true,
  "action": "assess",
  "sleepQuality": 5,
  "issues": [
    "入睡困难",
    "睡眠时长不足"
  ],
  "causes": [
    "睡前使用电子设备",
    "作息不规律",
    "压力大"
  ],
  "knowledge": {
    "sleepDuration": "成人建议7-9小时",
    "sleepCycles": "包括浅睡、深睡、REM睡眠",
    "sleepEnvironment": "安静、黑暗、凉爽"
  },
  "advice": [
    "睡前1小时避免屏幕",
    "建立规律的作息时间",
    "优化睡眠环境",
    "睡前进行放松练习"
  ],
  "improvementPlan": {
    "bedtime": "22:00",
    "wakeTime": "06:00",
    "steps": [
      "第一周：调整就寝时间到22:00",
      "第二周：建立睡前放松习惯",
      "第三周：优化睡眠环境"
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
-- 绑定技能到心小安角色
-- ============================================

-- 获取心小安的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '心小安' LIMIT 1);

-- 绑定技能3：认知扭曲识别
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
    'cognitive_distortion_identification',
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

-- 绑定技能4：睡眠健康指导
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
    'sleep_health_guidance',
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
WHERE skill_id IN ('cognitive_distortion_identification', 'sleep_health_guidance')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('cognitive_distortion_identification', 'sleep_health_guidance')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('cognitive_distortion_identification', 'sleep_health_guidance')
    AND character_id = @character_id;
