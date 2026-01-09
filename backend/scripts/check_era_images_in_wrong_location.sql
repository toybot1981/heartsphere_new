-- 检查 era 相关的图片是否被错误地存储在 character 目录下
-- 基于数据库中的记录来确定正确的文件位置

-- 1. 检查 system_eras 表中的图片URL
SELECT 
    'system_eras' as table_name,
    id,
    name,
    image_url,
    CASE 
        WHEN image_url LIKE 'character/%' OR image_url LIKE '%/character/%' THEN '错误：应该在era目录'
        WHEN image_url LIKE 'era/%' OR image_url LIKE '%/era/%' THEN '正确：在era目录'
        WHEN image_url LIKE 'resource_era/%' OR image_url LIKE '%/resource_era/%' THEN '需要修复：resource_era改为era'
        ELSE '其他格式'
    END as status
FROM system_eras
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%'
ORDER BY id;

-- 2. 检查 system_resources 表中 category='era' 的记录
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url,
    CASE 
        WHEN url LIKE 'character/%' OR url LIKE '%/character/%' THEN '错误：应该在era目录'
        WHEN url LIKE 'era/%' OR url LIKE '%/era/%' THEN '正确：在era目录'
        WHEN url LIKE 'resource_era/%' OR url LIKE '%/resource_era/%' THEN '需要修复：resource_era改为era'
        ELSE '其他格式'
    END as status
FROM system_resources
WHERE category = 'era'
ORDER BY id;

-- 3. 统计需要修复的记录数
SELECT 
    'system_eras需要修复' as summary,
    COUNT(*) as count
FROM system_eras
WHERE (image_url LIKE 'character/%' OR image_url LIKE '%/character/%')
   OR (image_url LIKE 'resource_era/%' OR image_url LIKE '%/resource_era/%')
UNION ALL
SELECT 
    'system_resources需要修复',
    COUNT(*)
FROM system_resources
WHERE category = 'era'
  AND ((url LIKE 'character/%' OR url LIKE '%/character/%')
   OR (url LIKE 'resource_era/%' OR url LIKE '%/resource_era/%'));
