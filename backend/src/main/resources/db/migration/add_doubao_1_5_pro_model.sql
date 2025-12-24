-- 添加豆包 1.5 Pro 32K 模型配置
-- 基于官方API示例：doubao-1-5-pro-32k-250115

-- 添加新的文本生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'doubao-1-5-pro-32k-250115', 'text', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"temperature": 0.7, "max_tokens": 2000}', TRUE, 1, 0.000015, TRUE, '豆包1.5 Pro 32K模型（最新推荐）', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    description = '豆包1.5 Pro 32K模型（最新推荐）',
    updated_at = NOW();

-- 将旧模型设置为非默认
UPDATE ai_model_config 
SET is_default = FALSE 
WHERE provider = 'doubao' 
  AND capability = 'text' 
  AND model_name != 'doubao-1-5-pro-32k-250115';

