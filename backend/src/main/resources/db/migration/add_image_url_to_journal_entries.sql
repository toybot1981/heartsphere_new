-- 为 journal_entries 表添加 image_url 字段
ALTER TABLE `journal_entries`
ADD COLUMN `image_url` VARCHAR(500) NULL COMMENT '日志配图URL' AFTER `insight`;

