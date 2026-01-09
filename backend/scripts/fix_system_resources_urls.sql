-- 修复 system_resources 表中的 URL 路径
-- 确保 URL 路径与 category 字段匹配，并使用 resource_ 前缀

-- ==========================================
-- 第一部分：修复包含 general 的 URL
-- ==========================================

-- 1. 如果 category='character' 且 URL 包含 general，替换为 resource_character
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_character/')
WHERE category = 'character' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_character/')
WHERE category = 'character' 
  AND url LIKE 'general/%';

-- 2. 如果 category='era' 且 URL 包含 general，替换为 resource_era
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_era/')
WHERE category = 'era' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_era/')
WHERE category = 'era' 
  AND url LIKE 'general/%';

-- 3. 如果 category='journal' 且 URL 包含 general，替换为 resource_journal
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_journal/')
WHERE category = 'journal' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_journal/')
WHERE category = 'journal' 
  AND url LIKE 'general/%';

-- 4. 如果 category='avatar' 且 URL 包含 general，替换为 resource_avatar
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_avatar/')
WHERE category = 'avatar' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_avatar/')
WHERE category = 'avatar' 
  AND url LIKE 'general/%';

-- 5. 如果 category='scenario' 且 URL 包含 general，替换为 resource_scenario
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_scenario/')
WHERE category = 'scenario' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_scenario/')
WHERE category = 'scenario' 
  AND url LIKE 'general/%';

-- 5a. 如果 category='item' 且 URL 包含 general，替换为 resource_item
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_item/')
WHERE category = 'item' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_item/')
WHERE category = 'item' 
  AND url LIKE 'general/%';

-- 5b. 如果 category='general' 且 URL 包含 general，替换为 resource_general
-- 注意：category='general' 的记录可能需要手动检查并更新category
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/resource_general/')
WHERE category = 'general' 
  AND (url LIKE '%/general/%' OR url LIKE 'general/%');

UPDATE system_resources
SET url = REPLACE(url, 'general/', 'resource_general/')
WHERE category = 'general' 
  AND url LIKE 'general/%';

-- ==========================================
-- 第二部分：修复路径不匹配的问题
-- ==========================================

-- 6. 如果 category='character' 但 URL 是 character/ 而不是 resource_character/
UPDATE system_resources
SET url = REPLACE(url, '/character/', '/resource_character/')
WHERE category = 'character' 
  AND url LIKE '%/character/%' 
  AND url NOT LIKE '%/resource_character/%';

UPDATE system_resources
SET url = REPLACE(url, 'character/', 'resource_character/')
WHERE category = 'character' 
  AND url LIKE 'character/%' 
  AND url NOT LIKE 'resource_character/%';

-- 7. 如果 category='era' 但 URL 是 era/ 而不是 resource_era/
UPDATE system_resources
SET url = REPLACE(url, '/era/', '/resource_era/')
WHERE category = 'era' 
  AND url LIKE '%/era/%' 
  AND url NOT LIKE '%/resource_era/%';

UPDATE system_resources
SET url = REPLACE(url, 'era/', 'resource_era/')
WHERE category = 'era' 
  AND url LIKE 'era/%' 
  AND url NOT LIKE 'resource_era/%';

-- 8. 如果 category='journal' 但 URL 是 journal/ 而不是 resource_journal/
UPDATE system_resources
SET url = REPLACE(url, '/journal/', '/resource_journal/')
WHERE category = 'journal' 
  AND url LIKE '%/journal/%' 
  AND url NOT LIKE '%/resource_journal/%';

UPDATE system_resources
SET url = REPLACE(url, 'journal/', 'resource_journal/')
WHERE category = 'journal' 
  AND url LIKE 'journal/%' 
  AND url NOT LIKE 'resource_journal/%';

-- ==========================================
-- 第三部分：验证修复结果
-- ==========================================

-- 检查是否还有问题
SELECT 
    '修复后检查' as check_type,
    category,
    CASE 
        WHEN url LIKE '%/general/%' OR url LIKE 'general/%' THEN '仍有general路径'
        WHEN category = 'character' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%' THEN 'character路径不匹配'
        WHEN category = 'era' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%' THEN 'era路径不匹配'
        WHEN category = 'journal' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%' THEN 'journal路径不匹配'
        WHEN category = 'avatar' AND url NOT LIKE '%/resource_avatar/%' AND url NOT LIKE 'resource_avatar/%' THEN 'avatar路径不匹配'
        WHEN category = 'scenario' AND url NOT LIKE '%/resource_scenario/%' AND url NOT LIKE 'resource_scenario/%' THEN 'scenario路径不匹配'
        WHEN category = 'general' THEN 'category为general（可能需要手动处理）'
        ELSE '路径正常'
    END as status,
    COUNT(*) as count
FROM system_resources
GROUP BY category, status
HAVING status != '路径正常' OR category = 'general'
ORDER BY category, status;

-- 显示一些示例记录
SELECT 
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE '%/general/%' OR url LIKE 'general/%' THEN '仍有general路径'
        WHEN category = 'character' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%' THEN 'character路径不匹配'
        WHEN category = 'era' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%' THEN 'era路径不匹配'
        WHEN category = 'journal' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%' THEN 'journal路径不匹配'
        ELSE '路径正常'
    END as status
FROM system_resources
WHERE url LIKE '%/general/%' 
   OR url LIKE 'general/%'
   OR (category = 'character' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%')
   OR (category = 'era' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%')
   OR (category = 'journal' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%')
LIMIT 20;
