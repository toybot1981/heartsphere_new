-- 修复 avatar 相关图片的位置
-- avatar 图片应该存储在 character 目录下

-- ==========================================
-- 第一部分：修复 system_resources 表（category='avatar'）
-- ==========================================

-- 1. 修复 url：resource_avatar -> character
UPDATE system_resources
SET url = REPLACE(url, '/resource_avatar/', '/character/')
WHERE category = 'avatar'
  AND (url LIKE '%/resource_avatar/%' OR url LIKE 'resource_avatar/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 2. 修复 url：avatar -> character
UPDATE system_resources
SET url = REPLACE(url, '/avatar/', '/character/')
WHERE category = 'avatar'
  AND (url LIKE '%/avatar/%' OR url LIKE 'avatar/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 3. 修复 url：era -> character（错误位置的图片）
UPDATE system_resources
SET url = REPLACE(url, '/era/', '/character/')
WHERE category = 'avatar'
  AND (url LIKE '%/era/%' OR url LIKE 'era/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- 4. 修复 url：general -> character（错误位置的图片）
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/character/')
WHERE category = 'avatar'
  AND (url LIKE '%/general/%' OR url LIKE 'general/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';

-- ==========================================
-- 第二部分：修复 system_characters 表（avatar_url）
-- ==========================================

-- 5. 修复 avatar_url：resource_character -> character
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/resource_character/', '/character/')
WHERE avatar_url LIKE '%/resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'resource_character/', 'character/')
WHERE avatar_url LIKE 'resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 6. 修复 avatar_url：resource_avatar -> character
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/resource_avatar/', '/character/')
WHERE avatar_url LIKE '%/resource_avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'resource_avatar/', 'character/')
WHERE avatar_url LIKE 'resource_avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 7. 修复 avatar_url：avatar -> character
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/avatar/', '/character/')
WHERE avatar_url LIKE '%/avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'avatar/', 'character/')
WHERE avatar_url LIKE 'avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 8. 修复 avatar_url：era -> character（错误位置的图片）
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/era/', '/character/')
WHERE avatar_url LIKE '%/era/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'era/', 'character/')
WHERE avatar_url LIKE 'era/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 9. 修复 avatar_url：general -> character（错误位置的图片）
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/general/', '/character/')
WHERE avatar_url LIKE '%/general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'general/', 'character/')
WHERE avatar_url LIKE 'general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- ==========================================
-- 第三部分：修复 system_main_stories 表（avatar_url）
-- ==========================================

-- 10. 修复 avatar_url：resource_character -> character
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/resource_character/', '/character/')
WHERE avatar_url LIKE '%/resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'resource_character/', 'character/')
WHERE avatar_url LIKE 'resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 11. 修复 avatar_url：resource_avatar -> character
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/resource_avatar/', '/character/')
WHERE avatar_url LIKE '%/resource_avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'resource_avatar/', 'character/')
WHERE avatar_url LIKE 'resource_avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 12. 修复 avatar_url：avatar -> character
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/avatar/', '/character/')
WHERE avatar_url LIKE '%/avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'avatar/', 'character/')
WHERE avatar_url LIKE 'avatar/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- ==========================================
-- 第四部分：验证修复结果
-- ==========================================

-- 检查是否还有问题
SELECT 
    'system_resources' as table_name,
    COUNT(*) as remaining_issues
FROM system_resources
WHERE category = 'avatar'
  AND ((url LIKE 'resource_avatar/%' OR url LIKE '%/resource_avatar/%')
   OR (url LIKE 'avatar/%' OR url LIKE '%/avatar/%')
   OR (url LIKE 'era/%' OR url LIKE '%/era/%')
   OR (url LIKE 'general/%' OR url LIKE '%/general/%'))
UNION ALL
SELECT 
    'system_characters',
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
   OR (avatar_url LIKE 'general/%' OR avatar_url LIKE '%/general/%'))
UNION ALL
SELECT 
    'system_main_stories',
    COUNT(*)
FROM system_main_stories
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
