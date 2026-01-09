-- 匹配预置资源并更新用户场景和角色的图片链接
-- 匹配规则：根据名称匹配，优先使用预置表（system_eras, system_characters），其次使用资源表（system_resources）
SET NAMES utf8mb4;
USE heartsphere;

-- ==========================================
-- 第一部分：更新用户场景 (eras) 的图片
-- ==========================================

-- 1. 优先匹配 system_eras 表（预置场景表）
-- 如果用户场景有 system_era_id，直接使用预置场景的图片
UPDATE eras e
INNER JOIN system_eras se ON e.system_era_id = se.id
SET e.image_url = se.image_url
WHERE e.image_url IS NULL 
   OR e.image_url = ''
   OR e.image_url LIKE 'placeholder://%'
   AND se.image_url IS NOT NULL 
   AND se.image_url != ''
   AND se.image_url NOT LIKE 'placeholder://%';

-- 2. 如果 system_era_id 匹配失败，通过名称匹配 system_eras
UPDATE eras e
INNER JOIN system_eras se ON e.name COLLATE utf8mb4_unicode_ci = se.name COLLATE utf8mb4_unicode_ci
SET e.image_url = se.image_url
WHERE (e.image_url IS NULL 
    OR e.image_url = ''
    OR e.image_url LIKE 'placeholder://%')
  AND se.image_url IS NOT NULL 
  AND se.image_url != ''
  AND se.image_url NOT LIKE 'placeholder://%'
  AND NOT EXISTS (
      SELECT 1 FROM system_eras se2 
      WHERE se2.id = e.system_era_id 
      AND se2.image_url IS NOT NULL 
      AND se2.image_url != ''
      AND se2.image_url NOT LIKE 'placeholder://%'
  );

-- 3. 通过名称匹配 system_resources 表（category='era'）
UPDATE eras e
INNER JOIN system_resources sr ON e.name COLLATE utf8mb4_unicode_ci = sr.name COLLATE utf8mb4_unicode_ci AND sr.category = 'era'
SET e.image_url = sr.url
WHERE (e.image_url IS NULL 
    OR e.image_url = ''
    OR e.image_url LIKE 'placeholder://%')
  AND sr.url IS NOT NULL 
  AND sr.url != ''
  AND sr.url NOT LIKE 'placeholder://%'
  AND NOT EXISTS (
      SELECT 1 FROM system_eras se 
      WHERE (se.id = e.system_era_id OR se.name COLLATE utf8mb4_unicode_ci = e.name COLLATE utf8mb4_unicode_ci)
      AND se.image_url IS NOT NULL 
      AND se.image_url != ''
      AND se.image_url NOT LIKE 'placeholder://%'
  );

-- ==========================================
-- 第二部分：更新用户角色 (characters) 的图片
-- ==========================================

-- 1. 通过名称匹配 system_characters 表（预置角色表）
-- 更新 avatar_url
UPDATE characters c
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
SET c.avatar_url = sc.avatar_url
WHERE (c.avatar_url IS NULL 
    OR c.avatar_url = ''
    OR c.avatar_url LIKE 'placeholder://%')
  AND sc.avatar_url IS NOT NULL 
  AND sc.avatar_url != ''
  AND sc.avatar_url NOT LIKE 'placeholder://%';

