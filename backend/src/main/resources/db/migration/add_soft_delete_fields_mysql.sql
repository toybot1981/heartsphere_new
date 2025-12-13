-- 为用户数据表添加软删除字段 (MySQL版本)
-- 执行方法：mysql -u root -p123456 heartsphere < add_soft_delete_fields_mysql.sql

-- 为 characters 表添加软删除字段
ALTER TABLE `characters` 
ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `updated_at`,
ADD COLUMN `deleted_at` DATETIME NULL AFTER `is_deleted`,
ADD INDEX `idx_is_deleted` (`is_deleted`),
ADD INDEX `idx_deleted_at` (`deleted_at`);

-- 为 worlds 表添加软删除字段
ALTER TABLE `worlds` 
ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `updated_at`,
ADD COLUMN `deleted_at` DATETIME NULL AFTER `is_deleted`,
ADD INDEX `idx_is_deleted` (`is_deleted`),
ADD INDEX `idx_deleted_at` (`deleted_at`);

-- 为 eras 表添加软删除字段
ALTER TABLE `eras` 
ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `updated_at`,
ADD COLUMN `deleted_at` DATETIME NULL AFTER `is_deleted`,
ADD INDEX `idx_is_deleted` (`is_deleted`),
ADD INDEX `idx_deleted_at` (`deleted_at`);

-- 为 scripts 表添加软删除字段
ALTER TABLE `scripts` 
ADD COLUMN `is_deleted` TINYINT(1) NOT NULL DEFAULT 0 AFTER `updated_at`,
ADD COLUMN `deleted_at` DATETIME NULL AFTER `is_deleted`,
ADD INDEX `idx_is_deleted` (`is_deleted`),
ADD INDEX `idx_deleted_at` (`deleted_at`);

