-- 添加插件发布状态字段
-- 功能：支持插件预览和发布管理
-- 创建时间：2025-01-04

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 添加发布状态字段
ALTER TABLE plugins 
ADD COLUMN publish_status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '发布状态：DRAFT(草稿), PENDING(待审核), PUBLISHED(已发布), ARCHIVED(已归档)' AFTER status;

-- 添加预览URL字段（可选，用于插件预览）
ALTER TABLE plugins 
ADD COLUMN preview_url VARCHAR(500) COMMENT '预览URL' AFTER icon_url;

-- 添加发布说明字段
ALTER TABLE plugins 
ADD COLUMN publish_note TEXT COMMENT '发布说明' AFTER publish_status;

-- 添加发布时间字段
ALTER TABLE plugins 
ADD COLUMN published_at DATETIME COMMENT '发布时间' AFTER publish_status;

-- 更新索引
ALTER TABLE plugins 
ADD INDEX idx_publish_status (publish_status);
