-- 修复系统预置表（system_characters, system_eras, system_main_stories）中的图片URL
-- 确保URL路径与system_resources保持一致，使用resource_前缀

-- ==========================================
-- 第一部分：修复 system_characters 表
-- ==========================================

-- 1. 修复 avatar_url：general -> resource_character
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/general/', '/resource_character/')
WHERE avatar_url LIKE '%/general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'general/', 'resource_character/')
WHERE avatar_url LIKE 'general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 2. 修复 avatar_url：character -> resource_character（如果直接使用character）
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/character/', '/resource_character/')
WHERE avatar_url LIKE '%/character/%'
  AND avatar_url NOT LIKE '%/resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'character/', 'resource_character/')
WHERE avatar_url LIKE 'character/%'
  AND avatar_url NOT LIKE 'resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 3. 修复 background_url：general -> resource_character
UPDATE system_characters
SET background_url = REPLACE(background_url, '/general/', '/resource_character/')
WHERE background_url LIKE '%/general/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_characters
SET background_url = REPLACE(background_url, 'general/', 'resource_character/')
WHERE background_url LIKE 'general/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- 4. 修复 background_url：character -> resource_character（如果直接使用character）
UPDATE system_characters
SET background_url = REPLACE(background_url, '/character/', '/resource_character/')
WHERE background_url LIKE '%/character/%'
  AND background_url NOT LIKE '%/resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_characters
SET background_url = REPLACE(background_url, 'character/', 'resource_character/')
WHERE background_url LIKE 'character/%'
  AND background_url NOT LIKE 'resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- ==========================================
-- 第二部分：修复 system_eras 表
-- ==========================================

-- 5. 修复 image_url：general -> resource_era
UPDATE system_eras
SET image_url = REPLACE(image_url, '/general/', '/resource_era/')
WHERE image_url LIKE '%/general/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'general/', 'resource_era/')
WHERE image_url LIKE 'general/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

-- 6. 修复 image_url：era -> resource_era（如果直接使用era）
UPDATE system_eras
SET image_url = REPLACE(image_url, '/era/', '/resource_era/')
WHERE image_url LIKE '%/era/%'
  AND image_url NOT LIKE '%/resource_era/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'era/', 'resource_era/')
WHERE image_url LIKE 'era/%'
  AND image_url NOT LIKE 'resource_era/%'
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';

-- ==========================================
-- 第三部分：修复 system_main_stories 表
-- ==========================================

-- 7. 修复 avatar_url：general -> resource_character
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/general/', '/resource_character/')
WHERE avatar_url LIKE '%/general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'general/', 'resource_character/')
WHERE avatar_url LIKE 'general/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 8. 修复 avatar_url：character -> resource_character（如果直接使用character）
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/character/', '/resource_character/')
WHERE avatar_url LIKE '%/character/%'
  AND avatar_url NOT LIKE '%/resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'character/', 'resource_character/')
WHERE avatar_url LIKE 'character/%'
  AND avatar_url NOT LIKE 'resource_character/%'
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%';

-- 9. 修复 background_url：general -> resource_character
UPDATE system_main_stories
SET background_url = REPLACE(background_url, '/general/', '/resource_character/')
WHERE background_url LIKE '%/general/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET background_url = REPLACE(background_url, 'general/', 'resource_character/')
WHERE background_url LIKE 'general/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- 10. 修复 background_url：character -> resource_character（如果直接使用character）
UPDATE system_main_stories
SET background_url = REPLACE(background_url, '/character/', '/resource_character/')
WHERE background_url LIKE '%/character/%'
  AND background_url NOT LIKE '%/resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET background_url = REPLACE(background_url, 'character/', 'resource_character/')
WHERE background_url LIKE 'character/%'
  AND background_url NOT LIKE 'resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- ==========================================
-- 第四部分：验证修复结果
-- ==========================================

-- 检查是否还有问题
SELECT 
    'system_characters' as table_name,
    'avatar_url' as field_name,
    COUNT(*) as remaining_count
FROM system_characters
WHERE (avatar_url LIKE '%/general/%' OR avatar_url LIKE 'general/%')
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
UNION ALL
SELECT 
    'system_characters',
    'background_url',
    COUNT(*)
FROM system_characters
WHERE (background_url LIKE '%/general/%' OR background_url LIKE 'general/%')
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%'
UNION ALL
SELECT 
    'system_eras',
    'image_url',
    COUNT(*)
FROM system_eras
WHERE (image_url LIKE '%/general/%' OR image_url LIKE 'general/%')
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%'
UNION ALL
SELECT 
    'system_main_stories',
    'avatar_url',
    COUNT(*)
FROM system_main_stories
WHERE (avatar_url LIKE '%/general/%' OR avatar_url LIKE 'general/%')
  AND avatar_url NOT LIKE 'placeholder://%'
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
UNION ALL
SELECT 
    'system_main_stories',
    'background_url',
    COUNT(*)
FROM system_main_stories
WHERE (background_url LIKE '%/general/%' OR background_url LIKE 'general/%')
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';
