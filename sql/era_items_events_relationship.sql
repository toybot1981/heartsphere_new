-- ============================================
-- 物品和事件与时代关系查询
-- 生成时间: 2025-12-28
-- ============================================

-- 1. 查看所有时代及其物品、事件统计
SELECT
    e.id AS era_id,
    e.name AS era_name,
    e.description AS era_description,
    COUNT(DISTINCT i.id) AS item_count,
    COUNT(DISTINCT ev.id) AS event_count,
    GROUP_CONCAT(DISTINCT i.name ORDER BY i.sort_order SEPARATOR ', ') AS items,
    GROUP_CONCAT(DISTINCT ev.name ORDER BY ev.sort_order SEPARATOR ', ') AS events
FROM system_eras e
LEFT JOIN system_era_items i ON e.id = i.system_era_id AND i.is_active = 1
LEFT JOIN system_era_events ev ON e.id = ev.system_era_id AND ev.is_active = 1
WHERE e.id IN (23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43)
GROUP BY e.id, e.name, e.description
ORDER BY e.id;

-- 2. 查看所有物品及其所属时代
SELECT
    i.id AS item_id,
    i.item_id AS item_code,
    i.name AS item_name,
    i.description AS item_description,
    e.id AS era_id,
    e.name AS era_name
FROM system_era_items i
JOIN system_eras e ON i.system_era_id = e.id
WHERE i.is_active = 1
ORDER BY e.id, i.sort_order;

-- 3. 查看所有事件及其所属时代
SELECT
    ev.id AS event_id,
    ev.event_id AS event_code,
    ev.name AS event_name,
    ev.description AS event_description,
    e.id AS era_id,
    e.name AS era_name
FROM system_era_events ev
JOIN system_eras e ON ev.system_era_id = e.id
WHERE ev.is_active = 1
ORDER BY e.id, ev.sort_order;

-- 4. 统计每个时代的物品和事件数量
SELECT
    e.id AS era_id,
    e.name AS era_name,
    COUNT(DISTINCT i.id) AS item_count,
    COUNT(DISTINCT ev.id) AS event_count
FROM system_eras e
LEFT JOIN system_era_items i ON e.id = i.system_era_id AND i.is_active = 1
LEFT JOIN system_era_events ev ON e.id = ev.system_era_id AND ev.is_active = 1
GROUP BY e.id, e.name
ORDER BY e.id;

-- 5. 查找未匹配的物品（如果有的话）
SELECT
    i.id,
    i.item_id,
    i.name,
    i.description
FROM system_era_items i
WHERE i.system_era_id IS NULL AND i.is_active = 1;

-- 6. 查找未匹配的事件（如果有的话）
SELECT
    ev.id,
    ev.event_id,
    ev.name,
    ev.description
FROM system_era_events ev
WHERE ev.system_era_id IS NULL AND ev.is_active = 1;

-- 7. 查看特定时代（如：我的大学）的所有物品和事件
SELECT
    'Item' AS type,
    i.item_id AS code,
    i.name AS name,
    i.description AS description,
    i.sort_order
FROM system_era_items i
WHERE i.system_era_id = 23 AND i.is_active = 1
UNION ALL
SELECT
    'Event' AS type,
    ev.event_id AS code,
    ev.name AS name,
    ev.description AS description,
    ev.sort_order
FROM system_era_events ev
WHERE ev.system_era_id = 23 AND ev.is_active = 1
ORDER BY sort_order;

-- ============================================
-- 数据完整性验证
-- ============================================

-- 验证1: 检查是否有物品或事件的system_era_id为NULL
SELECT
    'Items without era' AS check_type,
    COUNT(*) AS count
FROM system_era_items
WHERE system_era_id IS NULL AND is_active = 1
UNION ALL
SELECT
    'Events without era' AS check_type,
    COUNT(*) AS count
FROM system_era_events
WHERE system_era_id IS NULL AND is_active = 1;

-- 验证2: 检查每个时代是否至少有8个物品和8个事件
SELECT
    e.id AS era_id,
    e.name AS era_name,
    COUNT(DISTINCT i.id) AS item_count,
    COUNT(DISTINCT ev.id) AS event_count,
    CASE
        WHEN COUNT(DISTINCT i.id) < 8 THEN 'WARNING: Less than 8 items'
        WHEN COUNT(DISTINCT ev.id) < 8 THEN 'WARNING: Less than 8 events'
        ELSE 'OK'
    END AS status
FROM system_eras e
LEFT JOIN system_era_items i ON e.id = i.system_era_id AND i.is_active = 1
LEFT JOIN system_era_events ev ON e.id = ev.system_era_id AND ev.is_active = 1
WHERE e.id IN (23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 40, 41, 42, 43)
GROUP BY e.id, e.name
ORDER BY e.id;

-- ============================================
-- 说明
-- ============================================
-- 本SQL文件包含了所有用于查询物品、事件和时代关系的SQL语句
-- 可以用于：
-- 1. 验证数据完整性
-- 2. 生成报告
-- 3. 查看特定时代的内容
-- 4. 检查数据匹配状态
-- ============================================
