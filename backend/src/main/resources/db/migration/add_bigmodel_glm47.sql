-- 添加智谱AI BigModel GLM-4.7 模型配置和计费信息
-- 创建日期: 2025-01-XX

-- ========== 1. 添加智谱AI提供商（如果不存在） ==========
INSERT INTO ai_providers (name, display_name, enabled, created_at, updated_at)
VALUES ('bigmodel', '智谱AI', TRUE, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    display_name = '智谱AI',
    enabled = TRUE,
    updated_at = NOW();

-- ========== 2. 添加GLM-4.7文本生成模型配置 ==========
INSERT INTO ai_model_config (provider, model_name, capability, api_key, base_url, model_params, is_default, priority, cost_per_token, is_active, description, created_at, updated_at)
VALUES 
('bigmodel', 'glm-4.7', 'text', '', 'https://open.bigmodel.cn/api/paas/v4', '{"temperature": 1.0, "max_tokens": 65536}', FALSE, 1, 0.00001, TRUE, '智谱AI GLM-4.7文本生成模型', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    base_url = 'https://open.bigmodel.cn/api/paas/v4',
    model_params = '{"temperature": 1.0, "max_tokens": 65536}',
    description = '智谱AI GLM-4.7文本生成模型',
    updated_at = NOW();

-- ========== 3. 添加GLM-4.7的计费信息 ==========
-- 注意：model_id 需要引用 ai_model_config 表中刚插入的记录

-- 输入Token资费（示例价格，需要根据实际情况调整）
-- 先删除可能存在的旧记录，然后插入新记录
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'bigmodel' AND model_name = 'glm-4.7' AND capability = 'text') AS temp
) AND pricing_type = 'input_token';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'input_token' AS pricing_type,
    0.005 AS unit_price,  -- 每千Token 0.005元（需要根据实际价格调整）
    'per_1k_tokens' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,  -- NULL表示永久有效
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config
WHERE provider = 'bigmodel' AND model_name = 'glm-4.7' AND capability = 'text';

-- 输出Token资费（示例价格，需要根据实际情况调整）
-- 先删除可能存在的旧记录，然后插入新记录
DELETE FROM ai_model_pricing 
WHERE model_id IN (
    SELECT id FROM (SELECT id FROM ai_model_config WHERE provider = 'bigmodel' AND model_name = 'glm-4.7' AND capability = 'text') AS temp
) AND pricing_type = 'output_token';

INSERT INTO ai_model_pricing (model_id, pricing_type, unit_price, unit, min_charge_unit, effective_date, expiry_date, is_active, created_at, updated_at)
SELECT 
    id AS model_id,
    'output_token' AS pricing_type,
    0.015 AS unit_price,  -- 每千Token 0.015元（需要根据实际价格调整）
    'per_1k_tokens' AS unit,
    0 AS min_charge_unit,
    NOW() AS effective_date,
    NULL AS expiry_date,  -- NULL表示永久有效
    TRUE AS is_active,
    NOW() AS created_at,
    NOW() AS updated_at
FROM ai_model_config
WHERE provider = 'bigmodel' AND model_name = 'glm-4.7' AND capability = 'text';

