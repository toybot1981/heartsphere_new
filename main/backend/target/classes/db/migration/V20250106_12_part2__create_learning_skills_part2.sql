-- 学小知技能定义 - 第二部分（技能3-4）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_12_part2__create_learning_skills_part2.sql
-- 
-- 说明：本文件包含学小知的第3-4个技能
-- 3. 记忆技巧训练（Memory Technique Training）
-- 4. 笔记方法指导（Note-Taking Method Guidance）

SET NAMES utf8mb4;

-- ============================================
-- 技能3：记忆技巧训练（Memory Technique Training）
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
    'memory_technique_training',
    '记忆技巧训练',
    '教授记忆技巧（记忆宫殿、联想法、间隔重复等），帮助用户提高记忆效率。通过训练和实践，帮助用户掌握各种记忆方法，提高学习效果。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "techniqueType": {
                "type": "string",
                "enum": ["memory_palace", "association", "spaced_repetition", "mnemonic", "chunking", "all"],
                "description": "技巧类型：memory_palace(记忆宫殿), association(联想法), spaced_repetition(间隔重复), mnemonic(助记符), chunking(分块), all(全部)"
            },
            "content": {
                "type": "string",
                "description": "需要记忆的内容"
            },
            "action": {
                "type": "string",
                "enum": ["teach", "practice", "apply", "review"],
                "default": "teach",
                "description": "操作类型：teach(教授), practice(练习), apply(应用), review(复习)"
            }
        },
        "required": ["techniqueType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的记忆技巧训练"
    }',
    '记忆,记忆技巧,记忆方法,记忆训练,记忆宫殿,联想法',
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
    'memory_technique_training',
    2,
    '## 记忆技巧训练技能使用说明

### 功能描述
记忆技巧训练技能教授用户各种记忆技巧，帮助用户提高记忆效率，提高学习效果。

### 核心功能
1. **技巧教授**：教授各种记忆技巧
2. **技巧练习**：引导用户进行技巧练习
3. **技巧应用**：帮助用户将技巧应用到实际学习中
4. **技巧复习**：定期复习和巩固技巧
5. **效果评估**：评估技巧使用效果
6. **个性化建议**：根据用户情况提供个性化建议

### 参数说明
- **techniqueType** (必填): 技巧类型
  - `memory_palace`: 记忆宫殿法
  - `association`: 联想法
  - `spaced_repetition`: 间隔重复法
  - `mnemonic`: 助记符法
  - `chunking`: 分块法
  - `all`: 全部技巧
- **content** (可选): 需要记忆的内容
- **action** (可选): 操作类型
  - `teach`: 教授技巧
  - `practice`: 练习技巧
  - `apply`: 应用技巧
  - `review`: 复习技巧

### 使用场景
- 想要提高记忆效率
- 需要记忆大量信息
- 想要学习记忆技巧
- 需要将记忆技巧应用到学习中

### 执行流程
1. 了解用户想要学习的记忆技巧
2. 教授记忆技巧的原理和方法
3. 提供具体的操作步骤
4. 引导用户进行练习
5. 帮助用户将技巧应用到实际学习中
6. 评估技巧使用效果
7. 提供改进建议

### 常用记忆技巧
- **记忆宫殿**：将信息与熟悉的地点关联
- **联想法**：通过联想建立联系
- **间隔重复**：按照遗忘曲线复习
- **助记符**：使用缩写、口诀等
- **分块法**：将信息分成小块记忆

