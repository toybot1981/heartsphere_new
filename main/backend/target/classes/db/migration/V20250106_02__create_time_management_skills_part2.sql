-- 时小光技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_02__create_time_management_skills_part2.sql
-- 
-- 说明：本文件包含时小光的第3-4个技能
-- 3. 番茄工作法助手（Pomodoro Assistant）
-- 4. 优先级矩阵（Priority Matrix）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：番茄工作法助手（Pomodoro Assistant）
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
    'pomodoro_assistant',
    '番茄工作法助手',
    '实施和监控番茄工作法，帮助用户保持专注，提高工作效率。启动25分钟专注时间，提醒用户休息，记录完成的番茄数，分析专注时间分布。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "duration": {
                "type": "integer",
                "default": 25,
                "description": "专注时长（分钟），默认25分钟"
            },
            "taskName": {
                "type": "string",
                "description": "任务名称"
            },
            "autoStart": {
                "type": "boolean",
                "default": false,
                "description": "是否自动开始"
            },
            "action": {
                "type": "string",
                "enum": ["start", "pause", "resume", "stop", "status"],
                "description": "操作类型：start(开始), pause(暂停), resume(继续), stop(停止), status(查看状态)"
            }
        },
        "required": ["action"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的番茄工作法实施和监控"
    }',
    '番茄工作法,番茄钟,专注,时间管理,工作效率,番茄',
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
    'pomodoro_assistant',
    2,
    '## 番茄工作法助手技能使用说明

### 功能描述
番茄工作法助手帮助用户实施和监控番茄工作法，保持专注，提高工作效率。

### 核心功能
1. **启动专注时间**：启动25分钟（或自定义时长）的专注时间
2. **休息提醒**：提醒用户休息（5分钟短休息，15分钟长休息）
3. **番茄数记录**：记录完成的番茄数
4. **专注分析**：分析专注时间分布
5. **专注技巧**：提供专注技巧和建议
6. **报告生成**：生成每日/每周专注报告

### 参数说明
- **action** (必填): 操作类型
  - `start`: 开始一个新的番茄钟
  - `pause`: 暂停当前番茄钟
  - `resume`: 继续暂停的番茄钟
  - `stop`: 停止当前番茄钟
  - `status`: 查看当前状态
- **duration** (可选): 专注时长（分钟），默认25分钟
- **taskName** (可选): 任务名称
- **autoStart** (可选): 是否自动开始，默认false

### 使用场景
- 需要长时间专注工作
- 容易分心，需要外部提醒
- 想要培养专注习惯

### 执行流程
1. 用户选择操作（开始/暂停/继续/停止/查看状态）
2. 如果开始，启动专注计时器
3. 在专注时间结束时提醒用户休息
4. 记录完成的番茄数
5. 提供专注技巧和建议
6. 生成专注时间报告

### 番茄工作法规则
- 一个番茄钟 = 25分钟专注 + 5分钟短休息
- 每4个番茄钟后，进行15分钟长休息
- 专注期间不能被打断
- 如果被打断，当前番茄钟作废

### 返回格式
```json
{
  "success": true,
  "action": "start",
  "status": "running",
  "remainingTime": 1500,
  "pomodoroCount": 1,
  "taskName": "写报告",
  "tips": ["保持专注", "避免干扰"]
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能4：优先级矩阵（Priority Matrix）
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
    'priority_matrix',
    '优先级矩阵',
    '使用艾森豪威尔矩阵（紧急-重要矩阵）帮助用户识别任务优先级，合理分配时间和精力。将任务分类到四个象限，提供每个象限的处理建议。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "tasks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "任务名称"
                        },
                        "urgency": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 10,
                            "description": "紧急性评分（1-10）"
                        },
                        "importance": {
                            "type": "integer",
                            "minimum": 1,
                            "maximum": 10,
                            "description": "重要性评分（1-10）"
                        }
                    },
                    "required": ["name", "urgency", "importance"]
                },
                "description": "任务列表"
            },
            "matrixType": {
                "type": "string",
                "enum": ["Eisenhower", "ABC", "MoSCoW"],
                "default": "Eisenhower",
                "description": "矩阵类型：Eisenhower(艾森豪威尔), ABC(ABC分类), MoSCoW(MoSCoW方法)"
            }
        },
        "required": ["tasks"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的优先级分析"
    }',
    '优先级,紧急重要矩阵,任务优先级,艾森豪威尔矩阵,任务管理,优先级排序',
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
    'priority_matrix',
    2,
    '## 优先级矩阵技能使用说明

### 功能描述
优先级矩阵技能使用艾森豪威尔矩阵（紧急-重要矩阵）帮助用户识别任务优先级，合理分配时间和精力。

### 核心功能
1. **任务收集**：收集用户的所有待办任务
2. **评估引导**：引导用户评估每个任务的紧急性和重要性
3. **象限分类**：将任务分类到四个象限
   - 第一象限：紧急且重要（立即处理）
   - 第二象限：重要但不紧急（计划处理）
   - 第三象限：紧急但不重要（委托或减少）
   - 第四象限：不紧急也不重要（删除或延迟）
4. **处理建议**：提供每个象限的处理建议
5. **可视化**：生成优先级矩阵可视化图表
6. **任务推荐**：推荐每日任务安排

### 参数说明
- **tasks** (必填): 任务列表，每个任务包含：
  - `name`: 任务名称
  - `urgency`: 紧急性评分（1-10）
  - `importance`: 重要性评分（1-10）
- **matrixType** (可选): 矩阵类型
  - `Eisenhower`: 艾森豪威尔矩阵（默认）
  - `ABC`: ABC分类法
  - `MoSCoW`: MoSCoW方法

### 使用场景
- 任务太多，不知道先做什么
- 感觉忙碌但效率不高
- 需要平衡多个目标

### 艾森豪威尔矩阵说明
- **第一象限（紧急且重要）**：立即处理，如紧急项目、危机处理
- **第二象限（重要但不紧急）**：计划处理，如长期目标、预防性工作
- **第三象限（紧急但不重要）**：委托或减少，如不重要的会议、干扰
- **第四象限（不紧急也不重要）**：删除或延迟，如浪费时间的事情

### 执行流程
1. 收集用户的所有待办任务
2. 引导用户评估每个任务的紧急性和重要性
3. 根据评分将任务分类到四个象限
4. 为每个象限提供处理建议
5. 生成可视化优先级矩阵
6. 推荐每日任务安排

### 返回格式
```json
{
  "success": true,
  "matrixType": "Eisenhower",
  "quadrants": {
    "urgent_important": [
      {"name": "紧急项目", "urgency": 9, "importance": 9}
    ],
    "important_not_urgent": [
      {"name": "长期目标", "urgency": 3, "importance": 8}
    ],
    "urgent_not_important": [
      {"name": "不重要的会议", "urgency": 7, "importance": 2}
    ],
    "not_urgent_not_important": [
      {"name": "刷手机", "urgency": 1, "importance": 1}
    ]
  },
  "recommendations": {
    "urgent_important": "立即处理这些任务",
    "important_not_urgent": "制定计划，安排时间处理"
  },
  "dailyTasks": ["任务1", "任务2"]
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

-- 绑定技能3：番茄工作法助手
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
    'pomodoro_assistant',
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

-- 绑定技能4：优先级矩阵
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
    'priority_matrix',
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
WHERE skill_id IN ('pomodoro_assistant', 'priority_matrix')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('pomodoro_assistant', 'priority_matrix')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('pomodoro_assistant', 'priority_matrix')
    AND character_id = @character_id;
