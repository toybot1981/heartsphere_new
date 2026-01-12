-- 数据迁移脚本：将 scenario_items 和 scenario_events 的数据迁移到新表结构
-- 注意：此脚本在表重命名后执行，用于处理数据迁移和清理

SET NAMES utf8mb4;

-- 1. 确保 system_era_items 表中的 system_era_id 字段已正确设置
-- （数据迁移已在之前的匹配服务中完成，这里只是确保字段存在）

-- 2. 清理不需要的列（如果迁移脚本V10036没有执行）
-- 这些列在重命名表后应该已经不存在，但为了安全起见，使用条件删除
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'system_era_items' 
     AND COLUMN_NAME = 'era_id') > 0,
    'ALTER TABLE system_era_items DROP COLUMN era_id, DROP COLUMN user_id, DROP COLUMN is_system',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'system_era_events' 
     AND COLUMN_NAME = 'era_id') > 0,
    'ALTER TABLE system_era_events DROP COLUMN era_id, DROP COLUMN user_id, DROP COLUMN is_system',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 确保索引正确
-- MySQL不支持CREATE INDEX IF NOT EXISTS，需要先检查索引是否存在
SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'system_era_items' 
    AND INDEX_NAME = 'idx_system_era_id'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX idx_system_era_id ON system_era_items (system_era_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
    SELECT COUNT(*) 
    FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'system_era_events' 
    AND INDEX_NAME = 'idx_system_era_id'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX idx_system_era_id ON system_era_events (system_era_id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

