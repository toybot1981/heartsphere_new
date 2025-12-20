-- 为 scripts 表添加 character_ids 和 tags 字段
-- 执行方法：mysql -u root -p123456 heartsphere < add_character_ids_and_tags_to_scripts.sql

ALTER TABLE `scripts` 
ADD COLUMN `character_ids` TEXT NULL COMMENT '关联的角色ID列表（JSON数组）' AFTER `scene_count`,
ADD COLUMN `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）' AFTER `character_ids`;


