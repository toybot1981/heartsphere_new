-- 根据剧本物品表和剧本事件表的中文名称，更新资源管理中的类别
-- 将匹配的资源类别更新为 'item' 或 'event'

SET NAMES utf8mb4;

-- ==========================================
-- 第一部分：检查需要更新的资源
-- ==========================================

-- 1. 检查可以匹配到 system_era_items 的资源（去掉名称中的"（物品）"和"（事件）"后缀）
SELECT 
    '可以更新为 item' as type,
    sr.id,
    sr.name,
    sr.category as current_category,
    sie.name as item_name,
    'item' as new_category
FROM system_resources sr
INNER JOIN system_era_items sie ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', ''))
WHERE sr.category != 'item'
ORDER BY sr.id
LIMIT 20;

-- 2. 检查可以匹配到 system_era_events 的资源（去掉名称中的"（物品）"和"（事件）"后缀）
SELECT 
    '可以更新为 event' as type,
    sr.id,
    sr.name,
    sr.category as current_category,
    see.name as event_name,
    'event' as new_category
FROM system_resources sr
INNER JOIN system_era_events see ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
WHERE sr.category != 'event'
ORDER BY sr.id
LIMIT 20;

-- 3. 统计需要更新的数量（去掉名称中的"（物品）"和"（事件）"后缀）
SELECT 
    '统计' as summary,
    COUNT(DISTINCT sr.id) as items_to_update
FROM system_resources sr
INNER JOIN system_era_items sie ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', ''))
WHERE sr.category != 'item'
UNION ALL
SELECT 
    '统计' as summary,
    COUNT(DISTINCT sr.id) as events_to_update
FROM system_resources sr
INNER JOIN system_era_events see ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
WHERE sr.category != 'event';

-- ==========================================
-- 第二部分：更新资源类别
-- ==========================================

-- 1. 更新匹配到 system_era_items 的资源类别为 'item'（去掉名称中的"（物品）"和"（事件）"后缀）
UPDATE system_resources sr
INNER JOIN system_era_items sie ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', ''))
SET sr.category = 'item'
WHERE sr.category != 'item';

-- 2. 更新匹配到 system_era_events 的资源类别为 'event'（去掉名称中的"（物品）"和"（事件）"后缀）
UPDATE system_resources sr
INNER JOIN system_era_events see ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
SET sr.category = 'event'
WHERE sr.category != 'event';

-- ==========================================
-- 第三部分：验证更新结果
-- ==========================================

-- 1. 检查更新后的资源类别分布
SELECT 
    '更新后的类别分布' as summary,
    category,
    COUNT(*) as count
FROM system_resources
WHERE category IN ('item', 'event', 'scenario')
GROUP BY category;

-- 2. 检查是否还有未匹配的资源（名称相同但类别不对，去掉名称中的"（物品）"和"（事件）"后缀）
SELECT 
    '未匹配的 item 资源' as type,
    sr.id,
    sr.name,
    sr.category,
    sie.name as item_name
FROM system_resources sr
INNER JOIN system_era_items sie ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', ''))
WHERE sr.category != 'item'
LIMIT 10;

SELECT 
    '未匹配的 event 资源' as type,
    sr.id,
    sr.name,
    sr.category,
    see.name as event_name
FROM system_resources sr
INNER JOIN system_era_events see ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
WHERE sr.category != 'event'
LIMIT 10;

-- 3. 显示更新后的示例（去掉名称中的"（物品）"和"（事件）"后缀）
SELECT 
    '更新后的 item 示例' as type,
    sr.id,
    sr.name,
    sr.category,
    sie.name as item_name
FROM system_resources sr
INNER JOIN system_era_items sie ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', ''))
WHERE sr.category = 'item'
LIMIT 10;

SELECT 
    '更新后的 event 示例' as type,
    sr.id,
    sr.name,
    sr.category,
    see.name as event_name
FROM system_resources sr
INNER JOIN system_era_events see ON TRIM(REPLACE(REPLACE(REPLACE(sr.name, '（物品）', ''), '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
WHERE sr.category = 'event'
LIMIT 10;
