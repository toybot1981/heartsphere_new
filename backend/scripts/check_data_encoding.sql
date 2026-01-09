-- 检查数据编码问题
-- 使用 UTF-8 字符集连接

SET NAMES utf8mb4;

-- 检查 system_resources 表中的数据
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    CASE 
        WHEN name REGEXP '[^\x00-\x7F]' THEN '包含非ASCII字符'
        ELSE '仅ASCII字符'
    END as encoding_check
FROM system_resources
WHERE name IS NOT NULL
LIMIT 20;

-- 检查是否有乱码数据（检查常见的中文字符）
SELECT 
    'system_resources' as table_name,
    id,
    name,
    category,
    LENGTH(name) as byte_length,
    CHAR_LENGTH(name) as char_length
FROM system_resources
WHERE name IS NOT NULL
  AND LENGTH(name) != CHAR_LENGTH(name)
LIMIT 20;

-- 检查 system_characters 表
SELECT 
    'system_characters' as table_name,
    id,
    name,
    LENGTH(name) as byte_length,
    CHAR_LENGTH(name) as char_length
FROM system_characters
WHERE name IS NOT NULL
LIMIT 20;

-- 检查 system_eras 表
SELECT 
    'system_eras' as table_name,
    id,
    name,
    LENGTH(name) as byte_length,
    CHAR_LENGTH(name) as char_length
FROM system_eras
WHERE name IS NOT NULL
LIMIT 20;
