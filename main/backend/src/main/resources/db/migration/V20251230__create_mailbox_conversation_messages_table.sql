-- 创建跨时空信箱对话消息表
-- 用于存储用户间对话的具体消息内容
-- 注意：对话消息不在 mailbox_messages 表中显示，只在对话界面显示

CREATE TABLE IF NOT EXISTS mailbox_conversation_messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '消息ID',
    conversation_id BIGINT NOT NULL COMMENT '对话ID',
    
    -- 发送者信息
    sender_id BIGINT NOT NULL COMMENT '发送者ID',
    sender_type VARCHAR(50) NOT NULL COMMENT '发送者类型：user/system',
    
    -- 消息内容
    message_type VARCHAR(50) NOT NULL COMMENT '消息类型：text/image/voice/emoji等',
    content TEXT NOT NULL COMMENT '消息内容',
    content_data TEXT COMMENT '消息扩展数据（JSON格式，用于存储图片URL、语音URL等）',
    
    -- 回复信息
    reply_to_id BIGINT COMMENT '回复的消息ID（如果有）',
    
    -- 状态
    is_edited BOOLEAN DEFAULT FALSE COMMENT '是否已编辑',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '是否已删除',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (conversation_id) REFERENCES mailbox_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation (conversation_id, created_at),
    INDEX idx_sender (sender_id, created_at),
    INDEX idx_message_type (message_type),
    INDEX idx_reply_to (reply_to_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨时空信箱对话消息表';


