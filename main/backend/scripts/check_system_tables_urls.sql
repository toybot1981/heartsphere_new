-- 检查系统预置表（system_characters, system_eras, system_main_stories）中的图片URL
-- 查看哪些记录的URL需要根据system_resources进行更新

-- 1. 检查 system_characters 表
SELECT 
    'system_characters' as table_name,
    id,
    name,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' OR avatar_url LIKE 'general/%' THEN 'avatar_url包含general'
        WHEN background_url LIKE '%/general/%' OR background_url LIKE 'general/%' THEN 'background_url包含general'
        WHEN avatar_url LIKE '%/resource_%' OR avatar_url LIKE 'resource_%' THEN 'avatar_url使用resource_前缀（正确）'
        WHEN background_url LIKE '%/resource_%' OR background_url LIKE 'resource_%' THEN 'background_url使用resource_前缀（正确）'
        WHEN avatar_url LIKE 'character/%' OR avatar_url LIKE '%/character/%' THEN 'avatar_url直接使用character（可能需要更新）'
        WHEN background_url LIKE 'character/%' OR background_url LIKE '%/character/%' THEN 'background_url直接使用character（可能需要更新）'
        ELSE '其他格式'
    END as issue_type
FROM system_characters
WHERE avatar_url LIKE '%/general/%' 
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE '%/general/%'
   OR background_url LIKE 'general/%'
   OR (avatar_url LIKE 'character/%' OR avatar_url LIKE '%/character/%')
   OR (background_url LIKE 'character/%' OR background_url LIKE '%/character/%')
ORDER BY id
LIMIT 50;

-- 2. 检查 system_eras 表
SELECT 
    'system_eras' as table_name,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' OR image_url LIKE 'general/%' THEN 'image_url包含general'
        WHEN image_url LIKE '%/resource_%' OR image_url LIKE 'resource_%' THEN 'image_url使用resource_前缀（正确）'
        WHEN image_url LIKE 'era/%' OR image_url LIKE '%/era/%' THEN 'image_url直接使用era（可能需要更新）'
        ELSE '其他格式'
    END as issue_type
FROM system_eras
WHERE image_url LIKE '%/general/%' 
   OR image_url LIKE 'general/%'
   OR (image_url LIKE 'era/%' OR image_url LIKE '%/era/%')
ORDER BY id
LIMIT 50;

-- 3. 检查 system_main_stories 表
SELECT 
    'system_main_stories' as table_name,
    id,
    name,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' OR avatar_url LIKE 'general/%' THEN 'avatar_url包含general'
        WHEN background_url LIKE '%/general/%' OR background_url LIKE 'general/%' THEN 'background_url包含general'
        WHEN avatar_url LIKE '%/resource_%' OR avatar_url LIKE 'resource_%' THEN 'avatar_url使用resource_前缀（正确）'
        WHEN background_url LIKE '%/resource_%' OR background_url LIKE 'resource_%' THEN 'background_url使用resource_前缀（正确）'
        WHEN avatar_url LIKE 'character/%' OR avatar_url LIKE '%/character/%' THEN 'avatar_url直接使用character（可能需要更新）'
        WHEN background_url LIKE 'character/%' OR background_url LIKE '%/character/%' THEN 'background_url直接使用character（可能需要更新）'
        ELSE '其他格式'
    END as issue_type
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' 
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE '%/general/%'
   OR background_url LIKE 'general/%'
   OR (avatar_url LIKE 'character/%' OR avatar_url LIKE '%/character/%')
   OR (background_url LIKE 'character/%' OR background_url LIKE '%/character/%')
ORDER BY id
LIMIT 50;

-- 4. 统计需要修复的记录数
SELECT 
    'system_characters' as table_name,
    COUNT(*) as need_fix_count
FROM system_characters
WHERE avatar_url LIKE '%/general/%' 
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE '%/general/%'
   OR background_url LIKE 'general/%'
UNION ALL
SELECT 
    'system_eras',
    COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/general/%' 
   OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    'system_main_stories',
    COUNT(*)
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' 
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE '%/general/%'
   OR background_url LIKE 'general/%';
