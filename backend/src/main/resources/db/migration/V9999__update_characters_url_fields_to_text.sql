-- 更新 characters 表的 avatar_url 和 background_url 字段为 TEXT 类型
-- 以支持长 URL（如火山引擎 TOS 的带签名 URL）

ALTER TABLE `characters` 
MODIFY COLUMN `avatar_url` TEXT NULL COMMENT '角色头像URL',
MODIFY COLUMN `background_url` TEXT NULL COMMENT '角色背景图URL';

