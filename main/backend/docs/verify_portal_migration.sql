-- 传送门迁移脚本验证 SQL 查询
-- 在 MySQL 客户端中执行这些查询来验证迁移状态

USE heartsphere;

-- 1. 检查 Flyway 迁移历史
SELECT 
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_on,
    success
FROM flyway_schema_history 
WHERE script LIKE '%portal%' 
ORDER BY installed_rank DESC;

-- 2. 检查 portal_config 表是否存在
SHOW TABLES LIKE 'portal_config';

-- 3. 查看 portal_config 表的完整结构
DESCRIBE portal_config;

-- 4. 查看 portal_type 和 permission_type 字段的详细信息
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'heartsphere'
  AND TABLE_NAME = 'portal_config'
  AND COLUMN_NAME IN ('portal_type', 'permission_type');

-- 5. 查看完整的表创建语句
SHOW CREATE TABLE portal_config\G

-- 6. 检查表中是否有数据，以及数据的格式
SELECT 
    id,
    portal_name,
    portal_type,
    permission_type,
    created_at
FROM portal_config
LIMIT 10;

-- 7. 检查 portal_type 的所有可能值
SELECT DISTINCT portal_type, COUNT(*) as count
FROM portal_config
GROUP BY portal_type;

-- 8. 检查 permission_type 的所有可能值
SELECT DISTINCT permission_type, COUNT(*) as count
FROM portal_config
GROUP BY permission_type;
