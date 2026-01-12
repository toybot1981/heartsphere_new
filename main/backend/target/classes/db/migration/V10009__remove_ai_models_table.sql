-- 删除 ai_models 表
-- 注意：ai_models 表已被 ai_model_config 表替代
-- 此迁移脚本删除 ai_models 表及其相关外键约束

-- 1. 删除 ai_model_pricing 表的外键约束（如果存在）
-- MySQL 不支持 IF EXISTS，需要先检查约束名称
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_model_pricing' 
    AND REFERENCED_TABLE_NAME = 'ai_models' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE ai_model_pricing DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 删除 ai_usage_records 表的外键约束（如果存在）
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_usage_records' 
    AND REFERENCED_TABLE_NAME = 'ai_models' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NOT NULL, 
    CONCAT('ALTER TABLE ai_usage_records DROP FOREIGN KEY ', @constraint_name), 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. 删除 ai_models 表（如果存在）
DROP TABLE IF EXISTS ai_models;

-- 4. 确保 ai_model_pricing 表的外键指向 ai_model_config
-- 先删除可能存在的旧外键
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_model_pricing' 
    AND REFERENCED_TABLE_NAME = 'ai_model_config' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NULL, 
    'ALTER TABLE ai_model_pricing ADD CONSTRAINT fk_pricing_model_config FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON DELETE CASCADE', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. 确保 ai_usage_records 表的外键指向 ai_model_config
SET @constraint_name = (
    SELECT CONSTRAINT_NAME 
    FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'ai_usage_records' 
    AND REFERENCED_TABLE_NAME = 'ai_model_config' 
    LIMIT 1
);

SET @sql = IF(@constraint_name IS NULL, 
    'ALTER TABLE ai_usage_records ADD CONSTRAINT fk_usage_model_config FOREIGN KEY (model_id) REFERENCES ai_model_config(id) ON DELETE CASCADE', 
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

