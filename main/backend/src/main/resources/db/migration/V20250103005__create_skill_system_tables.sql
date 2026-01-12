-- 创建心域角色 Skill 系统相关表
-- 结合 Claude Skill 规范设计

-- 1. 技能定义表（对应 Claude Skill 的 Level 1：元数据）
CREATE TABLE IF NOT EXISTS skill_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL UNIQUE COMMENT '技能ID（唯一标识）',
    name VARCHAR(255) NOT NULL COMMENT '技能名称',
    description TEXT COMMENT '技能描述（Level 1）',
    category VARCHAR(50) COMMENT '技能分类：combat/magic/craft/social/exploration/life等',
    skill_type VARCHAR(50) DEFAULT 'PASSIVE' COMMENT '技能类型：ACTIVE/PASSIVE/AUTOMATIC',
    max_level INT DEFAULT 100 COMMENT '最大等级',
    base_value INT DEFAULT 0 COMMENT '基础值',
    icon_url VARCHAR(500) COMMENT '技能图标URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_skill_type (skill_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能定义表';

-- 2. 技能指令表（对应 Claude Skill 的 Level 2：指令）
CREATE TABLE IF NOT EXISTS skill_instructions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '关联的技能ID',
    instruction_level INT DEFAULT 1 COMMENT '指令层级（1-3，对应 Claude 的 Level）',
    instruction_text TEXT NOT NULL COMMENT '指令内容',
    trigger_condition TEXT COMMENT '触发条件（JSON格式）',
    execution_order INT DEFAULT 0 COMMENT '执行顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_instruction_level (instruction_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能指令表';

-- 3. 技能资源表（对应 Claude Skill 的 Level 3：资源和代码）
CREATE TABLE IF NOT EXISTS skill_resources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '关联的技能ID',
    resource_type VARCHAR(50) NOT NULL COMMENT '资源类型：template/example/script/config',
    resource_name VARCHAR(255) NOT NULL COMMENT '资源名称',
    resource_content TEXT COMMENT '资源内容（文本）',
    resource_url VARCHAR(500) COMMENT '资源URL（文件）',
    resource_order INT DEFAULT 0 COMMENT '资源顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_resource_type (resource_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能资源表';

-- 4. 角色技能关联表（角色拥有的技能及其值）
CREATE TABLE IF NOT EXISTS character_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    current_level INT DEFAULT 0 COMMENT '当前等级（0-100）',
    experience INT DEFAULT 0 COMMENT '经验值',
    unlocked_at TIMESTAMP COMMENT '解锁时间',
    last_used_at TIMESTAMP COMMENT '最后使用时间',
    usage_count INT DEFAULT 0 COMMENT '使用次数',
    metadata TEXT COMMENT '扩展元数据（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    UNIQUE KEY uk_character_skill (character_id, skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能关联表';

-- 5. 技能树关系表（技能之间的依赖和前置关系）
CREATE TABLE IF NOT EXISTS skill_tree (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    parent_skill_id VARCHAR(100) NOT NULL COMMENT '父技能ID',
    child_skill_id VARCHAR(100) NOT NULL COMMENT '子技能ID',
    unlock_level INT COMMENT '解锁所需等级',
    prerequisite_skill_id VARCHAR(100) COMMENT '前置技能ID',
    required_level INT COMMENT '前置技能所需等级',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    FOREIGN KEY (child_skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    INDEX idx_parent_skill (parent_skill_id),
    INDEX idx_child_skill (child_skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能树关系表';
