-- 根据剧本物品表和剧本事件表的中文名称，更新资源管理中的类别
-- 匹配逻辑：
-- 1. 如果资源名称包含"（物品）"，优先匹配 system_era_items
-- 2. 如果资源名称包含"（事件）"，优先匹配 system_era_events
-- 3. 如果资源名称不包含后缀，同时检查 items 和 events，优先匹配 items

SET NAMES utf8mb4;

-- ==========================================
-- 第一部分：检查需要更新的资源
-- ==========================================

-- 1. 检查可以匹配到 system_era_items 的资源（名称包含"（物品）"或名称完全匹配）
SELECT 
    '可以更新为 item' as type,
    sr.id,
    sr.name,
    sr.category as current_category,
    sie.name as item_name,
    'item' as new_category
FROM system_resources sr
INNER JOIN system_era_items sie ON (
    -- 情况1：资源名称包含"（物品）"，去掉后缀后匹配
    (sr.name LIKE '%（物品）%' AND TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
    OR
    -- 情况2：资源名称不包含后缀，直接匹配
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
)
WHERE sr.category != 'item'
ORDER BY sr.id
LIMIT 20;

-- 2. 检查可以匹配到 system_era_events 的资源（名称包含"（事件）"或名称完全匹配且不匹配items）
SELECT 
    '可以更新为 event' as type,
    sr.id,
    sr.name,
    sr.category as current_category,
    see.name as event_name,
    'event' as new_category
FROM system_resources sr
INNER JOIN system_era_events see ON (
    -- 情况1：资源名称包含"（事件）"，去掉后缀后匹配
    (sr.name LIKE '%（事件）%' AND TRIM(REPLACE(REPLACE(sr.name, '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', '')))
    OR
    -- 情况2：资源名称不包含后缀，直接匹配（但需要确保不匹配items）
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' 
     AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
     AND NOT EXISTS (
         SELECT 1 FROM system_era_items sie2 
         WHERE TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie2.name, ' ', ''))
     ))
)
WHERE sr.category != 'event'
ORDER BY sr.id
LIMIT 20;

-- 3. 统计需要更新的数量
SELECT 
    '统计 - items' as summary,
    COUNT(DISTINCT sr.id) as count_to_update
FROM system_resources sr
INNER JOIN system_era_items sie ON (
    (sr.name LIKE '%（物品）%' AND TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
)
WHERE sr.category != 'item'
UNION ALL
SELECT 
    '统计 - events' as summary,
    COUNT(DISTINCT sr.id) as count_to_update
FROM system_resources sr
INNER JOIN system_era_events see ON (
    (sr.name LIKE '%（事件）%' AND TRIM(REPLACE(REPLACE(sr.name, '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' 
     AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
     AND NOT EXISTS (
         SELECT 1 FROM system_era_items sie2 
         WHERE TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie2.name, ' ', ''))
     ))
)
WHERE sr.category != 'event';

-- ==========================================
-- 第二部分：更新资源类别
-- ==========================================

-- 1. 更新匹配到 system_era_items 的资源类别为 'item'
UPDATE system_resources sr
INNER JOIN system_era_items sie ON (
    (sr.name LIKE '%（物品）%' AND TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
)
SET sr.category = 'item'
WHERE sr.category != 'item';

-- 2. 更新匹配到 system_era_events 的资源类别为 'event'（排除已匹配items的）
UPDATE system_resources sr
INNER JOIN system_era_events see ON (
    (sr.name LIKE '%（事件）%' AND TRIM(REPLACE(REPLACE(sr.name, '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' 
     AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
     AND NOT EXISTS (
         SELECT 1 FROM system_era_items sie2 
         WHERE TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie2.name, ' ', ''))
     ))
)
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

-- 2. 显示更新后的示例
SELECT 
    '更新后的 item 示例' as type,
    sr.id,
    sr.name,
    sr.category,
    sie.name as item_name
FROM system_resources sr
INNER JOIN system_era_items sie ON (
    (sr.name LIKE '%（物品）%' AND TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie.name, ' ', '')))
)
WHERE sr.category = 'item'
LIMIT 10;

SELECT 
    '更新后的 event 示例' as type,
    sr.id,
    sr.name,
    sr.category,
    see.name as event_name
FROM system_resources sr
INNER JOIN system_era_events see ON (
    (sr.name LIKE '%（事件）%' AND TRIM(REPLACE(REPLACE(sr.name, '（事件）', ''), ' ', '')) = TRIM(REPLACE(see.name, ' ', '')))
    OR
    (sr.name NOT LIKE '%（物品）%' AND sr.name NOT LIKE '%（事件）%' 
     AND TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(see.name, ' ', ''))
     AND NOT EXISTS (
         SELECT 1 FROM system_era_items sie2 
         WHERE TRIM(REPLACE(sr.name, ' ', '')) = TRIM(REPLACE(sie2.name, ' ', ''))
     ))
)
WHERE sr.category = 'event'
LIMIT 10;
