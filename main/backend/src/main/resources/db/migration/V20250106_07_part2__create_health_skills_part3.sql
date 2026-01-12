-- 康小健技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_07_part2__create_health_skills_part3.sql
-- 
-- 说明：本文件包含康小健的第5-6个技能
-- 5. 压力管理（Stress Management）
-- 6. 健康习惯养成（Health Habit Formation）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：压力管理（Stress Management）
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
    'stress_management',
    '压力管理',
    '识别和管理压力，提供压力缓解技巧。帮助用户识别压力源，评估压力水平，提供压力管理策略和放松技巧，帮助用户有效应对压力。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "stressLevel": {
                "type": "integer",
                "minimum": 1,
                "maximum": 10,
                "description": "压力水平（1-10）"
            },
            "stressors": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "压力源列表"
            },
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "压力症状（如：头痛、失眠、焦虑等）"
            },
            "action": {
                "type": "string",
                "enum": ["assess", "identify", "manage", "relax"],
                "default": "assess",
                "description": "操作类型：assess(评估), identify(识别), manage(管理), relax(放松)"
            },
            "technique": {
                "type": "string",
                "enum": ["breathing", "meditation", "exercise", "music", "all"],
                "description": "放松技巧类型"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的压力管理指导"
    }',
    '压力,压力管理,放松,减压,压力缓解,压力应对',
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
    'stress_management',
    2,
    '## 压力管理技能使用说明

### 功能描述
压力管理技能帮助用户识别和管理压力，提供压力缓解技巧，帮助用户有效应对压力，保持身心健康。

### 核心功能
1. **压力评估**：评估用户的压力水平
2. **压力源识别**：识别生活中的压力源
3. **症状分析**：分析压力对身体和心理的影响
4. **管理策略**：提供压力管理策略
5. **放松技巧**：教授放松技巧
6. **长期管理**：帮助建立长期压力管理习惯

### 参数说明
- **stressLevel** (可选): 压力水平（1-10）
- **stressors** (可选): 压力源列表
- **symptoms** (可选): 压力症状数组
- **action** (可选): 操作类型
  - `assess`: 评估压力水平
  - `identify`: 识别压力源
  - `manage`: 提供管理策略
  - `relax`: 放松技巧指导
- **technique** (可选): 放松技巧类型
  - `breathing`: 呼吸技巧
  - `meditation`: 冥想
  - `exercise`: 运动
  - `music`: 音乐
  - `all`: 全部技巧

### 使用场景
- 感到压力大，需要管理
- 想要学习压力缓解技巧
- 需要识别压力源
- 想要建立压力管理习惯

### 执行流程
1. 了解用户的压力感受和症状
2. 评估压力水平
3. 识别压力源
4. 分析压力对身体和心理的影响
5. 提供压力管理策略
6. 教授放松技巧
7. 帮助建立长期压力管理习惯

### 压力管理策略
- **问题解决**：直接解决压力源
- **情绪调节**：调节情绪反应
- **时间管理**：合理安排时间
- **社交支持**：寻求社交支持
- **生活方式**：改善生活方式（运动、睡眠、饮食）
- **放松技巧**：使用放松技巧缓解压力

