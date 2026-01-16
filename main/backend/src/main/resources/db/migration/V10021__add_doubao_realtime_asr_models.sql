-- 添加豆包实时语音识别模型配置
-- 参考文档：https://www.volcengine.com/docs/6561/1594356?lang=zh
-- 
-- 端到端实时语音大模型 API 支持以下模型版本：
-- - O: 基础版本，支持精品音色（vv、xiaohe、yunzhou、xiaotian）
-- - SC: 支持声音复刻和角色扮演
-- - 1.2.1.0: O2.0版本（规范版本号），整体能力升级，支持唱歌能力增强和热修复
-- - 2.2.0.0: SC2.0版本（规范版本号），角色演绎能力提升，音色克隆能力升级

-- 实时语音识别模型配置
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('doubao', 'realtime-asr-O', 'audio', '', 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue', '{"model": "O", "format": "pcm", "sample_rate": 16000, "channel": 1}', FALSE, 1, 0.0004, TRUE, '豆包端到端实时语音大模型 O版本，支持精品音色（vv、xiaohe、yunzhou、xiaotian），支持低延迟、多模式交互', NOW(), NOW()),
('doubao', 'realtime-asr-SC', 'audio', '', 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue', '{"model": "SC", "format": "pcm", "sample_rate": 16000, "channel": 1}', FALSE, 2, 0.0005, TRUE, '豆包端到端实时语音大模型 SC版本，支持声音复刻和角色扮演，支持克隆音色1.0', NOW(), NOW()),
('doubao', 'realtime-asr-O2.0', 'audio', '', 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue', '{"model": "1.2.1.0", "format": "pcm", "sample_rate": 16000, "channel": 1}', FALSE, 3, 0.00045, TRUE, '豆包端到端实时语音大模型 O2.0版本，整体能力升级，支持唱歌能力增强和热修复', NOW(), NOW()),
('doubao', 'realtime-asr-SC2.0', 'audio', '', 'wss://openspeech.bytedance.com/api/v3/realtime/dialogue', '{"model": "2.2.0.0", "format": "pcm", "sample_rate": 16000, "channel": 1}', FALSE, 4, 0.00055, TRUE, '豆包端到端实时语音大模型 SC2.0版本，角色演绎能力提升，支持克隆音色2.0', NOW(), NOW());

-- 添加对应的定价配置
INSERT INTO ai_model_pricing (model_config_id, input_price_per_token, output_price_per_token, created_at, updated_at)
SELECT 
    id,
    0.0004,  -- 输入价格（每token）
    0.0004,  -- 输出价格（每token）
    NOW(),
    NOW()
FROM ai_model_config
WHERE provider = 'doubao' 
  AND model_name LIKE 'realtime-asr-%'
  AND capability = 'audio'
  AND id NOT IN (SELECT model_config_id FROM ai_model_pricing WHERE model_config_id IS NOT NULL);
