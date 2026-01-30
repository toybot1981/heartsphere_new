-- 角色长期学习系统迁移脚本
-- 用于添加角色知识资产库和学习历史表
-- 执行时间: 2026-01-24

SET NAMES utf8mb4;

-- 1. 向 characters 表添加新字段
ALTER TABLE `characters` 
ADD COLUMN `experience_level` INT DEFAULT 1 COMMENT '角色经验等级 (1-5: 新手到专家)',
ADD COLUMN `knowledge_asset_count` INT DEFAULT 0 COMMENT '角色知识资产总数',
ADD COLUMN `last_learning_update` TIMESTAMP NULL COMMENT '最后一次学习/资产更新时间',
ADD INDEX `idx_experience_level` (`experience_level`);

-- 2. 创建角色知识资产表
CREATE TABLE `character_knowledge_assets` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `asset_type` VARCHAR(50) NOT NULL COMMENT '资产类型: DOMAIN_KNOWLEDGE/INTERACTION_SKILLS/DECISION_RULES/EXPERIENCE_PATTERNS',
    `title` VARCHAR(255) NOT NULL COMMENT '资产标题',
    `content` LONGTEXT NOT NULL COMMENT '完整内容',
    `summary` VARCHAR(500) COMMENT '摘要（用于相似度计算）',
    `source_conversation_id` BIGINT COMMENT '源对话消息ID',
    `trust_score` INT DEFAULT 50 COMMENT '信任度评分 (0-100)',
    `usage_count` INT DEFAULT 0 COMMENT '被使用次数',
    `positive_feedback_count` INT DEFAULT 0 COMMENT '正面评价数',
    `negative_feedback_count` INT DEFAULT 0 COMMENT '负面评价数',
    `is_auto_promoted` BOOLEAN DEFAULT TRUE COMMENT '是否自动升级',
    `is_approved` BOOLEAN DEFAULT FALSE COMMENT '是否通过审核',
    `approved_by` VARCHAR(64) COMMENT '审核者ID',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `last_used_at` TIMESTAMP NULL COMMENT '最后使用时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_type` (`character_id`, `asset_type`),
    KEY `idx_trust_score` (`trust_score`),
    KEY `idx_created_at` (`created_at`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_is_approved` (`is_approved`),
    CONSTRAINT `fk_asset_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色知识资产表';

-- 3. 创建角色学习历史表
CREATE TABLE `character_learning_history` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `event_type` VARCHAR(50) NOT NULL COMMENT '事件类型: ASSET_PROMOTED/ASSET_UPDATED/LEVEL_UP/FEEDBACK_RECEIVED',
    `asset_id` BIGINT COMMENT '关联的资产ID',
    `description` TEXT COMMENT '事件描述',
    `metadata` JSON COMMENT '事件元数据（JSON格式）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_event_time` (`character_id`, `created_at`),
    KEY `idx_event_type` (`event_type`),
    KEY `idx_character_id` (`character_id`),
    CONSTRAINT `fk_history_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_history_asset` FOREIGN KEY (`asset_id`) REFERENCES `character_knowledge_assets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色学习历史表';

-- 4. 验证迁移结果
SELECT '=== Migration Complete ===' as status,
       (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_NAME='characters' AND COLUMN_NAME='experience_level') as characters_experience_level_added,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='character_knowledge_assets') as character_knowledge_assets_created,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='character_learning_history') as character_learning_history_created;
