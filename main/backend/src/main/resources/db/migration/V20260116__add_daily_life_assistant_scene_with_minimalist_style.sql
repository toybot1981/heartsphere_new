-- 为"日常生活助手"场景添加极简主义风格设置
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20260116__add_daily_life_assistant_scene_with_minimalist_style.sql
-- 
-- 说明：本文件确保"日常生活助手"场景及其6个角色资源正确配置
-- 1. 为 system_eras 表添加 style 字段（如果不存在）
-- 2. 插入或更新"日常生活助手"场景，设置 style='minimalist'
-- 3. 确保所有数据使用 UTF-8 编码

SET NAMES utf8mb4;

-- ========== 1. 为 system_eras 表添加 style 字段（如果不存在）==========
-- 注意：使用存储过程来检查字段是否存在，避免重复添加
DELIMITER $$

DROP PROCEDURE IF EXISTS AddStyleColumnIfNotExists$$

CREATE PROCEDURE AddStyleColumnIfNotExists()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'system_eras'
      AND COLUMN_NAME = 'style';
    
    IF column_exists = 0 THEN
        ALTER TABLE `system_eras`
        ADD COLUMN `style` VARCHAR(50) DEFAULT 'realistic' COMMENT '场景风格：realistic-写实, anime-动漫, cyberpunk-赛博朋克, fantasy-奇幻, steampunk-蒸汽朋克, minimalist-极简, watercolor-水彩, oil-painting-油画';
    END IF;
END$$

DELIMITER ;

CALL AddStyleColumnIfNotExists();
DROP PROCEDURE IF EXISTS AddStyleColumnIfNotExists;

-- ========== 2. 插入或更新"日常生活助手"场景，设置 style='minimalist' ==========
-- 如果场景不存在，则插入；如果存在，则更新 style 字段
INSERT INTO `system_eras` (`name`, `description`, `image_url`, `is_active`, `sort_order`, `style`)
SELECT 
    '日常生活助手',
    '【生活助手型角色】提供日常生活帮助的专业数字人角色，包括时间管理、健康生活、学习成长、心理健康、情感陪伴等领域。这些角色专注于解决实际生活问题，提供专业指导和情感陪伴。',
    'placeholder://era/daily_life_assistant.jpg',
    TRUE,
    100,
    'minimalist'
WHERE NOT EXISTS (SELECT 1 FROM `system_eras` WHERE `name` = '日常生活助手');

-- 更新已存在场景的 style 字段
UPDATE `system_eras`
SET `style` = 'minimalist',
    `updated_at` = NOW()
WHERE `name` = '日常生活助手'
  AND (`style` IS NULL OR `style` != 'minimalist');

-- ========== 3. 验证场景数据 ==========
SELECT 
    id,
    name,
    description,
    style,
    image_url,
    is_active,
    sort_order
FROM `system_eras`
WHERE `name` = '日常生活助手';
