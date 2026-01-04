-- 增强技能系统以支持 Function Calling 和角色技能装备
-- 基于 Function Calling 机制实现数字人 Skill 系统
-- 创建时间：2025-01-04

-- ============================================
-- 第一部分：扩展 skill_definitions 表
-- ============================================

-- 检查并添加 Function Calling 相关字段
-- 注意：如果字段已存在，ALTER TABLE 会报错，但 Flyway 会处理这种情况
-- 如果需要更安全的迁移，可以在应用层检查字段是否存在

-- 添加 function_schema 字段（Function Calling JSON Schema）
ALTER TABLE skill_definitions 
ADD COLUMN function_schema TEXT COMMENT 'Function Calling JSON Schema（JSON格式），用于 AI Function Calling';

-- 添加 execution_type 字段（执行类型）
ALTER TABLE skill_definitions 
ADD COLUMN execution_type VARCHAR(50) DEFAULT 'RULE_BASED' COMMENT '执行类型：SCRIPT/API/GRAPH/DATABASE/RULE_BASED';

-- 添加 execution_config 字段（执行配置）
ALTER TABLE skill_definitions 
ADD COLUMN execution_config TEXT COMMENT '执行配置（JSON格式），包含脚本路径、API配置等';

-- 添加 auto_trigger_keywords 字段（自动触发关键词）
ALTER TABLE skill_definitions 
ADD COLUMN auto_trigger_keywords TEXT COMMENT '自动触发关键词（JSON数组格式），AI检测到这些关键词时自动考虑使用该技能';

-- 添加 required_permissions 字段（所需权限）
ALTER TABLE skill_definitions 
ADD COLUMN required_permissions VARCHAR(255) COMMENT '所需权限（逗号分隔），用于权限控制';

-- 添加 max_usage_per_day 字段（每日最大使用次数）
ALTER TABLE skill_definitions 
ADD COLUMN max_usage_per_day INT DEFAULT -1 COMMENT '每日最大使用次数（-1表示无限制）';

-- 添加 version 字段（技能版本号）
ALTER TABLE skill_definitions 
ADD COLUMN version VARCHAR(50) DEFAULT '1.0.0' COMMENT '技能版本号';

-- 添加 author 字段（技能作者）
ALTER TABLE skill_definitions 
ADD COLUMN author VARCHAR(255) COMMENT '技能作者';

-- 添加 is_system_skill 字段（是否为系统技能）
ALTER TABLE skill_definitions 
ADD COLUMN is_system_skill BOOLEAN DEFAULT FALSE COMMENT '是否为系统技能（系统技能不可删除）';

-- 添加索引优化查询
CREATE INDEX idx_execution_type ON skill_definitions(execution_type);
CREATE INDEX idx_is_system_skill ON skill_definitions(is_system_skill);

-- ============================================
-- 第二部分：创建技能执行记录表
-- ============================================

CREATE TABLE IF NOT EXISTS skill_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    character_id BIGINT COMMENT '角色ID',
    user_id BIGINT COMMENT '用户ID',
    execution_type VARCHAR(50) DEFAULT 'FUNCTION_CALL' COMMENT '执行类型：FUNCTION_CALL/GRAPH_NODE/MANUAL/AUTO_TRIGGER',
    parameters TEXT COMMENT '执行参数（JSON格式）',
    result TEXT COMMENT '执行结果（JSON格式）',
    execution_time_ms INT COMMENT '执行耗时（毫秒）',
    success BOOLEAN DEFAULT TRUE COMMENT '是否成功',
    error_message TEXT COMMENT '错误信息',
    error_stack TEXT COMMENT '错误堆栈（用于调试）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_id (skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success),
    INDEX idx_execution_type (execution_type),
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能执行记录表，记录所有技能的执行历史';

-- ============================================
-- 第三部分：创建角色技能装备表（character_skill_bindings）
-- ============================================

-- 注意：如果已存在 character_skills 表，我们需要创建新的 character_skill_bindings 表
-- character_skills 表用于存储技能等级和经验值
-- character_skill_bindings 表用于存储技能装备关系

CREATE TABLE IF NOT EXISTS character_skill_bindings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    character_id BIGINT NOT NULL COMMENT '角色ID',
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    is_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用（装备后可以启用/禁用）',
    auto_trigger BOOLEAN DEFAULT FALSE COMMENT '是否自动触发（AI自动判断是否使用）',
    priority INT DEFAULT 0 COMMENT '优先级（数字越大优先级越高，用于多个技能同时匹配时）',
    usage_count INT DEFAULT 0 COMMENT '使用次数统计',
    last_used_at TIMESTAMP NULL COMMENT '最后使用时间',
    equipped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '装备时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_character_skill (character_id, skill_id),
    INDEX idx_character_id (character_id),
    INDEX idx_skill_id (skill_id),
    INDEX idx_is_enabled (is_enabled),
    INDEX idx_auto_trigger (auto_trigger),
    INDEX idx_priority (priority),
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能装备表，管理角色装备的技能及其配置';

