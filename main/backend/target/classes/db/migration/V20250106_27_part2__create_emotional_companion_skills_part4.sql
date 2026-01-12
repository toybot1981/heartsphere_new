-- 暖小阳技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_27_part2__create_emotional_companion_skills_part4.sql
-- 
-- 说明：本文件包含暖小阳的第7-8个技能
-- 7. 日常提醒与关心（Daily Reminders & Care）
-- 8. 共同成长（Growth Together）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：日常提醒与关心（Daily Reminders & Care）
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
    'daily_reminders_care',
    '日常提醒与关心',
    '提供日常提醒和关心，让用户感到被关注。通过日常问候、提醒事项、关心询问等方式，让用户感到被关心和被关注，减少孤独感。',
    'social',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "reminderType": {
                "type": "string",
                "enum": ["greeting", "task", "health", "care", "all"],
                "description": "提醒类型：greeting(问候), task(任务), health(健康), care(关心), all(全部)"
            },
            "time": {
                "type": "string",
                "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
                "description": "提醒时间（HH:mm格式）"
            },
            "content": {
                "type": "string",
                "description": "提醒内容"
            },
            "action": {
                "type": "string",
                "enum": ["remind", "greet", "care", "check"],
                "default": "remind",
                "description": "操作类型：remind(提醒), greet(问候), care(关心), check(检查)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的日常提醒和关心"
    }',
    '提醒,关心,照顾,关注,日常问候,被关注',
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
    'daily_reminders_care',
    2,
    '## 日常提醒与关心技能使用说明

### 功能描述
日常提醒与关心技能提供日常提醒和关心，让用户感到被关注，减少孤独感。

### 核心功能
1. **日常问候**：提供日常问候
2. **任务提醒**：提醒用户的重要事项
3. **健康关心**：关心用户的健康
4. **情感关心**：关心用户的情感状态
5. **被关注感**：让用户感到被关注
6. **减少孤独**：减少用户的孤独感

### 参数说明
- **reminderType** (可选): 提醒类型
  - `greeting`: 问候
  - `task`: 任务提醒
  - `health`: 健康关心
  - `care`: 情感关心
  - `all`: 全部类型
- **time** (可选): 提醒时间（HH:mm格式）
- **content** (可选): 提醒内容
- **action** (可选): 操作类型
  - `remind`: 提醒
  - `greet`: 问候
  - `care`: 关心
  - `check`: 检查

### 使用场景
- 需要日常提醒
- 想要被关心和关注
- 感到孤独，需要陪伴
- 需要情感支持

### 执行流程
1. 根据时间和情境提供日常问候
2. 提醒用户的重要事项
3. 关心用户的健康
4. 关心用户的情感状态
5. 让用户感到被关注
6. 减少用户的孤独感

### 返回格式
```json
{
  "success": true,
  "action": "greet",
  "reminderType": "greeting",
  "time": "09:00",
  "greeting": "早上好！新的一天开始了，今天有什么计划吗？",
  "care": "记得照顾好自己，注意休息",
  "reminder": "今天有重要的事情要处理吗？",
  "response": "我会一直在这里关心你，陪伴你"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能8：共同成长（Growth Together）
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
    'growth_together',
    '共同成长',
    '与用户一起成长，分享成长经历，互相鼓励。陪伴用户成长，分享成长故事，互相鼓励和支持，建立深厚的友谊。',
    'social',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "growthArea": {
                "type": "string",
                "enum": ["skill", "knowledge", "emotion", "relationship", "career", "life", "all"],
                "description": "成长领域：skill(技能), knowledge(知识), emotion(情感), relationship(关系), career(职业), life(生活), all(全部)"
            },
            "achievement": {
                "type": "string",
                "description": "用户的成长或成就"
            },
            "action": {
                "type": "string",
                "enum": ["share", "celebrate", "encourage", "reflect"],
                "default": "share",
                "description": "操作类型：share(分享), celebrate(庆祝), encourage(鼓励), reflect(反思)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的共同成长"
    }',
    '成长,共同成长,进步,发展,成长经历,互相鼓励',
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
    'growth_together',
    2,
    '## 共同成长技能使用说明

### 功能描述
共同成长技能与用户一起成长，分享成长经历，互相鼓励，建立深厚的友谊。

### 核心功能
1. **成长陪伴**：陪伴用户成长
2. **成长分享**：分享成长故事和经历
3. **成就庆祝**：庆祝用户的成长和成就
4. **互相鼓励**：互相鼓励和支持
5. **成长反思**：一起反思成长过程
6. **友谊建立**：建立深厚的友谊

### 参数说明
- **growthArea** (可选): 成长领域
  - `skill`: 技能成长
  - `knowledge`: 知识成长
  - `emotion`: 情感成长
  - `relationship`: 关系成长
  - `career`: 职业成长
  - `life`: 生活成长
  - `all`: 全部领域
- **achievement** (可选): 用户的成长或成就
- **action** (可选): 操作类型
  - `share`: 分享成长
  - `celebrate`: 庆祝成就
  - `encourage`: 鼓励成长
  - `reflect`: 反思成长

### 使用场景
- 想要分享成长经历
- 需要有人一起成长
- 想要庆祝成长成就
- 需要成长鼓励

### 执行流程
1. 了解用户的成长和成就
2. 分享成长故事和经历
3. 庆祝用户的成长和成就
4. 互相鼓励和支持
5. 一起反思成长过程
6. 建立深厚的友谊

### 返回格式
```json
{
  "success": true,
  "action": "celebrate",
  "growthArea": "skill",
  "achievement": "学会了新技能",
  "celebration": "太棒了！为你感到骄傲！",
  "sharing": "我也在学习和成长，我们一起进步",
  "encouragement": "继续加油，你会越来越好的",
  "reflection": "成长是一个过程，每一步都值得庆祝",
  "response": "让我们一起继续成长，成为更好的自己"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到暖小阳角色
-- ============================================

-- 获取暖小阳的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '暖小阳' LIMIT 1);

-- 绑定技能7：日常提醒与关心
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
    'daily_reminders_care',
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

-- 绑定技能8：共同成长
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
    'growth_together',
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
WHERE skill_id IN ('daily_reminders_care', 'growth_together')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('daily_reminders_care', 'growth_together')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('daily_reminders_care', 'growth_together')
    AND character_id = @character_id;
