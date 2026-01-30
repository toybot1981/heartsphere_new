-- 创建联系表单表
CREATE TABLE IF NOT EXISTS `contact_forms` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL COMMENT '姓名',
    `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
    `phone` VARCHAR(20) NOT NULL COMMENT '电话',
    `company` VARCHAR(100) DEFAULT NULL COMMENT '公司名称（可选）',
    `message` TEXT NOT NULL COMMENT '咨询内容',
    `is_processed` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已处理',
    `process_notes` TEXT DEFAULT NULL COMMENT '处理备注',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    INDEX `idx_email` (`email`),
    INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='联系表单表';
