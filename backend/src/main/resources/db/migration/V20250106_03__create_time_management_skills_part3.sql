-- 时小光技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_03__create_time_management_skills_part3.sql
-- 
-- 说明：本文件包含时小光的第5-6个技能
-- 5. 习惯养成追踪（Habit Tracker）
-- 6. 目标设定与追踪（Goal Setting & Tracking）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：习惯养成追踪（Habit Tracker）
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
    'habit_tracker',
    '习惯养成追踪',
    '帮助用户建立和追踪日常习惯，通过数据可视化和鼓励来维持习惯。记录习惯完成情况，生成习惯完成率统计，提供习惯养成建议，庆祝里程碑。',
    'life',
    'PASSIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "habitName": {
                "type": "string",
                "description": "习惯名称"
            },
            "frequency": {
                "type": "string",
                "enum": ["daily", "weekly", "custom"],
                "description": "频率：daily(每天), weekly(每周), custom(自定义)"
            },
            "reminderTime": {
                "type": "string",
                "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$",
                "description": "提醒时间（HH:mm格式）"
            },
            "targetDays": {
                "type": "integer",
                "description": "目标天数（如：21天、66天等）"
            },
            "action": {
                "type": "string",
                "enum": ["create", "check", "query", "statistics", "milestone"],
                "default": "check",
                "description": "操作类型：create(创建), check(打卡), query(查询), statistics(统计), milestone(里程碑)"
            },
            "date": {
                "type": "string",
                "format": "date",
                "description": "日期（ISO格式：YYYY-MM-DD）"
            }
        },
        "required": ["habitName"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的习惯追踪和管理"
    }',
    '习惯,打卡,习惯养成,习惯追踪,习惯记录',
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
    'habit_tracker',
    2,
    '## 习惯养成追踪技能使用说明

### 功能描述
习惯养成追踪技能帮助用户建立和追踪日常习惯，通过数据可视化和鼓励来维持习惯，提高习惯养成成功率。

### 核心功能
1. **习惯创建**：帮助用户设定习惯目标
2. **习惯打卡**：每日提醒用户打卡，记录习惯完成情况
3. **数据统计**：生成习惯完成率统计（连续天数、完成率等）
4. **习惯建议**：提供习惯养成建议（基于行为心理学）
5. **里程碑庆祝**：庆祝里程碑（7天、21天、66天等）
6. **失败分析**：分析习惯失败原因并提供改进建议

### 参数说明
- **habitName** (必填): 习惯名称
- **frequency** (可选): 频率
  - `daily`: 每天
  - `weekly`: 每周
  - `custom`: 自定义
- **reminderTime** (可选): 提醒时间（HH:mm格式）
- **targetDays** (可选): 目标天数
- **action** (可选): 操作类型
  - `create`: 创建新习惯
  - `check`: 打卡
  - `query`: 查询习惯记录
  - `statistics`: 查看统计
  - `milestone`: 里程碑检查
- **date** (可选): 日期（ISO格式）

### 使用场景
- 想要养成新习惯（早起、运动、阅读等）
- 想要改掉坏习惯
- 需要外部监督和鼓励
- 想要追踪习惯养成进度

### 执行流程
1. 了解用户想要养成的习惯
2. 帮助用户设定习惯目标（频率、时间、目标天数等）
3. 设置提醒时间
4. 每日提醒用户打卡
5. 记录习惯完成情况
6. 生成习惯完成率统计
7. 庆祝里程碑
8. 分析失败原因并提供改进建议

### 习惯养成原则
- **21天法则**：21天可以初步形成习惯
- **66天法则**：66天可以真正巩固习惯
- **小步快跑**：从小目标开始，逐步增加
- **及时反馈**：及时记录和反馈
- **环境设计**：优化环境支持习惯养成

