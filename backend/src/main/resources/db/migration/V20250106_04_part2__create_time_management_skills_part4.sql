-- 时小光技能定义 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_04_part2__create_time_management_skills_part4.sql
-- 
-- 说明：本文件包含时小光的第7-8个技能
-- 7. 拖延症诊断（Procrastination Diagnosis）
-- 8. 时间块规划（Time Blocking）

SET NAMES utf8mb4;

-- ============================================
-- 技能7：拖延症诊断（Procrastination Diagnosis）
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
    'procrastination_diagnosis',
    '拖延症诊断',
    '通过对话和问卷，诊断用户的拖延类型和原因，提供针对性的解决方案。识别拖延的表现、原因和影响，帮助用户理解自己的拖延模式，制定改善计划。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "拖延症状描述"
            },
            "procrastinationType": {
                "type": "string",
                "enum": ["perfectionist", "dreamer", "worrier", "defier", "crisis_maker", "overdoer", "unknown"],
                "description": "拖延类型：perfectionist(完美主义), dreamer(梦想家), worrier(担忧者), defier(反抗者), crisis_maker(危机制造者), overdoer(过度者), unknown(未知)"
            },
            "action": {
                "type": "string",
                "enum": ["diagnose", "analyze", "solution", "plan"],
                "default": "diagnose",
                "description": "操作类型：diagnose(诊断), analyze(分析), solution(解决方案), plan(改善计划)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的拖延症诊断和分析"
    }',
    '拖延,拖延症,效率问题,时间管理,任务拖延',
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
    'procrastination_diagnosis',
    2,
    '## 拖延症诊断技能使用说明

### 功能描述
拖延症诊断技能通过对话和问卷，诊断用户的拖延类型和原因，提供针对性的解决方案，帮助用户克服拖延，提高效率。

### 核心功能
1. **症状收集**：收集用户的拖延症状和表现
2. **类型诊断**：诊断用户的拖延类型
3. **原因分析**：分析拖延产生的根本原因
4. **影响评估**：评估拖延对生活和工作的影响
5. **解决方案**：提供针对性的解决方案
6. **改善计划**：制定具体的改善计划

### 参数说明
- **symptoms** (可选): 拖延症状描述数组
- **procrastinationType** (可选): 拖延类型
  - `perfectionist`: 完美主义型（追求完美导致拖延）
  - `dreamer`: 梦想家型（只计划不行动）
  - `worrier`: 担忧者型（害怕失败而拖延）
  - `defier`: 反抗者型（抗拒任务而拖延）
  - `crisis_maker`: 危机制造者型（喜欢在压力下工作）
  - `overdoer`: 过度者型（任务太多导致拖延）
  - `unknown`: 未知类型
- **action** (可选): 操作类型
  - `diagnose`: 诊断拖延类型
  - `analyze`: 分析拖延原因
  - `solution`: 提供解决方案
  - `plan`: 制定改善计划

### 使用场景
- 经常拖延，想要了解原因
- 想要克服拖延习惯
- 需要针对性的解决方案
- 想要制定改善计划

### 执行流程
1. 了解用户的拖延表现和症状
2. 通过对话和问卷收集信息
3. 诊断用户的拖延类型
4. 分析拖延产生的根本原因
5. 评估拖延的影响
6. 提供针对性的解决方案
7. 制定具体的改善计划

### 常见拖延类型及解决方案
- **完美主义型**：降低标准，先完成再完善
- **梦想家型**：将计划转化为具体行动
- **担忧者型**：面对恐惧，从小事开始
- **反抗者型**：找到任务的意义和价值
- **危机制造者型**：提前规划，避免最后时刻
- **过度者型**：学会说"不"，优先重要任务

