-- 检查数据库中图片URL的存储格式
-- 执行方法：mysql -u root -p123456 heartsphere --default-character-set=utf8mb4 < check_image_urls.sql

-- 1. 检查 system_eras 表
SELECT 
    'system_eras' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM system_eras
UNION ALL
-- 2. 检查 system_characters 表
SELECT 
    'system_characters' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM system_characters
UNION ALL
-- 3. 检查 characters 表
SELECT 
    'characters' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' OR background_url LIKE 'http://%' OR background_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN (avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '') 
              OR (background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url IS NOT NULL AND background_url != '') THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN (avatar_url IS NULL OR avatar_url = '') AND (background_url IS NULL OR background_url = '') THEN 1 ELSE 0 END) AS null_or_empty_count
FROM characters
UNION ALL
-- 4. 检查 eras 表
SELECT 
    'eras' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM eras
UNION ALL
-- 5. 检查 journal_entries 表
SELECT 
    'journal_entries' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM journal_entries
UNION ALL
-- 6. 检查 users 表
SELECT 
    'users' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar LIKE 'http://%' OR avatar LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar NOT LIKE 'http://%' AND avatar NOT LIKE 'https://%' AND avatar IS NOT NULL AND avatar != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN avatar IS NULL OR avatar = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM users
UNION ALL
-- 7. 检查 user_main_stories 表
SELECT 
    'user_main_stories' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' OR background_url LIKE 'http://%' OR background_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN (avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '') 
              OR (background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url IS NOT NULL AND background_url != '') THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN (avatar_url IS NULL OR avatar_url = '') AND (background_url IS NULL OR background_url = '') THEN 1 ELSE 0 END) AS null_or_empty_count
FROM user_main_stories;

-- 显示包含 localhost 的记录示例（每表最多10条）
SELECT 'system_eras' AS table_name, id, name, image_url FROM system_eras WHERE image_url LIKE '%localhost%' LIMIT 10;
SELECT 'system_characters' AS table_name, id, name, avatar_url FROM system_characters WHERE avatar_url LIKE '%localhost%' LIMIT 10;
SELECT 'characters' AS table_name, id, name, avatar_url, background_url FROM characters WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' LIMIT 10;
SELECT 'eras' AS table_name, id, name, image_url FROM eras WHERE image_url LIKE '%localhost%' LIMIT 10;
SELECT 'journal_entries' AS table_name, id, title, image_url FROM journal_entries WHERE image_url LIKE '%localhost%' LIMIT 10;
SELECT 'users' AS table_name, id, username, avatar FROM users WHERE avatar LIKE '%localhost%' LIMIT 10;
SELECT 'user_main_stories' AS table_name, id, user_id, avatar_url, background_url FROM user_main_stories WHERE avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' LIMIT 10;

-- 显示包含绝对路径（非localhost）的记录示例
SELECT 'system_eras' AS table_name, id, name, image_url FROM system_eras WHERE (image_url LIKE 'http://%' OR image_url LIKE 'https://%') AND image_url NOT LIKE '%localhost%' LIMIT 10;
SELECT 'system_characters' AS table_name, id, name, avatar_url FROM system_characters WHERE (avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%') AND avatar_url NOT LIKE '%localhost%' LIMIT 10;
SELECT 'characters' AS table_name, id, name, avatar_url, background_url FROM characters WHERE ((avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%') OR (background_url LIKE 'http://%' OR background_url LIKE 'https://%')) AND avatar_url NOT LIKE '%localhost%' AND background_url NOT LIKE '%localhost%' LIMIT 10;
