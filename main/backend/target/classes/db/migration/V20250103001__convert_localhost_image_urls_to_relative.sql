-- 将数据库中的 localhost 图片URL转换为相对路径
-- 执行时间：2025-01-03
-- 说明：将包含 localhost:8081/api/images/files/ 的URL转换为相对路径

-- 1. 更新 system_eras 表
UPDATE system_eras
SET image_url = REPLACE(
    REPLACE(
        REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%';

-- 2. 更新 system_characters 表
UPDATE system_characters
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%';

-- 3. 更新 characters 表
UPDATE characters
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%';

UPDATE characters
SET background_url = REPLACE(
    REPLACE(
        REPLACE(background_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE background_url LIKE '%localhost%api/images/files/%';

-- 4. 更新 eras 表
UPDATE eras
SET image_url = REPLACE(
    REPLACE(
        REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%';

-- 5. 更新 journal_entries 表
UPDATE journal_entries
SET image_url = REPLACE(
    REPLACE(
        REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%';

-- 6. 更新 users 表（头像）
UPDATE users
SET avatar = REPLACE(
    REPLACE(
        REPLACE(avatar, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE avatar LIKE '%localhost%api/images/files/%';

-- 7. 更新 user_main_stories 表
UPDATE user_main_stories
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%';

UPDATE user_main_stories
SET background_url = REPLACE(
    REPLACE(
        REPLACE(background_url, 'http://localhost:8081/api/images/files/', ''),
        'https://localhost:8081/api/images/files/', ''
    ),
    'http://localhost:8080/api/images/files/', ''
)
WHERE background_url LIKE '%localhost%api/images/files/%';

-- 注意：此脚本只处理 localhost URL，外部URL（如 picsum.photos）保持不变
