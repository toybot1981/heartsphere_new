-- 修复物品类别资源的乱码问题
-- 从 system_era_items 表中获取正确的中文名称来更新 system_resources
USE heartsphere;

-- 1. 首先查看物品类别的资源，检查乱码情况
SELECT 
    '=== 物品资源检查 ===' as info;

SELECT 
    sr.id,
    sr.name as resource_name,
    sr.description as resource_desc,
    sei.name as item_name,
    sei.description as item_desc,
    CASE 
        WHEN sr.name = sei.name THEN '名称匹配'
        WHEN sr.name LIKE CONCAT('%', sei.name, '%') THEN '名称包含'
        WHEN sei.name LIKE CONCAT('%', sr.name, '%') THEN '物品名称包含资源名称'
        ELSE '不匹配'
    END as match_status
FROM system_resources sr
LEFT JOIN system_era_items sei ON (
    sr.name = sei.name 
    OR sr.name = CONCAT(sei.name, '（物品）')
    OR sr.name = CONCAT(sei.name, '(物品)')
    OR TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
)
WHERE sr.category = 'item'
ORDER BY sr.id
LIMIT 30;

-- 2. 根据 system_era_items 表中的正确名称更新 system_resources 中的物品资源
-- 匹配规则1：完全匹配
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sr.name = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
AND (sr.name != sei.name OR COALESCE(sr.description, '') != COALESCE(sei.description, ''));

-- 匹配规则2：资源名称包含"（物品）"后缀，去掉后缀后匹配
UPDATE system_resources sr
INNER JOIN system_era_items sei ON TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.category = 'item'
AND (sr.name LIKE '%（物品）%' OR sr.name LIKE '%(物品)%')
AND sr.name != sei.name;

-- 匹配规则3：通过 URL 中的文件名匹配（如果 URL 包含物品名称）
-- 这个规则需要更复杂的匹配逻辑，暂时跳过

-- 3. 显示更新结果
SELECT 
    '=== 更新结果统计 ===' as info;

SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as items_with_name,
    COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as items_with_description,
    COUNT(CASE WHEN name LIKE '%（物品）%' OR name LIKE '%(物品)%' THEN 1 END) as items_with_suffix
FROM system_resources 
WHERE category = 'item';

-- 4. 显示更新后的示例数据
SELECT 
    '=== 更新后的示例数据 ===' as info;

SELECT 
    sr.id,
    sr.name,
    sr.description,
    sr.category,
    sei.name as matched_item_name,
    sei.description as matched_item_desc
FROM system_resources sr
LEFT JOIN system_era_items sei ON sr.name = sei.name
WHERE sr.category = 'item'
ORDER BY sr.id
LIMIT 20;
