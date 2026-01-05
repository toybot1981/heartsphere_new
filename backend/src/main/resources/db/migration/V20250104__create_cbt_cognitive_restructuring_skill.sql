-- 创建CBT认知重构技能
-- 技能1: 认知重构 (Cognitive Restructuring)
-- 用于帮助识别和改变负面思维模式

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
    'cbt-cognitive-restructuring',
    'CBT认知重构',
    '认知行为疗法核心技能 - 帮助识别、评估和重构负面思维模式，包括自动思维识别、认知扭曲检测、证据评估和思维重构',
    'PSYCHIATRY',
    'ACTIVE',
    'RULE_BASED',
    '{
        "type": "object",
        "properties": {
            "action": {
                "type": "string",
                "enum": ["identify", "evaluate", "restructure", "challenge"],
                "description": "操作类型: identify(识别自动思维), evaluate(评估思维证据), restructure(重构思维), challenge(挑战认知扭曲)"
            },
            "patientId": {
                "type": "string",
                "description": "患者ID"
            },
            "situation": {
                "type": "string",
                "description": "触发情境描述"
            },
            "automaticThought": {
                "type": "string",
                "description": "自动思维内容"
            },
            "emotion": {
                "type": "string",
                "description": "伴随情绪（如：焦虑、抑郁、愤怒）"
            },
            "intensity": {
                "type": "integer",
                "minimum": 0,
                "maximum": 10,
                "description": "情绪强度 (0-10)"
            },
            "cognitiveDistortion": {
                "type": "string",
                "enum": ["全或无思维", "过度概括", "心理过滤", "贬低积极", "读心术", "灾难化", "情绪推理", "应该陈述", "贴标签", "个人化"],
                "description": "认知扭曲类型"
            },
            "evidenceFor": {
                "type": "array",
                "items": {"type": "string"},
                "description": "支持该思维的证据列表"
            },
            "evidenceAgainst": {
                "type": "array",
                "items": {"type": "string"},
                "description": "反驳该思维的证据列表"
            },
            "alternativeThought": {
                "type": "string",
                "description": "替代性思维"
            }
        },
        "required": ["action"]
    }',
    '{
        "rule": "cognitive_restructuring",
        "workflow": {
            "identify": {
                "steps": ["识别情境", "提取自动思维", "识别情绪", "评估强度"]
            },
            "evaluate": {
                "steps": ["收集支持证据", "收集反驳证据", "识别认知扭曲", "评估思维合理性"]
            },
            "restructure": {
                "steps": ["生成替代思维", "评估替代思维", "制定行动计划", "记录结果"]
            },
            "challenge": {
                "steps": ["识别扭曲类型", "挑战扭曲逻辑", "寻找替代解释", "验证新思维"]
            }
        }
    }',
    '认知,思维,想法,负面,重构,扭曲,自动思维,认知重构,CBT,认知行为',
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
        'cbt-cognitive-restructuring',
        2,
        '认知重构是CBT的核心技术，用于帮助患者识别和改变导致情绪困扰的负面思维模式。使用前需要建立良好的治疗关系。',
        1,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        2,
        '识别自动思维：当患者报告情绪困扰时，询问"当时你心里在想什么？"来识别自动思维。自动思维通常是快速、自动、不易察觉的。',
        2,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        2,
        '评估思维证据：使用苏格拉底式提问，帮助患者收集支持和反驳其思维的证据。询问"有什么证据支持这个想法？"和"有什么证据反驳这个想法？"',
        3,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        2,
        '识别认知扭曲：常见的认知扭曲包括：全或无思维、过度概括、心理过滤、贬低积极、读心术、灾难化、情绪推理、应该陈述、贴标签、个人化。',
        4,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        2,
        '重构思维：帮助患者生成更平衡、现实的替代思维。替代思维应该：1) 基于证据 2) 考虑多种可能性 3) 更加平衡 4) 有助于改善情绪',
        5,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        2,
        '使用示例：
1. 识别自动思维: {"action": "identify", "patientId": "P001", "situation": "收到工作反馈", "emotion": "焦虑", "intensity": 8}
2. 评估思维: {"action": "evaluate", "patientId": "P001", "automaticThought": "我完全搞砸了", "evidenceFor": ["反馈中有批评"], "evidenceAgainst": ["也有表扬", "完成了大部分工作"]}
3. 重构思维: {"action": "restructure", "patientId": "P001", "automaticThought": "我完全搞砸了", "alternativeThought": "虽然有一些需要改进的地方，但整体表现不错"}
4. 挑战扭曲: {"action": "challenge", "patientId": "P001", "cognitiveDistortion": "全或无思维", "automaticThought": "我完全搞砸了"}',
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
        'cbt-cognitive-restructuring',
        'TEMPLATE',
        '思维记录表',
        '/skills/cbt/cognitive-restructuring/thought-record-template.json',
        '{"situation": "", "automaticThought": "", "emotion": "", "intensity": 0, "cognitiveDistortion": "", "evidenceFor": [], "evidenceAgainst": [], "alternativeThought": "", "newEmotion": "", "newIntensity": 0}',
        1,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        'EXAMPLE',
        '认知扭曲示例',
        '/skills/cbt/cognitive-restructuring/distortion-examples.json',
        '{"全或无思维": "如果我不完美，我就是个失败者", "过度概括": "一次失败意味着我永远会失败", "心理过滤": "只关注负面，忽略积极", "贬低积极": "那只是运气好", "读心术": "他们一定觉得我很蠢", "灾难化": "如果这次考试失败，我的人生就完了", "情绪推理": "我感觉很糟糕，所以情况一定很糟糕", "应该陈述": "我应该总是做得最好", "贴标签": "我是个失败者", "个人化": "都是我的错"}',
        2,
        NOW()
    ),
    (
        'cbt-cognitive-restructuring',
        'CONFIG',
        '苏格拉底式提问清单',
        '/skills/cbt/cognitive-restructuring/socratic-questions.json',
        '["这个想法的证据是什么？", "有没有其他可能的解释？", "最坏的情况是什么？我能应对吗？", "最好的情况是什么？", "最现实的情况是什么？", "这个想法对我有什么影响？", "如果朋友有同样的想法，我会对他说什么？", "我应该做什么？"]',
        3,
        NOW()
    )
ON DUPLICATE KEY UPDATE
    resource_content = VALUES(resource_content),
    resource_url = VALUES(resource_url),
    resource_order = VALUES(resource_order);
