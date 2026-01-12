-- 迁移图片URL到新的路径结构
-- 执行时间：2025-01-03
-- 说明：
-- 1. 将包含 localhost:8081/api/images/files/ 或 /api/images/files/ 的URL转换为相对路径
-- 2. 系统资源：保持 category/year/month/filename 格式
-- 3. 用户资源：当前数据库中可能还是旧格式，需要根据实际情况迁移
--    注意：用户资源的迁移可能需要额外的逻辑判断，此处只处理URL格式转换

-- ============================================
-- 1. 系统资源表 - system_resources
-- ============================================
UPDATE system_resources
SET url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE url LIKE '%localhost%api/images/files/%' 
   OR url LIKE '%/api/images/files/%'
   OR url LIKE '%/images/files/%';

-- 如果URL以 resource_ 开头，保持不变（系统资源格式：resource_category/year/month/filename）
-- 如果URL不是以 resource_ 开头且不包含 userId，保持原样（可能已经是正确的相对路径）

-- ============================================
-- 2. 系统时代表 - system_eras
-- ============================================
UPDATE system_eras
SET image_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%' 
   OR image_url LIKE '%/api/images/files/%'
   OR image_url LIKE '%/images/files/%';

-- ============================================
-- 3. 系统角色表 - system_characters
-- ============================================
UPDATE system_characters
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%';

-- ============================================
-- 4. 用户角色表 - characters
-- ============================================
-- 注意：用户资源的路径应该是 userId/category/year/month/filename
-- 但由于现有数据中路径可能不包含 userId，需要根据实际数据情况处理
-- 这里先转换URL格式，userId的添加需要根据业务逻辑判断

UPDATE characters
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%';

UPDATE characters
SET background_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(background_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE background_url LIKE '%localhost%api/images/files/%' 
   OR background_url LIKE '%/api/images/files/%'
   OR background_url LIKE '%/images/files/%';

-- ============================================
-- 5. 用户时代表 - eras
-- ============================================
UPDATE eras
SET image_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%' 
   OR image_url LIKE '%/api/images/files/%'
   OR image_url LIKE '%/images/files/%';

-- ============================================
-- 6. 日记条目表 - journal_entries
-- ============================================
UPDATE journal_entries
SET image_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(image_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE image_url LIKE '%localhost%api/images/files/%' 
   OR image_url LIKE '%/api/images/files/%'
   OR image_url LIKE '%/images/files/%';

-- ============================================
-- 7. 用户表 - users
-- ============================================
UPDATE users
SET avatar = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(avatar, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE avatar LIKE '%localhost%api/images/files/%' 
   OR avatar LIKE '%/api/images/files/%'
   OR avatar LIKE '%/images/files/%';

-- ============================================
-- 8. 用户主线故事表 - user_main_stories
-- ============================================
UPDATE user_main_stories
SET avatar_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(avatar_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%';

UPDATE user_main_stories
SET background_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(background_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE background_url LIKE '%localhost%api/images/files/%' 
   OR background_url LIKE '%/api/images/files/%'
   OR background_url LIKE '%/images/files/%';

-- ============================================
-- 注意：
-- 1. 此脚本只处理URL格式转换，将绝对URL转换为相对路径
-- 2. 系统资源的路径格式保持不变（category/year/month/filename）
-- 3. 用户资源的路径迁移需要根据实际业务逻辑处理：
--    - 如果现有路径不包含 userId，可能需要通过关联表查找 userId
--    - 新上传的用户资源会自动使用新格式（userId/category/year/month/filename）
-- 4. 外部URL（如 https://picsum.photos/...）保持不变
