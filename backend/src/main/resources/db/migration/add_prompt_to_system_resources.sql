-- 为系统资源表添加提示词字段
ALTER TABLE `system_resources` 
ADD COLUMN `prompt` TEXT NULL COMMENT 'AI生成图片的提示词' AFTER `description`;



