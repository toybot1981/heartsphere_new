-- ============================================
-- 添加豆包和DashScope的语音模型配置
-- 包括TTS（文本转语音）和STT（语音转文本）模型
-- ============================================

-- ========== 1. 豆包（Doubao）TTS模型 ==========
-- CosyVoice - 豆包主流的TTS模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'CosyVoice', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"voice": "zhitian_emo", "format": "mp3", "sample_rate": 24000, "speed": 1.0}', FALSE, 1, 0.0, TRUE, '豆包CosyVoice语音合成模型，支持多种音色', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://ark.cn-beijing.volces.com/api/v3',
    model_params = '{"voice": "zhitian_emo", "format": "mp3", "sample_rate": 24000, "speed": 1.0}',
    description = '豆包CosyVoice语音合成模型，支持多种音色',
    updated_at = NOW();

-- ========== 2. 豆包（Doubao）STT模型 ==========
-- Fun-ASR - 豆包主流的ASR模型，支持多语言
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'Fun-ASR', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"language": "zh-CN", "response_format": "json"}', FALSE, 1, 0.0, TRUE, '豆包Fun-ASR多语言语音识别模型', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://ark.cn-beijing.volces.com/api/v3',
    model_params = '{"language": "zh-CN", "response_format": "json"}',
    description = '豆包Fun-ASR多语言语音识别模型',
    updated_at = NOW();

-- Paraformer-8k-v2 - 豆包实时语音识别模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'Paraformer-8k-v2', 'audio', '', 'https://ark.cn-beijing.volces.com/api/v3', '{"language": "zh-CN", "response_format": "json"}', FALSE, 2, 0.0, TRUE, '豆包Paraformer实时语音识别模型-8k-v2', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://ark.cn-beijing.volces.com/api/v3',
    model_params = '{"language": "zh-CN", "response_format": "json"}',
    description = '豆包Paraformer实时语音识别模型-8k-v2',
    updated_at = NOW();

-- ========== 3. DashScope（通义千问）TTS模型 ==========
-- sambert-zhichu-v1 - DashScope主流的TTS模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('dashscope', 'sambert-zhichu-v1', 'audio', '', 'https://dashscope.aliyuncs.com/api/v1', '{"voice": "zhitian_emo", "format": "wav", "sample_rate": 16000}', FALSE, 1, 0.0, TRUE, 'DashScope sambert-zhichu-v1语音合成模型，支持多种音色', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://dashscope.aliyuncs.com/api/v1',
    model_params = '{"voice": "zhitian_emo", "format": "wav", "sample_rate": 16000}',
    description = 'DashScope sambert-zhichu-v1语音合成模型，支持多种音色',
    updated_at = NOW();

-- ========== 4. DashScope（通义千问）STT模型 ==========
-- paraformer-v2 - DashScope主流的ASR模型
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('dashscope', 'paraformer-v2', 'audio', '', 'https://dashscope.aliyuncs.com/api/v1', '{"language": "zh", "response_format": "json"}', FALSE, 1, 0.0, TRUE, 'DashScope paraformer-v2语音识别模型，支持多语言', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://dashscope.aliyuncs.com/api/v1',
    model_params = '{"language": "zh", "response_format": "json"}',
    description = 'DashScope paraformer-v2语音识别模型，支持多语言',
    updated_at = NOW();

-- ========== 5. 插入豆包TTS模型计费信息 ==========
-- CosyVoice TTS - 按字符数计费（每千字符）
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'doubao' AND model_name = 'CosyVoice' AND capability = 'audio') AS temp
) AND pricing_type = 'audio_character';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'audio_character' AS pricing_type,
    0.01 AS unit_price,  -- 每千字符 0.01元（示例价格，需要根据实际价格调整）
    'per_1k_characters' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,  -- NULL表示永久有效
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config 
WHERE provider = 'doubao' AND model_name = 'CosyVoice' AND capability = 'audio';

-- ========== 6. 插入豆包STT模型计费信息 ==========
-- Fun-ASR STT - 按分钟计费
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'doubao' AND model_name = 'Fun-ASR' AND capability = 'audio') AS temp
) AND pricing_type = 'audio_minute';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'audio_minute' AS pricing_type,
    0.05 AS unit_price,  -- 每分钟 0.05元（示例价格，需要根据实际价格调整）
    'per_minute' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config 
WHERE provider = 'doubao' AND model_name = 'Fun-ASR' AND capability = 'audio';

-- Paraformer-8k-v2 STT - 按分钟计费
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'doubao' AND model_name = 'Paraformer-8k-v2' AND capability = 'audio') AS temp
) AND pricing_type = 'audio_minute';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'audio_minute' AS pricing_type,
    0.05 AS unit_price,  -- 每分钟 0.05元（示例价格，需要根据实际价格调整）
    'per_minute' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config 
WHERE provider = 'doubao' AND model_name = 'Paraformer-8k-v2' AND capability = 'audio';

-- ========== 7. 插入DashScope TTS模型计费信息 ==========
-- sambert-zhichu-v1 TTS - 按字符数计费（每千字符）
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'dashscope' AND model_name = 'sambert-zhichu-v1' AND capability = 'audio') AS temp
) AND pricing_type = 'audio_character';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'audio_character' AS pricing_type,
    0.01 AS unit_price,  -- 每千字符 0.01元（示例价格，需要根据实际价格调整）
    'per_1k_characters' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config 
WHERE provider = 'dashscope' AND model_name = 'sambert-zhichu-v1' AND capability = 'audio';

-- ========== 8. 插入DashScope STT模型计费信息 ==========
-- paraformer-v2 STT - 按分钟计费
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'dashscope' AND model_name = 'paraformer-v2' AND capability = 'audio') AS temp
) AND pricing_type = 'audio_minute';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'audio_minute' AS pricing_type,
    0.05 AS unit_price,  -- 每分钟 0.05元（示例价格，需要根据实际价格调整）
    'per_minute' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config 
WHERE provider = 'dashscope' AND model_name = 'paraformer-v2' AND capability = 'audio';

-- ========== 9. 验证插入结果 ==========
SELECT 
    '模型配置统计' AS type,
    provider,
    capability,
    COUNT(*) AS count
FROM ai_model_config 
WHERE provider IN ('doubao', 'dashscope') AND capability = 'audio'
GROUP BY provider, capability;

SELECT 
    '计费信息统计' AS type,
    amc.provider,
    amc.model_name,
    amp.pricing_type,
    amp.unit_price,
    amp.unit
FROM ai_model_pricing amp
INNER JOIN ai_model_config amc ON amp.model_id = amc.id
WHERE amc.provider IN ('doubao', 'dashscope') AND amc.capability = 'audio'
ORDER BY amc.provider, amc.model_name, amp.pricing_type;
