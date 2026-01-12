-- 创建跨时空信箱对话表
-- 用于存储用户间的对话会话信息

CREATE TABLE IF NOT EXISTS mailbox_conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '对话ID',
    participant1_id BIGINT NOT NULL COMMENT '参与者1用户ID',
    participant2_id BIGINT NOT NULL COMMENT '参与者2用户ID（或系统ID）',
    conversation_type VARCHAR(50) NOT NULL COMMENT '对话类型：user_to_user/user_to_system',
    
    -- 最后消息信息
    last_message_id BIGINT COMMENT '最后一条消息ID',
    last_message_at DATETIME COMMENT '最后消息时间',
    
    -- 参与者1的状态
    unread_count_1 INT DEFAULT 0 COMMENT '参与者1的未读数量',
    is_pinned_1 BOOLEAN DEFAULT FALSE COMMENT '参与者1是否置顶',
    is_muted_1 BOOLEAN DEFAULT FALSE COMMENT '参与者1是否免打扰',
    
    -- 参与者2的状态
    unread_count_2 INT DEFAULT 0 COMMENT '参与者2的未读数量',
    is_pinned_2 BOOLEAN DEFAULT FALSE COMMENT '参与者2是否置顶',
    is_muted_2 BOOLEAN DEFAULT FALSE COMMENT '参与者2是否免打扰',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (participant1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (participant2_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_participant1 (participant1_id, last_message_at),
    INDEX idx_participant2 (participant2_id, last_message_at),
    INDEX idx_participants (participant1_id, participant2_id),
    INDEX idx_conversation_type (conversation_type),
    INDEX idx_last_message_at (last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨时空信箱对话表';


