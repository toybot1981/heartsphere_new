-- 可选：删除旧的 scenario_items 和 scenario_events 表
-- 注意：此脚本默认被注释，仅在确认数据迁移成功且不再需要备份时执行
-- 执行前请确保：
-- 1. system_era_items 和 system_era_events 表数据完整
-- 2. 所有相关代码已更新为使用新表
-- 3. 已进行充分测试

SET NAMES utf8mb4;

-- 取消下面的注释以删除旧表（谨慎操作！）
-- DROP TABLE IF EXISTS `scenario_items`;
-- DROP TABLE IF EXISTS `scenario_events`;

-- 如果需要保留表但删除数据，可以使用：
-- TRUNCATE TABLE `scenario_items`;
-- TRUNCATE TABLE `scenario_events`;



