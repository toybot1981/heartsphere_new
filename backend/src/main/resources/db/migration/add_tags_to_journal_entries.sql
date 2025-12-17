-- 为日记条目表添加标签字段
ALTER TABLE `journal_entries` 
ADD COLUMN `tags` VARCHAR(500) NULL COMMENT '标签（逗号分隔，如：#灵感,#梦境,#工作）' AFTER `content`;

-- 添加索引以优化搜索性能
CREATE INDEX `idx_tags` ON `journal_entries`(`tags`(255));
CREATE INDEX `idx_title_content` ON `journal_entries`(`title`(100), `content`(100));