-- 更新 background_url
UPDATE characters c
INNER JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
SET c.background_url = sc.background_url
WHERE (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%')
  AND sc.background_url IS NOT NULL 
  AND sc.background_url != ''
  AND sc.background_url NOT LIKE 'placeholder://%';

-- 2. 通过名称匹配 system_resources 表（category='character' 或 'avatar'）
-- 更新 avatar_url（优先使用 category='avatar'，其次使用 category='character'）
UPDATE characters c
INNER JOIN system_resources sr ON c.name COLLATE utf8mb4_unicode_ci = sr.name COLLATE utf8mb4_unicode_ci
    AND sr.category IN ('avatar', 'character')
SET c.avatar_url = sr.url
WHERE (c.avatar_url IS NULL 
    OR c.avatar_url = ''
    OR c.avatar_url LIKE 'placeholder://%')
  AND sr.url IS NOT NULL 
  AND sr.url != ''
  AND sr.url NOT LIKE 'placeholder://%'
  AND NOT EXISTS (
      SELECT 1 FROM system_characters sc 
      WHERE sc.name COLLATE utf8mb4_unicode_ci = c.name COLLATE utf8mb4_unicode_ci
      AND sc.avatar_url IS NOT NULL 
      AND sc.avatar_url != ''
      AND sc.avatar_url NOT LIKE 'placeholder://%'
  )
  AND sr.category = (
      SELECT category FROM system_resources sr2 
      WHERE sr2.name COLLATE utf8mb4_unicode_ci = c.name COLLATE utf8mb4_unicode_ci
      AND sr2.category IN ('avatar', 'character')
      ORDER BY CASE WHEN sr2.category = 'avatar' THEN 1 ELSE 2 END
      LIMIT 1
  );

-- 更新 background_url（使用 category='character'）
UPDATE characters c
INNER JOIN system_resources sr ON c.name COLLATE utf8mb4_unicode_ci = sr.name COLLATE utf8mb4_unicode_ci
    AND sr.category = 'character'
SET c.background_url = sr.url
WHERE (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%')
  AND sr.url IS NOT NULL 
  AND sr.url != ''
  AND sr.url NOT LIKE 'placeholder://%'
  AND NOT EXISTS (
      SELECT 1 FROM system_characters sc 
      WHERE sc.name COLLATE utf8mb4_unicode_ci = c.name COLLATE utf8mb4_unicode_ci
      AND sc.background_url IS NOT NULL 
      AND sc.background_url != ''
      AND sc.background_url NOT LIKE 'placeholder://%'
  );

-- ==========================================
-- 第三部分：统计更新结果
-- ==========================================

-- 1. 统计场景更新结果
SELECT 
    '场景更新统计' as summary,
    COUNT(*) as total_eras,
    COUNT(CASE WHEN image_url IS NOT NULL AND image_url != '' AND image_url NOT LIKE 'placeholder://%' THEN 1 END) as eras_with_image,
    COUNT(CASE WHEN image_url IS NULL OR image_url = '' OR image_url LIKE 'placeholder://%' THEN 1 END) as eras_without_image
FROM eras
WHERE is_deleted = 0;

-- 2. 统计角色更新结果
SELECT 
    '角色更新统计' as summary,
    COUNT(*) as total_characters,
    COUNT(CASE WHEN avatar_url IS NOT NULL AND avatar_url != '' AND avatar_url NOT LIKE 'placeholder://%' THEN 1 END) as characters_with_avatar,
    COUNT(CASE WHEN background_url IS NOT NULL AND background_url != '' AND background_url NOT LIKE 'placeholder://%' THEN 1 END) as characters_with_background,
    COUNT(CASE WHEN (avatar_url IS NULL OR avatar_url = '' OR avatar_url LIKE 'placeholder://%') 
                AND (background_url IS NULL OR background_url = '' OR background_url LIKE 'placeholder://%') 
                THEN 1 END) as characters_without_images
FROM characters
WHERE is_deleted = 0;

-- 3. 显示更新后的示例数据
SELECT 
    '更新后的场景示例' as type,
    e.id,
    e.name,
    e.image_url,
    se.name as matched_system_era,
    se.image_url as matched_system_era_image
FROM eras e
LEFT JOIN system_eras se ON e.system_era_id = se.id OR e.name COLLATE utf8mb4_unicode_ci = se.name COLLATE utf8mb4_unicode_ci
WHERE e.is_deleted = 0
  AND e.image_url IS NOT NULL 
  AND e.image_url != ''
  AND e.image_url NOT LIKE 'placeholder://%'
ORDER BY e.id
LIMIT 10;

SELECT 
    '更新后的角色示例' as type,
    c.id,
    c.name,
    c.avatar_url,
    c.background_url,
    sc.name as matched_system_character,
    sc.avatar_url as matched_system_character_avatar
FROM characters c
LEFT JOIN system_characters sc ON c.name COLLATE utf8mb4_unicode_ci = sc.name COLLATE utf8mb4_unicode_ci
WHERE c.is_deleted = 0
  AND (c.avatar_url IS NOT NULL AND c.avatar_url != '' AND c.avatar_url NOT LIKE 'placeholder://%'
       OR c.background_url IS NOT NULL AND c.background_url != '' AND c.background_url NOT LIKE 'placeholder://%')
ORDER BY c.id
LIMIT 10;
