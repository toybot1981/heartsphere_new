-- 分析 general 目录下的图片应该属于哪个 category
-- 通过查询数据库中的图片URL来确定正确的分类

-- 1. 检查 system_resources 表中使用 general 分类的资源
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'general/%' THEN '应该检查是否应该使用其他category'
        WHEN url LIKE '%/general/%' THEN '路径包含general，需要迁移'
        ELSE '路径正常'
    END as status
FROM system_resources
WHERE category = 'general' OR url LIKE '%/general/%'
ORDER BY created_at DESC;

-- 2. 检查 characters 表中的图片URL
SELECT 
    'characters' as table_name,
    id,
    name,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url需要迁移'
        WHEN background_url LIKE '%/general/%' THEN 'background_url需要迁移'
        ELSE '路径正常'
    END as status
FROM characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
LIMIT 50;

-- 3. 检查 eras 表中的图片URL
SELECT 
    'eras' as table_name,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url需要迁移'
        ELSE '路径正常'
    END as status
FROM eras
WHERE image_url LIKE '%/general/%'
LIMIT 50;

-- 4. 检查 journal_entries 表中的图片URL
SELECT 
    'journal_entries' as table_name,
    id,
    title,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url需要迁移到journal'
        ELSE '路径正常'
    END as status
FROM journal_entries
WHERE image_url LIKE '%/general/%'
LIMIT 50;

-- 5. 检查 system_characters 表中的图片URL
SELECT 
    'system_characters' as table_name,
    id,
    name,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url需要迁移到character'
        WHEN background_url LIKE '%/general/%' THEN 'background_url需要迁移到character'
        ELSE '路径正常'
    END as status
FROM system_characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
LIMIT 50;

-- 6. 检查 system_eras 表中的图片URL
SELECT 
    'system_eras' as table_name,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url需要迁移到era'
        ELSE '路径正常'
    END as status
FROM system_eras
WHERE image_url LIKE '%/general/%'
LIMIT 50;

-- 7. 检查 system_main_stories 表中的图片URL
SELECT 
    'system_main_stories' as table_name,
    id,
    title,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url需要迁移到character'
        WHEN background_url LIKE '%/general/%' THEN 'background_url需要迁移到character'
        ELSE '路径正常'
    END as status
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
LIMIT 50;

-- 8. 统计各表中使用 general 的图片数量
SELECT 
    'system_resources' as table_name,
    COUNT(*) as count_with_general
FROM system_resources
WHERE category = 'general' OR url LIKE '%/general/%'
UNION ALL
SELECT 
    'characters',
    COUNT(*)
FROM characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
UNION ALL
SELECT 
    'eras',
    COUNT(*)
FROM eras
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 
    'journal_entries',
    COUNT(*)
FROM journal_entries
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 
    'system_characters',
    COUNT(*)
FROM system_characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
UNION ALL
SELECT 
    'system_eras',
    COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 
    'system_main_stories',
    COUNT(*)
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%';
