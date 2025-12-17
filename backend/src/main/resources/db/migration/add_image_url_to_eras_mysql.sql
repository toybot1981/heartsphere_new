-- 为 eras 表添加 image_url 字段 (MySQL 版本)
-- 注意：MySQL 不支持 IF NOT EXISTS，需要先检查字段是否存在

-- 方法1：直接添加（如果字段不存在）
-- 如果字段已存在，会报错，可以忽略
ALTER TABLE eras 
ADD COLUMN image_url TEXT COMMENT '时代封面图片链接';

-- 方法2：如果字段已存在，先删除再添加（谨慎使用）
-- ALTER TABLE eras DROP COLUMN IF EXISTS image_url;
-- ALTER TABLE eras ADD COLUMN image_url TEXT COMMENT '时代封面图片链接';

-- 验证字段是否添加成功
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'heartsphere' 
--   AND TABLE_NAME = 'eras' 
--   AND COLUMN_NAME = 'image_url';



