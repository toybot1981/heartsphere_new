-- 插入默认提示词模板

-- 意图识别模板
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '意图识别模板',
    'intent',
    '用于识别用户消息的意图和任务类型',
    '你是一个专业的意图识别专家，擅长准确识别用户的任务意图。',
    '你是一个意图识别专家。请分析用户的消息，识别用户的意图和任务类型。

用户消息：{{userMessage}}

请按照以下JSON格式返回识别结果：
{
  "taskType": "COMMAND|SCRIPT|COMPUTER_USE|CHAT",
  "intent": "意图描述",
  "parameters": {
    "key": "value"
  },
  "confidence": 0.9
}

任务类型说明：
- COMMAND: 执行系统命令
- SCRIPT: 执行脚本（Python、JavaScript等）
- COMPUTER_USE: GUI自动化操作
- CHAT: 普通对话，不需要执行任务

请准确识别用户意图。',
    '{"userMessage": {"type": "string", "required": true, "description": "用户消息"}}',
    '{"userMessage": "帮我执行一个命令"}',
    1,
    TRUE,
    NOW(),
    NOW()
);


-- 情绪分析模板
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '情绪分析模板',
    'emotion',
    '用于分析文本的情绪状态',
    '你是一个专业的情绪分析专家，擅长深入理解文本中的情绪和情感。',
    '请分析以下文本的情绪状态，并返回JSON格式的结果。

文本内容：{{text}}

{{#if hasContext}}
上下文信息：
{{#if conversationHistory}}
- 对话历史: {{conversationHistory}}
{{/if}}
{{#if timeOfDay}}
- 时间: {{timeOfDay}}点
{{/if}}
{{#if dayOfWeek}}
- 星期: 周{{dayOfWeek}}
{{/if}}
{{/if}}

请分析并返回JSON格式结果，包含以下字段：
{
  "primaryEmotion": "主要情绪类型（happy/excited/content/peaceful/hopeful/grateful/calm/thoughtful/focused/relaxed/sad/anxious/angry/lonely/tired/confused）",
  "secondaryEmotions": ["次要情绪类型数组（可选）"],
  "intensity": "情绪强度（mild/moderate/strong）",
  "confidence": 分析置信度（0-1之间的小数）,
  "emotionTags": ["情绪标签数组，如['工作压力', '情感困扰']"],
  "keyPhrases": ["关键短语数组，最能体现情绪的短语"],
  "reasoning": "分析理由（简要说明为什么得出这个结论）"
}

注意：
- 要深入理解文本的隐含情绪，不仅仅是表面文字
- 考虑上下文的情绪背景
- 识别情绪的混合状态
- 评估情绪的强度和真实性
- 只返回JSON，不要包含其他文字',
    '{"text": {"type": "string", "required": true, "description": "待分析文本"}, "hasContext": {"type": "boolean", "required": false, "description": "是否有上下文"}, "conversationHistory": {"type": "string", "required": false, "description": "对话历史"}, "timeOfDay": {"type": "number", "required": false, "description": "时间（0-23）"}, "dayOfWeek": {"type": "number", "required": false, "description": "星期（0-6）"}}',
    '{"text": "今天心情不错", "hasContext": true, "conversationHistory": "之前的对话", "timeOfDay": 14, "dayOfWeek": 1}',
    1,
    TRUE,
    NOW(),
    NOW()
);

-- 记忆提取模板
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '记忆提取模板',
    'memory',
    '用于从对话中提取用户的事实、偏好和记忆',
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

-- 角色生成模板
INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_at, updated_at)
VALUES (
    '角色生成模板',
    'character',
    '用于生成角色档案',
    'You are a creative writer. Create a complete character profile for a world/era named "{{eraName}}".
Output JSON only with these properties: 
- name, age (number), role, bio
- systemInstruction (detailed roleplay instructions)
- firstMessage (greeting)
- themeColor (hex), colorAccent (hex)
- mbti (e.g. INFJ)
- tags (array of strings, personality keywords)
- speechStyle (description of how they talk)
- catchphrases (array of strings, 2-3 common phrases)
- secrets (hidden depth/secret)
- motivations (current goal)

The content MUST be in Chinese.',
    'Character concept: "{{characterConcept}}".

{{#if worldStyle}}
World style: {{worldStyle}}
{{/if}}

{{#if existingCharacters}}
Existing characters:
{{#each existingCharacters}}
  - {{name}} ({{role}})
{{/each}}
{{/if}}

{{#if requirements}}
Special requirements:
{{#each requirements}}
  - {{this}}
{{/each}}
{{/if}}',
    '{"eraName": {"type": "string", "required": true, "description": "时代名称"}, "characterConcept": {"type": "string", "required": true, "description": "角色概念"}, "worldStyle": {"type": "string", "required": false, "description": "世界风格"}, "existingCharacters": {"type": "array", "required": false, "description": "已有角色列表"}, "requirements": {"type": "array", "required": false, "description": "特殊要求"}}',
    '{"eraName": "现代都市", "characterConcept": "一个温柔的程序员", "worldStyle": "现代", "requirements": ["温暖", "技术背景"]}',
    1,
    TRUE,
    NOW(),
    NOW()
);
