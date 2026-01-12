-- 生成 general 图片使用情况报告
-- 此脚本会查询所有使用 general 分类的图片记录

-- 1. system_resources 表中使用 general 分类的资源
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'general/%' THEN '路径以general开头'
        WHEN url LIKE '%/general/%' THEN '路径包含general'
        WHEN category = 'general' THEN '分类为general'
        ELSE '其他'
    END as issue_type,
    created_at
FROM system_resources
WHERE category = 'general' OR url LIKE '%/general/%' OR url LIKE 'general/%'
ORDER BY created_at DESC;

-- 2. characters 表中的图片URL（用户角色）
SELECT 
    'characters' as table_name,
    id,
    name,
    user_id,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url包含general'
        WHEN background_url LIKE '%/general/%' THEN 'background_url包含general'
        WHEN avatar_url LIKE 'general/%' THEN 'avatar_url以general开头'
        WHEN background_url LIKE 'general/%' THEN 'background_url以general开头'
        ELSE '其他'
    END as issue_type,
    created_at
FROM characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 3. eras 表中的图片URL（用户时代）
SELECT 
    'eras' as table_name,
    id,
    name,
    user_id,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url包含general'
        WHEN image_url LIKE 'general/%' THEN 'image_url以general开头'
        ELSE '其他'
    END as issue_type,
    created_at
FROM eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 4. journal_entries 表中的图片URL（日记）
SELECT 
    'journal_entries' as table_name,
    id,
    title,
    user_id,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url包含general，应该迁移到journal'
        WHEN image_url LIKE 'general/%' THEN 'image_url以general开头，应该迁移到journal'
        ELSE '其他'
    END as issue_type,
    created_at
FROM journal_entries
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 5. system_characters 表中的图片URL（系统角色）
SELECT 
    'system_characters' as table_name,
    id,
    name,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url包含general，应该迁移到character'
        WHEN background_url LIKE '%/general/%' THEN 'background_url包含general，应该迁移到character'
        WHEN avatar_url LIKE 'general/%' THEN 'avatar_url以general开头，应该迁移到character'
        WHEN background_url LIKE 'general/%' THEN 'background_url以general开头，应该迁移到character'
        ELSE '其他'
    END as issue_type,
    created_at
FROM system_characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 6. system_eras 表中的图片URL（系统时代）
SELECT 
    'system_eras' as table_name,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE '%/general/%' THEN 'image_url包含general，应该迁移到era'
        WHEN image_url LIKE 'general/%' THEN 'image_url以general开头，应该迁移到era'
        ELSE '其他'
    END as issue_type,
    created_at
FROM system_eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 7. system_main_stories 表中的图片URL（系统主线故事）
SELECT 
    'system_main_stories' as table_name,
    id,
    title,
    avatar_url,
    background_url,
    CASE 
        WHEN avatar_url LIKE '%/general/%' THEN 'avatar_url包含general，应该迁移到character'
        WHEN background_url LIKE '%/general/%' THEN 'background_url包含general，应该迁移到character'
        WHEN avatar_url LIKE 'general/%' THEN 'avatar_url以general开头，应该迁移到character'
        WHEN background_url LIKE 'general/%' THEN 'background_url以general开头，应该迁移到character'
        ELSE '其他'
    END as issue_type,
    created_at
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
ORDER BY created_at DESC
LIMIT 50;

-- 8. 统计汇总
SELECT 
    '统计汇总' as summary,
    'system_resources' as table_name,
    COUNT(*) as count_with_general
FROM system_resources
WHERE category = 'general' OR url LIKE '%/general/%' OR url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'characters',
    COUNT(*)
FROM characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'eras',
    COUNT(*)
FROM eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'journal_entries',
    COUNT(*)
FROM journal_entries
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'system_characters',
    COUNT(*)
FROM system_characters
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'system_eras',
    COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/general/%' OR image_url LIKE 'general/%'
UNION ALL
SELECT 
    '统计汇总',
    'system_main_stories',
    COUNT(*)
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' 
   OR background_url LIKE '%/general/%'
   OR avatar_url LIKE 'general/%'
   OR background_url LIKE 'general/%';
