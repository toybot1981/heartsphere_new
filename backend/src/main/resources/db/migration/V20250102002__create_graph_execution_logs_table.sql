-- 创建Graph执行日志表
CREATE TABLE IF NOT EXISTS graph_execution_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    execution_id VARCHAR(100) NOT NULL COMMENT '执行ID（UUID）',
    graph_id BIGINT NOT NULL COMMENT 'Graph定义ID',
    node_id VARCHAR(255) NOT NULL COMMENT '节点ID',
    node_type VARCHAR(50) COMMENT '节点类型（dialogue, choice, condition等）',
    log_type VARCHAR(50) NOT NULL COMMENT '日志类型：NODE_START, NODE_END, NODE_ERROR, STATE_CHANGE, USER_ACTION',
    message TEXT COMMENT '日志消息',
    state_snapshot LONGTEXT COMMENT '状态快照（JSON）',
    error_message TEXT COMMENT '错误信息（如果有错误）',
    execution_time_ms BIGINT COMMENT '执行时间（毫秒）',
    step_number INT COMMENT '执行步骤号',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    
    INDEX idx_execution_id (execution_id),
    INDEX idx_node_id (node_id),
    INDEX idx_execution_node (execution_id, node_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Graph执行日志表';
