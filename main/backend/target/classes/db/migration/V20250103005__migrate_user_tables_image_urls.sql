-- 迁移用户表的图片URL到新路径结构
-- 执行时间：2025-01-03
-- 说明：
-- 1. 将包含 localhost:8081/api/images/files/ 或 /api/images/files/ 的URL转换为相对路径
-- 2. 用户资源的路径格式：userId/category/year/month/filename
-- 3. 外部URL（如 picsum.photos, placeholder://）保持不变
-- 4. 注意：此脚本只处理URL格式转换，不添加userId前缀（已在文件迁移脚本中处理）

-- ============================================
-- 1. characters 表 - avatar_url（用户角色）
-- ============================================
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
WHERE user_id IS NOT NULL
  AND (avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%')
  AND avatar_url NOT LIKE 'http://picsum%'
  AND avatar_url NOT LIKE 'https://picsum%'
  AND avatar_url NOT LIKE 'placeholder://%';

-- characters 表 - background_url
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
WHERE user_id IS NOT NULL
  AND background_url IS NOT NULL
  AND (background_url LIKE '%localhost%api/images/files/%' 
   OR background_url LIKE '%/api/images/files/%'
   OR background_url LIKE '%/images/files/%')
  AND background_url NOT LIKE 'http://picsum%'
  AND background_url NOT LIKE 'https://picsum%'
  AND background_url NOT LIKE 'placeholder://%';

-- ============================================
-- 2. eras 表 - image_url（用户时代）
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
WHERE user_id IS NOT NULL
  AND (image_url LIKE '%localhost%api/images/files/%' 
   OR image_url LIKE '%/api/images/files/%'
   OR image_url LIKE '%/images/files/%')
  AND image_url NOT LIKE 'http://picsum%'
  AND image_url NOT LIKE 'https://picsum%'
  AND image_url NOT LIKE 'placeholder://%';

-- ============================================
-- 3. user_main_stories 表 - avatar_url
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
WHERE avatar_url IS NOT NULL
  AND (avatar_url LIKE '%localhost%api/images/files/%' 
   OR avatar_url LIKE '%/api/images/files/%'
   OR avatar_url LIKE '%/images/files/%')
  AND avatar_url NOT LIKE 'http://picsum%'
  AND avatar_url NOT LIKE 'https://picsum%'
  AND avatar_url NOT LIKE 'placeholder://%';

-- user_main_stories 表 - background_url
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
-- 2. 用户资源的路径格式应该是：userId/category/year/month/filename
-- 3. 如果路径中还没有userId，需要通过文件迁移脚本添加userId前缀
-- 4. 外部URL（如 https://picsum.photos/..., placeholder://...）保持不变
-- 5. 如果URL已经是正确的相对路径格式（包含userId），不会受影响
