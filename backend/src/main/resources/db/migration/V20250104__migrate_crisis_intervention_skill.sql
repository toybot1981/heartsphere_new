-- 迁移 crisis-intervention 技能到数据库
-- 这是第一个迁移的技能，作为示例

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
    is_active,
    created_at,
    updated_at
) VALUES (
    'crisis-intervention',
    '危机干预',
    '危机干预工具 - 评估风险、制定干预方案、提供应急指导',
    'PSYCHIATRY',
    'ACTIVE',
    'SCRIPT',
    '{
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["assess", "plan", "guide", "resources"],
                "description": "操作类型: assess(评估风险), plan(制定干预方案), guide(获取应急指导), resources(查看危机资源)"
            },
            "patientId": {
                "type": "string",
                "description": "患者ID"
            },
            "riskLevel": {
                "type": "string",
                "enum": ["low", "medium", "high", "critical"],
                "description": "风险等级: low(低), medium(中), high(高), critical(紧急)"
            },
            "symptoms": {
                "type": "array",
                "items": {
                    "type": "string"
                },
                "description": "危机症状列表"
            },
            "situation": {
                "type": "string",
                "description": "危机情况描述"
            }
        },
        "required": ["action"]
    }',
    '{
        "script": "crisis-intervention.js",
        "language": "javascript",
        "entryPoint": "run",
        "timeout": 30000
    }',
    '危机,紧急,自杀,自伤,危险,风险,干预,应急',
    'PSYCHIATRY_ACCESS',
    -1,
    '1.0.0',
    'HeartSphere Psychiatry Team',
    true,
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

-- 2. 插入技能指令（Level 2）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    priority,
    created_at
) VALUES
    (
        'crisis-intervention',
        2,
        '危机干预技能用于评估和处理心理健康危机情况，包括自杀风险、暴力风险等。使用前请确保有适当的专业资质。',
        1,
        NOW()
    ),
    (
        'crisis-intervention',
        2,
        '评估危机风险时，需要提供患者ID、症状列表和情况描述。系统会根据症状关键词自动计算风险评分。',
        2,
        NOW()
    ),
    (
        'crisis-intervention',
        2,
        '制定干预方案时，需要提供患者ID和风险等级。系统会根据风险等级生成相应的干预措施。',
        3,
        NOW()
    ),
    (
        'crisis-intervention',
        2,
        '获取应急指导时，只需提供风险等级即可。系统会返回针对该风险等级的详细应对步骤。',
        4,
        NOW()
    ),
    (
        'crisis-intervention',
        2,
        '查看危机资源时，不需要额外参数。系统会返回急救电话、心理热线、医院信息等资源列表。',
        5,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    priority = VALUES(priority);

-- 3. 插入技能资源（Level 3）- 技能脚本内容
-- 注意：实际脚本内容应该存储在文件系统中，这里只存储引用
INSERT INTO skill_resources (
    skill_id,
    resource_type,
    resource_name,
    resource_path,
    resource_content,
    created_at
) VALUES
    (
        'crisis-intervention',
        'SCRIPT',
        'crisis-intervention.js',
        '/skills/psychiatry-tools/crisis-intervention.js',
        NULL,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    resource_path = VALUES(resource_path),
    updated_at = NOW();

-- 4. 创建技能使用说明（作为 Level 2 指令的补充）
INSERT INTO skill_instructions (
    skill_id,
    instruction_level,
    instruction_text,
    priority,
    created_at
) VALUES
    (
        'crisis-intervention',
        2,
        '使用示例：
1. 评估危机风险: {"action": "assess", "patientId": "P001", "symptoms": ["自杀意念", "绝望感"], "situation": "患者表达想死的想法"}
2. 制定干预方案: {"action": "plan", "patientId": "P001", "riskLevel": "high"}
3. 获取应急指导: {"action": "guide", "riskLevel": "critical"}
4. 查看危机资源: {"action": "resources"}',
        10,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text);
