-- 重命名 scenario_items 为 system_era_items
-- 重命名 scenario_events 为 system_era_events
-- 这些表用于存储系统预置的物品和事件

SET NAMES utf8mb4;

-- 1. 删除旧的外键约束（如果存在）
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'scenario_items' 
    AND REFERENCED_TABLE_NAME = 'eras' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE scenario_items DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'scenario_items' 
    AND REFERENCED_TABLE_NAME = 'users' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE scenario_items DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'scenario_events' 
    AND REFERENCED_TABLE_NAME = 'eras' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE scenario_events DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'scenario_events' 
    AND REFERENCED_TABLE_NAME = 'users' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE scenario_events DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 删除不需要的列（era_id, user_id, is_system）
-- MySQL不支持DROP COLUMN IF EXISTS，需要先检查列是否存在
SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_items' 
     AND COLUMN_NAME = 'era_id') > 0,
    'ALTER TABLE scenario_items DROP COLUMN era_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_items' 
     AND COLUMN_NAME = 'user_id') > 0,
    'ALTER TABLE scenario_items DROP COLUMN user_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_items' 
     AND COLUMN_NAME = 'is_system') > 0,
    'ALTER TABLE scenario_items DROP COLUMN is_system',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_events' 
     AND COLUMN_NAME = 'era_id') > 0,
    'ALTER TABLE scenario_events DROP COLUMN era_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_events' 
     AND COLUMN_NAME = 'user_id') > 0,
    'ALTER TABLE scenario_events DROP COLUMN user_id',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = IF(
    (SELECT COUNT(*) FROM information_schema.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'scenario_events' 
     AND COLUMN_NAME = 'is_system') > 0,
    'ALTER TABLE scenario_events DROP COLUMN is_system',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 重命名表
RENAME TABLE `scenario_items` TO `system_era_items`;
RENAME TABLE `scenario_events` TO `system_era_events`;

-- 4. 添加 system_era_id 外键约束（如果还没有）
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'system_era_items' 
    AND REFERENCED_TABLE_NAME = 'system_eras' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NULL, 
    'ALTER TABLE system_era_items ADD CONSTRAINT fk_system_era_items_era FOREIGN KEY (system_era_id) REFERENCES system_eras(id) ON DELETE SET NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'system_era_events' 
    AND REFERENCED_TABLE_NAME = 'system_eras' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NULL, 
    'ALTER TABLE system_era_events ADD CONSTRAINT fk_system_era_events_era FOREIGN KEY (system_era_id) REFERENCES system_eras(id) ON DELETE SET NULL', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. 更新表注释
ALTER TABLE `system_era_items` COMMENT='系统预置时代物品表';
ALTER TABLE `system_era_events` COMMENT='系统预置时代事件表';

