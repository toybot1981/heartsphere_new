-- 为 skill_resources 表添加 description 列（若不存在）
-- 解决 Admin 模块查询时报错 Unknown column 'sr1_0.description' in 'field list'
-- 与 V20260128__enhance_skill_resources_for_creator 解耦，确保列一定存在

SET @dbname = DATABASE();
SET @tablename = 'skill_resources';
SET @preparedStatement = (SELECT IF(
    (
        SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
        WHERE
            (TABLE_SCHEMA = @dbname)
            AND (TABLE_NAME = @tablename)
            AND (COLUMN_NAME = 'description')
    ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN description TEXT COMMENT ''资源描述'' AFTER resource_name')
));
PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
