-- 为没有中国元素的资源提示词开头添加 "Chinese Character, "
-- 排除特定国外IP的资源（日本、埃及、希腊、欧洲、文艺复兴、工业革命、欧式城堡、童话角色等）

-- 更新头像类别（排除日系、御姐、少年英雄等日本动漫风格）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'avatar'
AND `name` NOT IN ('日系萌妹', '御姐风格', '少年英雄');

-- 更新角色类别（排除童话角色、仙女等）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'character'
AND `name` NOT IN ('仙女', '小精灵', '小矮人', '童话公主', '童话王子', '童话骑士', '童话魔法师', '童话女巫');

-- 更新时代类别（排除外国历史IP）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'era'
AND `name` NOT IN ('古代埃及', '古希腊', '中世纪欧洲', '文艺复兴', '工业革命');

-- 更新通用类别（排除欧式城堡）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'general'
AND `name` NOT IN ('欧式城堡');

-- 更新剧本类别（所有剧本都应该有中国元素）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'scenario';

-- 更新日记类别（所有日记都应该有中国元素）
UPDATE `system_resources` 
SET `prompt` = CONCAT('Chinese Character, ', `prompt`)
WHERE `prompt` NOT LIKE '%Chinese%'
AND `category` = 'journal';




