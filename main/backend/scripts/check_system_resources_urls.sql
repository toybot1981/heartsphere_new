-- 检查 system_resources 表中的 URL 路径
-- 查看哪些记录的 URL 还包含 general 或路径不正确

SELECT 
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE '%/general/%' THEN 'URL包含general，需要修复'
        WHEN url LIKE 'general/%' THEN 'URL以general开头，需要修复'
        WHEN category = 'character' AND url NOT LIKE '%/character/%' AND url NOT LIKE 'character/%' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%' THEN 'category是character但URL路径不匹配'
        WHEN category = 'era' AND url NOT LIKE '%/era/%' AND url NOT LIKE 'era/%' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%' THEN 'category是era但URL路径不匹配'
        WHEN category = 'journal' AND url NOT LIKE '%/journal/%' AND url NOT LIKE 'journal/%' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%' THEN 'category是journal但URL路径不匹配'
        ELSE 'URL路径正常'
    END as issue_type
FROM system_resources
WHERE url LIKE '%/general/%' 
   OR url LIKE 'general/%'
   OR (category = 'character' AND url NOT LIKE '%/character/%' AND url NOT LIKE 'character/%' AND url NOT LIKE '%/resource_character/%' AND url NOT LIKE 'resource_character/%')
   OR (category = 'era' AND url NOT LIKE '%/era/%' AND url NOT LIKE 'era/%' AND url NOT LIKE '%/resource_era/%' AND url NOT LIKE 'resource_era/%')
   OR (category = 'journal' AND url NOT LIKE '%/journal/%' AND url NOT LIKE 'journal/%' AND url NOT LIKE '%/resource_journal/%' AND url NOT LIKE 'resource_journal/%')
ORDER BY created_at DESC
LIMIT 100;

-- 统计各分类的URL格式
SELECT 
    category,
    CASE 
        WHEN url LIKE 'resource_%' THEN '使用resource_前缀'
        WHEN url LIKE '%/resource_%' THEN '路径中包含resource_'
        WHEN url LIKE 'character/%' OR url LIKE '%/character/%' THEN '直接使用character'
        WHEN url LIKE 'era/%' OR url LIKE '%/era/%' THEN '直接使用era'
        WHEN url LIKE 'journal/%' OR url LIKE '%/journal/%' THEN '直接使用journal'
        WHEN url LIKE 'general/%' OR url LIKE '%/general/%' THEN '使用general（错误）'
        ELSE '其他格式'
    END as url_format,
    COUNT(*) as count
FROM system_resources
GROUP BY category, url_format
ORDER BY category, url_format;
