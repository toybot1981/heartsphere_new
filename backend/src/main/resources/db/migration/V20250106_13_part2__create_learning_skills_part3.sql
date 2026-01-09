-- 学小知技能定义 - 第三部分（技能5-6）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_13_part2__create_learning_skills_part3.sql
-- 
-- 说明：本文件包含学小知的第5-6个技能
-- 5. 学习效果评估（Learning Effectiveness Assessment）
-- 6. 学习动力激发（Learning Motivation Boost）

SET NAMES utf8mb4;

-- ============================================
-- 技能5：学习效果评估（Learning Effectiveness Assessment）
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
    'learning_effectiveness_assessment',
    '学习效果评估',
    '通过测试、问答评估学习效果，发现薄弱环节。帮助用户了解自己的学习掌握情况，识别知识盲点，提供针对性的学习建议。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "subject": {
                "type": "string",
                "description": "学习科目或主题"
            },
            "assessmentType": {
                "type": "string",
                "enum": ["quiz", "qna", "self_check", "comprehensive"],
                "description": "评估类型：quiz(测验), qna(问答), self_check(自检), comprehensive(综合评估)"
            },
            "topics": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "评估的知识点列表"
            },
            "action": {
                "type": "string",
                "enum": ["create", "take", "analyze", "improve"],
                "default": "create",
                "description": "操作类型：create(创建), take(进行), analyze(分析), improve(改进)"
            }
        },
        "required": ["subject"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的学习效果评估"
    }',
    '学习效果,学习评估,测试,知识检查,学习掌握,学习检测',
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
    'learning_effectiveness_assessment',
    2,
    '## 学习效果评估技能使用说明

### 功能描述
学习效果评估技能通过测试、问答等方式评估用户的学习效果，帮助用户了解自己的学习掌握情况，识别知识盲点，提供针对性的学习建议。

### 核心功能
1. **评估创建**：创建学习效果评估
2. **测试进行**：进行测试或问答
3. **结果分析**：分析评估结果
4. **薄弱识别**：识别薄弱环节和知识盲点
5. **改进建议**：提供针对性的学习改进建议
6. **进度追踪**：追踪学习进度和改善情况

### 参数说明
- **subject** (必填): 学习科目或主题
- **assessmentType** (可选): 评估类型
  - `quiz`: 测验（选择题、判断题等）
  - `qna`: 问答（开放式问题）
  - `self_check`: 自检（自我评估）
  - `comprehensive`: 综合评估
- **topics** (可选): 评估的知识点列表
- **action** (可选): 操作类型
  - `create`: 创建评估
  - `take`: 进行评估
  - `analyze`: 分析结果
  - `improve`: 改进建议

### 使用场景
- 想要了解自己的学习掌握情况
- 需要检查学习效果
- 想要发现知识盲点
- 需要针对性的学习建议

### 执行流程
1. 了解用户的学习科目和内容
2. 创建学习效果评估
3. 进行测试或问答
4. 分析评估结果
5. 识别薄弱环节和知识盲点
6. 提供针对性的学习改进建议
7. 追踪学习进度和改善情况

### 评估方法
- **测验**：通过选择题、判断题等测试知识掌握
- **问答**：通过开放式问题评估理解深度
- **自检**：通过自我评估了解学习情况
- **综合评估**：结合多种方法全面评估

