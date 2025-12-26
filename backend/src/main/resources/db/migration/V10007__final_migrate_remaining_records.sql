-- 最终迁移：迁移所有可以匹配的记录
-- 执行日期: 2025-12-26
-- 
-- 注意：此脚本只迁移在 ai_model_config 中存在对应配置的记录
-- 对于不存在的配置，需要先创建配置或手动处理

-- ============================================================================
-- 第一部分：迁移 ai_model_pricing 表中所有可匹配的记录
-- ============================================================================

UPDATE ai_model_pricing amp
INNER JOIN ai_models am ON amp.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON (
    BINARY UPPER(amc.provider) = BINARY UPPER(ap.name)
    AND BINARY amc.model_name = BINARY am.model_code
)
SET amp.model_id = amc.id
WHERE EXISTS (
    -- 确保当前 model_id 还在 ai_models 中
    SELECT 1 FROM ai_models am2 WHERE am2.id = amp.model_id
)
AND NOT EXISTS (
    -- 确保还没有迁移到 ai_model_config
    SELECT 1 FROM ai_model_config amc2 WHERE amc2.id = amp.model_id
);

-- 显示迁移结果
SELECT 
    'ai_model_pricing migration result' as report_type,
    COUNT(*) as total_records,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
    ) THEN 1 ELSE 0 END) as in_config,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_models am WHERE am.id = amp.model_id
    ) THEN 1 ELSE 0 END) as still_in_models
FROM ai_model_pricing amp;

-- ============================================================================
-- 第二部分：迁移 ai_usage_records 表中所有可匹配的记录
-- ============================================================================

UPDATE ai_usage_records aur
INNER JOIN ai_models am ON aur.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON (
    BINARY UPPER(amc.provider) = BINARY UPPER(ap.name)
    AND BINARY amc.model_name = BINARY am.model_code
)
SET aur.model_id = amc.id
WHERE EXISTS (
    -- 确保当前 model_id 还在 ai_models 中
    SELECT 1 FROM ai_models am2 WHERE am2.id = aur.model_id
)
AND NOT EXISTS (
    -- 确保还没有迁移到 ai_model_config
    SELECT 1 FROM ai_model_config amc2 WHERE amc2.id = aur.model_id
);

-- 显示迁移结果
SELECT 
    'ai_usage_records migration result' as report_type,
    COUNT(*) as total_records,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
    ) THEN 1 ELSE 0 END) as in_config,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_models am WHERE am.id = aur.model_id
    ) THEN 1 ELSE 0 END) as still_in_models
FROM ai_usage_records aur;

-- ============================================================================
-- 第三部分：列出无法迁移的记录（需要在 ai_model_config 中创建配置）
-- ============================================================================

-- 无法迁移的 ai_model_pricing 记录
SELECT 
    'ai_model_pricing unmigrated' as report_type,
    amp.id as pricing_id,
    amp.model_id as current_model_id,
    am.model_code,
    am.model_name,
    ap.name as provider_name
FROM ai_model_pricing amp
INNER JOIN ai_models am ON amp.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc 
    WHERE BINARY UPPER(amc.provider) = BINARY UPPER(ap.name)
    AND BINARY amc.model_name = BINARY am.model_code
)
ORDER BY ap.name, am.model_code;

-- 无法迁移的 ai_usage_records 记录（按模型分组统计）
SELECT 
    'ai_usage_records unmigrated summary' as report_type,
    am.model_code,
    am.model_name,
    ap.name as provider_name,
    COUNT(*) as record_count
FROM ai_usage_records aur
INNER JOIN ai_models am ON aur.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc 
    WHERE BINARY UPPER(amc.provider) = BINARY UPPER(ap.name)
    AND BINARY amc.model_name = BINARY am.model_code
)
GROUP BY am.model_code, am.model_name, ap.name
ORDER BY ap.name, am.model_code;

