-- 检查 avatar 相关的图片位置
-- avatar 图片应该存储在 character 目录下

-- 1. 检查 system_resources 表中 category='avatar' 的记录
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'character/%' OR url LIKE '%/character/%' THEN '正确：在character目录'
        WHEN url LIKE 'resource_avatar/%' OR url LIKE '%/resource_avatar/%' THEN '需要修复：resource_avatar改为character'
        WHEN url LIKE 'avatar/%' OR url LIKE '%/avatar/%' THEN '需要修复：avatar改为character'
        WHEN url LIKE 'era/%' OR url LIKE '%/era/%' THEN '错误：应该在character目录'
        WHEN url LIKE 'general/%' OR url LIKE '%/general/%' THEN '错误：应该在character目录'
        ELSE '其他格式'
    END as status
FROM system_resources
WHERE category = 'avatar'
ORDER BY id;

-- 2. 检查 system_characters 表中的 avatar_url
SELECT 
    'system_characters' as table_name,
    id,
    name,
    avatar_url,
    CASE 
        WHEN avatar_url LIKE 'character/%' OR avatar_url LIKE '%/character/%' THEN '正确：在character目录'
        WHEN avatar_url LIKE 'resource_character/%' OR avatar_url LIKE '%/resource_character/%' THEN '需要修复：resource_character改为character'
        WHEN avatar_url LIKE 'resource_avatar/%' OR avatar_url LIKE '%/resource_avatar/%' THEN '需要修复：resource_avatar改为character'
        WHEN avatar_url LIKE 'avatar/%' OR avatar_url LIKE '%/avatar/%' THEN '需要修复：avatar改为character'
        WHEN avatar_url LIKE 'era/%' OR avatar_url LIKE '%/era/%' THEN '错误：应该在character目录'
        WHEN avatar_url LIKE 'general/%' OR avatar_url LIKE '%/general/%' THEN '错误：应该在character目录'
        ELSE '其他格式'
    END as status
FROM system_characters
WHERE avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
ORDER BY id
LIMIT 50;

-- 3. 统计需要修复的记录数
SELECT 
    'system_resources需要修复' as summary,
    COUNT(*) as count
FROM system_resources
WHERE category = 'avatar'
  AND ((url LIKE 'resource_avatar/%' OR url LIKE '%/resource_avatar/%')
   OR (url LIKE 'avatar/%' OR url LIKE '%/avatar/%')
   OR (url LIKE 'era/%' OR url LIKE '%/era/%')
   OR (url LIKE 'general/%' OR url LIKE '%/general/%'))
UNION ALL
SELECT 
    'system_characters需要修复',
    COUNT(*)
FROM system_characters
WHERE avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
  AND ((avatar_url LIKE 'resource_character/%' OR avatar_url LIKE '%/resource_character/%')
   OR (avatar_url LIKE 'resource_avatar/%' OR avatar_url LIKE '%/resource_avatar/%')
   OR (avatar_url LIKE 'avatar/%' OR avatar_url LIKE '%/avatar/%')
   OR (avatar_url LIKE 'era/%' OR avatar_url LIKE '%/era/%')
   OR (avatar_url LIKE 'general/%' OR avatar_url LIKE '%/general/%'));
