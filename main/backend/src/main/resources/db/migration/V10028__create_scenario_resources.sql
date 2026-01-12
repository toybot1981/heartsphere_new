-- 为所有剧本物品和事件创建资源记录（包含AI图片生成提示词）
-- 此脚本使用SQL查询自动从scenario_items和scenario_events表生成资源记录

SET NAMES utf8mb4;

-- 物品资源：根据物品类型生成不同的提示词
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`)
SELECT 
    CONCAT(si.name, '（物品）') as name,
    CONCAT('placeholder://item/', si.item_id, '.jpg') as url,
    'item' as category,
    si.description,
    CASE 
        WHEN si.item_type = 'weapon' THEN CONCAT(si.name, ', weapon, realistic style, high quality, detailed weapon design, game item style')
        WHEN si.item_type = 'tool' THEN CONCAT(si.name, ', tool item, realistic style, high quality, detailed tool design, practical item')
        WHEN si.item_type = 'key' THEN CONCAT(si.name, ', key item, realistic style, high quality, detailed key design, essential item')
        WHEN si.item_type = 'consumable' THEN CONCAT(si.name, ', consumable item, realistic style, high quality, detailed item design, usable item')
        WHEN si.item_type = 'collectible' THEN CONCAT(si.name, ', collectible item, realistic style, high quality, detailed collectible design, treasure item')
        ELSE CONCAT(si.name, ', item, realistic style, high quality, detailed item design')
    END as prompt,
    si.tags,
    NULL as created_by_admin_id,
    NOW() as created_at,
    NOW() as updated_at
FROM scenario_items si
WHERE si.is_system = 1
  AND NOT EXISTS (
    SELECT 1 FROM system_resources sr 
    WHERE sr.category = 'item' AND sr.url = CONCAT('placeholder://item/', si.item_id, '.jpg')
  );

-- 事件图标资源（注意：event_id已经包含event_前缀）
INSERT INTO `system_resources` (`name`, `url`, `category`, `description`, `prompt`, `tags`, `created_by_admin_id`, `created_at`, `updated_at`)
SELECT 
    CONCAT(se.name, '（事件图标）') as name,
    CONCAT('placeholder://icon/', se.event_id, '.png') as url,
    'event_icon' as category,
    CONCAT(se.name, '事件图标') as description,
    CONCAT('Icon design, ', se.name, ', minimalist icon style, clean design, event icon, simple and clear, game UI icon style') as prompt,
    se.tags,
    NULL as created_by_admin_id,
    NOW() as created_at,
    NOW() as updated_at
FROM scenario_events se
WHERE se.is_system = 1
  AND NOT EXISTS (
    SELECT 1 FROM system_resources sr 
    WHERE sr.category = 'event_icon' AND sr.url = CONCAT('placeholder://icon/', se.event_id, '.png')
  );

