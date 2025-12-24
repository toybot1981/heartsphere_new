-- 为日记条目表添加本我镜像（insight）字段
ALTER TABLE `journal_entries` 
ADD COLUMN `insight` TEXT NULL COMMENT '本我镜像（Mirror of Truth）分析结果' AFTER `tags`;

