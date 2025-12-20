-- 从 user_main_stories 表删除 description、mbti、relationships 字段
-- 执行方法：mysql -u root -p123456 heartsphere < remove_extra_fields_from_user_main_stories.sql

-- MySQL 不支持 IF EXISTS，需要分别执行
ALTER TABLE `user_main_stories` DROP COLUMN `description`;
ALTER TABLE `user_main_stories` DROP COLUMN `mbti`;
ALTER TABLE `user_main_stories` DROP COLUMN `relationships`;

