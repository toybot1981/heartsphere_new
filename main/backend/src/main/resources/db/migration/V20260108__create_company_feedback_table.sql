-- 创建公司官网反馈收集表
CREATE TABLE IF NOT EXISTS company_feedback (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) COMMENT '姓名',
    email VARCHAR(200) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '电话',
    company VARCHAR(200) COMMENT '公司名称（可选）',
    message TEXT COMMENT '反馈内容',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公司官网反馈收集表';
