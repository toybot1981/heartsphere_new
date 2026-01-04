-- ============================================
-- 更新用户场景图片：从系统预置场景获取图片URL
-- ============================================
-- 功能：查找用户场景中图片URL为空或无效的场景，
--      通过 system_era_id 关联到 system_eras 表，
--      如果系统预置场景有有效的图片URL，则更新用户场景的图片URL
-- ============================================

SET SQL_SAFE_UPDATES = 0;

-- 显示更新前的统计信息
SELECT 
    '更新前统计' AS status,
    COUNT(*) AS total_user_eras,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' OR image_url LIKE 'placeholder://%' THEN 1 ELSE 0 END) AS eras_without_image,
    SUM(CASE WHEN system_era_id IS NOT NULL THEN 1 ELSE 0 END) AS eras_with_system_era_id,
    SUM(CASE WHEN system_era_id IS NOT NULL 
             AND (image_url IS NULL OR image_url = '' OR image_url LIKE 'placeholder://%')
             AND EXISTS (
                 SELECT 1 FROM system_eras se 
                 WHERE se.id = eras.system_era_id 
                 AND se.image_url IS NOT NULL 
                 AND se.image_url != '' 
                 AND se.image_url NOT LIKE 'placeholder://%'
             ) THEN 1 ELSE 0 END) AS eras_can_be_updated
FROM eras
WHERE is_deleted = 0;

-- ============================================
-- 更新用户场景的图片URL（从系统预置场景获取）
-- ============================================
UPDATE eras e
INNER JOIN system_eras se ON e.system_era_id = se.id
SET e.image_url = se.image_url,
    e.updated_at = NOW()
WHERE e.is_deleted = 0
  AND e.system_era_id IS NOT NULL
  -- 只更新图片URL为空、null或placeholder的场景
  AND (e.image_url IS NULL 
       OR e.image_url = '' 
       OR e.image_url LIKE 'placeholder://%'
       OR (e.image_url NOT LIKE 'http://%' 
           AND e.image_url NOT LIKE 'https://%' 
           AND e.image_url NOT LIKE 'images/%'))
  -- 确保系统预置场景有有效的图片URL
  AND se.image_url IS NOT NULL
  AND se.image_url != ''
  AND se.image_url NOT LIKE 'placeholder://%'
  AND (se.image_url LIKE 'http://%' 
       OR se.image_url LIKE 'https://%' 
       OR se.image_url LIKE 'images/%'
       OR se.image_url LIKE 'general/%');

-- 显示更新结果
SELECT 
    '更新结果' AS status,
    ROW_COUNT() AS updated_count;

-- 显示更新后的统计信息
SELECT 
    '更新后统计' AS status,
    COUNT(*) AS total_user_eras,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' OR image_url LIKE 'placeholder://%' THEN 1 ELSE 0 END) AS eras_without_image,
    SUM(CASE WHEN system_era_id IS NOT NULL THEN 1 ELSE 0 END) AS eras_with_system_era_id,
    SUM(CASE WHEN system_era_id IS NOT NULL 
             AND image_url IS NOT NULL 
             AND image_url != '' 
             AND image_url NOT LIKE 'placeholder://%' THEN 1 ELSE 0 END) AS eras_with_valid_image
FROM eras
WHERE is_deleted = 0;

-- 显示更新详情（可选，用于验证）
SELECT 
    e.id AS era_id,
    e.name AS era_name,
    e.system_era_id,
    se.name AS system_era_name,
    e.image_url AS updated_image_url,
    e.updated_at
FROM eras e
INNER JOIN system_eras se ON e.system_era_id = se.id
WHERE e.is_deleted = 0
  AND e.system_era_id IS NOT NULL
  AND e.image_url IS NOT NULL
  AND e.image_url != ''
  AND e.image_url NOT LIKE 'placeholder://%'
  AND e.updated_at >= DATE_SUB(NOW(), INTERVAL 1 MINUTE)
ORDER BY e.updated_at DESC
LIMIT 20;

SET SQL_SAFE_UPDATES = 1;

