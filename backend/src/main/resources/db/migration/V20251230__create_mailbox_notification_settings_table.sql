-- 创建跨时空信箱提醒设置表
-- 用于存储用户的提醒偏好设置

CREATE TABLE IF NOT EXISTS mailbox_notification_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '设置ID',
    user_id BIGINT NOT NULL UNIQUE COMMENT '用户ID',
    
    -- 总开关
    enable_notifications BOOLEAN DEFAULT TRUE COMMENT '是否启用提醒',
    
    -- 分类开关
    esoul_letter_enabled BOOLEAN DEFAULT TRUE COMMENT 'E-SOUL来信提醒',
    resonance_enabled BOOLEAN DEFAULT TRUE COMMENT '共鸣消息提醒',
    system_message_enabled BOOLEAN DEFAULT TRUE COMMENT '系统消息提醒',
    user_message_enabled BOOLEAN DEFAULT TRUE COMMENT '用户消息提醒',
    
    -- 免打扰时间
    quiet_hours_start TIME COMMENT '免打扰开始时间',
    quiet_hours_end TIME COMMENT '免打扰结束时间',
    
    -- 其他设置
    sound_enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用声音',
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='跨时空信箱提醒设置表';

