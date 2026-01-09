-- 检查物品类别的资源数据编码问题
USE heartsphere;

-- 1. 检查物品类别的资源数量
SELECT 
    COUNT(*) as total_items,
    COUNT(CASE WHEN name REGEXP '[^[:print:]]' THEN 1 END) as name_with_non_printable,
    COUNT(CASE WHEN description REGEXP '[^[:print:]]' THEN 1 END) as desc_with_non_printable,
    COUNT(CASE WHEN prompt REGEXP '[^[:print:]]' THEN 1 END) as prompt_with_non_printable
FROM system_resources 
WHERE category = 'item';

-- 2. 查看物品类别的资源示例（前10条）
SELECT 
    id,
    name,
    description,
    category,
    HEX(name) as name_hex,
    HEX(description) as desc_hex,
    LENGTH(name) as name_length,
    CHAR_LENGTH(name) as name_char_length,
    LENGTH(description) as desc_length,
    CHAR_LENGTH(description) as desc_char_length
FROM system_resources 
WHERE category = 'item'
ORDER BY id
LIMIT 10;

-- 3. 检查是否有明显的乱码模式（常见乱码特征）
SELECT 
    id,
    name,
    description,
    CASE 
        WHEN name LIKE '%%' THEN 'name_has_replacement_char'
        WHEN description LIKE '%%' THEN 'desc_has_replacement_char'
        ELSE 'ok'
    END as encoding_status
FROM system_resources 
WHERE category = 'item'
AND (name LIKE '%%' OR description LIKE '%%')
LIMIT 20;
