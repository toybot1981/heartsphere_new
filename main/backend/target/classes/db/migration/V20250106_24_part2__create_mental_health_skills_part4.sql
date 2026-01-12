-- 心小安技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_24_part2__create_mental_health_skills_part4.sql
-- 
-- 说明：本文件包含心小安的第7-8个技能
-- 7. 心理健康习惯养成（Mental Health Habit Formation）
-- 8. 专业转介（Professional Referral）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：心理健康习惯养成（Mental Health Habit Formation）
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
    'mental_health_habit_formation',
    '心理健康习惯养成',
    '帮助用户建立和维护有益心理健康的习惯。通过习惯追踪、提醒和鼓励，帮助用户养成正念练习、情绪管理、社交活动等有益心理健康的习惯。',
    'healthcare',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "habitType": {
                "type": "string",
                "enum": ["mindfulness", "exercise", "social", "sleep", "gratitude", "other"],
                "description": "习惯类型：mindfulness(正念), exercise(运动), social(社交), sleep(睡眠), gratitude(感恩), other(其他)"
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
                "enum": ["create", "track", "remind", "celebrate"],
                "default": "create",
                "description": "操作类型：create(创建), track(追踪), remind(提醒), celebrate(庆祝)"
            }
        },
        "required": ["habitType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的心理健康习惯养成"
    }',
    '心理健康习惯,心理维护,健康习惯,习惯养成,心理保健',
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
    'mental_health_habit_formation',
    2,
    '## 心理健康习惯养成技能使用说明

### 功能描述
心理健康习惯养成技能帮助用户建立和维护有益心理健康的习惯，通过习惯追踪、提醒和鼓励，提升心理健康水平。

### 核心功能
1. **习惯创建**：帮助用户设定心理健康习惯目标
2. **习惯追踪**：追踪习惯完成情况
3. **习惯提醒**：定期提醒用户执行习惯
4. **习惯鼓励**：提供鼓励和支持
5. **里程碑庆祝**：庆祝习惯养成里程碑
6. **效果评估**：评估习惯对心理健康的影响

### 参数说明
- **habitType** (必填): 习惯类型
  - `mindfulness`: 正念练习
  - `exercise`: 运动
  - `social`: 社交活动
  - `sleep`: 睡眠习惯
  - `gratitude`: 感恩练习
  - `other`: 其他心理健康习惯
- **habitName** (可选): 习惯名称
- **frequency** (可选): 频率
- **action** (可选): 操作类型
  - `create`: 创建习惯
  - `track`: 追踪习惯
  - `remind`: 提醒执行
  - `celebrate`: 庆祝里程碑

### 使用场景
- 想要建立有益心理健康的习惯
- 需要习惯追踪和提醒
- 想要改善心理健康
- 需要鼓励和支持

### 执行流程
1. 了解用户想要养成的心理健康习惯
2. 帮助用户设定习惯目标
3. 设置习惯追踪和提醒
4. 定期提醒用户执行习惯
5. 追踪习惯完成情况
6. 提供鼓励和支持
7. 庆祝习惯养成里程碑
8. 评估习惯对心理健康的影响

### 有益心理健康的习惯
- **正念练习**：每天10-15分钟正念冥想
- **运动**：每周至少150分钟中等强度运动
- **社交活动**：定期与朋友和家人联系
- **睡眠习惯**：保持规律的睡眠时间
- **感恩练习**：每天记录感恩的事
- **情绪管理**：学习情绪调节技巧

