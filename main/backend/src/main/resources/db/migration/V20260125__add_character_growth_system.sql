-- 角色自我成长和导师能力系统迁移脚本
-- 用于添加角色成长、关系和导师相关表
-- 执行时间: 2026-01-25

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 1. 向 characters 表添加成长相关字段
ALTER TABLE `characters` 
ADD COLUMN `relationship_stage` VARCHAR(20) DEFAULT 'STRANGER' COMMENT '关系阶段: STRANGER/FRIEND/CLOSE_FRIEND/MENTOR',
ADD COLUMN `growth_trajectory` JSON COMMENT '成长轨迹（JSON格式）',
ADD COLUMN `self_reflection_history` JSON COMMENT '自我反思历史（JSON格式）',
ADD COLUMN `mentorship_capabilities` JSON COMMENT '导师能力列表（JSON格式）',
ADD INDEX `idx_relationship_stage` (`relationship_stage`);

-- 2. 创建角色成长事件表
CREATE TABLE IF NOT EXISTS `character_growth_events` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `event_type` VARCHAR(50) NOT NULL COMMENT '事件类型: LEARNING/REFLECTION/ABILITY_UPGRADE/RELATIONSHIP_PROGRESS',
    `event_category` VARCHAR(50) COMMENT '事件分类: SELF_GROWTH/COMPANIONSHIP/MENTORSHIP',
    `title` VARCHAR(255) COMMENT '事件标题',
    `description` TEXT COMMENT '事件描述',
    `metadata` JSON COMMENT '事件元数据（JSON格式）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_user_time` (`character_id`, `user_id`, `created_at`),
    KEY `idx_event_type` (`event_type`),
    KEY `idx_event_category` (`event_category`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_growth_event_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色成长事件表';

-- 3. 创建角色关系里程碑表
CREATE TABLE IF NOT EXISTS `character_relationship_milestones` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `milestone_type` VARCHAR(50) NOT NULL COMMENT '里程碑类型: STAGE_TRANSITION/EMOTIONAL_CONNECTION/SHARED_EXPERIENCE',
    `from_stage` VARCHAR(20) COMMENT '起始阶段',
    `to_stage` VARCHAR(20) COMMENT '目标阶段',
    `title` VARCHAR(255) NOT NULL COMMENT '里程碑标题',
    `description` TEXT COMMENT '里程碑描述',
    `metadata` JSON COMMENT '里程碑元数据（JSON格式）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_user_time` (`character_id`, `user_id`, `created_at`),
    KEY `idx_milestone_type` (`milestone_type`),
    KEY `idx_stage_transition` (`from_stage`, `to_stage`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_milestone_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色关系里程碑表';

-- 4. 创建角色导师指导会话表
CREATE TABLE IF NOT EXISTS `character_mentorship_sessions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `session_type` VARCHAR(50) NOT NULL COMMENT '会话类型: ACTIVE_GUIDANCE/PERSONALIZED_EDUCATION/GROWTH_PLANNING',
    `title` VARCHAR(255) NOT NULL COMMENT '会话标题',
    `content` LONGTEXT COMMENT '指导内容',
    `learning_objectives` JSON COMMENT '学习目标（JSON格式）',
    `user_progress` JSON COMMENT '用户进度（JSON格式）',
    `effectiveness_score` INT COMMENT '效果评分 (0-100)',
    `user_feedback` TEXT COMMENT '用户反馈',
    `status` VARCHAR(20) DEFAULT 'ACTIVE' COMMENT '状态: ACTIVE/COMPLETED/ARCHIVED',
    `started_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '开始时间',
    `completed_at` TIMESTAMP NULL COMMENT '完成时间',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_user_time` (`character_id`, `user_id`, `started_at`),
    KEY `idx_session_type` (`session_type`),
    KEY `idx_status` (`status`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_user_id` (`user_id`),
    CONSTRAINT `fk_mentorship_character` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色导师指导会话表';

-- 5. 验证迁移结果
SELECT '=== Migration Complete ===' as status,
       (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_NAME='characters' AND COLUMN_NAME='relationship_stage') as characters_relationship_stage_added,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='character_growth_events') as character_growth_events_created,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='character_relationship_milestones') as character_relationship_milestones_created,
       (SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='character_mentorship_sessions') as character_mentorship_sessions_created;
