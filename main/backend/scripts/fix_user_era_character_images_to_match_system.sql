-- 修复用户场景和角色的图片URL，使其与预置资源保持一致
-- 对于有 system_era_id 的场景，直接使用预置场景的图片URL
-- 对于匹配到预置角色的角色，使用预置角色的图片URL
SET NAMES utf8mb4;
USE heartsphere;

-- ==========================================
-- 第一部分：修复用户场景图片（使用预置场景的图片URL）
-- ==========================================

-- 1. 对于有 system_era_id 的场景，直接使用预置场景的图片URL
UPDATE eras e
INNER JOIN system_eras se ON e.system_era_id = se.id
SET e.image_url = se.image_url
WHERE se.image_url IS NOT NULL 
  AND se.image_url != ''
  AND se.image_url NOT LIKE 'placeholder://%'
  AND (e.image_url IS NULL 
       OR e.image_url = ''
       OR e.image_url LIKE 'placeholder://%'
       OR e.image_url COLLATE utf8mb4_unicode_ci != se.image_url COLLATE utf8mb4_unicode_ci);  -- 即使已有图片，也要更新为预置场景的图片

-- ==========================================
-- 第二部分：修复用户角色图片（使用预置角色的图片URL）
-- ==========================================

-- 1. 更新 avatar_url（使用预置角色的 avatar_url）
UPDATE characters c
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
SET c.avatar_url = sc.avatar_url
WHERE sc.avatar_url IS NOT NULL 
  AND sc.avatar_url != ''
  AND sc.avatar_url NOT LIKE 'placeholder://%'
  AND (c.avatar_url IS NULL 
       OR c.avatar_url = ''
       OR c.avatar_url LIKE 'placeholder://%'
       OR c.avatar_url COLLATE utf8mb4_unicode_ci != sc.avatar_url COLLATE utf8mb4_unicode_ci);  -- 即使已有图片，也要更新为预置角色的图片

-- 2. 更新 background_url（使用预置角色的 background_url）
UPDATE characters c
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
SET c.background_url = sc.background_url
WHERE sc.background_url IS NOT NULL 
  AND sc.background_url != ''
  AND sc.background_url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
       OR c.background_url = ''
       OR c.background_url LIKE 'placeholder://%'
       OR c.background_url COLLATE utf8mb4_unicode_ci != sc.background_url COLLATE utf8mb4_unicode_ci);  -- 即使已有图片，也要更新为预置角色的图片

-- ==========================================
-- 第三部分：统计更新结果
-- ==========================================

-- 1. 统计场景更新结果
SELECT 
    '场景更新统计' as summary,
    COUNT(*) as total_eras_with_system_id,
    COUNT(CASE WHEN e.image_url COLLATE utf8mb4_unicode_ci = se.image_url COLLATE utf8mb4_unicode_ci THEN 1 END) as eras_matched,
    COUNT(CASE WHEN e.image_url COLLATE utf8mb4_unicode_ci != se.image_url COLLATE utf8mb4_unicode_ci THEN 1 END) as eras_not_matched
FROM eras e
INNER JOIN system_eras se ON e.system_era_id = se.id
WHERE e.is_deleted = 0
  AND se.image_url IS NOT NULL 
  AND se.image_url != ''
  AND se.image_url NOT LIKE 'placeholder://%';

-- 2. 统计角色更新结果
SELECT 
    '角色更新统计' as summary,
    COUNT(*) as total_characters_matched,
    COUNT(CASE WHEN c.avatar_url COLLATE utf8mb4_unicode_ci = sc.avatar_url COLLATE utf8mb4_unicode_ci THEN 1 END) as avatars_matched,
    COUNT(CASE WHEN c.background_url COLLATE utf8mb4_unicode_ci = sc.background_url COLLATE utf8mb4_unicode_ci THEN 1 END) as backgrounds_matched
FROM characters c
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
WHERE c.is_deleted = 0
  AND (sc.avatar_url IS NOT NULL AND sc.avatar_url != '' AND sc.avatar_url NOT LIKE 'placeholder://%'
       OR sc.background_url IS NOT NULL AND sc.background_url != '' AND sc.background_url NOT LIKE 'placeholder://%');

-- 3. 显示更新后的示例数据（用户 ty1）
SELECT 
    '用户ty1场景更新后' as type,
    e.id,
    e.name,
    e.system_era_id,
    e.image_url,
    se.image_url as system_image_url,
    CASE WHEN e.image_url COLLATE utf8mb4_unicode_ci = se.image_url COLLATE utf8mb4_unicode_ci THEN '✓ 一致' ELSE '✗ 不一致' END as status
FROM eras e
INNER JOIN users u ON e.user_id = u.id
INNER JOIN system_eras se ON e.system_era_id = se.id
WHERE u.username = 'ty1'
  AND e.is_deleted = 0
ORDER BY e.id;

SELECT 
    '用户ty1角色更新后' as type,
    c.id,
    c.name,
    c.avatar_url,
    sc.avatar_url as system_avatar_url,
    c.background_url,
    sc.background_url as system_background_url,
    CASE 
        WHEN c.avatar_url COLLATE utf8mb4_unicode_ci = sc.avatar_url COLLATE utf8mb4_unicode_ci 
             AND c.background_url COLLATE utf8mb4_unicode_ci = sc.background_url COLLATE utf8mb4_unicode_ci THEN '✓ 完全一致'
        WHEN c.avatar_url COLLATE utf8mb4_unicode_ci = sc.avatar_url COLLATE utf8mb4_unicode_ci THEN '✓ 头像一致'
        WHEN c.background_url COLLATE utf8mb4_unicode_ci = sc.background_url COLLATE utf8mb4_unicode_ci THEN '✓ 背景一致'
        ELSE '✗ 不一致'
    END as status
FROM characters c
INNER JOIN users u ON c.user_id = u.id
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
WHERE u.username = 'ty1'
  AND c.is_deleted = 0
ORDER BY c.id;
