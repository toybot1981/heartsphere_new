-- 康小健技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_06__create_health_skills_part2.sql
-- 
-- 说明：本文件包含康小健的第3-4个技能
-- 3. 运动计划制定（Exercise Plan Creation）
-- 4. 睡眠质量改善（Sleep Quality Improvement）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：运动计划制定（Exercise Plan Creation）
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
    'exercise_plan_creation',
    '运动计划制定',
    '根据用户的身体状况、目标和偏好，制定个性化运动计划。考虑运动类型、强度、频率、时长等因素，提供科学的运动方案，帮助用户建立运动习惯。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "goal": {
                "type": "string",
                "enum": ["weight_loss", "muscle_gain", "endurance", "flexibility", "health_maintenance", "rehabilitation"],
                "description": "运动目标：weight_loss(减重), muscle_gain(增肌), endurance(耐力), flexibility(柔韧性), health_maintenance(健康维持), rehabilitation(康复)"
            },
            "currentFitness": {
                "type": "string",
                "enum": ["beginner", "intermediate", "advanced"],
                "description": "当前体能水平：beginner(初级), intermediate(中级), advanced(高级)"
            },
            "availableTime": {
                "type": "object",
                "properties": {
                    "perWeek": {"type": "integer", "description": "每周可用时间（小时）"},
                    "perDay": {"type": "number", "description": "每天可用时间（小时）"}
                },
                "description": "可用时间"
            },
            "preferences": {
                "type": "array",
                "items": {"type": "string"},
                "description": "运动偏好（如：跑步、游泳、瑜伽等）"
            },
            "restrictions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "运动限制（如：膝盖问题、背部问题等）"
            },
            "action": {
                "type": "string",
                "enum": ["create", "update", "review", "adjust"],
                "default": "create",
                "description": "操作类型：create(创建), update(更新), review(检查), adjust(调整)"
            }
        },
        "required": ["goal"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的运动计划制定"
    }',
    '运动,健身,运动计划,锻炼,运动方案,运动训练',
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
    'exercise_plan_creation',
    2,
    '## 运动计划制定技能使用说明

### 功能描述
运动计划制定技能根据用户的身体状况、目标和偏好，制定个性化运动计划，帮助用户建立运动习惯，实现健康目标。

### 核心功能
1. **需求分析**：分析用户的运动目标、身体状况和偏好
2. **计划制定**：制定个性化的运动计划
3. **运动类型选择**：选择合适的运动类型和强度
4. **进度安排**：安排运动频率、时长和进度
5. **计划调整**：根据实际情况调整计划
6. **习惯建立**：帮助建立长期运动习惯

### 参数说明
- **goal** (必填): 运动目标
  - `weight_loss`: 减重
  - `muscle_gain`: 增肌
  - `endurance`: 提高耐力
  - `flexibility`: 提高柔韧性
  - `health_maintenance`: 健康维持
  - `rehabilitation`: 康复训练
- **currentFitness** (可选): 当前体能水平
- **availableTime** (可选): 可用时间
- **preferences** (可选): 运动偏好数组
- **restrictions** (可选): 运动限制数组
- **action** (可选): 操作类型

### 使用场景
- 想要开始运动但不知道如何开始
- 需要针对特定目标的运动计划
- 想要提高运动效果
- 需要调整现有运动计划

### 执行流程
1. 了解用户的运动目标和身体状况
2. 评估用户的体能水平
3. 了解用户的运动偏好和限制
4. 制定个性化的运动计划
5. 安排运动频率、时长和强度
6. 提供运动建议和注意事项
7. 定期检查和调整计划

### 运动计划要素
- **运动类型**：有氧运动、力量训练、柔韧性训练等
- **运动强度**：低强度、中强度、高强度
- **运动频率**：每周运动次数
- **运动时长**：每次运动时长
- **进度安排**：循序渐进，逐步提高
- **休息恢复**：合理安排休息时间

