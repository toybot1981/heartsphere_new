-- 同步资源表中的图片URL到角色表和场景表
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20260118__sync_resource_images_to_characters_and_eras.sql
-- 
-- 说明：将 system_resources 表中已更新的图片URL同步到 system_characters 和 system_eras 表

SET NAMES utf8mb4;

-- ========== 1. 同步场景图片 (system_eras.image_url) ==========
UPDATE `system_eras` e
INNER JOIN `system_resources` r ON e.name = r.name AND r.category = 'era'
SET e.image_url = r.url,
    e.updated_at = NOW()
WHERE r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (e.image_url IS NULL 
    OR e.image_url = ''
    OR e.image_url LIKE 'placeholder://%');

-- ========== 2. 同步角色头像 (system_characters.avatar_url) ==========
-- 匹配规则：system_resources.name = '{角色名}-头像'
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON CONCAT(c.name, '-头像') = r.name AND r.category = 'character'
SET c.avatar_url = r.url,
    c.updated_at = NOW()
WHERE r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.avatar_url IS NULL 
    OR c.avatar_url = ''
    OR c.avatar_url LIKE 'placeholder://%');

-- ========== 3. 同步角色背景 (system_characters.background_url) ==========
-- 匹配规则：根据角色当前的 background_url 中的场景名，匹配资源表中的 '{场景名}-背景'
-- 例如：placeholder://character/efficiency_studio_background.jpg -> 效率工作室-背景

-- 3.1 时小光 -> 效率工作室-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '效率工作室-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '时小光'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- 3.2 康小健 -> 健康生活馆-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '健康生活馆-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '康小健'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- 3.3 学小知 -> 智慧书房-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '智慧书房-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '学小知'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- 3.4 心小暖 -> 温暖小屋-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '温暖小屋-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '心小暖'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- 3.5 心小安 -> 心理健康中心-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '心理健康中心-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '心小安'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- 3.6 暖小阳 -> 阳光客厅-背景
UPDATE `system_characters` c
INNER JOIN `system_resources` r ON r.name = '阳光客厅-背景' AND r.category = 'character'
SET c.background_url = r.url,
    c.updated_at = NOW()
WHERE c.name = '暖小阳'
  AND r.url IS NOT NULL 
  AND r.url != ''
  AND r.url NOT LIKE 'placeholder://%'
  AND (c.background_url IS NULL 
    OR c.background_url = ''
    OR c.background_url LIKE 'placeholder://%');

-- ========== 4. 验证同步结果 ==========
SELECT '场景同步结果' as sync_type, id, name, image_url 
FROM system_eras 
WHERE name = '日常生活助手'
UNION ALL
SELECT '角色同步结果', id, name, CONCAT('头像:', avatar_url, ' | 背景:', background_url) as image_url
FROM system_characters 
WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
ORDER BY sync_type, id;
