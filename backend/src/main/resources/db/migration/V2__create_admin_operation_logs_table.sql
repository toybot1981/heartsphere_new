-- 创建管理员操作日志表
CREATE TABLE IF NOT EXISTS admin_operation_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    admin_id BIGINT NOT NULL COMMENT '管理员ID',
    operation_type VARCHAR(20) NOT NULL COMMENT '操作类型：view/edit/delete/export',
    module VARCHAR(50) NOT NULL COMMENT '功能模块',
    target_id BIGINT COMMENT '目标对象ID',
    operation_content TEXT COMMENT '操作内容',
    operation_result VARCHAR(20) COMMENT '操作结果：success/failed',
    ip_address VARCHAR(50) COMMENT 'IP地址',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    INDEX idx_admin_time (admin_id, created_at),
    INDEX idx_module (module, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员操作日志表';



