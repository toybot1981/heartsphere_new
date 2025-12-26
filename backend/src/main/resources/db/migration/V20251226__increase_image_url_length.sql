-- 将 image_url 字段长度从 500 扩大到 2000
ALTER TABLE `journal_entries`
MODIFY COLUMN `image_url` VARCHAR(2000) NULL COMMENT '日志配图URL';