### 返回格式
```json
{
  "success": true,
  "action": "assess",
  "stressLevel": 7,
  "stressors": [
    "工作量大",
    "时间紧迫"
  ],
  "symptoms": [
    "头痛",
    "失眠",
    "焦虑"
  ],
  "managementStrategies": [
    "时间管理：合理安排工作时间",
    "任务分解：将大任务分解为小任务",
    "寻求支持：与同事或朋友沟通"
  ],
  "relaxationTechniques": [
    {
      "name": "深呼吸",
      "steps": ["吸气4秒", "屏住呼吸4秒", "呼气4秒"],
      "duration": "5-10分钟"
    },
    {
      "name": "渐进式肌肉放松",
      "steps": ["从脚部开始", "逐步放松全身肌肉"],
      "duration": "15-20分钟"
    }
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
-- 技能6：健康习惯养成（Health Habit Formation）
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
    'health_habit_formation',
    '健康习惯养成',
    '帮助用户建立和维护有益健康的习惯。通过习惯追踪、提醒和鼓励，帮助用户养成健康的生活方式，如规律作息、健康饮食、适度运动等。',
    'healthcare',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "habitType": {
                "type": "string",
                "enum": ["exercise", "diet", "sleep", "hydration", "meditation", "other"],
                "description": "习惯类型：exercise(运动), diet(饮食), sleep(睡眠), hydration(饮水), meditation(冥想), other(其他)"
            },
            "habitName": {
                "type": "string",
                "description": "习惯名称"
            },
            "frequency": {
                "type": "string",
                "enum": ["daily", "weekly", "custom"],
                "description": "频率：daily(每天), weekly(每周), custom(自定义)"
            },
            "action": {
                "type": "string",
                "enum": ["create", "track", "remind", "celebrate", "analyze"],
                "default": "create",
                "description": "操作类型：create(创建), track(追踪), remind(提醒), celebrate(庆祝), analyze(分析)"
            }
        },
        "required": ["habitType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的健康习惯养成"
    }',
    '健康习惯,习惯养成,健康生活方式,习惯追踪,健康维护',
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
    'health_habit_formation',
    2,
    '## 健康习惯养成技能使用说明

### 功能描述
健康习惯养成技能帮助用户建立和维护有益健康的习惯，通过习惯追踪、提醒和鼓励，帮助用户养成健康的生活方式。

### 核心功能
1. **习惯创建**：帮助用户设定健康习惯目标
2. **习惯追踪**：追踪习惯完成情况
3. **习惯提醒**：定期提醒用户执行习惯
4. **习惯鼓励**：提供鼓励和支持
5. **里程碑庆祝**：庆祝习惯养成里程碑
6. **习惯分析**：分析习惯养成情况，提供改进建议

### 参数说明
- **habitType** (必填): 习惯类型
  - `exercise`: 运动习惯
  - `diet`: 饮食习惯
  - `sleep`: 睡眠习惯
  - `hydration`: 饮水习惯
  - `meditation`: 冥想习惯
  - `other`: 其他健康习惯
- **habitName** (可选): 习惯名称
- **frequency** (可选): 频率
- **action** (可选): 操作类型
  - `create`: 创建新习惯
  - `track`: 追踪习惯
  - `remind`: 提醒执行
  - `celebrate`: 庆祝里程碑
  - `analyze`: 分析习惯

### 使用场景
- 想要建立健康的生活习惯
- 需要习惯追踪和提醒
- 想要改掉不健康的习惯
- 需要鼓励和支持

### 执行流程
1. 了解用户想要养成的健康习惯
2. 帮助用户设定习惯目标
3. 设置习惯追踪和提醒
4. 定期提醒用户执行习惯
5. 追踪习惯完成情况
6. 提供鼓励和支持
7. 庆祝习惯养成里程碑
8. 分析习惯养成情况，提供改进建议

### 健康习惯类型
- **运动习惯**：每天运动30分钟、每周运动3次等
- **饮食习惯**：每天吃早餐、每天吃5种蔬菜等
- **睡眠习惯**：每天22:00睡觉、每天睡7-8小时等
- **饮水习惯**：每天喝8杯水、定时喝水等
- **冥想习惯**：每天冥想10分钟、每周冥想3次等

### 返回格式
```json
{
  "success": true,
  "action": "create",
  "habitType": "exercise",
  "habitName": "每天运动30分钟",
  "frequency": "daily",
  "targetDays": 21,
  "reminderTime": "19:00",
  "tracking": {
    "currentStreak": 0,
    "totalDays": 0,
    "completionRate": 0
  },
  "encouragement": "开始养成健康习惯是很好的决定！让我们一起坚持下去！",
  "tips": [
    "从小目标开始",
    "设定固定时间",
    "记录完成情况"
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
-- 绑定技能到康小健角色
-- ============================================

-- 获取康小健的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '康小健' LIMIT 1);

-- 绑定技能5：压力管理
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
    'stress_management',
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

-- 绑定技能6：健康习惯养成
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
    'health_habit_formation',
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
WHERE skill_id IN ('stress_management', 'health_habit_formation')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('stress_management', 'health_habit_formation')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('stress_management', 'health_habit_formation')
    AND character_id = @character_id;
