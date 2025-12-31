-- 为 scenario_items 和 scenario_events 表添加 system_era_id 字段
-- 用于关联系统预设的物品和事件到系统场景

SET NAMES utf8mb4;

-- 为 scenario_items 表添加 system_era_id 字段
ALTER TABLE `scenario_items`
ADD COLUMN `system_era_id` BIGINT NULL COMMENT '关联的系统预设时代ID' AFTER `era_id`,
ADD INDEX `idx_system_era_id` (`system_era_id`);

-- 为 scenario_events 表添加 system_era_id 字段
ALTER TABLE `scenario_events`
ADD COLUMN `system_era_id` BIGINT NULL COMMENT '关联的系统预设时代ID' AFTER `era_id`,
ADD INDEX `idx_system_era_id` (`system_era_id`);