### 返回格式
```json
{
  "success": true,
  "action": "check",
  "habitName": "早起",
  "currentStreak": 15,
  "totalDays": 30,
  "completionRate": 85.5,
  "nextMilestone": {
    "days": 21,
    "remaining": 6,
    "message": "还有6天就达到21天里程碑了！"
  },
  "statistics": {
    "thisWeek": {"completed": 6, "total": 7},
    "thisMonth": {"completed": 25, "total": 30}
  },
  "encouragement": "你已经连续坚持15天了，很棒！继续保持！"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能6：目标设定与追踪（Goal Setting & Tracking）
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
    'goal_setting_tracking',
    '目标设定与追踪',
    '使用SMART原则帮助用户设定目标，并追踪目标完成进度。将大目标分解为小里程碑，设定关键指标（KPI）来追踪进度，定期检查目标进度，提供目标调整建议。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "goalDescription": {
                "type": "string",
                "description": "目标描述"
            },
            "deadline": {
                "type": "string",
                "format": "date",
                "description": "截止日期（ISO格式：YYYY-MM-DD）"
            },
            "metrics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "target": {"type": "number"},
                        "current": {"type": "number"}
                    }
                },
                "description": "关键指标（KPI）列表"
            },
            "milestones": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {"type": "string"},
                        "date": {"type": "string", "format": "date"}
                    }
                },
                "description": "里程碑列表"
            },
            "action": {
                "type": "string",
                "enum": ["create", "update", "track", "review", "adjust"],
                "default": "create",
                "description": "操作类型：create(创建), update(更新), track(追踪), review(检查), adjust(调整)"
            }
        },
        "required": ["goalDescription"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的目标设定和追踪"
    }',
    '目标设定,SMART,目标追踪,目标管理,目标规划',
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
    'goal_setting_tracking',
    2,
    '## 目标设定与追踪技能使用说明

### 功能描述
目标设定与追踪技能使用SMART原则帮助用户设定目标，并追踪目标完成进度，确保目标的可实现性和可追踪性。

### 核心功能
1. **SMART原则引导**：引导用户使用SMART原则设定目标
   - Specific（具体）：目标要具体明确
   - Measurable（可衡量）：目标要可量化
   - Achievable（可实现）：目标要现实可行
   - Relevant（相关）：目标要与整体规划相关
   - Time-bound（有时限）：目标要有明确的时间限制
2. **目标分解**：将大目标分解为小里程碑
3. **KPI设定**：设定关键指标（KPI）来追踪进度
4. **进度追踪**：定期检查目标进度
5. **目标调整**：提供目标调整建议
6. **成就庆祝**：庆祝阶段性成就
7. **失败分析**：分析目标失败原因

### 参数说明
- **goalDescription** (必填): 目标描述
- **deadline** (可选): 截止日期（ISO格式）
- **metrics** (可选): 关键指标（KPI）列表
  - `name`: 指标名称
  - `target`: 目标值
  - `current`: 当前值
- **milestones** (可选): 里程碑列表
  - `name`: 里程碑名称
  - `date`: 里程碑日期
- **action** (可选): 操作类型
  - `create`: 创建新目标
  - `update`: 更新目标
  - `track`: 追踪进度
  - `review`: 检查进度
  - `adjust`: 调整目标

### 使用场景
- 设定年度/月度/周度目标
- 需要将模糊愿望转化为具体目标
- 追踪长期目标进度
- 需要目标管理和调整

### 执行流程
1. 了解用户的目标想法
2. 引导用户使用SMART原则设定目标
3. 将大目标分解为小里程碑
4. 设定关键指标（KPI）
5. 定期检查目标进度
6. 提供目标调整建议
7. 庆祝阶段性成就
8. 分析目标失败原因

### SMART原则示例
- **不好的目标**："我要减肥"
- **好的目标**："在3个月内（Time-bound）减重10公斤（Measurable），通过每周运动3次、控制饮食（Specific），从当前70公斤减到60公斤（Achievable），为了健康（Relevant）"

### 返回格式
```json
{
  "success": true,
  "action": "create",
  "goal": {
    "description": "在3个月内减重10公斤",
    "deadline": "2025-04-01",
    "smart": {
      "specific": "通过每周运动3次、控制饮食减重",
      "measurable": "从70公斤减到60公斤",
      "achievable": "每周减重约0.8公斤，可行",
      "relevant": "为了健康",
      "timeBound": "3个月"
    }
  },
  "milestones": [
    {"name": "第一个月减重3公斤", "date": "2025-02-01"},
    {"name": "第二个月减重3公斤", "date": "2025-03-01"},
    {"name": "第三个月减重4公斤", "date": "2025-04-01"}
  ],
  "metrics": [
    {"name": "体重", "target": 60, "current": 70},
    {"name": "每周运动次数", "target": 3, "current": 0}
  ],
  "progress": 0,
  "nextReview": "2025-01-15"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 绑定技能到时小光角色
-- ============================================

-- 获取时小光的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '时小光' LIMIT 1);

-- 绑定技能5：习惯养成追踪
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
    'habit_tracker',
    true,
    true,
    5,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能6：目标设定与追踪
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
    'goal_setting_tracking',
    true,
    false,
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
WHERE skill_id IN ('habit_tracker', 'goal_setting_tracking')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('habit_tracker', 'goal_setting_tracking')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('habit_tracker', 'goal_setting_tracking')
    AND character_id = @character_id;
