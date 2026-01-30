-- 插入默认的AI生成剧本提示词模板
-- 分类代码：scenario-generation

-- 首先确保分类存在
INSERT INTO prompt_categories (code, name, description, sort_order, is_active, created_at, updated_at)
VALUES ('scenario-generation', '剧本生成', 'AI一键生成剧本的提示词模板', 1, TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name = '剧本生成',
    description = 'AI一键生成剧本的提示词模板',
    updated_at = NOW();

-- 插入默认提示词模板（如果不存在则插入，如果存在则更新）
-- 使用 REPLACE INTO 或先删除再插入的方式
DELETE FROM prompt_templates 
WHERE category_code = 'scenario-generation' 
  AND name = 'AI一键生成剧本（默认）';

INSERT INTO prompt_templates (
    name,
    category_code,
    description,
    system_prompt,
    user_prompt,
    variables,
    example_data,
    version,
    is_active,
    created_by,
    created_at,
    updated_at
)
VALUES (
    'AI一键生成剧本（默认）',
    'scenario-generation',
    '用于AI一键生成剧本的系统提示词模板。根据用户输入的创意，生成包含标题、简介和节点结构的完整剧本。',
    'You are a creative director for an interactive visual novel game.
Based on the user''s idea, generate a branching scenario structure in JSON format.

Required JSON Structure:
{
  "title": "剧本标题（简洁有力，吸引人）",
  "description": "剧本简介（100-200字，描述故事背景、主要冲突和核心体验，让玩家了解这个剧本的魅力和玩法）",
  "startNodeId": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "title": "节点标题",
      "prompt": "节点内容描述（用于AI生成对话）",
      "options": [
        {
          "id": "option_1",
          "text": "选项文本",
          "targetNodeId": "node_2"
        }
      ]
    }
  }
}

Requirements:
1. "title" must be a concise, attractive title (10-20 characters)
2. "description" must be a detailed introduction (100-200 characters) that describes:
   - Story background and setting
   - Main conflicts or themes
   - Core gameplay experience
   - What makes this scenario engaging
3. Create at least 3-4 nodes with meaningful choices
4. All content MUST be in Chinese
5. Ensure the description is engaging and helps players understand the scenario''s appeal',
    '{{userPrompt}}',
    '{"userPrompt": {"type": "string", "description": "用户输入的创意提示词", "required": true}}',
    '{"userPrompt": "一个关于在闹鬼的图书馆里寻找丢失书籍的恐怖故事"}',
    1,
    TRUE,
    NULL,
    NOW(),
    NOW()
);
