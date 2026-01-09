-- 检查 general 相关的图片位置
-- general 图片应该存储在 general 目录下

-- 1. 检查 system_resources 表中 category='general' 的记录
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'general/%' OR url LIKE '%/general/%' THEN '正确：在general目录'
        WHEN url LIKE 'character/%' OR url LIKE '%/character/%' THEN '错误：应该在general目录'
        WHEN url LIKE 'era/%' OR url LIKE '%/era/%' THEN '错误：应该在general目录'
        WHEN url LIKE 'resource_general/%' OR url LIKE '%/resource_general/%' THEN '需要修复：resource_general改为general'
        WHEN url LIKE 'resource_character/%' OR url LIKE '%/resource_character/%' THEN '需要修复：resource_character改为general'
        ELSE '其他格式'
    END as status
FROM system_resources
WHERE category = 'general'
ORDER BY id;

-- 2. 统计需要修复的记录数
SELECT 
    'system_resources需要修复' as summary,
    COUNT(*) as count
FROM system_resources
WHERE category = 'general'
  AND ((url LIKE 'character/%' OR url LIKE '%/character/%')
   OR (url LIKE 'era/%' OR url LIKE '%/era/%')
   OR (url LIKE 'resource_general/%' OR url LIKE '%/resource_general/%')
   OR (url LIKE 'resource_character/%' OR url LIKE '%/resource_character/%'));

-- 3. 显示一些示例记录
SELECT 
    id,
    name,
    category,
    url
FROM system_resources
WHERE category = 'general'
  AND (url LIKE 'character/%' OR url LIKE '%/character/%')
LIMIT 20;
