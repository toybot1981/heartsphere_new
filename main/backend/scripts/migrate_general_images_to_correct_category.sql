-- 迁移 general 目录下的图片到正确的 category
-- 执行前请先运行 analyze_general_images.sql 进行分析
-- 执行前请备份数据库和文件系统

-- ==========================================
-- 第一部分：更新数据库中的URL路径
-- ==========================================

-- 1. 迁移 journal_entries 表中的图片URL（general -> journal）
UPDATE journal_entries
SET image_url = REPLACE(image_url, '/general/', '/journal/')
WHERE image_url LIKE '%/general/%';

UPDATE journal_entries
SET image_url = REPLACE(image_url, 'general/', 'journal/')
WHERE image_url LIKE 'general/%';

-- 2. 迁移 characters 表中的图片URL（general -> character）
UPDATE characters
SET avatar_url = REPLACE(avatar_url, '/general/', '/character/')
WHERE avatar_url LIKE '%/general/%';

UPDATE characters
SET avatar_url = REPLACE(avatar_url, 'general/', 'character/')
WHERE avatar_url LIKE 'general/%';

UPDATE characters
SET background_url = REPLACE(background_url, '/general/', '/character/')
WHERE background_url LIKE '%/general/%';

UPDATE characters
SET background_url = REPLACE(background_url, 'general/', 'character/')
WHERE background_url LIKE 'general/%';

-- 3. 迁移 eras 表中的图片URL（general -> era）
UPDATE eras
SET image_url = REPLACE(image_url, '/general/', '/era/')
WHERE image_url LIKE '%/general/%';

UPDATE eras
SET image_url = REPLACE(image_url, 'general/', 'era/')
WHERE image_url LIKE 'general/%';

-- 4. 迁移 system_characters 表中的图片URL（general -> character）
UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, '/general/', '/character/')
WHERE avatar_url LIKE '%/general/%';

UPDATE system_characters
SET avatar_url = REPLACE(avatar_url, 'general/', 'character/')
WHERE avatar_url LIKE 'general/%';

UPDATE system_characters
SET background_url = REPLACE(background_url, '/general/', '/character/')
WHERE background_url LIKE '%/general/%';

UPDATE system_characters
SET background_url = REPLACE(background_url, 'general/', 'character/')
WHERE background_url LIKE 'general/%';

-- 5. 迁移 system_eras 表中的图片URL（general -> era）
UPDATE system_eras
SET image_url = REPLACE(image_url, '/general/', '/era/')
WHERE image_url LIKE '%/general/%';

UPDATE system_eras
SET image_url = REPLACE(image_url, 'general/', 'era/')
WHERE image_url LIKE 'general/%';

-- 6. 迁移 system_main_stories 表中的图片URL（general -> character）
UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, '/general/', '/character/')
WHERE avatar_url LIKE '%/general/%';

UPDATE system_main_stories
SET avatar_url = REPLACE(avatar_url, 'general/', 'character/')
WHERE avatar_url LIKE 'general/%';

UPDATE system_main_stories
SET background_url = REPLACE(background_url, '/general/', '/character/')
WHERE background_url LIKE '%/general/%';

UPDATE system_main_stories
SET background_url = REPLACE(background_url, 'general/', 'character/')
WHERE background_url LIKE 'general/%';

-- 7. 迁移 system_resources 表中的图片URL
-- 注意：system_resources 的 category 字段应该已经正确，这里只迁移URL路径
-- 如果 category='general' 但实际应该是其他分类，需要手动检查并更新
UPDATE system_resources
SET url = REPLACE(url, '/general/', '/character/')
WHERE category = 'character' AND url LIKE '%/general/%';

UPDATE system_resources
SET url = REPLACE(url, '/general/', '/era/')
WHERE category = 'era' AND url LIKE '%/general/%';

UPDATE system_resources
SET url = REPLACE(url, '/general/', '/journal/')
WHERE category = 'journal' AND url LIKE '%/general/%';

-- ==========================================
-- 第二部分：验证迁移结果
-- ==========================================

-- 检查是否还有使用 general 的URL
SELECT 'journal_entries' as table_name, COUNT(*) as remaining_count
FROM journal_entries
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 'characters', COUNT(*)
FROM characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
UNION ALL
SELECT 'eras', COUNT(*)
FROM eras
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 'system_characters', COUNT(*)
FROM system_characters
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
UNION ALL
SELECT 'system_eras', COUNT(*)
FROM system_eras
WHERE image_url LIKE '%/general/%'
UNION ALL
SELECT 'system_main_stories', COUNT(*)
FROM system_main_stories
WHERE avatar_url LIKE '%/general/%' OR background_url LIKE '%/general/%'
UNION ALL
SELECT 'system_resources', COUNT(*)
FROM system_resources
WHERE url LIKE '%/general/%' AND category != 'general';

-- ==========================================
-- 注意：执行完数据库迁移后，还需要执行文件系统迁移
-- 使用 migrate_general_images_files.sh 脚本
-- ==========================================
