-- 创建测试技能
-- 这是一个简单的测试技能，用于验证技能系统功能

-- 1. 插入技能定义（Level 1）
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
    'test-skill',
    '测试技能',
    '这是一个简单的测试技能，用于验证技能系统的基本功能。可以接收用户输入并返回处理结果。',
    'UTILITY',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "input": {
                "type": "string",
                "description": "用户输入的内容"
            },
            "action": {
                "type": "string",
                "enum": ["echo", "uppercase", "lowercase", "reverse"],
                "description": "处理动作: echo(原样返回), uppercase(转大写), lowercase(转小写), reverse(反转)"
            }
        },
        "required": ["input"]
    }',
    '{
        "type": "RULE_BASED",
        "description": "基于规则的简单处理"
    }',
    '测试,test,echo',
    NULL,
    -1,
    '1.0.0',
    'HeartSphere Test',
    false,
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    function_schema = VALUES(function_schema),
    execution_config = VALUES(execution_config),
    version = VALUES(version),
    updated_at = NOW();

-- 2. 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    trigger_condition,
    execution_order,
    created_at
) VALUES (
    'test-skill',
    2,
    '## 测试技能使用说明

### 功能
这是一个测试技能，用于验证技能系统的基本功能。

### 参数说明
- **input** (必填): 用户输入的内容
- **action** (可选): 处理动作
  - `echo`: 原样返回输入内容
  - `uppercase`: 将输入转换为大写
  - `lowercase`: 将输入转换为小写
  - `reverse`: 反转输入字符串

### 使用示例
- 输入: "Hello World", action: "uppercase" → 输出: "HELLO WORLD"
- 输入: "Test", action: "reverse" → 输出: "tseT"
- 输入: "Hello", action: "echo" → 输出: "Hello"

### 返回格式
```json
{
  "success": true,
  "input": "原始输入",
  "action": "处理动作",
  "output": "处理后的结果",
  "timestamp": "处理时间"
}
```',
    NULL,
    1,
    NOW()
) ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- 3. 插入技能资源（Level 3）- 可选
-- 这个测试技能不需要额外的资源，所以这里不插入
