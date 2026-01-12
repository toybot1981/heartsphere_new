-- 全面的数据迁移脚本：将所有关联 ai_models 的表迁移到 ai_model_config
-- 执行日期: 2025-12-26
-- 
-- 迁移逻辑：
-- 1. 通过 model_id 查询 ai_models，获取 model_code 和 provider_id
-- 2. 通过 provider_id 查询 ai_providers，获取 provider name
-- 3. 通过 provider name 和 model_code 查询 ai_model_config，获取新的 id
-- 4. 更新原表的 model_id

-- ============================================================================
-- 第一部分：迁移 ai_model_pricing 表
-- ============================================================================

-- 1.1 备份无法迁移的记录（用于后续检查）
DROP TABLE IF EXISTS ai_model_pricing_migration_backup;
CREATE TABLE ai_model_pricing_migration_backup AS
SELECT amp.*, am.model_code, am.provider_id, ap.name as provider_name
FROM ai_model_pricing amp
LEFT JOIN ai_models am ON amp.model_id = am.id
LEFT JOIN ai_providers ap ON am.provider_id = ap.id
LEFT JOIN ai_model_config amc ON BINARY amc.provider = BINARY UPPER(ap.name) 
    AND BINARY amc.model_name = BINARY am.model_code
WHERE amc.id IS NULL;

-- 1.2 删除旧的外键约束（如果存在）
-- MySQL 8.0 不支持 IF EXISTS，需要先检查是否存在
SET @fk1 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_model_pricing' 
    AND CONSTRAINT_NAME = 'ai_model_pricing_ibfk_1' LIMIT 1);
SET @fk2 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_model_pricing' 
    AND CONSTRAINT_NAME = 'FKdvfoxh5y9leoqymmxb93hmx7x' LIMIT 1);
SET @sql = IF(@fk1 IS NOT NULL, CONCAT('ALTER TABLE ai_model_pricing DROP FOREIGN KEY ', @fk1), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@fk2 IS NOT NULL, CONCAT('ALTER TABLE ai_model_pricing DROP FOREIGN KEY ', @fk2), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 1.3 迁移数据：将 ai_model_pricing.model_id 从 ai_models.id 改为 ai_model_config.id
UPDATE ai_model_pricing amp
INNER JOIN ai_models am ON amp.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON BINARY amc.provider = BINARY UPPER(ap.name) 
    AND BINARY amc.model_name = BINARY am.model_code
SET amp.model_id = amc.id
WHERE amc.id IS NOT NULL;

-- 1.4 显示迁移统计（在迁移后验证）
-- 注意：此查询在迁移后执行，统计已迁移到 ai_model_config 的记录
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

-- 1.5 添加新的外键约束，关联到 ai_model_config 表（如果不存在）
SET @fk = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_model_pricing' 
    AND CONSTRAINT_NAME = 'fk_pricing_model_config' LIMIT 1);
SET @sql = IF(@fk IS NOT NULL, 'SELECT 1', 
    'ALTER TABLE ai_model_pricing ADD CONSTRAINT fk_pricing_model_config FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON DELETE CASCADE ON UPDATE CASCADE');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 第二部分：迁移 ai_usage_records 表
-- ============================================================================

-- 2.1 备份无法迁移的记录（用于后续检查）
DROP TABLE IF EXISTS ai_usage_records_migration_backup;
CREATE TABLE ai_usage_records_migration_backup AS
SELECT aur.*, am.model_code, am.provider_id as am_provider_id, ap.name as provider_name
FROM ai_usage_records aur
LEFT JOIN ai_models am ON aur.model_id = am.id
LEFT JOIN ai_providers ap ON am.provider_id = ap.id
LEFT JOIN ai_model_config amc ON BINARY amc.provider = BINARY UPPER(ap.name) 
    AND BINARY amc.model_name = BINARY am.model_code
WHERE amc.id IS NULL;