### 返回格式
```json
{
  "success": true,
  "action": "create",
  "goal": "weight_loss",
  "currentFitness": "beginner",
  "plan": {
    "weeklySchedule": [
      {
        "day": "Monday",
        "exercises": [
          {"type": "cardio", "name": "快走", "duration": 30, "intensity": "moderate"}
        ]
      },
      {
        "day": "Wednesday",
        "exercises": [
          {"type": "strength", "name": "力量训练", "duration": 45, "intensity": "moderate"}
        ]
      }
    ],
    "totalWeeklyHours": 3,
    "progression": "每2周增加10%强度"
  },
  "tips": [
    "运动前热身，运动后拉伸",
    "保持充足水分",
    "注意运动安全"
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
-- 技能4：睡眠质量改善（Sleep Quality Improvement）
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
    'sleep_quality_improvement',
    '睡眠质量改善',
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
                    "sleepDuration": {"type": "number", "description": "睡眠时长（小时）"},
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
        "description": "基于LLM的睡眠质量改善指导"
    }',
    '睡眠,失眠,睡眠质量,睡眠改善,睡眠习惯,睡眠健康',
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
    'sleep_quality_improvement',
    2,
    '## 睡眠质量改善技能使用说明

### 功能描述
睡眠质量改善技能提供睡眠健康知识和指导，帮助用户改善睡眠质量，建立健康的睡眠习惯。

### 核心功能
1. **睡眠评估**：评估用户的睡眠质量和问题
2. **问题分析**：分析睡眠问题的原因
3. **睡眠卫生**：提供睡眠卫生建议
4. **改善计划**：制定睡眠改善计划
5. **习惯建立**：帮助建立健康的睡眠习惯
6. **效果追踪**：追踪睡眠改善效果

### 参数说明
- **sleepIssues** (可选): 睡眠问题数组
- **sleepData** (可选): 睡眠数据
  - `bedtime`: 就寝时间
  - `wakeTime`: 起床时间
  - `sleepDuration`: 睡眠时长（小时）
  - `sleepQuality`: 睡眠质量（1-10）
- **action** (可选): 操作类型
  - `assess`: 评估睡眠质量
  - `advice`: 提供睡眠建议
  - `plan`: 制定改善计划
  - `track`: 追踪改善效果

### 使用场景
- 睡眠质量不好，想要改善
- 经常失眠或早醒
- 想要建立规律的睡眠习惯
- 需要睡眠健康指导

### 执行流程
1. 了解用户的睡眠问题和数据
2. 评估睡眠质量和问题
3. 分析睡眠问题的原因
4. 提供睡眠卫生建议
5. 制定睡眠改善计划
6. 帮助建立健康的睡眠习惯
7. 追踪睡眠改善效果

### 睡眠卫生建议
- **规律作息**：每天固定时间睡觉和起床
- **睡前准备**：睡前1小时避免屏幕，放松身心
- **睡眠环境**：保持卧室安静、黑暗、凉爽
- **避免刺激**：睡前避免咖啡因、酒精、大餐
- **适度运动**：白天适度运动，但睡前避免剧烈运动
- **放松技巧**：使用深呼吸、冥想等放松技巧

### 返回格式
```json
{
  "success": true,
  "action": "assess",
  "sleepQuality": 6,
  "issues": [
    "入睡困难",
    "睡眠时长不足"
  ],
  "causes": [
    "睡前使用电子设备",
    "作息不规律",
    "压力大"
  ],
  "advice": [
    "睡前1小时避免屏幕",
    "建立规律的作息时间",
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
-- 绑定技能到康小健角色
-- ============================================

-- 获取康小健的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '康小健' LIMIT 1);

-- 绑定技能3：运动计划制定
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
    'exercise_plan_creation',
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

-- 绑定技能4：睡眠质量改善
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
    'sleep_quality_improvement',
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
WHERE skill_id IN ('exercise_plan_creation', 'sleep_quality_improvement')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('exercise_plan_creation', 'sleep_quality_improvement')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('exercise_plan_creation', 'sleep_quality_improvement')
    AND character_id = @character_id;
