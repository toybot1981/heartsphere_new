-- 创建跨时空信箱表（时间信件表）
-- 用于存储用户反馈、管理员回复等信件
-- 注意：与EmailService（真实邮件发送）区分开

CREATE TABLE IF NOT EXISTS chronos_letters (
    id VARCHAR(255) PRIMARY KEY,
    user_id BIGINT NOT NULL,
    sender_id VARCHAR(255) NOT NULL COMMENT '发件人ID：user、admin或角色ID',
    sender_name VARCHAR(255) NOT NULL COMMENT '发件人名称',
    sender_avatar_url VARCHAR(1000) COMMENT '发件人头像URL',
    subject VARCHAR(500) NOT NULL COMMENT '信件主题',
    content TEXT NOT NULL COMMENT '信件内容',
    timestamp BIGINT NOT NULL COMMENT '时间戳（毫秒）',
    is_read BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已读',
    theme_color VARCHAR(50) COMMENT '主题色（用于前端显示）',
    type VARCHAR(50) NOT NULL DEFAULT 'user_feedback' COMMENT '信件类型：user_feedback, admin_reply, ai_generated',
    parent_letter_id VARCHAR(255) COMMENT '父信件ID（用于回复）',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_parent_letter_id (parent_letter_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨时空信箱表（时间信件表）';

