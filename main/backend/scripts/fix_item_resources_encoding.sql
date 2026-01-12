-- 修复物品类别资源的乱码问题
USE heartsphere;

-- 1. 首先查看物品类别的资源，检查乱码情况
SELECT 
    id,
    name,
    description,
    category,
    HEX(name) as name_hex,
    HEX(description) as desc_hex
FROM system_resources 
WHERE category = 'item'
ORDER BY id
LIMIT 20;

-- 2. 检查是否有乱码（常见乱码模式：如问号、方块等）
-- 如果数据本身在数据库中就是乱码，需要从 system_era_items 表中获取正确的中文名称来更新

-- 3. 根据 system_era_items 表中的正确名称更新 system_resources 中的物品资源
-- 匹配规则：system_resources.name 应该与 system_era_items.name 匹配
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sr.name = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(sei.description, sr.description)
WHERE sr.category = 'item'
AND (sr.name != sei.name OR sr.description != COALESCE(sei.description, sr.description));

-- 4. 对于名称中包含"（物品）"后缀的资源，去掉后缀并匹配
UPDATE system_resources sr
INNER JOIN system_era_items sei ON TRIM(REPLACE(REPLACE(sr.name, '（物品）', ''), '(物品)', '')) = sei.name
SET 
    sr.name = sei.name,
    sr.description = COALESCE(sei.description, sr.description)
WHERE sr.category = 'item'
AND (sr.name LIKE '%（物品）%' OR sr.name LIKE '%(物品)%')
AND (sr.name != sei.name OR sr.description != COALESCE(sei.description, sr.description));

-- 5. 显示更新结果
SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN name IS NOT NULL AND name != '' THEN 1 END) as items_with_name,
    COUNT(CASE WHEN description IS NOT NULL AND description != '' THEN 1 END) as items_with_description
FROM system_resources 
WHERE category = 'item';
