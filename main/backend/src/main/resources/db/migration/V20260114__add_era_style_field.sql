-- 为场景（Era）添加风格字段
-- 用于存储场景的风格设置（如：realistic, anime, cyberpunk 等）
-- 默认值为 'realistic'（写实风格）

-- 添加 style 字段（如果不存在）
-- 注意：使用 IF NOT EXISTS 语法在某些 MySQL 版本中可能不支持，需要手动检查
ALTER TABLE eras 
ADD COLUMN style VARCHAR(50) DEFAULT 'realistic' COMMENT '场景风格：realistic-写实, anime-动漫, cyberpunk-赛博朋克, fantasy-奇幻, steampunk-蒸汽朋克, minimalist-极简, watercolor-水彩, oil-painting-油画';

-- 为现有数据设置默认值（确保所有现有场景都有风格设置）
UPDATE eras SET style = 'realistic' WHERE style IS NULL OR style = '';

-- 验证数据迁移结果
-- SELECT COUNT(*) as total_eras, 
--        COUNT(CASE WHEN style IS NOT NULL THEN 1 END) as eras_with_style,
--        style, COUNT(*) as count_by_style
-- FROM eras 
-- GROUP BY style;
