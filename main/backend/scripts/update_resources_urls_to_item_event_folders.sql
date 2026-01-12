-- 更新资源管理中的图片 URL，将 item 和 event 类别的资源图片路径更新为对应的文件夹
-- 例如：general/2025/12/xxx.png -> item/2025/12/xxx.png 或 event/2025/12/xxx.png

SET NAMES utf8mb4;

-- ==========================================
-- 第一部分：检查需要更新的资源
-- ==========================================

-- 1. 检查 item 类别的资源，URL 不在 item 目录下的
SELECT 
    'item 需要更新' as type,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'item/%' THEN '已在 item 目录'
        WHEN url LIKE 'event/%' THEN '错误：在 event 目录'
        WHEN url LIKE 'general/%' THEN '需要更新：从 general 到 item'
        WHEN url LIKE 'character/%' THEN '需要更新：从 character 到 item'
        WHEN url LIKE 'scenario/%' THEN '需要更新：从 scenario 到 item'
        ELSE '其他路径'
    END as status
FROM system_resources
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%'
ORDER BY id
LIMIT 20;

-- 2. 检查 event 类别的资源，URL 不在 event 目录下的
SELECT 
    'event 需要更新' as type,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'event/%' THEN '已在 event 目录'
        WHEN url LIKE 'item/%' THEN '错误：在 item 目录'
        WHEN url LIKE 'general/%' THEN '需要更新：从 general 到 event'
        WHEN url LIKE 'character/%' THEN '需要更新：从 character 到 event'
        WHEN url LIKE 'scenario/%' THEN '需要更新：从 scenario 到 event'
        ELSE '其他路径'
    END as status
FROM system_resources
WHERE category = 'event'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'event/%'
ORDER BY id
LIMIT 20;

-- 3. 统计需要更新的数量
SELECT 
    '统计 - item' as summary,
    COUNT(*) as count_to_update
FROM system_resources
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%'
UNION ALL
SELECT 
    '统计 - event' as summary,
    COUNT(*) as count_to_update
FROM system_resources
WHERE category = 'event'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'event/%';

-- ==========================================
-- 第二部分：更新资源 URL
-- ==========================================

-- 1. 更新 item 类别的资源 URL
UPDATE system_resources
SET url = CONCAT('item/', SUBSTRING_INDEX(url, '/', -2))
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%'
  AND url LIKE '%/%/%';  -- 确保有路径结构（如 general/2025/12/xxx.png）

-- 2. 更新 event 类别的资源 URL
UPDATE system_resources
SET url = CASE 
    WHEN url LIKE '%/%/%/%' THEN CONCAT('event/', SUBSTRING_INDEX(url, '/', -3))  -- 如果有4段路径（如 era/2025/12/xxx.png）
    WHEN url LIKE '%/%/%' THEN CONCAT('event/', SUBSTRING_INDEX(url, '/', -2))    -- 如果有3段路径（如 general/12/xxx.png）
    ELSE url
END
WHERE category = 'event'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'event/%'
  AND (url LIKE '%/%/%' OR url LIKE '%/%/%/%');  -- 确保有路径结构

-- ==========================================
-- 第三部分：验证更新结果
-- ==========================================

-- 1. 检查更新后的 URL 分布
SELECT 
    '更新后的 URL 分布' as summary,
    category,
    CASE 
        WHEN url LIKE 'item/%' THEN 'item 目录'
        WHEN url LIKE 'event/%' THEN 'event 目录'
        WHEN url LIKE 'placeholder://%' THEN '占位符'
        ELSE '其他'
    END as url_location,
    COUNT(*) as count
FROM system_resources
WHERE category IN ('item', 'event')
GROUP BY category, url_location
ORDER BY category, url_location;

-- 2. 检查是否还有需要更新的资源
SELECT 
    '剩余问题 - item' as type,
    COUNT(*) as count
FROM system_resources
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%'
UNION ALL
SELECT 
    '剩余问题 - event' as type,
    COUNT(*) as count
FROM system_resources
WHERE category = 'event'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'event/%';

-- 3. 显示更新后的示例
SELECT 
    '更新后的 item 示例' as type,
    id,
    name,
    category,
    url
FROM system_resources
WHERE category = 'item'
  AND url LIKE 'item/%'
LIMIT 10;

SELECT 
    '更新后的 event 示例' as type,
    id,
    name,
    category,
    url
FROM system_resources
WHERE category = 'event'
  AND url LIKE 'event/%'
LIMIT 10;
