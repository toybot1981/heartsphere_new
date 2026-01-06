-- 修复技能JSON Schema中的编码问题
-- 重新插入function_schema和execution_config，确保中文内容正确编码

-- 1. 修复CBT认知重构技能的function_schema
UPDATE skill_definitions SET
    function_schema = '{
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
    execution_config = '{
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
    }'
WHERE skill_id = 'cbt-cognitive-restructuring';

-- 2. 修复CBT行为激活技能的function_schema
UPDATE skill_definitions SET
    function_schema = '{
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
    execution_config = '{
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
    }'
WHERE skill_id = 'cbt-behavioral-activation';

-- 3. 修复测试技能的function_schema
UPDATE skill_definitions SET
    function_schema = '{
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
    execution_config = '{
        "type": "RULE_BASED",
        "description": "基于规则的简单处理"
    }'
WHERE skill_id = 'test-skill';
