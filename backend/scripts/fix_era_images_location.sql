-- 修复 era 相关图片的位置
-- 1. 将数据库中的 URL 从 character 改为 era
-- 2. 将 resource_era 改为 era

-- ==========================================
-- 第一部分：修复 system_eras 表
-- ==========================================

-- 1. 修复 image_url：character -> era（错误位置的图片）
UPDATE system_eras
SET image_url = REPLACE(image_url, '/character/', '/era/')
WHERE image_url LIKE '%/character/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'character/', 'era/')
WHERE image_url LIKE 'character/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

-- 2. 修复 image_url：resource_era -> era
UPDATE system_eras
SET image_url = REPLACE(image_url, '/resource_era/', '/era/')
WHERE image_url LIKE '%/resource_era/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'resource_era/', 'era/')
WHERE image_url LIKE 'resource_era/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

-- 3. 处理 localhost URL 中的 resource_era
UPDATE system_eras
SET image_url = REPLACE(image_url, '/resource_era/', '/era/')
WHERE image_url LIKE '%/resource_era/%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'resource_era/', 'era/')
WHERE image_url LIKE 'resource_era/%';

-- ==========================================
-- 第二部分：修复 system_resources 表（category='era'）
-- ==========================================

-- 4. 修复 url：character -> era（错误位置的图片）
UPDATE system_resources
SET url = REPLACE(url, '/character/', '/era/')
WHERE category = 'era'
  AND (url LIKE '%/character/%' OR url LIKE 'character/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 5. 修复 url：resource_era -> era
UPDATE system_resources
SET url = REPLACE(url, '/resource_era/', '/era/')
WHERE category = 'era'
  AND (url LIKE '%/resource_era/%' OR url LIKE 'resource_era/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- ==========================================
-- 第三部分：验证修复结果
-- ==========================================

-- 检查是否还有问题
SELECT 
    'system_eras' as table_name,
    COUNT(*) as remaining_issues
FROM system_eras
WHERE (image_url LIKE 'character/%' OR image_url LIKE '%/character/%')
   OR (image_url LIKE 'resource_era/%' OR image_url LIKE '%/resource_era/%')
UNION ALL
SELECT 
    'system_resources',
    COUNT(*)
FROM system_resources
WHERE category = 'era'
  AND ((url LIKE 'character/%' OR url LIKE '%/character/%')
   OR (url LIKE 'resource_era/%' OR url LIKE '%/resource_era/%'));

-- 显示一些示例记录
SELECT 
    'system_eras示例' as note,
    id,
    name,
    image_url
FROM system_eras
WHERE image_url LIKE 'era/%' OR image_url LIKE '%/era/%'
LIMIT 5;

SELECT 
    'system_resources示例' as note,
    id,
    name,
    category,
    url
FROM system_resources
WHERE category = 'era'
  AND (url LIKE 'era/%' OR url LIKE '%/era/%')
LIMIT 5;
