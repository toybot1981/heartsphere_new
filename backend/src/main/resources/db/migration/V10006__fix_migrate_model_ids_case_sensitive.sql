-- 修复数据迁移：处理 provider 大小写不一致的问题
-- 执行日期: 2025-12-26
-- 
-- 问题：之前的迁移脚本使用 BINARY UPPER(ap.name) 与 amc.provider 比较
-- 但 ai_model_config.provider 可能是小写（doubao）或大写（DOUBAO）
-- 需要更灵活的匹配逻辑

-- ============================================================================
-- 第一部分：修复 ai_model_pricing 表
-- ============================================================================

-- 1.1 检查未迁移的记录
SELECT 
    'ai_model_pricing unmigrated' as check_type,
    COUNT(*) as count
FROM ai_model_pricing amp
INNER JOIN ai_models am ON amp.model_id = am.id
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
);

-- 1.2 迁移数据：使用更灵活的匹配（忽略 provider 大小写）
UPDATE ai_model_pricing amp
INNER JOIN ai_models am ON amp.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON (
    -- provider 匹配：支持大小写不敏感，使用 BINARY 避免字符集问题
    (BINARY UPPER(amc.provider) = BINARY UPPER(ap.name))
    AND 
    -- model_name 精确匹配，使用 BINARY 避免字符集问题
    (BINARY amc.model_name = BINARY am.model_code)
)
SET amp.model_id = amc.id
WHERE amp.model_id = am.id
  AND NOT EXISTS (
    SELECT 1 FROM ai_model_config amc2 WHERE amc2.id = amp.model_id
  );

-- 1.3 显示迁移统计
SELECT 
    'ai_model_pricing' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
    ) THEN 1 ELSE 0 END) as migrated_to_config,
    SUM(CASE WHEN NOT EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
    ) THEN 1 ELSE 0 END) as still_pointing_to_models
FROM ai_model_pricing amp;

-- ============================================================================
-- 第二部分：修复 ai_usage_records 表
-- ============================================================================

-- 2.1 检查未迁移的记录
SELECT 
    'ai_usage_records unmigrated' as check_type,
    COUNT(*) as count
FROM ai_usage_records aur
INNER JOIN ai_models am ON aur.model_id = am.id
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
);

-- 2.2 迁移数据：使用更灵活的匹配（忽略 provider 大小写）
UPDATE ai_usage_records aur
INNER JOIN ai_models am ON aur.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON (
    -- provider 匹配：支持大小写不敏感，使用 BINARY 避免字符集问题
    (BINARY UPPER(amc.provider) = BINARY UPPER(ap.name))
    AND 
    -- model_name 精确匹配，使用 BINARY 避免字符集问题
    (BINARY amc.model_name = BINARY am.model_code)
)
SET aur.model_id = amc.id
WHERE aur.model_id = am.id
  AND NOT EXISTS (
    SELECT 1 FROM ai_model_config amc2 WHERE amc2.id = aur.model_id
  );

-- 2.3 显示迁移统计
SELECT 
    'ai_usage_records' as table_name,
    COUNT(*) as total_records,
    SUM(CASE WHEN EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
    ) THEN 1 ELSE 0 END) as migrated_to_config,
    SUM(CASE WHEN NOT EXISTS (
        SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
    ) THEN 1 ELSE 0 END) as still_pointing_to_models
FROM ai_usage_records aur;

-- ============================================================================
-- 第三部分：验证迁移结果
-- ============================================================================

-- 3.1 验证 ai_model_pricing
SELECT 
    'ai_model_pricing validation' as check_type,
    COUNT(*) as invalid_records
FROM ai_model_pricing amp
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
);

-- 3.2 验证 ai_usage_records
SELECT 
    'ai_usage_records validation' as check_type,
    COUNT(*) as invalid_records
FROM ai_usage_records aur
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
);

-- 3.3 验证特定记录（id=32）
SELECT 
    'ai_model_pricing id=32' as check_type,
    amp.id,
    amp.model_id,
    am.model_code,
    amc.id as expected_config_id,
    amc.model_name,
    amc.provider
FROM ai_model_pricing amp
LEFT JOIN ai_models am ON amp.model_id = am.id
LEFT JOIN ai_model_config amc ON amc.id = amp.model_id
WHERE amp.id = 32;

