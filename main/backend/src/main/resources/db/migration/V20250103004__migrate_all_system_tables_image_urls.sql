-- 迁移所有系统表的图片URL到新路径结构
-- 执行时间：2025-01-03
-- 说明：
-- 1. 将包含 localhost:8081/api/images/files/ 或 /api/images/files/ 的URL转换为相对路径
-- 2. 系统资源的路径格式：category/year/month/filename
-- 3. 外部URL（如 picsum.photos, placeholder://）保持不变

-- ============================================
-- 1. system_characters 表 - avatar_url
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
WHERE (avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%')
  AND avatar_url NOT LIKE 'http://picsum%'
  AND avatar_url NOT LIKE 'https://picsum%'
  AND avatar_url NOT LIKE 'placeholder://%';

-- system_characters 表 - background_url
UPDATE system_characters
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
WHERE background_url IS NOT NULL
  AND (background_url LIKE '%localhost%api/images/files/%' 
   OR background_url LIKE '%/api/images/files/%'
   OR background_url LIKE '%/images/files/%')
  AND background_url NOT LIKE 'http://picsum%'
  AND background_url NOT LIKE 'https://picsum%'
  AND background_url NOT LIKE 'placeholder://%';

-- ============================================
-- 2. system_eras 表 - image_url
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
WHERE (image_url LIKE '%localhost%api/images/files/%' 
   OR image_url LIKE '%/api/images/files/%'
   OR image_url LIKE '%/images/files/%')
  AND image_url NOT LIKE 'http://picsum%'
  AND image_url NOT LIKE 'https://picsum%'
  AND image_url NOT LIKE 'placeholder://%';

-- ============================================
-- 3. system_resources 表 - url
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
WHERE (url LIKE '%localhost%api/images/files/%' 
   OR url LIKE '%/api/images/files/%'
   OR url LIKE '%/images/files/%')
  AND url NOT LIKE 'http://picsum%'
  AND url NOT LIKE 'https://picsum%'
  AND url NOT LIKE 'placeholder://%';

-- ============================================
-- 4. system_era_items 表 - icon_url
-- ============================================
UPDATE system_era_items
SET icon_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(icon_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE icon_url IS NOT NULL
  AND (icon_url LIKE '%localhost%api/images/files/%' 
   OR icon_url LIKE '%/api/images/files/%'
   OR icon_url LIKE '%/images/files/%')
  AND icon_url NOT LIKE 'http://picsum%'
  AND icon_url NOT LIKE 'https://picsum%'
  AND icon_url NOT LIKE 'placeholder://%';

-- ============================================
-- 5. system_era_events 表 - icon_url
-- ============================================
UPDATE system_era_events
SET icon_url = REPLACE(
    REPLACE(
        REPLACE(
            REPLACE(icon_url, 'http://localhost:8081/api/images/files/', ''),
            'https://localhost:8081/api/images/files/', ''
        ),
        '/api/images/files/', ''
    ),
    '/images/files/', ''
)
WHERE icon_url IS NOT NULL
  AND (icon_url LIKE '%localhost%api/images/files/%' 
   OR icon_url LIKE '%/api/images/files/%'
   OR icon_url LIKE '%/images/files/%')
  AND icon_url NOT LIKE 'http://picsum%'
  AND icon_url NOT LIKE 'https://picsum%'
  AND icon_url NOT LIKE 'placeholder://%';

-- ============================================
-- 6. system_main_stories 表 - avatar_url
-- ============================================
UPDATE system_main_stories
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
WHERE avatar_url IS NOT NULL
  AND (avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%')
  AND avatar_url NOT LIKE 'http://picsum%'
  AND avatar_url NOT LIKE 'https://picsum%'
  AND avatar_url NOT LIKE 'placeholder://%';

-- system_main_stories 表 - background_url
UPDATE system_main_stories
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
WHERE background_url IS NOT NULL
  AND (background_url LIKE '%localhost%api/images/files/%' 
   OR background_url LIKE '%/api/images/files/%'
   OR background_url LIKE '%/images/files/%')
  AND background_url NOT LIKE 'http://picsum%'
  AND background_url NOT LIKE 'https://picsum%'
  AND background_url NOT LIKE 'placeholder://%';

-- ============================================
-- 注意：
-- 1. 此脚本只处理URL格式转换，将绝对URL转换为相对路径
-- 2. 系统资源的路径格式：category/year/month/filename
-- 3. 外部URL（如 https://picsum.photos/..., placeholder://...）保持不变
-- 4. 如果URL已经是正确的相对路径格式，不会受影响
