-- 迁移脚本：将数据库中的绝对URL转换为相对路径
-- 执行此脚本前，请先备份数据库
-- 注意：此脚本只处理当前baseUrl域名的图片URL，外部URL（如picsum.photos）将保持不变

-- 假设 baseUrl 为 http://localhost:8081/api/images
-- 相对路径格式：category/year/month/filename 或 /files/category/year/month/filename

-- 1. 迁移 characters 表的 avatar_url
UPDATE characters
SET avatar_url = CASE
    -- 如果URL包含 /files/，提取相对路径
    WHEN avatar_url LIKE '%/files/%' THEN 
        SUBSTRING(avatar_url, LOCATE('/files/', avatar_url) + LENGTH('/files/'))
    -- 如果URL包含 /api/images/files/，提取相对路径
    WHEN avatar_url LIKE '%/api/images/files/%' THEN
        SUBSTRING(avatar_url, LOCATE('/api/images/files/', avatar_url) + LENGTH('/api/images/files/'))
    -- 如果URL包含 /api/images/，提取相对路径
    WHEN avatar_url LIKE '%/api/images/%' THEN
        SUBSTRING(avatar_url, LOCATE('/api/images/', avatar_url) + LENGTH('/api/images/'))
    -- 外部URL保持不变
    ELSE avatar_url
END
WHERE avatar_url IS NOT NULL 
  AND avatar_url != ''
  AND (avatar_url LIKE '%/api/images/%' OR avatar_url LIKE '%/files/%');

-- 2. 迁移 characters 表的 background_url
UPDATE characters
SET background_url = CASE
    WHEN background_url LIKE '%/files/%' THEN 
        SUBSTRING(background_url, LOCATE('/files/', background_url) + LENGTH('/files/'))
    WHEN background_url LIKE '%/api/images/files/%' THEN
        SUBSTRING(background_url, LOCATE('/api/images/files/', background_url) + LENGTH('/api/images/files/'))
    WHEN background_url LIKE '%/api/images/%' THEN
        SUBSTRING(background_url, LOCATE('/api/images/', background_url) + LENGTH('/api/images/'))
    ELSE background_url
END
WHERE background_url IS NOT NULL 
  AND background_url != ''
  AND (background_url LIKE '%/api/images/%' OR background_url LIKE '%/files/%');

-- 3. 迁移 eras 表的 image_url
UPDATE eras
SET image_url = CASE
    WHEN image_url LIKE '%/files/%' THEN 
        SUBSTRING(image_url, LOCATE('/files/', image_url) + LENGTH('/files/'))
    WHEN image_url LIKE '%/api/images/files/%' THEN
        SUBSTRING(image_url, LOCATE('/api/images/files/', image_url) + LENGTH('/api/images/files/'))
    WHEN image_url LIKE '%/api/images/%' THEN
        SUBSTRING(image_url, LOCATE('/api/images/', image_url) + LENGTH('/api/images/'))
    ELSE image_url
END
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND (image_url LIKE '%/api/images/%' OR image_url LIKE '%/files/%');

-- 4. 迁移 users 表的 avatar（如果存在）
-- 注意：需要根据实际表结构调整字段名
-- UPDATE users
-- SET avatar = CASE
--     WHEN avatar LIKE '%/files/%' THEN 
--         SUBSTRING(avatar, LOCATE('/files/', avatar) + LENGTH('/files/'))
--     WHEN avatar LIKE '%/api/images/files/%' THEN
--         SUBSTRING(avatar, LOCATE('/api/images/files/', avatar) + LENGTH('/api/images/files/'))
--     WHEN avatar LIKE '%/api/images/%' THEN
--         SUBSTRING(avatar, LOCATE('/api/images/', avatar) + LENGTH('/api/images/'))
--     ELSE avatar
-- END
-- WHERE avatar IS NOT NULL 
--   AND avatar != ''
--   AND (avatar LIKE '%/api/images/%' OR avatar LIKE '%/files/%');

-- 查询迁移结果（可选，用于验证）
-- SELECT 'characters.avatar_url' as table_column, COUNT(*) as total, 
--        SUM(CASE WHEN avatar_url NOT LIKE 'http%' THEN 1 ELSE 0 END) as relative_paths,
--        SUM(CASE WHEN avatar_url LIKE 'http%' THEN 1 ELSE 0 END) as absolute_urls
-- FROM characters WHERE avatar_url IS NOT NULL
-- UNION ALL
-- SELECT 'characters.background_url' as table_column, COUNT(*) as total,
--        SUM(CASE WHEN background_url NOT LIKE 'http%' THEN 1 ELSE 0 END) as relative_paths,
--        SUM(CASE WHEN background_url LIKE 'http%' THEN 1 ELSE 0 END) as absolute_urls
-- FROM characters WHERE background_url IS NOT NULL
-- UNION ALL
-- SELECT 'eras.image_url' as table_column, COUNT(*) as total,
--        SUM(CASE WHEN image_url NOT LIKE 'http%' THEN 1 ELSE 0 END) as relative_paths,
--        SUM(CASE WHEN image_url LIKE 'http%' THEN 1 ELSE 0 END) as absolute_urls
-- FROM eras WHERE image_url IS NOT NULL;

