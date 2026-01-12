-- 为用户资源图片URL添加userId前缀
-- 执行时间：2025-01-03
-- 说明：
-- 1. 将格式为 category/year/month/filename 的路径转换为 userId/category/year/month/filename
-- 2. 只处理用户表（characters, eras等）中路径不包含userId的记录
-- 3. 外部URL（http://, https://, placeholder://）保持不变

-- ============================================
-- 1. characters 表 - avatar_url
-- ============================================
UPDATE characters
SET avatar_url = CONCAT(user_id, '/', avatar_url)
WHERE user_id IS NOT NULL
  AND avatar_url IS NOT NULL
  AND avatar_url != ''
  AND avatar_url NOT LIKE '%/%/%/%/%'  -- 不包含userId（旧格式：category/year/month/file）
  AND avatar_url NOT LIKE 'http://%'
  AND avatar_url NOT LIKE 'https://%'
  AND avatar_url NOT LIKE 'placeholder://%';

-- characters 表 - background_url
UPDATE characters
SET background_url = CONCAT(user_id, '/', background_url)
WHERE user_id IS NOT NULL
  AND background_url IS NOT NULL
  AND background_url != ''
  AND background_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND background_url NOT LIKE 'http://%'
  AND background_url NOT LIKE 'https://%'
  AND background_url NOT LIKE 'placeholder://%';

-- ============================================
-- 2. eras 表 - image_url
-- ============================================
UPDATE eras
SET image_url = CONCAT(user_id, '/', image_url)
WHERE user_id IS NOT NULL
  AND image_url IS NOT NULL
  AND image_url != ''
  AND image_url NOT LIKE '%/%/%/%/%'  -- 不包含userId
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%'
  AND image_url NOT LIKE 'placeholder://%';

-- ============================================
-- 注意：
-- 1. 此脚本为路径添加userId前缀
-- 2. 只处理格式为 category/year/month/filename 的路径
-- 3. 已经包含userId的路径（格式为 userId/category/year/month/filename）不会受影响
-- 4. 外部URL保持不变
-- 5. 此脚本应在文件迁移之后执行，确保文件系统中的文件也已迁移
