-- 修复物品类别资源的乱码问题
-- 从 system_era_items 表中获取正确的中文名称来更新 system_resources
SET NAMES utf8mb4;
USE heartsphere;

-- ==========================================
-- 第一部分：检查乱码情况
-- ==========================================

-- 1. 检查物品类别的资源，查看是否有乱码
SELECT 
    '=== 物品资源乱码检查 ===' as info;

SELECT 
    sr.id,
    sr.name as resource_name,
    sr.description as resource_desc,
    HEX(sr.name) as name_hex,
    HEX(sr.description) as desc_hex,
    sei.name as correct_item_name,
    sei.description as correct_item_desc
FROM system_resources sr
LEFT JOIN system_era_items sei ON (
    sr.name = sei.name 
    OR sr.name = CONCAT(sei.name, '（物品）')
    OR sr.name = CONCAT(sei.name, '(物品)')
    OR TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
    OR TRIM(REPLACE(REPLACE(sei.name, ' ', ''), '　', '')) = TRIM(REPLACE(REPLACE(sr.name, ' ', ''), '　', ''))
)
WHERE sr.category = 'item'
ORDER BY sr.id
LIMIT 30;

-- ==========================================
-- 第二部分：修复乱码 - 更新名称和描述
-- ==========================================

-- 1. 完全匹配：直接更新名称和描述
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sr.name = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
AND (sr.name != sei.name OR COALESCE(sr.description, '') != COALESCE(sei.description, ''));

-- 2. 资源名称包含"（物品）"后缀：去掉后缀后匹配并更新
UPDATE system_resources sr
INNER JOIN system_era_items sei ON TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
AND (sr.name LIKE '%（物品）%' OR sr.name LIKE '%(物品)%')
AND sr.name != sei.name;

-- 3. 去除空格后匹配（处理可能的空格差异导致的乱码）
UPDATE system_resources sr
INNER JOIN system_era_items sei ON TRIM(REPLACE(REPLACE(sei.name, ' ', ''), '　', '')) = TRIM(REPLACE(REPLACE(sr.name, ' ', ''), '　', ''))
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
AND sr.name != sei.name
AND NOT EXISTS (
    SELECT 1 FROM system_era_items sei2 
    WHERE sei2.name = sr.name
);

-- 4. 通过 URL 文件名匹配（如果 URL 包含物品名称的一部分）
-- 这个需要更复杂的逻辑，暂时跳过

-- ==========================================
-- 第三部分：验证修复结果
-- ==========================================

-- 1. 统计更新结果
SELECT 
    '=== 更新结果统计 ===' as info;

SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as items_with_name,
    COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as items_with_description,
    COUNT(CASE WHEN name LIKE '%（物品）%' OR name LIKE '%(物品)%' THEN 1 END) as items_with_suffix,
    COUNT(CASE WHEN name REGEXP '[^[:print:]]' THEN 1 END) as items_with_non_printable
FROM system_resources 
WHERE category = 'item';

-- 2. 显示修复后的示例数据
SELECT 
    '=== 修复后的示例数据 ===' as info;

SELECT 
    sr.id,
    sr.name,
    LEFT(sr.description, 50) as description_preview,
    sr.category,
    sei.name as matched_item_name,
    CASE 
        WHEN sr.name = sei.name THEN '✓ 匹配'
        ELSE '✗ 不匹配'
    END as match_status
FROM system_resources sr
LEFT JOIN system_era_items sei ON sr.name = sei.name
WHERE sr.category = 'item'
ORDER BY sr.id
LIMIT 20;

-- 3. 检查是否还有未匹配的资源
SELECT 
    '=== 未匹配的资源（可能需要手动处理） ===' as info;

SELECT 
    sr.id,
    sr.name,
    LEFT(sr.description, 50) as description_preview,
    sr.url
FROM system_resources sr
WHERE sr.category = 'item'
AND NOT EXISTS (
    SELECT 1 FROM system_era_items sei 
    WHERE sei.name = sr.name
    OR sr.name = CONCAT(sei.name, '（物品）')
    OR sr.name = CONCAT(sei.name, '(物品)')
    OR TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
)
LIMIT 20;