### 返回格式
```json
{
  "success": true,
  "action": "create",
  "habitType": "mindfulness",
  "habitName": "每天正念冥想10分钟",
  "frequency": "daily",
  "targetDays": 30,
  "reminderTime": "20:00",
  "tracking": {
    "currentStreak": 0,
    "totalDays": 0,
    "completionRate": 0
  },
  "benefits": [
    "减少焦虑",
    "提高专注力",
    "改善情绪"
  ],
  "encouragement": "建立心理健康习惯是很好的决定！让我们一起坚持下去！"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能8：专业转介（Professional Referral）
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
    'professional_referral',
    '专业转介',
    '在识别到严重心理健康问题时，提供专业帮助资源。评估问题的严重程度，提供心理咨询、心理治疗、精神科医生等专业资源，引导用户寻求专业帮助。',
    'healthcare',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "issueType": {
                "type": "string",
                "enum": ["depression", "anxiety", "trauma", "addiction", "crisis", "other"],
                "description": "问题类型：depression(抑郁), anxiety(焦虑), trauma(创伤), addiction(成瘾), crisis(危机), other(其他)"
            },
            "severity": {
                "type": "string",
                "enum": ["mild", "moderate", "severe", "critical"],
                "description": "严重程度：mild(轻度), moderate(中度), severe(重度), critical(紧急)"
            },
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "症状列表"
            },
            "action": {
                "type": "string",
                "enum": ["assess", "refer", "resources", "guide"],
                "default": "assess",
                "description": "操作类型：assess(评估), refer(转介), resources(资源), guide(引导)"
            }
        },
        "required": ["issueType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的专业转介"
    }',
    '专业帮助,心理咨询,转介,心理治疗,精神科,专业资源',
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
    'professional_referral',
    2,
    '## 专业转介技能使用说明

### 功能描述
专业转介技能在识别到严重心理健康问题时，提供专业帮助资源，引导用户寻求专业帮助。

### 核心功能
1. **问题评估**：评估问题的严重程度
2. **转介判断**：判断是否需要专业转介
3. **资源提供**：提供专业帮助资源
4. **转介引导**：引导用户寻求专业帮助
5. **后续支持**：提供后续支持建议

### 参数说明
- **issueType** (必填): 问题类型
  - `depression`: 抑郁
  - `anxiety`: 焦虑
  - `trauma`: 创伤
  - `addiction`: 成瘾
  - `crisis`: 危机
  - `other`: 其他问题
- **severity** (可选): 严重程度
  - `mild`: 轻度（可以自我管理）
  - `moderate`: 中度（建议专业帮助）
  - `severe`: 重度（需要专业帮助）
  - `critical`: 紧急（需要立即专业帮助）
- **symptoms** (可选): 症状列表
- **action** (可选): 操作类型
  - `assess`: 评估问题
  - `refer`: 提供转介
  - `resources`: 提供资源
  - `guide`: 引导帮助

### 使用场景
- 识别到严重的心理健康问题
- 需要专业帮助
- 想要了解专业资源
- 需要转介指导

### 执行流程
1. 评估问题的严重程度
2. 判断是否需要专业转介
3. 提供专业帮助资源
4. 引导用户寻求专业帮助
5. 提供后续支持建议

### 专业资源类型
- **心理咨询**：适合轻度到中度问题
- **心理治疗**：适合中重度问题
- **精神科医生**：适合需要药物治疗的问题
- **危机干预**：适合紧急情况
- **支持小组**：适合需要同伴支持的情况

### 重要提醒
- **专业判断**：转介需要专业判断，不能替代专业诊断
- **紧急情况**：紧急情况必须立即引导专业帮助
- **持续支持**：转介后继续提供支持
- **隐私保护**：保护用户隐私

### 返回格式
```json
{
  "success": true,
  "action": "refer",
  "issueType": "depression",
  "severity": "severe",
  "assessment": "您的情况需要专业心理健康服务",
  "referral": {
    "recommended": true,
    "urgency": "high",
    "services": [
      {
        "type": "psychotherapy",
        "name": "心理治疗",
        "description": "适合中重度抑郁",
        "howToFind": "可以通过医院心理科或专业心理咨询机构"
      },
      {
        "type": "psychiatry",
        "name": "精神科",
        "description": "可能需要药物治疗",
        "howToFind": "医院精神科或心理卫生中心"
      }
    ]
  },
  "resources": [
    {"type": "hotline", "name": "心理危机干预热线", "number": "400-xxx-xxxx"},
    {"type": "hospital", "name": "就近医院心理科", "action": "预约就诊"}
  ],
  "guidance": "建议尽快寻求专业帮助，我会继续支持您"
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

-- 绑定技能7：心理健康习惯养成
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
    'mental_health_habit_formation',
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

-- 绑定技能8：专业转介
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
    'professional_referral',
    true,
    false,
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
WHERE skill_id IN ('mental_health_habit_formation', 'professional_referral')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('mental_health_habit_formation', 'professional_referral')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('mental_health_habit_formation', 'professional_referral')
    AND character_id = @character_id;
