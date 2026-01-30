-- 后端大模型调用提示词统一管理：插入默认模板（UTF-8）
-- 变更ID: migrate-backend-prompts-to-template-management
SET NAMES utf8mb4;

-- 先插入本迁移用到的分类（若已存在则更新描述，避免外键失败）
INSERT INTO prompt_categories (code, name, description, sort_order, is_active, created_at, updated_at) VALUES
('memory-character-interaction', '角色交互记忆', '从对话中提取角色与用户的交互记忆', 10, TRUE, NOW(), NOW()),
('memory-character-scene', '角色场景记忆', '从对话中提取角色在场景中的记忆', 11, TRUE, NOW(), NOW()),
('skill-selection-level1', '技能选择Level1', '根据用户消息初选相关技能', 20, TRUE, NOW(), NOW()),
('skill-selection-level2', '技能选择Level2', '对候选技能进行深度评估', 21, TRUE, NOW(), NOW()),
('skill-selection-level3', '技能选择Level3', '对最终候选技能进行最终决策', 22, TRUE, NOW(), NOW()),
('skill-selection-level2-batch', '技能选择Level2批量', '对多个候选技能进行深度评估', 23, TRUE, NOW(), NOW()),
('skill-selection-level3-batch', '技能选择Level3批量', '对多个最终候选技能进行最终决策', 24, TRUE, NOW(), NOW()),
('skill-execution', '技能执行', '大模型执行技能时的系统与用户提示词', 30, TRUE, NOW(), NOW()),
('admin-prompt-optimize', '管理端提示词优化', '管理端根据模板和上下文生成优化后的提示词', 40, TRUE, NOW(), NOW()),
('multiagent-agent-system', '多智能体Agent系统提示', '多智能体场景下 Agent 的系统提示词', 50, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), updated_at = NOW();

-- memory + name=facts（事实提取，与现有「记忆提取模板」并存，按 name 区分）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    'facts',
    'memory',
    '从对话中提取用户事实信息',
    '你是一个专业的记忆提取专家，擅长从对话中提取用户的事实信息。请以JSON格式返回结果。',
    '请从以下对话中提取用户的事实信息，返回JSON格式。