### 返回格式
```json
{
  "success": true,
  "action": "diagnose",
  "procrastinationType": "perfectionist",
  "typeName": "完美主义型",
  "description": "您因为追求完美而拖延，总是觉得准备不够充分",
  "causes": [
    "害怕不完美",
    "过度准备",
    "标准过高"
  ],
  "impact": {
    "work": "工作效率低，经常错过截止日期",
    "life": "压力大，焦虑感强"
  },
  "solutions": [
    "降低标准，先完成再完善",
    "设定时间限制",
    "接受不完美"
  ],
    "improvementPlan": {
      "steps": [
        "设定完成而非完美的目标",
        "使用番茄工作法",
        "设定截止日期"
      ],
    "timeline": "2-4周"
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
-- 技能8：时间块规划（Time Blocking）
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
    'time_blocking',
    '时间块规划',
    '将时间划分为时间块，为每个时间块分配任务。通过时间块规划，帮助用户更好地管理时间，提高专注力和效率，减少任务切换带来的时间浪费。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "date": {
                "type": "string",
                "format": "date",
                "description": "日期（ISO格式：YYYY-MM-DD）"
            },
            "timeBlocks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "startTime": {"type": "string", "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},
                        "endTime": {"type": "string", "pattern": "^([0-1][0-9]|2[0-3]):[0-5][0-9]$"},
                        "task": {"type": "string"},
                        "category": {"type": "string"}
                    }
                },
                "description": "时间块列表"
            },
            "action": {
                "type": "string",
                "enum": ["create", "update", "view", "optimize"],
                "default": "create",
                "description": "操作类型：create(创建), update(更新), view(查看), optimize(优化)"
            }
        },
        "required": ["date"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的时间块规划"
    }',
    '时间块,日程规划,时间安排,时间管理,时间分配',
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
    'time_blocking',
    2,
    '## 时间块规划技能使用说明

### 功能描述
时间块规划技能将时间划分为时间块，为每个时间块分配任务，帮助用户更好地管理时间，提高专注力和效率。

### 核心功能
1. **时间块创建**：将一天的时间划分为多个时间块
2. **任务分配**：为每个时间块分配具体任务
3. **时间块优化**：优化时间块安排，提高效率
4. **时间块查看**：查看时间块规划
5. **时间块更新**：更新和调整时间块
6. **专注力保护**：通过时间块保护专注时间

### 参数说明
- **date** (必填): 日期（ISO格式：YYYY-MM-DD）
- **timeBlocks** (可选): 时间块列表
  - `startTime`: 开始时间（HH:mm格式）
  - `endTime`: 结束时间（HH:mm格式）
  - `task`: 任务描述
  - `category`: 任务类别
- **action** (可选): 操作类型
  - `create`: 创建时间块规划
  - `update`: 更新时间块
  - `view`: 查看时间块规划
  - `optimize`: 优化时间块安排

### 使用场景
- 想要更好地规划一天的时间
- 需要提高专注力和效率
- 想要减少任务切换带来的时间浪费
- 需要平衡工作和生活

### 执行流程
1. 了解用户的任务和可用时间
2. 将时间划分为时间块
3. 为每个时间块分配任务
4. 优化时间块安排（考虑任务类型、优先级、精力水平等）
5. 生成时间块规划
6. 提供时间块管理建议

### 时间块规划原则
- **固定时间块**：为重要任务设置固定时间块
- **缓冲时间**：在时间块之间留出缓冲时间
- **任务类型匹配**：根据任务类型安排时间块（深度工作、浅层工作等）
- **精力匹配**：将重要任务安排在精力充沛的时间
- **灵活性**：保留一些灵活时间块应对突发情况

### 返回格式
```json
{
  "success": true,
  "action": "create",
  "date": "2025-01-07",
  "timeBlocks": [
    {
      "startTime": "09:00",
      "endTime": "11:00",
      "task": "深度工作：完成项目报告",
      "category": "work",
      "type": "deep_work"
    },
    {
      "startTime": "11:00",
      "endTime": "11:15",
      "task": "休息",
      "category": "break"
    },
    {
      "startTime": "11:15",
      "endTime": "12:00",
      "task": "回复邮件和处理杂务",
      "category": "work",
      "type": "shallow_work"
    }
  ],
  "totalHours": 8,
  "deepWorkHours": 2,
  "suggestions": [
    "在精力充沛的上午安排深度工作",
    "在时间块之间留出缓冲时间"
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
-- 绑定技能到时小光角色
-- ============================================

-- 获取时小光的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '时小光' LIMIT 1);

-- 绑定技能7：拖延症诊断
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
    'procrastination_diagnosis',
    true,
    false,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 绑定技能8：时间块规划
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
    'time_blocking',
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
WHERE skill_id IN ('procrastination_diagnosis', 'time_blocking')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('procrastination_diagnosis', 'time_blocking')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('procrastination_diagnosis', 'time_blocking')
    AND character_id = @character_id;
