-- 修复所有表中的 resource_ 前缀，改为直接使用 category
-- 因为文件系统中实际使用的是 character/、era/ 等，而不是 resource_character/、resource_era/

-- ==========================================
-- 第一部分：修复 system_resources 表
-- ==========================================

-- 1. resource_character -> character
UPDATE system_resources
SET url = REPLACE(url, '/resource_character/', '/character/')
WHERE url LIKE '%/resource_character/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_character/', 'character/')
WHERE url LIKE 'resource_character/%';

-- 2. resource_era -> era
UPDATE system_resources
SET url = REPLACE(url, '/resource_era/', '/era/')
WHERE url LIKE '%/resource_era/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_era/', 'era/')
WHERE url LIKE 'resource_era/%';

-- 3. resource_journal -> journal
UPDATE system_resources
SET url = REPLACE(url, '/resource_journal/', '/journal/')
WHERE url LIKE '%/resource_journal/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_journal/', 'journal/')
WHERE url LIKE 'resource_journal/%';

-- 4. resource_avatar -> character（avatar 通常也存储在 character 目录）
UPDATE system_resources
SET url = REPLACE(url, '/resource_avatar/', '/character/')
WHERE url LIKE '%/resource_avatar/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_avatar/', 'character/')
WHERE url LIKE 'resource_avatar/%';

-- 5. resource_scenario -> character（scenario 通常也存储在 character 目录）
UPDATE system_resources
SET url = REPLACE(url, '/resource_scenario/', '/character/')
WHERE url LIKE '%/resource_scenario/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_scenario/', 'character/')
WHERE url LIKE 'resource_scenario/%';

-- 6. resource_item -> item（如果有 item 目录）
UPDATE system_resources
SET url = REPLACE(url, '/resource_item/', '/item/')
WHERE url LIKE '%/resource_item/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_item/', 'item/')
WHERE url LIKE 'resource_item/%';

-- 7. resource_general -> general（如果有 general 目录）
UPDATE system_resources
SET url = REPLACE(url, '/resource_general/', '/general/')
WHERE url LIKE '%/resource_general/%';

UPDATE system_resources
SET url = REPLACE(url, 'resource_general/', 'general/')
WHERE url LIKE 'resource_general/%';

-- ==========================================
-- 第二部分：修复 system_characters 表
-- ==========================================

-- 8. resource_character -> character
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

UPDATE system_characters
SET background_url = REPLACE(background_url, '/resource_character/', '/character/')
WHERE background_url LIKE '%/resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_characters
SET background_url = REPLACE(background_url, 'resource_character/', 'character/')
WHERE background_url LIKE 'resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- ==========================================
-- 第三部分：修复 system_eras 表
-- ==========================================

-- 9. resource_era -> era
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

-- 同时处理 localhost URL
UPDATE system_eras
SET image_url = REPLACE(image_url, '/resource_era/', '/era/')
WHERE image_url LIKE '%/resource_era/%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'resource_era/', 'era/')
WHERE image_url LIKE 'resource_era/%';

-- ==========================================
-- 第四部分：修复 system_main_stories 表
-- ==========================================

-- 10. resource_character -> character
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

UPDATE system_main_stories
SET background_url = REPLACE(background_url, '/resource_character/', '/character/')
WHERE background_url LIKE '%/resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

UPDATE system_main_stories
SET background_url = REPLACE(background_url, 'resource_character/', 'character/')
WHERE background_url LIKE 'resource_character/%'
  AND background_url NOT LIKE 'placeholder://%'
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%';

-- ==========================================
-- 第五部分：验证修复结果
-- ==========================================

-- 检查是否还有 resource_ 前缀
SELECT 
    'system_resources' as table_name,
    COUNT(*) as still_has_resource_prefix
FROM system_resources
WHERE url LIKE '%/resource_%' OR url LIKE 'resource_%'
UNION ALL
SELECT 
    'system_characters',
    COUNT(*)
FROM system_characters
WHERE (avatar_url LIKE '%/resource_%' OR avatar_url LIKE 'resource_%')
   OR (background_url LIKE '%/resource_%' OR background_url LIKE 'resource_%')
UNION ALL
SELECT 
    'system_eras',
    COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/resource_%' OR image_url LIKE 'resource_%'
UNION ALL
SELECT 
    'system_main_stories',
    COUNT(*)
FROM system_main_stories
WHERE (avatar_url LIKE '%/resource_%' OR avatar_url LIKE 'resource_%')
   OR (background_url LIKE '%/resource_%' OR background_url LIKE 'resource_%');

-- 显示一些示例记录
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    url
FROM system_resources
WHERE url LIKE '%/resource_%' OR url LIKE 'resource_%'
LIMIT 10;