### 返回格式
```json
{
  "success": true,
  "action": "teach",
  "techniqueType": "memory_palace",
  "techniqueName": "记忆宫殿法",
  "description": "将需要记忆的信息与熟悉的地点关联",
  "steps": [
    "选择一个熟悉的地点（如：自己的家）",
    "在脑海中清晰地想象这个地点",
    "将要记忆的信息与地点中的位置关联",
    "通过想象在位置间行走来回忆信息"
  ],
  "example": {
    "content": "记忆购物清单：牛奶、面包、鸡蛋",
    "application": "在门口放牛奶，在客厅放面包，在厨房放鸡蛋"
  },
  "practice": "尝试用记忆宫殿法记忆今天的任务清单"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- ============================================
-- 技能4：笔记方法指导（Note-Taking Method Guidance）
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
    'note_taking_method_guidance',
    '笔记方法指导',
    '教授高效笔记方法（康奈尔笔记法、思维导图等），帮助用户提高笔记效率和学习效果。根据学习内容和目标，推荐合适的笔记方法，提供具体操作指导。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "methodType": {
                "type": "string",
                "enum": ["cornell", "mindmap", "outline", "chart", "flow", "all"],
                "description": "方法类型：cornell(康奈尔), mindmap(思维导图), outline(大纲), chart(图表), flow(流程图), all(全部)"
            },
            "contentType": {
                "type": "string",
                "enum": ["lecture", "reading", "meeting", "research", "other"],
                "description": "内容类型：lecture(讲座), reading(阅读), meeting(会议), research(研究), other(其他)"
            },
            "action": {
                "type": "string",
                "enum": ["teach", "apply", "review", "optimize"],
                "default": "teach",
                "description": "操作类型：teach(教授), apply(应用), review(检查), optimize(优化)"
            }
        },
        "required": ["methodType"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的笔记方法指导"
    }',
    '笔记,笔记方法,康奈尔笔记法,思维导图,学习笔记,笔记技巧',
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
    'note_taking_method_guidance',
    2,
    '## 笔记方法指导技能使用说明

### 功能描述
笔记方法指导技能教授用户高效笔记方法，帮助用户提高笔记效率和学习效果。

### 核心功能
1. **方法教授**：教授各种笔记方法
2. **方法推荐**：根据学习内容推荐合适的笔记方法
3. **方法应用**：帮助用户应用笔记方法
4. **笔记检查**：检查笔记质量，提供改进建议
5. **方法优化**：优化笔记方法，提高效率
6. **习惯建立**：帮助建立良好的笔记习惯

### 参数说明
- **methodType** (必填): 方法类型
  - `cornell`: 康奈尔笔记法
  - `mindmap`: 思维导图
  - `outline`: 大纲笔记法
  - `chart`: 图表笔记法
  - `flow`: 流程图笔记法
  - `all`: 全部方法
- **contentType** (可选): 内容类型
- **action** (可选): 操作类型
  - `teach`: 教授方法
  - `apply`: 应用方法
  - `review`: 检查笔记
  - `optimize`: 优化方法

### 使用场景
- 想要提高笔记效率
- 需要学习高效笔记方法
- 想要改善笔记质量
- 需要针对不同内容的笔记方法

### 执行流程
1. 了解用户的学习内容和目标
2. 推荐合适的笔记方法
3. 教授笔记方法的具体操作
4. 帮助用户应用笔记方法
5. 检查笔记质量
6. 提供改进建议
7. 帮助建立良好的笔记习惯

### 常用笔记方法
- **康奈尔笔记法**：将页面分为笔记区、提示区、总结区
- **思维导图**：以中心主题为核心，分支展开
- **大纲笔记法**：使用层级结构组织信息
- **图表笔记法**：使用表格、图表等可视化方式
- **流程图笔记法**：使用流程图展示过程

### 返回格式
```json
{
  "success": true,
  "action": "teach",
  "methodType": "cornell",
  "methodName": "康奈尔笔记法",
  "description": "将页面分为三个区域：笔记区、提示区、总结区",
  "structure": {
    "noteArea": "右侧：记录主要内容",
    "cueArea": "左侧：记录关键词和问题",
    "summaryArea": "底部：记录总结"
  },
  "steps": [
    "在页面右侧记录主要内容",
    "在左侧记录关键词和问题",
    "课后在底部写总结",
    "复习时用左侧提示回忆内容"
  ],
  "tips": [
    "使用简洁的语言",
    "使用符号和缩写",
    "及时复习和总结"
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
-- 绑定技能到学小知角色
-- ============================================

-- 获取学小知的角色ID
SET @character_id = (SELECT id FROM system_characters WHERE name = '学小知' LIMIT 1);

-- 绑定技能3：记忆技巧训练
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
    'memory_technique_training',
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

-- 绑定技能4：笔记方法指导
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
    'note_taking_method_guidance',
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
WHERE skill_id IN ('memory_technique_training', 'note_taking_method_guidance')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('memory_technique_training', 'note_taking_method_guidance')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('memory_technique_training', 'note_taking_method_guidance')
    AND character_id = @character_id;
