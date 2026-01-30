-- 为 skill_resources 表添加 description 列（若不存在）
-- 解决 Admin 模块查询时报错 Unknown column 'sr1_0.description' in 'field list'
-- Admin 独立启动时也会执行此迁移，确保 heartsphere 库中该列存在

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
