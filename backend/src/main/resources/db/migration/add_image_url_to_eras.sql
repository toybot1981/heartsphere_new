-- 为 eras 表添加 image_url 字段
-- 如果字段已存在，此脚本会失败，可以忽略错误

ALTER TABLE eras 
ADD COLUMN IF NOT EXISTS image_url TEXT COMMENT '时代封面图片链接';

-- 验证字段是否添加成功
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'heartsphere' 
--   AND TABLE_NAME = 'eras' 
--   AND COLUMN_NAME = 'image_url';



