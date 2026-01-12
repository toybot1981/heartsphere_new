-- 修复双重编码的物品资源（id 1640-1647）
-- 这些数据的HEX编码是双重编码的，需要从 system_era_items 表中获取正确的中文名称
SET NAMES utf8mb4;
USE heartsphere;

-- 1. 检查双重编码的数据
SELECT 
    '双重编码数据检查' as info,
    sr.id,
    sr.name as current_name,
    sr.description as current_desc,
    HEX(sr.name) as name_hex,
    sei.name as correct_name,
    sei.description as correct_desc
FROM system_resources sr
LEFT JOIN system_era_items sei ON (
    -- 尝试匹配：去掉可能的编码问题后匹配
    sei.name COLLATE utf8mb4_unicode_ci = CONVERT(UNHEX(REPLACE(REPLACE(REPLACE(REPLACE(HEX(sr.name), 'C3A5', 'E5'), 'C3A8', 'E8'), 'C3A6', 'E6'), 'C3A7', 'E7')), CHAR USING utf8mb4) COLLATE utf8mb4_unicode_ci
)
WHERE sr.category = 'item'
  AND sr.id BETWEEN 1640 AND 1647
ORDER BY sr.id;

-- 2. 直接根据已知的对应关系更新（学生证、课本、笔记本、校园卡、社团徽章、奖学金证书、实验报告、毕业设计）
UPDATE system_resources sr
INNER JOIN system_era_items sei ON (
    (sr.id = 1640 AND sei.name = '学生证')
    OR (sr.id = 1641 AND sei.name = '课本')
    OR (sr.id = 1642 AND sei.name = '笔记本')
    OR (sr.id = 1643 AND sei.name = '校园卡')
    OR (sr.id = 1644 AND sei.name = '社团徽章')
    OR (sr.id = 1645 AND sei.name = '奖学金证书')
    OR (sr.id = 1646 AND sei.name = '实验报告')
    OR (sr.id = 1647 AND sei.name = '毕业设计')
)
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
  AND sr.id BETWEEN 1640 AND 1647;

-- 3. 显示更新结果
SELECT 
    '更新结果' as info,
    sr.id,
    sr.name,
    LEFT(sr.description, 50) as description_preview,
    sei.name as matched_item_name
FROM system_resources sr
LEFT JOIN system_era_items sei ON sr.name COLLATE utf8mb4_unicode_ci = sei.name COLLATE utf8mb4_unicode_ci
WHERE sr.category = 'item'
  AND sr.id BETWEEN 1640 AND 1647
ORDER BY sr.id;
