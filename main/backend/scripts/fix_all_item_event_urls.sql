-- 更新所有 item 和 event 类别的资源 URL
-- 将 URL 从其他目录（general, character, scenario, era等）更新为 item/ 或 event/ 目录

SET NAMES utf8mb4;

-- ==========================================
-- 第一部分：检查需要更新的资源
-- ==========================================

-- 1. 检查 item 类别的资源，URL 不在 item 目录下的
SELECT 
    'item 需要更新' as type,
    COUNT(*) as count
FROM system_resources
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%';

-- 2. 检查 event 类别的资源，URL 不在 event 目录下的
SELECT 
    'event 需要更新' as type,
    COUNT(*) as count
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
-- 提取路径的最后两部分（year/month/filename 或 month/filename）
UPDATE system_resources
SET url = CONCAT('item/', 
    CASE 
        WHEN url LIKE '%/%/%/%' THEN SUBSTRING_INDEX(url, '/', -3)  -- 如果有4段路径（如 general/2025/12/xxx.png）
        WHEN url LIKE '%/%/%' THEN SUBSTRING_INDEX(url, '/', -2)    -- 如果有3段路径（如 general/12/xxx.png）
        WHEN url LIKE '%/%' THEN SUBSTRING_INDEX(url, '/', -1)       -- 如果只有2段路径（如 general/xxx.png）
        ELSE SUBSTRING_INDEX(url, '/', -1)                           -- 其他情况，只取文件名
    END
)
WHERE category = 'item'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'item/%'
  AND url IS NOT NULL
  AND url != '';

-- 2. 更新 event 类别的资源 URL
UPDATE system_resources
SET url = CONCAT('event/', 
    CASE 
        WHEN url LIKE '%/%/%/%' THEN SUBSTRING_INDEX(url, '/', -3)  -- 如果有4段路径（如 era/2025/12/xxx.png）
        WHEN url LIKE '%/%/%' THEN SUBSTRING_INDEX(url, '/', -2)    -- 如果有3段路径（如 general/12/xxx.png）
        WHEN url LIKE '%/%' THEN SUBSTRING_INDEX(url, '/', -1)       -- 如果只有2段路径（如 general/xxx.png）
        ELSE SUBSTRING_INDEX(url, '/', -1)                           -- 其他情况，只取文件名
    END
)
WHERE category = 'event'
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url NOT LIKE 'event/%'
  AND url IS NOT NULL
  AND url != '';

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
