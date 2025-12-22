-- 修复AI模型配置的描述信息乱码问题
-- 使用UTF8编码重新设置描述信息

-- 清空现有描述，准备重新插入
UPDATE ai_model_config SET description = NULL;

-- ========== 通义千问 (Qwen) ==========
UPDATE ai_model_config SET description = '通义千问Max模型，最强性能' WHERE provider = 'qwen' AND model_name = 'qwen-max' AND capability = 'text';
UPDATE ai_model_config SET description = '通义千问Plus模型，平衡性能' WHERE provider = 'qwen' AND model_name = 'qwen-plus' AND capability = 'text';
UPDATE ai_model_config SET description = '通义千问Turbo模型，快速响应' WHERE provider = 'qwen' AND model_name = 'qwen-turbo' AND capability = 'text';
UPDATE ai_model_config SET description = '通义千问3.0 Max模型' WHERE provider = 'qwen' AND model_name = 'qwen3-max' AND capability = 'text';
UPDATE ai_model_config SET description = '通义万相V1图片生成模型' WHERE provider = 'qwen' AND model_name = 'wanx-v1' AND capability = 'image';
UPDATE ai_model_config SET description = '通义万相V2图片生成模型' WHERE provider = 'qwen' AND model_name = 'wanx-v2' AND capability = 'image';

-- ========== 豆包 (Doubao) ==========
UPDATE ai_model_config SET description = '豆包Pro 4K模型' WHERE provider = 'doubao' AND model_name = 'doubao-pro-4k' AND capability = 'text';
UPDATE ai_model_config SET description = '豆包Pro 32K模型' WHERE provider = 'doubao' AND model_name = 'doubao-pro-32k' AND capability = 'text';
UPDATE ai_model_config SET description = '豆包Lite 4K模型，经济型' WHERE provider = 'doubao' AND model_name = 'doubao-lite-4k' AND capability = 'text';
UPDATE ai_model_config SET description = '豆包图片生成模型' WHERE provider = 'doubao' AND model_name = 'doubao-image-v1' AND capability = 'image';

-- ========== Google Gemini ==========
UPDATE ai_model_config SET description = 'Gemini 2.0 Flash实验版，快速响应' WHERE provider = 'gemini' AND model_name = 'gemini-2.0-flash-exp' AND capability = 'text';
UPDATE ai_model_config SET description = 'Gemini 1.5 Pro，高性能' WHERE provider = 'gemini' AND model_name = 'gemini-1.5-pro' AND capability = 'text';
UPDATE ai_model_config SET description = 'Gemini 1.5 Flash，快速响应' WHERE provider = 'gemini' AND model_name = 'gemini-1.5-flash' AND capability = 'text';
UPDATE ai_model_config SET description = 'Gemini Imagen 3.0图片生成模型' WHERE provider = 'gemini' AND model_name = 'imagen-3.0-generate-001' AND capability = 'image';

-- ========== OpenAI GPT ==========
UPDATE ai_model_config SET description = 'OpenAI GPT-4，最强性能' WHERE provider = 'openai' AND model_name = 'gpt-4' AND capability = 'text';
UPDATE ai_model_config SET description = 'OpenAI GPT-4 Turbo，快速响应' WHERE provider = 'openai' AND model_name = 'gpt-4-turbo' AND capability = 'text';
UPDATE ai_model_config SET description = 'OpenAI GPT-3.5 Turbo，经济型' WHERE provider = 'openai' AND model_name = 'gpt-3.5-turbo' AND capability = 'text';
UPDATE ai_model_config SET description = 'OpenAI GPT-4o，最新模型' WHERE provider = 'openai' AND model_name = 'gpt-4o' AND capability = 'text';
UPDATE ai_model_config SET description = 'OpenAI DALL-E 3图片生成模型' WHERE provider = 'openai' AND model_name = 'dall-e-3' AND capability = 'image';
UPDATE ai_model_config SET description = 'OpenAI DALL-E 2图片生成模型' WHERE provider = 'openai' AND model_name = 'dall-e-2' AND capability = 'image';

-- ========== 修复路由策略描述 ==========
UPDATE ai_routing_strategy SET description = '文本生成使用单一模式，默认qwen-max' WHERE capability = 'text';
UPDATE ai_routing_strategy SET description = '图片生成使用单一模式，默认wanx-v1' WHERE capability = 'image';
UPDATE ai_routing_strategy SET description = '音频处理使用单一模式' WHERE capability = 'audio';
UPDATE ai_routing_strategy SET description = '视频生成使用单一模式' WHERE capability = 'video';


