-- 修复数据库字符编码问题
-- 确保所有数据库、表、列都使用 UTF-8 (utf8mb4)

-- ==========================================
-- 第一部分：设置数据库字符集
-- ==========================================

-- 设置数据库默认字符集为 utf8mb4
ALTER DATABASE heartsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- 第二部分：修复系统表的字符集
-- ==========================================

-- 修复 system_resources 表
ALTER TABLE system_resources CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_characters 表
ALTER TABLE system_characters CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_eras 表
ALTER TABLE system_eras CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_main_stories 表
ALTER TABLE system_main_stories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_worlds 表
ALTER TABLE system_worlds CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_scripts 表
ALTER TABLE system_scripts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_config 表
ALTER TABLE system_config CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_ai_config 表
ALTER TABLE system_ai_config CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_admin 表
ALTER TABLE system_admin CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_invite_codes 表
ALTER TABLE system_invite_codes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_era_events 表
ALTER TABLE system_era_events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 修复 system_era_items 表
ALTER TABLE system_era_items CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ==========================================
-- 第三部分：验证修复结果
-- ==========================================

-- 检查数据库字符集
SELECT 
    'database' as type,
    SCHEMA_NAME as name,
    DEFAULT_CHARACTER_SET_NAME as charset,
    DEFAULT_COLLATION_NAME as collation
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'heartsphere';

-- 检查所有系统表的字符集
SELECT 
    'table' as type,
    TABLE_NAME as name,
    TABLE_COLLATION as collation
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'heartsphere'
  AND TABLE_NAME LIKE 'system_%'
ORDER BY TABLE_NAME;

-- 检查文本列的字符集
SELECT 
    'column' as type,
    TABLE_NAME,
    COLUMN_NAME,
    CHARACTER_SET_NAME as charset,
    COLLATION_NAME as collation
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'heartsphere'
  AND TABLE_NAME LIKE 'system_%'
  AND CHARACTER_SET_NAME IS NOT NULL
ORDER BY TABLE_NAME, COLUMN_NAME
LIMIT 20;
