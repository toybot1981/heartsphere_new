-- 创建对话日志表
-- 用于持久化用户与角色的对话历史，支持软删除和回收站功能

CREATE TABLE IF NOT EXISTS conversation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    character_id BIGINT NOT NULL COMMENT '角色ID',
    session_id VARCHAR(255) NOT NULL COMMENT '会话ID',
    
    -- 对话信息
    character_name VARCHAR(255) NOT NULL COMMENT '角色名称',
    character_avatar_url VARCHAR(500) COMMENT '角色头像URL',
    last_message_preview TEXT COMMENT '最后一条消息预览',
    message_count INT DEFAULT 0 COMMENT '消息数量',
    
    -- 时间信息
    first_message_at DATETIME COMMENT '第一条消息时间',
    last_message_at DATETIME COMMENT '最后一条消息时间',
    
    -- 软删除标记
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
    deleted_at DATETIME COMMENT '删除时间',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
    INDEX idx_user_character (user_id, character_id),
    INDEX idx_session (session_id),
    INDEX idx_deleted (is_deleted, deleted_at),
    INDEX idx_last_message_at (last_message_at),
    UNIQUE KEY uk_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话日志表';


