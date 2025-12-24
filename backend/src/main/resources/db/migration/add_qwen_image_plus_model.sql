-- 添加 qwen-image-plus 模型配置
-- 用于文生图功能，使用 DashScope multimodal-generation API

INSERT INTO ai_model_config (
    provider, 
    model_name, 
    capability, 
    api_key, 
    base_url, 
    is_default, 
    priority, 
    is_active, 
    description,
    created_at,
    updated_at
) VALUES (
    'qwen',
    'qwen-image-plus',
    'image',
    'sk-a486b81e29484fcea112b2c010b7bd95',
    'https://dashscope.aliyuncs.com/api/v1',
    false,
    2,
    true,
    '通义千问图像生成增强版模型，支持多模态生成',
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    api_key = VALUES(api_key),
    base_url = VALUES(base_url),
    description = VALUES(description),
    updated_at = NOW();

