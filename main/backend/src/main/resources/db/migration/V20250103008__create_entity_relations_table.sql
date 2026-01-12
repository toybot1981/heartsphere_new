-- 创建实体关系表
CREATE TABLE IF NOT EXISTS entity_relations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_entity_type VARCHAR(50) NOT NULL COMMENT '源实体类型（era, character, event, item）',
    source_entity_id VARCHAR(100) NOT NULL COMMENT '源实体ID',
    target_entity_type VARCHAR(50) NOT NULL COMMENT '目标实体类型（era, character, event, item）',
    target_entity_id VARCHAR(100) NOT NULL COMMENT '目标实体ID',
    relation_type VARCHAR(50) NOT NULL COMMENT '关系类型（FRIEND, ENEMY, ALLY, etc.）',
    strength INT DEFAULT 50 COMMENT '关系强度（0-100）',
    description TEXT COMMENT '关系描述',
    metadata TEXT COMMENT '关系元数据（JSON格式）',
    user_id BIGINT COMMENT '创建者（用户ID）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_source_entity (source_entity_type, source_entity_id),
    INDEX idx_target_entity (target_entity_type, target_entity_id),
    INDEX idx_relation_type (relation_type),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='实体关系表';
