-- 创建CBT行为激活技能
-- 技能2: 行为激活 (Behavioral Activation)
-- 用于帮助抑郁症患者通过增加积极活动来改善情绪

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
    'cbt-behavioral-activation',
    'CBT行为激活',
    '认知行为疗法核心技能 - 通过增加积极活动来改善情绪，包括活动监控、活动计划、活动执行和效果评估',
    'PSYCHIATRY',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["monitor", "plan", "execute", "evaluate"],
                "description": "操作类型: monitor(监控活动), plan(制定活动计划), execute(执行活动), evaluate(评估效果)"
            },
            "patientId": {
                "type": "string",
                "description": "患者ID"
            },
            "date": {
                "type": "string",
                "format": "date",
                "description": "日期 (YYYY-MM-DD)"
            },
            "activities": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "activity": {"type": "string", "description": "活动名称"},
                        "time": {"type": "string", "description": "时间"},
                        "pleasure": {"type": "integer", "minimum": 0, "maximum": 10, "description": "愉悦度 (0-10)"},
                        "mastery": {"type": "integer", "minimum": 0, "maximum": 10, "description": "掌控感 (0-10)"},
                        "duration": {"type": "integer", "description": "持续时间（分钟）"}
                    }
                },
                "description": "活动列表"
            },
            "activityPlan": {
                "type": "object",
                "properties": {
                    "activity": {"type": "string", "description": "活动名称"},
                    "scheduledTime": {"type": "string", "description": "计划时间"},
                    "difficulty": {"type": "string", "enum": ["easy", "medium", "hard"], "description": "难度等级"},
                    "expectedPleasure": {"type": "integer", "minimum": 0, "maximum": 10, "description": "预期愉悦度"},
                    "barriers": {"type": "array", "items": {"type": "string"}, "description": "潜在障碍"}
                },
                "description": "活动计划"
            },
            "activityCategory": {
                "type": "string",
                "enum": ["exercise", "social", "hobby", "work", "self-care", "learning", "creative", "relaxation"],
                "description": "活动类别：运动、社交、爱好、工作、自我照顾、学习、创造性、放松"
            },
            "completed": {
                "type": "boolean",
                "description": "是否完成"
            },
            "actualPleasure": {
                "type": "integer",
                "minimum": 0,
                "maximum": 10,
                "description": "实际愉悦度 (0-10)"
            },
            "actualMastery": {
                "type": "integer",
                "minimum": 0,
                "maximum": 10,
                "description": "实际掌控感 (0-10)"
            }
        },
        "required": ["action"]
    }',
    '{
        "rule": "behavioral_activation",
        "workflow": {
            "monitor": {
                "steps": ["记录活动", "评估愉悦度", "评估掌控感", "分析模式"]
            },
            "plan": {
                "steps": ["选择活动", "设置时间", "评估难度", "识别障碍", "制定应对策略"]
            },
            "execute": {
                "steps": ["执行活动", "记录实际体验", "评估完成度", "记录困难"]
            },
            "evaluate": {
                "steps": ["比较计划与实际", "评估效果", "识别成功因素", "调整计划"]
            }
        }
    }',
    '行为,活动,激活,抑郁,情绪,计划,执行,监控,评估,行为激活,BA,CBT',
    'PSYCHIATRY_ACCESS',
    -1,
    '1.0.0',
    'HeartSphere CBT Team',
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
    execution_order,
    created_at
) VALUES
    (
        'cbt-behavioral-activation',
        2,
        '行为激活是CBT的重要技术，特别适用于抑郁症治疗。通过增加积极活动，可以帮助患者打破抑郁循环，改善情绪和功能。',
        1,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '活动监控：要求患者记录每日活动，包括活动名称、时间、愉悦度（0-10）和掌控感（0-10）。这有助于识别活动-情绪模式。',
        2,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '制定活动计划：基于活动监控的结果，与患者一起制定下周的活动计划。选择愉悦度高或掌控感强的活动，从简单开始，逐步增加难度。',
        3,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '识别障碍：在制定计划时，询问患者"可能遇到什么困难？"帮助患者识别潜在障碍（如：疲劳、动机不足、时间限制）并制定应对策略。',
        4,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '活动类别：常见的活动类别包括：运动、社交、爱好、工作、自我照顾、学习、创造性活动、放松活动。确保计划包含多种类别的活动。',
        5,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '执行活动：鼓励患者按计划执行活动，即使情绪低落。强调"行动在前，感觉在后"的理念。记录实际体验，包括是否完成、实际愉悦度和掌控感。',
        6,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '评估效果：比较计划与实际执行情况，评估活动的效果。识别哪些活动最有效，哪些活动有困难，据此调整后续计划。',
        7,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        2,
        '使用示例：
1. 监控活动: {"action": "monitor", "patientId": "P001", "date": "2025-01-04", "activities": [{"activity": "散步", "time": "09:00", "pleasure": 5, "mastery": 6, "duration": 30}]}
2. 制定计划: {"action": "plan", "patientId": "P001", "activityPlan": {"activity": "与朋友共进午餐", "scheduledTime": "2025-01-05 12:00", "difficulty": "medium", "expectedPleasure": 7, "barriers": ["担心谈话困难"]}, "activityCategory": "social"}
3. 执行活动: {"action": "execute", "patientId": "P001", "activityPlan": {"activity": "与朋友共进午餐"}, "completed": true, "actualPleasure": 8, "actualMastery": 7}
4. 评估效果: {"action": "evaluate", "patientId": "P001", "date": "2025-01-04"}',
        10,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    instruction_text = VALUES(instruction_text),
    execution_order = VALUES(execution_order);

-- 3. 插入技能资源（Level 3）
INSERT INTO skill_resources (
    skill_id,
    resource_type,
    resource_name,
    resource_url,
    resource_content,
    resource_order,
    created_at
) VALUES
    (
        'cbt-behavioral-activation',
        'TEMPLATE',
        '活动监控表',
        '/skills/cbt/behavioral-activation/activity-monitoring-template.json',
        '{"date": "", "activities": [{"activity": "", "time": "", "pleasure": 0, "mastery": 0, "duration": 0}]}',
        1,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        'TEMPLATE',
        '活动计划表',
        '/skills/cbt/behavioral-activation/activity-planning-template.json',
        '{"activity": "", "scheduledTime": "", "difficulty": "medium", "expectedPleasure": 5, "barriers": [], "copingStrategies": [], "activityCategory": ""}',
        2,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        'EXAMPLE',
        '活动类别示例',
        '/skills/cbt/behavioral-activation/activity-categories.json',
        '{"exercise": ["散步", "跑步", "瑜伽", "游泳", "骑自行车"], "social": ["与朋友见面", "打电话", "参加聚会", "志愿服务"], "hobby": ["阅读", "听音乐", "看电影", "烹饪", "园艺"], "work": ["完成工作任务", "学习新技能", "整理文件"], "self-care": ["洗澡", "打扮", "健康饮食", "充足睡眠"], "learning": ["上课", "读书", "观看教程", "练习新技能"], "creative": ["绘画", "写作", "音乐创作", "手工制作"], "relaxation": ["冥想", "深呼吸", "按摩", "听放松音乐"]}',
        3,
        NOW()
    ),
    (
        'cbt-behavioral-activation',
        'CONFIG',
        '应对障碍策略',
        '/skills/cbt/behavioral-activation/barrier-coping-strategies.json',
        '{"疲劳": ["从简单活动开始", "分解为小步骤", "设定合理期望", "提前休息"], "动机不足": ["关注长期收益", "回忆成功的活动", "寻找支持", "设定奖励"], "时间限制": ["优先排序", "时间管理", "灵活调整", "充分利用碎片时间"], "社会焦虑": ["从低压力社交开始", "准备话题", "设定时间限制", "渐进暴露"], "完美主义": ["接受不完美", "关注过程而非结果", "设定现实目标", "庆祝小成就"]}',
        4,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    resource_content = VALUES(resource_content),
    resource_url = VALUES(resource_url),
    resource_order = VALUES(resource_order);
