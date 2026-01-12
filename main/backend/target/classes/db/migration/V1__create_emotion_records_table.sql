-- 创建情绪记录表
CREATE TABLE IF NOT EXISTS emotion_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    emotion_type VARCHAR(50) NOT NULL COMMENT '情绪类型：happy, sad, anxious, etc.',
    emotion_intensity VARCHAR(20) NOT NULL COMMENT '情绪强度：mild, moderate, strong',
    emotion_tags TEXT COMMENT '情绪标签（JSON数组，逗号分隔）',
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.5 COMMENT '识别置信度（0-1）',
    source VARCHAR(50) NOT NULL COMMENT '情绪来源：conversation, journal, behavior, manual',
    context TEXT COMMENT '触发情绪的上下文',
    conversation_id VARCHAR(100) COMMENT '关联的对话ID',
    journal_entry_id VARCHAR(100) COMMENT '关联的日记ID',
    trigger_text TEXT COMMENT '触发情绪的文字',
    key_phrases TEXT COMMENT '关键短语（JSON数组，逗号分隔）',
    reasoning TEXT COMMENT '分析理由',
    timestamp DATETIME NOT NULL COMMENT '情绪记录时间',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_user_timestamp (user_id, timestamp DESC),
    INDEX idx_emotion_type (emotion_type),
    INDEX idx_source (source),
    INDEX idx_timestamp (timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='情绪记录表';