-- ============================================
-- 第四部分：创建技能前置条件表（可选，用于技能解锁）
-- ============================================

CREATE TABLE IF NOT EXISTS skill_prerequisites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id VARCHAR(100) NOT NULL COMMENT '技能ID',
    prerequisite_skill_id VARCHAR(100) COMMENT '前置技能ID（需要先拥有该技能）',
    prerequisite_level INT DEFAULT 0 COMMENT '前置技能所需等级',
    required_character_level INT DEFAULT 0 COMMENT '角色所需等级',
    required_items TEXT COMMENT '所需物品（JSON数组）',
    custom_condition TEXT COMMENT '自定义条件（JSON格式）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_skill_id (skill_id),
    INDEX idx_prerequisite_skill_id (prerequisite_skill_id),
    FOREIGN KEY (skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    FOREIGN KEY (prerequisite_skill_id) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能前置条件表，定义技能解锁的前置条件';

-- ============================================
-- 第五部分：创建技能冲突表（用于定义技能之间的冲突关系）
-- ============================================

CREATE TABLE IF NOT EXISTS skill_conflicts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_id_1 VARCHAR(100) NOT NULL COMMENT '技能1 ID',
    skill_id_2 VARCHAR(100) NOT NULL COMMENT '技能2 ID',
    conflict_type VARCHAR(50) DEFAULT 'MUTUAL_EXCLUSIVE' COMMENT '冲突类型：MUTUAL_EXCLUSIVE（互斥）/WEAK_CONFLICT（弱冲突）',
    conflict_reason TEXT COMMENT '冲突原因说明',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_skill_conflict (skill_id_1, skill_id_2),
    INDEX idx_skill_id_1 (skill_id_1),
    INDEX idx_skill_id_2 (skill_id_2),
    FOREIGN KEY (skill_id_1) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id_2) REFERENCES skill_definitions(skill_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能冲突表，定义不能同时装备的技能';

-- ============================================
-- 第六部分：数据迁移（如果需要）
-- ============================================

-- 如果 character_skills 表已存在且有数据，可以考虑迁移到 character_skill_bindings
-- 这里先不执行，等确认后再添加

-- ============================================
-- 第七部分：创建视图（便于查询）
-- ============================================

-- 删除已存在的视图（如果存在）
DROP VIEW IF EXISTS v_character_equipped_skills;
DROP VIEW IF EXISTS v_skill_usage_statistics;

-- 角色已装备技能视图
CREATE VIEW v_character_equipped_skills AS
SELECT 
    csb.character_id,
    csb.skill_id,
    sd.name AS skill_name,
    sd.description AS skill_description,
    sd.category AS skill_category,
    sd.skill_type,
    sd.execution_type,
    csb.is_enabled,
    csb.auto_trigger,
    csb.priority,
    csb.usage_count,
    csb.last_used_at,
    csb.equipped_at,
    cs.level AS current_level,
    cs.experience AS current_experience
FROM character_skill_bindings csb
INNER JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
LEFT JOIN character_skills cs ON csb.character_id = cs.character_id AND csb.skill_id = cs.skill_id
WHERE csb.is_enabled = TRUE;

-- 技能使用统计视图
CREATE VIEW v_skill_usage_statistics AS
SELECT 
    se.skill_id,
    sd.name AS skill_name,
    COUNT(*) AS total_executions,
    SUM(CASE WHEN se.success = TRUE THEN 1 ELSE 0 END) AS successful_executions,
    SUM(CASE WHEN se.success = FALSE THEN 1 ELSE 0 END) AS failed_executions,
    AVG(se.execution_time_ms) AS avg_execution_time_ms,
    MAX(se.execution_time_ms) AS max_execution_time_ms,
    MIN(se.execution_time_ms) AS min_execution_time_ms,
    COUNT(DISTINCT se.character_id) AS unique_characters,
    COUNT(DISTINCT se.user_id) AS unique_users,
    MAX(se.created_at) AS last_execution_time
FROM skill_executions se
INNER JOIN skill_definitions sd ON se.skill_id = sd.skill_id
GROUP BY se.skill_id, sd.name;

-- ============================================
-- 完成
-- ============================================

-- 验证表是否创建成功
SELECT 'Skill system enhancement completed!' AS status;
