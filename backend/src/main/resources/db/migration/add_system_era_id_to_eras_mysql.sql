-- 为 eras 表添加 system_era_id 字段 (MySQL 版本)
-- 用于关联系统预置时代ID

ALTER TABLE eras 
ADD COLUMN system_era_id BIGINT NULL COMMENT '关联的系统预置时代ID' AFTER image_url;

-- 添加外键约束（可选，如果需要确保引用的系统时代存在）
-- ALTER TABLE eras 
-- ADD CONSTRAINT fk_eras_system_era 
-- FOREIGN KEY (system_era_id) REFERENCES system_eras(id) 
-- ON DELETE SET NULL ON UPDATE CASCADE;

-- 验证字段是否添加成功
-- SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'heartsphere' 
--   AND TABLE_NAME = 'eras' 
--   AND COLUMN_NAME = 'system_era_id';
