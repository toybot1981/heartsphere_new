-- 更新 characters 表的 avatar_url 和 background_url 字段为 VARCHAR(500)
-- 限制 URL 长度为 500 字符

ALTER TABLE `characters` 
MODIFY COLUMN `avatar_url` VARCHAR(500) NULL COMMENT '角色头像URL',
MODIFY COLUMN `background_url` VARCHAR(500) NULL COMMENT '角色背景图URL';

