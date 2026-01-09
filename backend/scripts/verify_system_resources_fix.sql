-- 验证 system_resources 表的 URL 修复结果

-- 1. 统计各分类的URL格式
SELECT 
    category,
    CASE 
        WHEN url LIKE 'resource_%' THEN '使用resource_前缀（正确）'
        WHEN url LIKE '%/resource_%' THEN '路径中包含resource_（正确）'
        WHEN url LIKE 'character/%' OR url LIKE '%/character/%' THEN '直接使用character（需要修复）'
        WHEN url LIKE 'era/%' OR url LIKE '%/era/%' THEN '直接使用era（需要修复）'
        WHEN url LIKE 'journal/%' OR url LIKE '%/journal/%' THEN '直接使用journal（需要修复）'
        WHEN url LIKE 'general/%' OR url LIKE '%/general/%' THEN '使用general（需要修复）'
        ELSE '其他格式'
    END as url_format,
    COUNT(*) as count
FROM system_resources
GROUP BY category, url_format
ORDER BY category, url_format;

-- 2. 检查还有问题的记录
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
        WHEN category = 'avatar' AND url NOT LIKE '%/resource_avatar/%' AND url NOT LIKE 'resource_avatar/%' THEN 'avatar路径不匹配'
        WHEN category = 'scenario' AND url NOT LIKE '%/resource_scenario/%' AND url NOT LIKE 'resource_scenario/%' THEN 'scenario路径不匹配'
        WHEN category = 'item' AND url NOT LIKE '%/resource_item/%' AND url NOT LIKE 'resource_item/%' THEN 'item路径不匹配'
        WHEN category = 'general' AND url NOT LIKE '%/resource_general/%' AND url NOT LIKE 'resource_general/%' THEN 'general路径不匹配'
        ELSE '路径正常'
    END as status
FROM system_resources
WHERE url LIKE '%/general/%' 
   OR url LIKE 'general/%'
   OR (category = 'character' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%')
   OR (category = 'era' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%')
   OR (category = 'journal' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%')
   OR (category = 'avatar' AND url NOT LIKE '%/resource_avatar/%' AND url NOT LIKE 'resource_avatar/%')
   OR (category = 'scenario' AND url NOT LIKE '%/resource_scenario/%' AND url NOT LIKE 'resource_scenario/%')
   OR (category = 'item' AND url NOT LIKE '%/resource_item/%' AND url NOT LIKE 'resource_item/%')
   OR (category = 'general' AND url NOT LIKE '%/resource_general/%' AND url NOT LIKE 'resource_general/%')
ORDER BY category, id
LIMIT 50;

-- 3. 统计修复结果
SELECT 
    '修复结果统计' as summary,
    COUNT(*) as total_records,
    SUM(CASE WHEN url LIKE 'resource_%' OR url LIKE '%/resource_%' THEN 1 ELSE 0 END) as correct_format_count,
    SUM(CASE WHEN url LIKE '%/general/%' OR url LIKE 'general/%' THEN 1 ELSE 0 END) as still_has_general,
    SUM(CASE 
        WHEN category = 'character' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%' THEN 1
        WHEN category = 'era' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%' THEN 1
        WHEN category = 'journal' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%' THEN 1
        ELSE 0
    END) as path_mismatch_count
FROM system_resources;
