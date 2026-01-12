-- 添加豆包语音模型配置
-- 语音合成（TTS）模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'CosyVoice', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"format": "mp3", "sample_rate": 24000}', FALSE, 1, 0.0005, TRUE, 'CosyVoice 语音合成，70+种高品质音色，支持中英日韩及多种方言', NOW(), NOW()),
('doubao', 'CosyVoice-voice-clone', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"format": "mp3", "sample_rate": 24000}', FALSE, 2, 0.0006, TRUE, 'CosyVoice 声音复刻，极速复刻，口音还原相似度高，韵律流畅', NOW(), NOW()),
('doubao', 'Qwen3-TTS', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"format": "mp3", "sample_rate": 24000}', FALSE, 3, 0.0004, TRUE, 'Qwen3-TTS语音合成，韵律拟人，低延迟，支持十种语言和国内多种方言输出', NOW(), NOW());

-- 语音识别（ASR）模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'Fun-ASR', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"language": "zh-CN"}', FALSE, 1, 0.0003, TRUE, 'Fun-ASR 多语言语音识别，支持超过31种语言，支持语种自由切换', NOW(), NOW()),
('doubao', 'Paraformer-8k-v2', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"language": "zh-CN"}', FALSE, 2, 0.00035, TRUE, 'Paraformer 实时语音识别-8k-v2，支持多个语种自由切换的实时场景语音识别', NOW(), NOW());

