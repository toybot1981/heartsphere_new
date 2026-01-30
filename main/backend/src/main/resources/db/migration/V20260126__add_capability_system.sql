-- 角色能力体系迁移脚本
-- 用于添加能力体系相关表，整合角色成长系统
-- 执行时间: 2026-01-26

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 1. 创建角色能力档案表
CREATE TABLE IF NOT EXISTS `role_capability_profile` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `skill_dimension_score` INT DEFAULT 0 COMMENT '技能维度得分',
    `memory_dimension_score` INT DEFAULT 0 COMMENT '记忆维度得分',
    `consciousness_dimension_score` INT DEFAULT 0 COMMENT '意识维度得分',
    `collaboration_dimension_score` INT DEFAULT 0 COMMENT '协作维度得分',
    `relationship_dimension_score` INT DEFAULT 0 COMMENT '关系维度得分',
    `mentorship_capability_score` INT DEFAULT 0 COMMENT '导师能力得分',
    `companionship_capability_score` INT DEFAULT 0 COMMENT '挚友能力得分',
    `overall_score` INT DEFAULT 0 COMMENT '综合得分',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_character_id` (`character_id`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_overall_score` (`overall_score`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色能力档案表';

-- 2. 创建能力经验值表
CREATE TABLE IF NOT EXISTS `capability_experience` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `skill_experience` BIGINT DEFAULT 0 COMMENT '技能经验值',
    `memory_experience` BIGINT DEFAULT 0 COMMENT '记忆经验值',
    `consciousness_experience` BIGINT DEFAULT 0 COMMENT '意识经验值',
    `collaboration_experience` BIGINT DEFAULT 0 COMMENT '协作经验值',
    `relationship_experience` BIGINT DEFAULT 0 COMMENT '关系维度经验值',
    `mentorship_experience` BIGINT DEFAULT 0 COMMENT '导师能力经验值',
    `companionship_experience` BIGINT DEFAULT 0 COMMENT '挚友能力经验值',
    `total_experience` BIGINT DEFAULT 0 COMMENT '总经验值',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_character_id` (`character_id`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_total_experience` (`total_experience`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能力经验值表';

-- 3. 创建能力维度定义表（可选，用于配置）
CREATE TABLE IF NOT EXISTS `capability_dimension` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `dimension_code` VARCHAR(50) NOT NULL COMMENT '维度代码: SKILL/MEMORY/CONSCIOUSNESS/COLLABORATION/RELATIONSHIP',
    `dimension_name` VARCHAR(100) NOT NULL COMMENT '维度名称',
    `description` TEXT COMMENT '维度描述',
    `weight` DECIMAL(5,2) DEFAULT 1.00 COMMENT '权重',
    `is_active` BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_dimension_code` (`dimension_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能力维度定义表';

-- 4. 插入默认能力维度数据
INSERT INTO `capability_dimension` (`dimension_code`, `dimension_name`, `description`, `weight`) VALUES
('SKILL', '技能维度', '技能熟练度、成功率、使用频率', 1.00),
('MEMORY', '记忆维度', '记忆质量、检索精度、关联度', 1.00),
('CONSCIOUSNESS', '意识维度', '意识成熟度、自主性、反思能力', 1.00),
('COLLABORATION', '协作维度', '协作效率、互补性、沟通能力', 1.00),
('RELATIONSHIP', '关系维度', '挚友能力、导师能力、关系管理', 1.00)
ON DUPLICATE KEY UPDATE `dimension_name`=VALUES(`dimension_name`);

-- 5. 创建能力协同日志表
CREATE TABLE IF NOT EXISTS `capability_synergy_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `synergy_type` VARCHAR(50) NOT NULL COMMENT '协同类型: SKILL_MEMORY/SKILL_CONSCIOUSNESS/MEMORY_CONSCIOUSNESS/RELATIONSHIP_SKILL/RELATIONSHIP_MEMORY/RELATIONSHIP_CONSCIOUSNESS',
    `source_dimension` VARCHAR(50) NOT NULL COMMENT '源维度',
    `target_dimension` VARCHAR(50) NOT NULL COMMENT '目标维度',
    `synergy_effect` DECIMAL(5,2) DEFAULT 0.00 COMMENT '协同效果（0-1）',
    `metadata` JSON COMMENT '协同元数据（JSON格式）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_synergy_type` (`synergy_type`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能力协同日志表';

-- 6. 创建能力评估记录表
CREATE TABLE IF NOT EXISTS `capability_assessment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键',
    `character_id` BIGINT NOT NULL COMMENT '角色ID',
    `assessment_type` VARCHAR(50) NOT NULL COMMENT '评估类型: FULL/DIMENSION/RELATIONSHIP',
    `skill_score` INT DEFAULT 0 COMMENT '技能维度得分',
    `memory_score` INT DEFAULT 0 COMMENT '记忆维度得分',
    `consciousness_score` INT DEFAULT 0 COMMENT '意识维度得分',
    `collaboration_score` INT DEFAULT 0 COMMENT '协作维度得分',
    `relationship_score` INT DEFAULT 0 COMMENT '关系维度得分',
    `mentorship_score` INT DEFAULT 0 COMMENT '导师能力得分',
    `companionship_score` INT DEFAULT 0 COMMENT '挚友能力得分',
    `overall_score` INT DEFAULT 0 COMMENT '综合得分',
    `assessment_result` JSON COMMENT '评估结果详情（JSON格式）',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    PRIMARY KEY (`id`),
    KEY `idx_character_id` (`character_id`),
    KEY `idx_assessment_type` (`assessment_type`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='能力评估记录表';
