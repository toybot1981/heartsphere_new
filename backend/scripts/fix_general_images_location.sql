-- 修复 general 相关图片的位置
-- general 图片应该存储在 general 目录下

-- ==========================================
-- 第一部分：修复 system_resources 表（category='general'）
-- ==========================================

-- 1. 修复 url：resource_general -> general
UPDATE system_resources
SET url = REPLACE(url, '/resource_general/', '/general/')
WHERE category = 'general'
  AND (url LIKE '%/resource_general/%' OR url LIKE 'resource_general/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 2. 修复 url：character -> general（错误位置的图片）
UPDATE system_resources
SET url = REPLACE(url, '/character/', '/general/')
WHERE category = 'general'
  AND (url LIKE '%/character/%' OR url LIKE 'character/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 3. 修复 url：era -> general（错误位置的图片）
UPDATE system_resources
SET url = REPLACE(url, '/era/', '/general/')
WHERE category = 'general'
  AND (url LIKE '%/era/%' OR url LIKE 'era/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 4. 修复 url：resource_character -> general（如果 category='general'）
UPDATE system_resources
SET url = REPLACE(url, '/resource_character/', '/general/')
WHERE category = 'general'
  AND (url LIKE '%/resource_character/%' OR url LIKE 'resource_character/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- ==========================================
-- 第二部分：验证修复结果
-- ==========================================

-- 检查是否还有问题
SELECT 
    'system_resources' as table_name,
    COUNT(*) as remaining_issues
FROM system_resources
WHERE category = 'general'
  AND ((url LIKE 'character/%' OR url LIKE '%/character/%')
   OR (url LIKE 'era/%' OR url LIKE '%/era/%')
   OR (url LIKE 'resource_general/%' OR url LIKE '%/resource_general/%')
   OR (url LIKE 'resource_character/%' OR url LIKE '%/resource_character/%'));

-- 显示一些示例记录
SELECT 
    '修复后示例' as note,
    id,
    name,
    category,
    url
FROM system_resources
WHERE category = 'general'
  AND (url LIKE 'general/%' OR url LIKE '%/general/%')
LIMIT 10;