-- 2.2 删除旧的外键约束（如果存在）
SET @fk1 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_usage_records' 
    AND CONSTRAINT_NAME = 'ai_usage_records_ibfk_3' LIMIT 1);
SET @fk2 = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_usage_records' 
    AND CONSTRAINT_NAME = 'ai_usage_records_ibfk_model' LIMIT 1);
SET @sql = IF(@fk1 IS NOT NULL, CONCAT('ALTER TABLE ai_usage_records DROP FOREIGN KEY ', @fk1), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET @sql = IF(@fk2 IS NOT NULL, CONCAT('ALTER TABLE ai_usage_records DROP FOREIGN KEY ', @fk2), 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.3 迁移数据：将 ai_usage_records.model_id 从 ai_models.id 改为 ai_model_config.id
UPDATE ai_usage_records aur
INNER JOIN ai_models am ON aur.model_id = am.id
INNER JOIN ai_providers ap ON am.provider_id = ap.id
INNER JOIN ai_model_config amc ON BINARY amc.provider = BINARY UPPER(ap.name) 
    AND BINARY amc.model_name = BINARY am.model_code
SET aur.model_id = amc.id
WHERE amc.id IS NOT NULL;

-- 2.4 显示迁移统计（在迁移后验证）
-- 注意：此查询在迁移后执行，统计已迁移到 ai_model_config 的记录
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

-- 2.5 添加新的外键约束，关联到 ai_model_config 表（如果不存在）
SET @fk = (SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_usage_records' 
    AND CONSTRAINT_NAME = 'fk_usage_records_model_config' LIMIT 1);
SET @sql = IF(@fk IS NOT NULL, 'SELECT 1', 
    'ALTER TABLE ai_usage_records ADD CONSTRAINT fk_usage_records_model_config FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON DELETE RESTRICT ON UPDATE CASCADE');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2.6 更新索引（如果需要）
SET @idx = (SELECT INDEX_NAME FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = 'heartsphere' AND TABLE_NAME = 'ai_usage_records' 
    AND INDEX_NAME = 'idx_user_model' LIMIT 1);
SET @sql = IF(@idx IS NULL, 
    'ALTER TABLE ai_usage_records ADD INDEX idx_user_model (user_id, model_id)', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================================================
-- 第三部分：检查是否有其他表需要迁移
-- ============================================================================

-- 查询所有引用 ai_models 的外键
SELECT 
    TABLE_NAME,
    CONSTRAINT_NAME,
    COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME = 'ai_models'
    AND TABLE_SCHEMA = 'heartsphere'
    AND REFERENCED_COLUMN_NAME = 'id';

-- ============================================================================
-- 第四部分：验证迁移结果
-- ============================================================================

-- 4.1 检查 ai_model_pricing 中是否有无效的 model_id（指向 ai_models 的）
SELECT 
    'ai_model_pricing validation' as check_type,
    COUNT(*) as invalid_records
FROM ai_model_pricing amp
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = amp.model_id
);

-- 4.2 检查 ai_usage_records 中是否有无效的 model_id（指向 ai_models 的）
SELECT 
    'ai_usage_records validation' as check_type,
    COUNT(*) as invalid_records
FROM ai_usage_records aur
WHERE NOT EXISTS (
    SELECT 1 FROM ai_model_config amc WHERE amc.id = aur.model_id
);

-- ============================================================================
-- 第五部分：生成迁移报告
-- ============================================================================

-- 生成无法迁移的记录报告
SELECT 
    'ai_model_pricing unmigrated records' as report_type,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT provider_name) as providers,
    GROUP_CONCAT(DISTINCT model_code) as model_codes
FROM ai_model_pricing_migration_backup
WHERE id IS NOT NULL;

SELECT 
    'ai_usage_records unmigrated records' as report_type,
    COUNT(*) as count,
    GROUP_CONCAT(DISTINCT provider_name) as providers,
    GROUP_CONCAT(DISTINCT model_code) as model_codes
FROM ai_usage_records_migration_backup
WHERE id IS NOT NULL;

