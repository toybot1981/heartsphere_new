-- 为 scripts 表添加 description 字段
-- 执行方法：mysql -u root -p123456 heartsphere < add_description_to_scripts.sql

ALTER TABLE `scripts` 
ADD COLUMN `description` TEXT NULL COMMENT '剧本描述' AFTER `title`;

