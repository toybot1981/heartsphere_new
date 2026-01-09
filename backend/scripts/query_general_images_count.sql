-- 快速统计使用 general 分类的图片数量
-- 此脚本只返回统计信息，不返回详细记录

-- 统计汇总
SELECT 
    'system_resources' as table_name,
    'category=general 或 url包含general' as condition,
    COUNT(*) as count
FROM system_resources
WHERE category = 'general' OR url LIKE '%/general/%' OR url LIKE 'general/%'
UNION ALL
SELECT 
    'characters',
    'avatar_url或background_url包含general',
    COUNT(*)
FROM characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
UNION ALL
SELECT 
    'eras',
    'image_url包含general',
    COUNT(*)
FROM eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    'journal_entries',
    'image_url包含general',
    COUNT(*)
FROM journal_entries
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    'system_characters',
    'avatar_url或background_url包含general',
    COUNT(*)
FROM system_characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
UNION ALL
SELECT 
    'system_eras',
    'image_url包含general',
    COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    'system_main_stories',
    'avatar_url或background_url包含general',
    COUNT(*)
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%';