### 返回格式
```json
{
  "success": true,
  "action": "analyze",
  "subject": "Python编程",
  "assessmentType": "comprehensive",
  "overallScore": 75,
  "mastery": {
    "excellent": ["变量和数据类型", "控制结构"],
    "good": ["函数", "列表"],
    "needs_improvement": ["面向对象", "异常处理"]
  },
  "weakAreas": [
    {
      "topic": "面向对象",
      "score": 50,
      "issues": ["不理解类的概念", "不会使用继承"],
      "suggestions": ["重新学习面向对象基础", "多做练习"]
    }
  ],
  "improvementPlan": {
    "priority": ["面向对象", "异常处理"],
    "methods": ["重新学习", "多做练习", "项目实践"],
    "timeline": "2周"
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
-- 技能6：学习动力激发（Learning Motivation Boost）
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
    'learning_motivation_boost',
    '学习动力激发',
    '帮助用户找到学习动力，克服学习倦怠。通过对话和引导，帮助用户重新发现学习的意义和价值，激发学习热情，克服学习障碍。',
    'life',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "motivationIssue": {
                "type": "string",
                "enum": ["lack_motivation", "burnout", "procrastination", "doubt", "distraction", "unknown"],
                "description": "动力问题：lack_motivation(缺乏动力), burnout(倦怠), procrastination(拖延), doubt(怀疑), distraction(分心), unknown(未知)"
            },
            "learningGoal": {
                "type": "string",
                "description": "学习目标"
            },
            "currentState": {
                "type": "string",
                "description": "当前状态描述"
            },
            "action": {
                "type": "string",
                "enum": ["identify", "inspire", "plan", "support"],
                "default": "identify",
                "description": "操作类型：identify(识别), inspire(激励), plan(计划), support(支持)"
            }
        },
        "required": []
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于LLM的学习动力激发"
    }',
    '学习动力,学习倦怠,学习激励,学习热情,学习障碍,学习动机',
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
    'learning_motivation_boost',
    2,
    '## 学习动力激发技能使用说明

### 功能描述
学习动力激发技能帮助用户找到学习动力，克服学习倦怠，重新激发学习热情，保持学习动力。

### 核心功能
1. **问题识别**：识别学习动力问题
2. **原因分析**：分析动力缺失的原因
3. **意义发现**：帮助用户重新发现学习的意义
4. **目标设定**：设定明确的学习目标
5. **激励支持**：提供激励和支持
6. **计划制定**：制定学习计划，重新开始

### 参数说明
- **motivationIssue** (可选): 动力问题
  - `lack_motivation`: 缺乏动力
  - `burnout`: 学习倦怠
  - `procrastination`: 学习拖延
  - `doubt`: 怀疑学习价值
  - `distraction`: 容易分心
  - `unknown`: 未知问题
- **learningGoal** (可选): 学习目标
- **currentState** (可选): 当前状态描述
- **action** (可选): 操作类型
  - `identify`: 识别问题
  - `inspire`: 激励用户
  - `plan`: 制定计划
  - `support`: 提供支持

### 使用场景
- 感到学习倦怠，缺乏动力
- 想要重新激发学习热情
- 需要找到学习的意义
- 想要克服学习障碍

### 执行流程
1. 了解用户的学习状态和问题
2. 识别学习动力问题
3. 分析动力缺失的原因
4. 帮助用户重新发现学习的意义和价值
5. 设定明确的学习目标
6. 提供激励和支持
7. 制定学习计划，帮助重新开始

### 动力激发方法
- **意义发现**：帮助用户发现学习的意义和价值
- **目标设定**：设定明确、可实现的学习目标
- **小步快跑**：从小目标开始，逐步建立信心
- **成就庆祝**：庆祝学习成就，增强动力
- **社交支持**：寻求学习伙伴和支持
- **兴趣培养**：培养学习兴趣，让学习变得有趣

### 返回格式
```json
{
  "success": true,
  "action": "inspire",
  "motivationIssue": "burnout",
  "identifiedCauses": [
    "学习时间过长",
    "缺乏成就感",
    "目标不明确"
  ],
  "inspiration": {
    "meaning": "学习是为了实现你的职业目标，掌握新技能可以让你更有竞争力",
    "value": "每次学习都是对自己的投资，积累的知识会带来长期回报",
    "vision": "想象一下掌握这个技能后的自己，会更有信心和能力"
  },
  "goals": [
    {
      "shortTerm": "本周完成基础部分学习",
      "longTerm": "3个月内掌握核心技能"
    }
  ],
  "motivationStrategies": [
    "设定小目标，每完成一个就庆祝",
    "找到学习伙伴，互相鼓励",
    "将学习与兴趣结合，让学习变得有趣"
  ],
  "support": "我会一直陪伴你，支持你的学习。记住，每一步都是进步！"
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

-- 绑定技能5：学习效果评估
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
    'learning_effectiveness_assessment',
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

-- 绑定技能6：学习动力激发
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
    'learning_motivation_boost',
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
WHERE skill_id IN ('learning_effectiveness_assessment', 'learning_motivation_boost')
UNION ALL
SELECT 
    '技能指令' as type,
    COUNT(*) as count
FROM skill_instructions 
WHERE skill_id IN ('learning_effectiveness_assessment', 'learning_motivation_boost')
UNION ALL
SELECT 
    '技能绑定' as type,
    COUNT(*) as count
FROM character_skill_bindings 
WHERE skill_id IN ('learning_effectiveness_assessment', 'learning_motivation_boost')
    AND character_id = @character_id;
