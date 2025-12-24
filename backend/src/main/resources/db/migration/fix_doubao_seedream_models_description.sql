-- 修复豆包 Seedream 模型配置的描述字段编码问题

-- 更新 Doubao-Seedream-4.5 模型描述
UPDATE ai_model_config 
SET description = '豆包 Seedream 4.5 模型（最新版本），支持文本生成图像、图像编辑等功能',
    updated_at = NOW()
WHERE provider = 'doubao' 
  AND model_name = 'Doubao-Seedream-4.5'
  AND capability = 'image';

-- 更新 Doubao-Seedream-4.0 模型描述
UPDATE ai_model_config 
SET description = '豆包 Seedream 4.0 模型，支持文本生成图像、图像编辑、多图融合等功能',
    updated_at = NOW()
WHERE provider = 'doubao' 
  AND model_name = 'Doubao-Seedream-4.0'
  AND capability = 'image';

-- 更新 Doubao-Seedream-3.0-t2i 模型描述
UPDATE ai_model_config 
SET description = '豆包 Seedream 3.0 文本生成图像模型',
    updated_at = NOW()
WHERE provider = 'doubao' 
  AND model_name = 'Doubao-Seedream-3.0-t2i'
  AND capability = 'image';

