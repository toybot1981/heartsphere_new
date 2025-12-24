-- 添加豆包 Seedream 图片生成模型配置
-- 支持 Doubao-Seedream-4.5、Doubao-Seedream-4.0、Doubao-Seedream-3.0-t2i
-- 注意：请在执行此脚本时使用 --default-character-set=utf8mb4 选项

-- 添加 Doubao-Seedream-4.5 模型（最新版本，推荐）
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
    'doubao',
    'Doubao-Seedream-4.5',
    'image',
    '',  -- API Key 与文本生成相同，从系统配置获取
    'https://ark.cn-beijing.volces.com/api/v3',
    true,  -- 设置为默认图片生成模型
    1,
    true,
    CONVERT('豆包 Seedream 4.5 模型（最新版本），支持文本生成图像、图像编辑等功能' USING utf8mb4),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    base_url = VALUES(base_url),
    description = CONVERT('豆包 Seedream 4.5 模型（最新版本），支持文本生成图像、图像编辑等功能' USING utf8mb4),
    updated_at = NOW();

-- 添加 Doubao-Seedream-4.0 模型
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
    'doubao',
    'Doubao-Seedream-4.0',
    'image',
    '',
    'https://ark.cn-beijing.volces.com/api/v3',
    false,
    2,
    true,
    CONVERT('豆包 Seedream 4.0 模型，支持文本生成图像、图像编辑、多图融合等功能' USING utf8mb4),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    base_url = VALUES(base_url),
    description = CONVERT('豆包 Seedream 4.0 模型，支持文本生成图像、图像编辑、多图融合等功能' USING utf8mb4),
    updated_at = NOW();

-- 添加 Doubao-Seedream-3.0-t2i 模型
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
    'doubao',
    'Doubao-Seedream-3.0-t2i',
    'image',
    '',
    'https://ark.cn-beijing.volces.com/api/v3',
    false,
    3,
    true,
    CONVERT('豆包 Seedream 3.0 文本生成图像模型' USING utf8mb4),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    base_url = VALUES(base_url),
    description = CONVERT('豆包 Seedream 3.0 文本生成图像模型' USING utf8mb4),
    updated_at = NOW();