对话内容：
{{#each messages}}
{{this}}
{{/each}}

请提取以下类型的事实：
1. 个人信息：姓名、年龄、生日、职业等
2. 偏好：喜欢的事物、不喜欢的食物等
3. 习惯：作息习惯、使用习惯等
4. 关系：家人、朋友、同事等
5. 其他重要信息

返回格式（JSON数组）：
[
  {
    "fact": "事实描述",
    "category": "PERSONAL|PREFERENCE|HABIT|RELATIONSHIP|WORK|HEALTH|FINANCE|LOCATION|CONTACT|SKILL|GOAL|OTHER",
    "importance": 0.0-1.0,
    "confidence": 0.0-1.0,
    "tags": ["标签1", "标签2"]
  }
]',
    '{"messages": {"type": "array", "required": true, "description": "对话消息列表"}}',
    '{"messages": ["用户: 我喜欢吃苹果", "用户: 我今年25岁"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- memory + name=preferences（偏好提取）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    'preferences',
    'memory',
    '从对话中提取用户偏好信息',
    '你是一个专业的偏好提取专家，擅长从对话中提取用户的偏好信息。请以JSON格式返回结果。',
    '请从以下对话中提取用户的偏好信息，返回JSON格式。

对话内容：
{{#each messages}}
{{this}}
{{/each}}

请提取以下类型的偏好：
1. 食物偏好：喜欢的食物、不喜欢的食物等
2. 活动偏好：喜欢的活动、兴趣爱好等
3. 时间偏好：偏好的时间段、作息习惯等
4. 交互偏好：喜欢的对话风格、回应方式等
5. 其他偏好

返回格式（JSON数组）：
[
  {
    "key": "偏好键（如：favorite_food）",
    "value": "偏好值",
    "type": "STRING|NUMBER|BOOLEAN|JSON|LIST|RATING",
    "confidence": 0.0-1.0
  }
]',
    '{"messages": {"type": "array", "required": true, "description": "对话消息列表"}}',
    '{"messages": ["用户: 我喜欢吃苹果"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- memory + name=memories（记忆提取）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    'memories',
    'memory',
    '从对话中提取重要用户记忆',
    '你是一个专业的记忆提取专家，擅长从对话中提取重要的用户记忆。请以JSON格式返回结果。',
    '请从以下对话中提取重要的用户记忆，返回JSON格式。

对话内容：
{{#each messages}}
{{this}}
{{/each}}

请提取以下类型的记忆：
1. 重要时刻：生日、纪念日、重要事件等
2. 情感经历：强烈的情感体验
3. 成长轨迹：用户的成长和变化
4. 其他重要记忆

返回格式（JSON数组）：
[
  {
    "type": "IMPORTANT_MOMENT|EMOTIONAL_EXPERIENCE|GROWTH_TRAJECTORY|...",
    "importance": "CORE|IMPORTANT|NORMAL|TEMPORARY",
    "content": "记忆内容",
    "confidence": 0.0-1.0,
    "tags": ["标签1", "标签2"]
  }
]',
    '{"messages": {"type": "array", "required": true, "description": "对话消息列表"}}',
    '{"messages": ["USER: 上周我生日", "ASSISTANT: 生日快乐"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- memory-character-interaction（角色交互记忆提取）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '角色交互记忆提取',
    'memory-character-interaction',
    '从对话中提取角色与用户的交互记忆',
    '你是一个专业的角色记忆提取专家，擅长从对话中提取角色与用户的交互记忆。请以JSON格式返回结果。',
    '请从以下对话中提取角色与用户的交互记忆，返回JSON格式。

对话内容：
{{#each messages}}
{{this}}
{{/each}}

请提取以下类型的交互记忆：
1. 对话话题：用户喜欢谈论的话题
2. 用户偏好：用户的偏好和习惯
3. 情感互动：与用户的情感互动
4. 重要时刻：与用户的重要时刻

返回格式（JSON数组）：
[
  {
    "type": "CONVERSATION_TOPIC|USER_PREFERENCE|EMOTIONAL_EXPERIENCE|IMPORTANT_MOMENT",
    "importance": "CORE|IMPORTANT|NORMAL|TEMPORARY",
    "content": "记忆内容",
    "interactionType": "CONVERSATION|ACTION|EVENT|EMOTION",
    "userRelatedData": {"key": "value"},
    "confidence": 0.0-1.0,
    "tags": ["标签1", "标签2"]
  }
]',
    '{"messages": {"type": "array", "required": true, "description": "对话消息列表"}}',
    '{"messages": ["用户: 你好", "角色: 你好呀"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- memory-character-scene（角色场景记忆提取）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '角色场景记忆提取',
    'memory-character-scene',
    '从对话中提取角色在场景中的记忆',
    '你是一个专业的角色场景记忆提取专家，擅长从对话中提取角色在特定场景中的记忆。请以JSON格式返回结果。',
    '请从以下对话中提取角色在场景中的记忆，返回JSON格式。

场景ID: {{eraId}}
对话内容：
{{#each messages}}
{{this}}
{{/each}}

请提取以下类型的场景记忆：
1. 场景上下文：角色在场景中的表现和状态
2. 场景事件：场景中发生的重要事件
3. 场景状态：角色在场景中的状态变化

返回格式（JSON数组）：
[
  {
    "type": "SCENE_CONTEXT|SCENE_EVENT|SCENE_STATE",
    "importance": "CORE|IMPORTANT|NORMAL|TEMPORARY",
    "content": "记忆内容",
    "sceneContext": "场景上下文描述",
    "inheritable": true,
    "confidence": 0.0-1.0,
    "tags": ["标签1", "标签2"]
  }
]',
    '{"eraId": {"type": "string", "required": true}, "messages": {"type": "array", "required": true}}',
    '{"eraId": "1", "messages": ["用户: 我们到了", "角色: 嗯，这里很安静"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-selection-level1（技能选择 Level1）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能选择Level1',
    'skill-selection-level1',
    '根据用户消息从技能列表中初选相关技能',
    '你是一个专业的技能选择助手，请严格按照JSON格式返回结果。',
    '你是一个技能选择助手。根据用户消息和对话上下文，从以下技能中选择最相关的技能。

[用户消息]
{{userMessage}}

{{#if conversationHistory}}
[对话上下文]
{{conversationHistory}}
{{/if}}

[可用技能列表]
{{skillsList}}

请分析用户消息，选择最相关的技能（最多选择 {{maxCandidates}} 个），并给出选择理由。

返回格式（JSON）：
{
  "selectedSkills": [
    {
      "skillId": "skill_id",
      "relevanceScore": 0-100,
      "reason": "选择理由"
    }
  ]
}
',
    '{"userMessage": {"type": "string", "required": true}, "conversationHistory": {"type": "string", "required": false}, "skillsList": {"type": "string", "required": true}, "maxCandidates": {"type": "number", "required": true}}',
    '{"userMessage": "帮我查一下天气", "skillsList": "- 技能ID: wtt\\n  技能名称: 天气\\n", "maxCandidates": 10}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-selection-level2（技能选择 Level2）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能选择Level2',
    'skill-selection-level2',
    '对候选技能进行深度评估',
    '你是一个专业的技能选择助手，请严格按照JSON格式返回结果。',
    '对以下候选技能进行深度评估，确定是否应该激活。

[用户消息]
{{userMessage}}

{{#if conversationHistory}}
[对话上下文]
{{conversationHistory}}
{{/if}}

[候选技能详情]
{{skillDetail}}

请评估这个技能：
1. 是否与用户消息高度相关
2. 是否适合当前对话上下文
3. 激活后是否能提供价值

返回格式（JSON）：
{
  "evaluatedSkills": [
    {
      "skillId": "{{skillId}}",
      "shouldActivate": true/false,
      "confidence": 0-100,
      "reason": "评估理由"
    }
  ]
}
',
    '{"userMessage": {"type": "string", "required": true}, "conversationHistory": {"type": "string", "required": false}, "skillDetail": {"type": "string", "required": true}, "skillId": {"type": "string", "required": true}}',
    '{"userMessage": "查天气", "skillDetail": "技能ID: wtt\\n技能名称: 天气", "skillId": "wtt"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-selection-level3（技能选择 Level3）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能选择Level3',
    'skill-selection-level3',
    '对最终候选技能进行最终决策',
    '你是一个专业的技能选择助手，请严格按照JSON格式返回结果。',
    '对以下最终候选技能进行最终决策，确定激活优先级。

[用户消息]
{{userMessage}}

[候选技能完整信息]
{{skillDetail}}

[技能资源（Level 3）]
{{resourcesList}}

请进行最终决策：
1. 确定激活优先级（1为最高）
2. 评估技能组合的协同效果
3. 考虑技能执行的顺序

返回格式（JSON）：
{
  "finalSkills": [
    {
      "skillId": "{{skillId}}",
      "priority": 1-N,
      "activationOrder": 1-N,
      "reason": "最终决策理由"
    }
  ]
}
',
    '{"userMessage": {"type": "string", "required": true}, "skillDetail": {"type": "string", "required": true}, "resourcesList": {"type": "string", "required": true}, "skillId": {"type": "string", "required": true}}',
    '{"userMessage": "查天气", "skillDetail": "技能ID: wtt", "resourcesList": "无资源", "skillId": "wtt"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-selection-level2-batch（技能选择 Level2 批量）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能选择Level2批量',
    'skill-selection-level2-batch',
    '对多个候选技能进行深度评估',
    '你是一个专业的技能选择助手，请严格按照JSON格式返回结果。',
    '对以下候选技能进行深度评估，确定是否应该激活。

[用户消息]
{{userMessage}}

{{#if conversationHistory}}
[对话上下文]
{{conversationHistory}}
{{/if}}

[候选技能详情]
{{candidatesDetail}}

请评估每个技能：
1. 是否与用户消息高度相关
2. 是否适合当前对话上下文
3. 激活后是否能提供价值

返回格式（JSON）：
{
  "evaluatedSkills": [
    {
      "skillId": "skill_id",
      "shouldActivate": true/false,
      "confidence": 0-100,
      "reason": "评估理由"
    }
  ]
}
',
    '{"userMessage": {"type": "string", "required": true}, "conversationHistory": {"type": "string", "required": false}, "candidatesDetail": {"type": "string", "required": true}}',
    '{"userMessage": "查天气", "candidatesDetail": "技能1: wtt"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-selection-level3-batch（技能选择 Level3 批量）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能选择Level3批量',
    'skill-selection-level3-batch',
    '对多个最终候选技能进行最终决策',
    '你是一个专业的技能选择助手，请严格按照JSON格式返回结果。',
    '对以下最终候选技能进行最终决策，确定激活优先级。

[用户消息]
{{userMessage}}

[候选技能完整信息]
{{candidatesDetail}}

请进行最终决策：
1. 确定激活优先级（1为最高）
2. 评估技能组合的协同效果
3. 考虑技能执行的顺序

返回格式（JSON）：
{
  "finalSkills": [
    {
      "skillId": "skill_id",
      "priority": 1-N,
      "activationOrder": 1-N,
      "reason": "最终决策理由"
    }
  ]
}
',
    '{"userMessage": {"type": "string", "required": true}, "candidatesDetail": {"type": "string", "required": true}}',
    '{"userMessage": "查天气", "candidatesDetail": "技能1: wtt"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- skill-execution（技能执行：系统+用户提示词，变量由代码注入）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '技能执行',
    'skill-execution',
    '大模型执行技能时的系统与用户提示词',
    '你是一个专业的{{skillName}}助手。

技能描述: {{skillDescription}}

执行指南:
{{instructionPart}}

请以JSON格式返回执行结果，包含以下字段：
- success: 是否成功（boolean）
- result: 执行结果（object，包含具体的技能输出）
- message: 执行说明（string，可选）',
    '请执行{{skillName}}技能。

输入参数:
{{parametersBlock}}

{{#if resourcesBlock}}
可用资源:
{{resourcesBlock}}
{{/if}}

请根据系统指令中的指南，使用提供的参数和资源执行技能，并返回JSON格式的结果。',
    '{"skillName": {"type": "string", "required": true}, "skillDescription": {"type": "string", "required": true}, "instructionPart": {"type": "string", "required": true}, "parametersBlock": {"type": "string", "required": true}, "resourcesBlock": {"type": "string", "required": false}}',
    '{"skillName": "天气", "skillDescription": "查询天气", "instructionPart": "1. 解析地点\\n2. 调用天气API", "parametersBlock": "- city: 北京"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- admin-prompt-optimize（管理端提示词优化）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '提示词优化',
    'admin-prompt-optimize',
    '管理端根据模板和上下文生成优化后的提示词',
    '你是一个提示词优化专家。请根据用户提供的模板和上下文，生成优化后的提示词。',
    '请根据以下模板和上下文，生成优化后的提示词。

模板名称：{{templateName}}
模板描述：{{templateDescription}}

原始系统提示词：
{{originalSystemPrompt}}

原始用户提示词：
{{originalUserPrompt}}

{{#if context}}
上下文信息：
{{context}}
{{/if}}

请返回JSON格式，包含以下字段：
{
  "systemPrompt": "优化后的系统提示词",
  "userPrompt": "优化后的用户提示词"
}
',
    '{"templateName": {"type": "string", "required": true}, "templateDescription": {"type": "string", "required": false}, "originalSystemPrompt": {"type": "string", "required": true}, "originalUserPrompt": {"type": "string", "required": true}, "context": {"type": "string", "required": false}}',
    '{"templateName": "情绪分析", "originalSystemPrompt": "你是情绪分析专家", "originalUserPrompt": "分析文本情绪"}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- multiagent-agent-system（多智能体 Agent 系统提示）
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '多智能体Agent系统提示',
    'multiagent-agent-system',
    '多智能体场景下 Agent 的系统提示词',
    '你是 {{agentName}}。{{agentDescription}}

{{#if capabilities}}
你的能力包括：
{{#each capabilities}}
- {{this}}
{{/each}}
{{/if}}

请根据用户的需求，使用你的专业能力提供帮助。',
    '',
    '{"agentName": {"type": "string", "required": true}, "agentDescription": {"type": "string", "required": true}, "capabilities": {"type": "array", "required": false}}',
    '{"agentName": "助手", "agentDescription": "一个智能助手", "capabilities": ["回答问题", "执行任务"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);
