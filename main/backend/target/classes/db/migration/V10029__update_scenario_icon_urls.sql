-- 更新scenario_items和scenario_events的icon_url字段，关联到system_resources中生成的资源

SET NAMES utf8mb4;

-- 更新scenario_items的icon_url字段，关联到system_resources
UPDATE scenario_items si
INNER JOIN system_resources sr ON sr.url COLLATE utf8mb4_unicode_ci = CONCAT('placeholder://item/', si.item_id, '.jpg') COLLATE utf8mb4_unicode_ci
SET si.icon_url = sr.url
WHERE si.is_system = 1;

-- 更新scenario_events的icon_url字段，关联到system_resources（注意：event_id已经包含event_前缀）
UPDATE scenario_events se
INNER JOIN system_resources sr ON sr.url COLLATE utf8mb4_unicode_ci = CONCAT('placeholder://icon/', se.event_id, '.png') COLLATE utf8mb4_unicode_ci
SET se.icon_url = sr.url
WHERE se.is_system = 1;

