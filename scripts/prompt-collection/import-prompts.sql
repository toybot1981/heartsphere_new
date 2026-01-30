-- 提示词分类和模板导入脚本
-- 生成时间: 1768397311.4224405
-- 提示词总数: 6

-- ============================================
-- 第一部分：创建分类体系
-- ============================================

-- 创建提示词分类体系
-- 执行前请确保已连接到正确的数据库

-- 一级分类（项目模块）
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('main', '主项目', '主项目相关提示词', NULL, 1, true, NOW(), NOW()),
  ('mentis', 'Mentis项目', 'Mentis项目相关提示词', NULL, 2, true, NOW(), NOW()),
  ('admin', '管理后台', '管理后台相关提示词', NULL, 3, true, NOW(), NOW()),
  ('shared', '共享', '共享提示词', NULL, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 获取一级分类ID（假设已存在）
SET @main_id = (SELECT id FROM prompt_categories WHERE code = 'main');
SET @mentis_id = (SELECT id FROM prompt_categories WHERE code = 'mentis');
SET @admin_id = (SELECT id FROM prompt_categories WHERE code = 'admin');
SET @shared_id = (SELECT id FROM prompt_categories WHERE code = 'shared');

-- 二级分类（功能模块）- Main项目
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('main-emotion-analysis', '情感分析', '主项目的情感分析相关提示词', @main_id, 1, true, NOW(), NOW()),
  ('main-letter-generation', '信件生成', '主项目的信件生成相关提示词', @main_id, 2, true, NOW(), NOW()),
  ('main-ai-service', 'AI服务', '主项目的AI服务相关提示词', @main_id, 3, true, NOW(), NOW()),
  ('main-skill-execution', '技能执行', '主项目的技能执行相关提示词', @main_id, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- 二级分类（功能模块）- Mentis项目
INSERT INTO prompt_categories (code, name, description, parent_id, sort_order, is_active, created_at, updated_at)
VALUES
  ('mentis-intent-recognition', '意图识别', 'Mentis项目的意图识别相关提示词', @mentis_id, 1, true, NOW(), NOW()),
  ('mentis-task-decomposition', '任务分解', 'Mentis项目的任务分解相关提示词', @mentis_id, 2, true, NOW(), NOW()),
  ('mentis-response-generation', '响应生成', 'Mentis项目的响应生成相关提示词', @mentis_id, 3, true, NOW(), NOW()),
  ('mentis-multi-agent', '多智能体', 'Mentis项目的多智能体协作相关提示词', @mentis_id, 4, true, NOW(), NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();


-- ============================================
-- 第二部分：导入提示词模板
-- ============================================

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('mentis-task-decomposition-multi-agent', 'mentis-task-decomposition', 'Mentis项目的多智能体任务分解提示词', '你是一个任务分解专家团队，由以下角色组成：
        1. **规划者（Planner）**：负责分析任务，识别关键步骤和依赖关系
        2. **执行者（Executor）**：负责确定每个步骤的具体执行方式
        3. **验证者（Validator）**：负责验证步骤的可行性和完整性', '请协作完成以下任务分解：
        
        用户需求：{userRequest}
        
        请按照以下流程进行：
        1. 规划者分析任务，识别主要步骤
        2. 执行者为每个步骤确定执行方式（COMMAND/SCRIPT/COMPUTER_USE）
        3. 验证者检查步骤的完整性和依赖关系
        
        最终请按照以下JSON格式返回任务步骤列表：
        {
          "steps": [
            {
              "stepId": "step_1",
              "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
              "description": "清晰的任务描述",
              "command": "执行的命令或脚本内容",
              "order": 1,
              "dependencies": []
            }
          ],
          "analysis": {
            "planner": "规划者的分析结果",
            "executor": "执行者的执行建议",
            "validator": "验证者的验证结果"
          }
        }
        
        要求：
        1. 每个步骤应该清晰、可执行
        2. 任务类型要准确识别（COMMAND用于命令行操作，SCRIPT用于脚本执行，COMPUTER_USE用于GUI操作）
        3. 步骤之间的依赖关系要明确（dependencies数组）
        4. 步骤顺序要合理（order字段）
        5. 对于需要浏览器操作的任务，使用COMPUTER_USE类型
        6. 对于需要数据收集的任务，考虑使用浏览器自动化', '{"userRequest": {"type": "string", "description": "变量 userRequest", "required": true}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = 'Mentis项目的多智能体任务分解提示词',
  system_prompt = '你是一个任务分解专家团队，由以下角色组成：
        1. **规划者（Planner）**：负责分析任务，识别关键步骤和依赖关系
        2. **执行者（Executor）**：负责确定每个步骤的具体执行方式
        3. **验证者（Validator）**：负责验证步骤的可行性和完整性',
  user_prompt = '请协作完成以下任务分解：
        
        用户需求：{userRequest}
        
        请按照以下流程进行：
        1. 规划者分析任务，识别主要步骤
        2. 执行者为每个步骤确定执行方式（COMMAND/SCRIPT/COMPUTER_USE）
        3. 验证者检查步骤的完整性和依赖关系
        
        最终请按照以下JSON格式返回任务步骤列表：
        {
          "steps": [
            {
              "stepId": "step_1",
              "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
              "description": "清晰的任务描述",
              "command": "执行的命令或脚本内容",
              "order": 1,
              "dependencies": []
            }
          ],
          "analysis": {
            "planner": "规划者的分析结果",
            "executor": "执行者的执行建议",
            "validator": "验证者的验证结果"
          }
        }
        
        要求：
        1. 每个步骤应该清晰、可执行
        2. 任务类型要准确识别（COMMAND用于命令行操作，SCRIPT用于脚本执行，COMPUTER_USE用于GUI操作）
        3. 步骤之间的依赖关系要明确（dependencies数组）
        4. 步骤顺序要合理（order字段）
        5. 对于需要浏览器操作的任务，使用COMPUTER_USE类型
        6. 对于需要数据收集的任务，考虑使用浏览器自动化',
  variables = '{"userRequest": {"type": "string", "description": "变量 userRequest", "required": true}}',
  example_data = '{}',
  updated_at = NOW();

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('mentis-task-decomposition-single', 'mentis-task-decomposition', 'Mentis项目的单任务分解提示词', '你是一个任务分解专家。请将用户的需求分解为可执行的任务步骤。', '用户需求：{userRequest}
        
        请按照以下JSON格式返回任务步骤列表：
        {
          "steps": [
            {
              "stepId": "step_1",
              "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
              "description": "任务描述",
              "command": "执行的命令或脚本内容",
              "order": 1,
              "dependencies": []
            }
          ]
        }
        
        要求：
        1. 每个步骤应该清晰、可执行
        2. 任务类型要准确识别
        3. 步骤之间的依赖关系要明确
        4. 步骤顺序要合理', '{"userRequest": {"type": "string", "description": "变量 userRequest", "required": true}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = 'Mentis项目的单任务分解提示词',
  system_prompt = '你是一个任务分解专家。请将用户的需求分解为可执行的任务步骤。',
  user_prompt = '用户需求：{userRequest}
        
        请按照以下JSON格式返回任务步骤列表：
        {
          "steps": [
            {
              "stepId": "step_1",
              "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
              "description": "任务描述",
              "command": "执行的命令或脚本内容",
              "order": 1,
              "dependencies": []
            }
          ]
        }
        
        要求：
        1. 每个步骤应该清晰、可执行
        2. 任务类型要准确识别
        3. 步骤之间的依赖关系要明确
        4. 步骤顺序要合理',
  variables = '{"userRequest": {"type": "string", "description": "变量 userRequest", "required": true}}',
  example_data = '{}',
  updated_at = NOW();

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('mentis-response-generation-friendly', 'mentis-response-generation', 'Mentis项目的友好响应生成提示词', '你是一个智能助手 Mentis。请根据任务执行结果，生成友好的自然语言响应返回给用户。
        
        执行结果：
        {executionResult}', '请生成一个友好的响应，说明任务执行情况。
        如果任务成功，简要说明结果。
        如果任务失败，友好地解释原因。', '{"executionResult": {"type": "string", "description": "变量 executionResult", "required": true}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = 'Mentis项目的友好响应生成提示词',
  system_prompt = '你是一个智能助手 Mentis。请根据任务执行结果，生成友好的自然语言响应返回给用户。
        
        执行结果：
        {executionResult}',
  user_prompt = '请生成一个友好的响应，说明任务执行情况。
        如果任务成功，简要说明结果。
        如果任务失败，友好地解释原因。',
  variables = '{"executionResult": {"type": "string", "description": "变量 executionResult", "required": true}}',
  example_data = '{}',
  updated_at = NOW();

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('mentis-intent-recognition-basic', 'mentis-intent-recognition', 'Mentis项目的基础意图识别提示词', '你是一个意图识别专家。请分析用户的消息，识别用户的意图和任务类型。', '用户消息：{userMessage}
        
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
        - COMMAND: 执行系统命令（如：运行 ls、执行命令、执行系统操作、执行 shell 命令等）
        - SCRIPT: 执行脚本（如：运行 Python 脚本、执行 JavaScript 代码、运行脚本、执行代码等）
        - COMPUTER_USE: GUI自动化操作（如：打开浏览器、搜索信息、查询天气、查询资料、点击按钮、操作界面、自动化操作、使用应用程序等）
        - CHAT: 普通对话，不需要执行任务（如：纯聊天、问候、简单询问、不需要实际操作的问题等）
        
        识别规则：
        1. 如果用户消息包含明确的执行意图（如"执行"、"运行"、"执行命令"、"运行脚本"、"打开"、"点击"等），应该识别为相应的任务类型
        2. 如果用户消息需要实际操作才能完成（如"查天气"、"查资料"、"搜索"、"打开网站"、"获取信息"等），应该识别为 COMPUTER_USE
        3. 查询类任务（查天气、查资料、搜索、获取信息等）需要打开浏览器、搜索、操作界面等，应该识别为 COMPUTER_USE，而不是 CHAT
        4. 只有在用户消息只是询问、咨询、聊天，不需要实际操作时，才识别为 CHAT
        5. 优先识别为任务类型（COMMAND/SCRIPT/COMPUTER_USE），只有在确实没有执行意图时才识别为 CHAT
        
        重要：查询类任务（如"查天气"、"查资料"、"搜索"等）应该识别为 COMPUTER_USE，因为需要打开浏览器、搜索、获取信息等实际操作。
        
        请准确识别用户意图，优先识别为任务类型。', '{"userMessage": {"type": "string", "description": "变量 userMessage", "required": true}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = 'Mentis项目的基础意图识别提示词',
  system_prompt = '你是一个意图识别专家。请分析用户的消息，识别用户的意图和任务类型。',
  user_prompt = '用户消息：{userMessage}
        
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
        - COMMAND: 执行系统命令（如：运行 ls、执行命令、执行系统操作、执行 shell 命令等）
        - SCRIPT: 执行脚本（如：运行 Python 脚本、执行 JavaScript 代码、运行脚本、执行代码等）
        - COMPUTER_USE: GUI自动化操作（如：打开浏览器、搜索信息、查询天气、查询资料、点击按钮、操作界面、自动化操作、使用应用程序等）
        - CHAT: 普通对话，不需要执行任务（如：纯聊天、问候、简单询问、不需要实际操作的问题等）
        
        识别规则：
        1. 如果用户消息包含明确的执行意图（如"执行"、"运行"、"执行命令"、"运行脚本"、"打开"、"点击"等），应该识别为相应的任务类型
        2. 如果用户消息需要实际操作才能完成（如"查天气"、"查资料"、"搜索"、"打开网站"、"获取信息"等），应该识别为 COMPUTER_USE
        3. 查询类任务（查天气、查资料、搜索、获取信息等）需要打开浏览器、搜索、操作界面等，应该识别为 COMPUTER_USE，而不是 CHAT
        4. 只有在用户消息只是询问、咨询、聊天，不需要实际操作时，才识别为 CHAT
        5. 优先识别为任务类型（COMMAND/SCRIPT/COMPUTER_USE），只有在确实没有执行意图时才识别为 CHAT
        
        重要：查询类任务（如"查天气"、"查资料"、"搜索"等）应该识别为 COMPUTER_USE，因为需要打开浏览器、搜索、获取信息等实际操作。
        
        请准确识别用户意图，优先识别为任务类型。',
  variables = '{"userMessage": {"type": "string", "description": "变量 userMessage", "required": true}}',
  example_data = '{}',
  updated_at = NOW();

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('main-emotion-analysis-default', 'main-emotion-analysis', '主项目的默认情感分析提示词', NULL, '请分析以下文本的情绪状态，并返回JSON格式的结果。

文本内容：
{text}

{context}

请分析并返回JSON格式结果，包含以下字段：
{
  "primaryEmotion": "主要情绪类型（happy/excited/content/peaceful/hopeful/grateful/calm/thoughtful/focused/relaxed/sad/anxious/angry/lonely/tired/confused）",
  "secondaryEmotions": ["次要情绪类型数组（可选）"],
  "intensity": "情绪强度（mild/moderate/strong）",
  "confidence": 分析置信度（0-1之间的小数）,
  "emotionTags": ["情绪标签数组，如[''工作压力'', ''情感困扰'']"],
  "keyPhrases": ["关键短语数组，最能体现情绪的短语"],
  "reasoning": "分析理由（简要说明为什么得出这个结论）"
}

注意：
- 要深入理解文本的隐含情绪，不仅仅是表面文字
- 考虑上下文的情绪背景
- 识别情绪的混合状态
- 评估情绪的强度和真实性
- 只返回JSON，不要包含其他文字', '{"text": {"type": "string", "description": "要分析的文本内容", "required": true}, "context": {"type": "string", "description": "上下文信息（对话历史、时间等）", "required": false}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = '主项目的默认情感分析提示词',
  system_prompt = NULL,
  user_prompt = '请分析以下文本的情绪状态，并返回JSON格式的结果。

文本内容：
{text}

{context}

请分析并返回JSON格式结果，包含以下字段：
{
  "primaryEmotion": "主要情绪类型（happy/excited/content/peaceful/hopeful/grateful/calm/thoughtful/focused/relaxed/sad/anxious/angry/lonely/tired/confused）",
  "secondaryEmotions": ["次要情绪类型数组（可选）"],
  "intensity": "情绪强度（mild/moderate/strong）",
  "confidence": 分析置信度（0-1之间的小数）,
  "emotionTags": ["情绪标签数组，如[''工作压力'', ''情感困扰'']"],
  "keyPhrases": ["关键短语数组，最能体现情绪的短语"],
  "reasoning": "分析理由（简要说明为什么得出这个结论）"
}

注意：
- 要深入理解文本的隐含情绪，不仅仅是表面文字
- 考虑上下文的情绪背景
- 识别情绪的混合状态
- 评估情绪的强度和真实性
- 只返回JSON，不要包含其他文字',
  variables = '{"text": {"type": "string", "description": "要分析的文本内容", "required": true}, "context": {"type": "string", "description": "上下文信息（对话历史、时间等）", "required": false}}',
  example_data = '{}',
  updated_at = NOW();

INSERT INTO prompt_templates (name, category_code, description, system_prompt, user_prompt, variables, example_data, version, is_active, created_by, created_at, updated_at)
VALUES ('main-letter-generation-character', 'main-letter-generation', '主项目的角色信件生成提示词', NULL, '角色信息：
姓名：{characterName}
角色：{characterRole}
简介：{characterBio}
说话风格：{speechStyle}

来信类型：{letterType}

{emotionInfo}

{journalInfo}

请根据以上信息，生成一封温暖的信件。要求：
1. 使用JSON格式返回：{"title": "信件标题", "content": "信件正文"}
2. 信件应该充满情感，像真正的朋友一样表达关心
3. 根据角色性格和说话风格调整语言
4. 结合用户的情绪状态和日记内容，让信件更个性化
5. 信件长度适中，既不过于简短也不过于冗长', '{"characterName": {"type": "string", "description": "角色姓名", "required": true}, "characterRole": {"type": "string", "description": "角色身份", "required": true}, "characterBio": {"type": "string", "description": "角色简介", "required": true}, "speechStyle": {"type": "string", "description": "说话风格", "required": false}, "letterType": {"type": "string", "description": "来信类型", "required": true}, "emotionInfo": {"type": "string", "description": "用户情绪信息", "required": false}, "journalInfo": {"type": "string", "description": "用户日记信息", "required": false}}', '{}', 1, true, 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  description = '主项目的角色信件生成提示词',
  system_prompt = NULL,
  user_prompt = '角色信息：
姓名：{characterName}
角色：{characterRole}
简介：{characterBio}
说话风格：{speechStyle}

来信类型：{letterType}

{emotionInfo}

{journalInfo}

请根据以上信息，生成一封温暖的信件。要求：
1. 使用JSON格式返回：{"title": "信件标题", "content": "信件正文"}
2. 信件应该充满情感，像真正的朋友一样表达关心
3. 根据角色性格和说话风格调整语言
4. 结合用户的情绪状态和日记内容，让信件更个性化
5. 信件长度适中，既不过于简短也不过于冗长',
  variables = '{"characterName": {"type": "string", "description": "角色姓名", "required": true}, "characterRole": {"type": "string", "description": "角色身份", "required": true}, "characterBio": {"type": "string", "description": "角色简介", "required": true}, "speechStyle": {"type": "string", "description": "说话风格", "required": false}, "letterType": {"type": "string", "description": "来信类型", "required": true}, "emotionInfo": {"type": "string", "description": "用户情绪信息", "required": false}, "journalInfo": {"type": "string", "description": "用户日记信息", "required": false}}',
  example_data = '{}',
  updated_at = NOW();
