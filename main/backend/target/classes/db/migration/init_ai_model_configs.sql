-- 初始化主流AI模型配置
-- 包括：通义千问(qwen)、豆包(doubao)、Google Gemini、OpenAI GPT

-- ========== 通义千问 (DashScope) ==========
-- 文本生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('dashscope', 'qwen-max', 'text', '', 'https://dashscope.aliyuncs.com/api/v1', '{"temperature": 0.7, "max_tokens": 2000}', TRUE, 1, 0.000012, TRUE, '通义千问Max模型，最强性能', NOW(), NOW()),
('dashscope', 'qwen-plus', 'text', '', 'https://dashscope.aliyuncs.com/api/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 2, 0.000008, TRUE, '通义千问Plus模型，平衡性能', NOW(), NOW()),
('dashscope', 'qwen-turbo', 'text', '', 'https://dashscope.aliyuncs.com/api/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 3, 0.000003, TRUE, '通义千问Turbo模型，快速响应', NOW(), NOW()),
('dashscope', 'qwen3-max', 'text', '', 'https://dashscope.aliyuncs.com/api/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 1, 0.000012, TRUE, '通义千问3.0 Max模型', NOW(), NOW());

-- 图片生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('dashscope', 'wanx-v1', 'image', '', 'https://dashscope.aliyuncs.com/api/v1', '{"size": "1024x1024", "n": 1}', TRUE, 1, 0.0008, TRUE, '通义万相V1图片生成模型', NOW(), NOW()),
('dashscope', 'wanx-v2', 'image', '', 'https://dashscope.aliyuncs.com/api/v1', '{"size": "1024x1024", "n": 1}', FALSE, 2, 0.0008, TRUE, '通义万相V2图片生成模型', NOW(), NOW());

-- ========== 豆包 (Volcengine Doubao) ==========
-- 文本生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'doubao-pro-4k', 'text', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 1, 0.00001, TRUE, '豆包Pro 4K模型', NOW(), NOW()),
('doubao', 'doubao-pro-32k', 'text', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 2, 0.000015, TRUE, '豆包Pro 32K模型', NOW(), NOW()),
('doubao', 'doubao-lite-4k', 'text', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 3, 0.000005, TRUE, '豆包Lite 4K模型，经济型', NOW(), NOW());

-- 图片生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'doubao-image-v1', 'image', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"size": "1024x1024", "n": 1}', FALSE, 1, 0.0006, TRUE, '豆包图片生成模型', NOW(), NOW());

-- ========== Google Gemini ==========
-- 文本生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('gemini', 'gemini-2.0-flash-exp', 'text', '', 'https://generativelanguage.googleapis.com/v1beta', '{"temperature": 0.7, "maxOutputTokens": 2000}', FALSE, 1, 0.000007, TRUE, 'Gemini 2.0 Flash实验版，快速响应', NOW(), NOW()),
('gemini', 'gemini-1.5-pro', 'text', '', 'https://generativelanguage.googleapis.com/v1beta', '{"temperature": 0.7, "maxOutputTokens": 2000}', FALSE, 2, 0.0000125, TRUE, 'Gemini 1.5 Pro，高性能', NOW(), NOW()),
('gemini', 'gemini-1.5-flash', 'text', '', 'https://generativelanguage.googleapis.com/v1beta', '{"temperature": 0.7, "maxOutputTokens": 2000}', FALSE, 3, 0.0000035, TRUE, 'Gemini 1.5 Flash，快速响应', NOW(), NOW());

-- 图片生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('gemini', 'imagen-3.0-generate-001', 'image', '', 'https://generativelanguage.googleapis.com/v1beta', '{"size": "1024x1024", "numberOfImages": 1}', FALSE, 1, 0.0008, TRUE, 'Gemini Imagen 3.0图片生成模型', NOW(), NOW());

-- ========== OpenAI GPT ==========
-- 文本生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('openai', 'gpt-4', 'text', '', 'https://api.openai.com/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 1, 0.00003, TRUE, 'OpenAI GPT-4，最强性能', NOW(), NOW()),
('openai', 'gpt-4-turbo', 'text', '', 'https://api.openai.com/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 2, 0.00001, TRUE, 'OpenAI GPT-4 Turbo，快速响应', NOW(), NOW()),
('openai', 'gpt-3.5-turbo', 'text', '', 'https://api.openai.com/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 3, 0.0000015, TRUE, 'OpenAI GPT-3.5 Turbo，经济型', NOW(), NOW()),
('openai', 'gpt-4o', 'text', '', 'https://api.openai.com/v1', '{"temperature": 0.7, "max_tokens": 2000}', FALSE, 1, 0.000025, TRUE, 'OpenAI GPT-4o，最新模型', NOW(), NOW());

-- 图片生成模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('openai', 'dall-e-3', 'image', '', 'https://api.openai.com/v1', '{"size": "1024x1024", "n": 1, "quality": "standard"}', FALSE, 1, 0.0004, TRUE, 'OpenAI DALL-E 3图片生成模型', NOW(), NOW()),
('openai', 'dall-e-2', 'image', '', 'https://api.openai.com/v1', '{"size": "1024x1024", "n": 1}', FALSE, 2, 0.0002, TRUE, 'OpenAI DALL-E 2图片生成模型', NOW(), NOW());

-- ========== 初始化路由策略 ==========
-- 文本生成路由策略（单一模式，默认使用dashscope的qwen-max）
INSERT INTO ai_routing_strategy (capability, strategy_type, config_json, is_active, description, created_at, updated_at)
VALUES 
('text', 'single', '{"defaultProvider": "qwen", "defaultModel": "qwen-max"}', TRUE, '文本生成使用单一模式，默认qwen-max', NOW(), NOW());

-- 图片生成路由策略（单一模式，默认使用dashscope的wanx-v1）
INSERT INTO ai_routing_strategy (capability, strategy_type, config_json, is_active, description, created_at, updated_at)
VALUES 
('image', 'single', '{"defaultProvider": "dashscope", "defaultModel": "wanx-v1"}', TRUE, '图片生成使用单一模式，默认wanx-v1', NOW(), NOW());

-- 音频处理路由策略（单一模式）
INSERT INTO ai_routing_strategy (capability, strategy_type, config_json, is_active, description, created_at, updated_at)
VALUES 
('audio', 'single', '{"defaultProvider": "dashscope", "defaultModel": "qwen-max"}', TRUE, '音频处理使用单一模式', NOW(), NOW());

-- 视频生成路由策略（单一模式）
INSERT INTO ai_routing_strategy (capability, strategy_type, config_json, is_active, description, created_at, updated_at)
VALUES 
('video', 'single', '{"defaultProvider": "dashscope", "defaultModel": "qwen-max"}', TRUE, '视频生成使用单一模式', NOW(), NOW());


