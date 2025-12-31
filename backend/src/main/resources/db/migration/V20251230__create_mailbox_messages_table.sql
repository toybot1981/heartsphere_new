-- 创建跨时空信箱消息表
-- 用于存储统一收件箱中的所有消息（E-SOUL来信、共鸣消息、系统消息、用户消息）
-- 注意：对话消息存储在 mailbox_conversation_messages 表中，不在本表

CREATE TABLE IF NOT EXISTS mailbox_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
    receiver_id BIGINT NOT NULL COMMENT '接收者用户ID',
    
    -- 发送者信息
    sender_type VARCHAR(50) NOT NULL COMMENT '发送者类型：esoul/heartsphere/system/user',
    sender_id BIGINT COMMENT '发送者ID（E-SOUL ID/心域ID/系统ID/用户ID）',
    sender_name VARCHAR(255) COMMENT '发送者名称',
    sender_avatar VARCHAR(1000) COMMENT '发送者头像URL',
    
    -- 消息信息
    message_type VARCHAR(50) NOT NULL COMMENT '消息类型（详见枚举）',
    message_category VARCHAR(50) NOT NULL COMMENT '消息分类：esoul_letter/resonance/system/user_message',
    title VARCHAR(500) COMMENT '消息标题',
    content TEXT NOT NULL COMMENT '消息内容',
    content_data TEXT COMMENT '消息扩展数据（JSON格式，用于存储关联内容、元数据、聚合信息等）',
    
    -- 状态标识
    is_read BOOLEAN DEFAULT FALSE COMMENT '是否已读',
    is_important BOOLEAN DEFAULT FALSE COMMENT '是否重要',
    is_starred BOOLEAN DEFAULT FALSE COMMENT '是否收藏',
    
    -- 关联信息
    related_id BIGINT COMMENT '关联对象ID（如关联的共享配置ID、场景ID等）',
    related_type VARCHAR(50) COMMENT '关联对象类型',
    reply_to_id BIGINT COMMENT '回复的消息ID（如果有）',
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    read_at DATETIME COMMENT '阅读时间',
    deleted_at DATETIME COMMENT '删除时间（软删除）',
    
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_receiver (receiver_id, created_at),
    INDEX idx_category (message_category, created_at),
    INDEX idx_sender (sender_type, sender_id),
    INDEX idx_read (receiver_id, is_read),
    INDEX idx_related (related_type, related_id),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨时空信箱消息表';

