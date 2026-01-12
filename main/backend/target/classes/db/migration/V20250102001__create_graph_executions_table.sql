-- 创建Graph执行表
CREATE TABLE IF NOT EXISTS `graph_executions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `execution_id` VARCHAR(100) NOT NULL UNIQUE COMMENT '执行ID（UUID）',
    `graph_id` BIGINT NOT NULL COMMENT 'Graph定义ID',
    `status` VARCHAR(50) NOT NULL COMMENT '执行状态：RUNNING, PAUSED, WAITING, COMPLETED, FAILED, CANCELLED',
    `current_node_id` VARCHAR(255) COMMENT '当前执行的节点ID',
    `wait_type` VARCHAR(50) COMMENT '等待类型：CHOICE, WAIT, NONE',
    `waiting_node_id` VARCHAR(255) COMMENT '等待中的节点ID',
    `step_count` INT DEFAULT 0 COMMENT '执行步骤数',
    `state_json` LONGTEXT COMMENT 'GraphState的JSON序列化',
    `context_data_json` TEXT COMMENT '执行上下文数据的JSON序列化',
    `error_message` TEXT COMMENT '错误信息（如果执行失败）',
    `created_by` BIGINT COMMENT '创建者ID（管理员ID）',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `completed_at` DATETIME COMMENT '完成时间（如果执行完成或失败）',
    INDEX `idx_graph_id` (`graph_id`),
    INDEX `idx_execution_id` (`execution_id`),
    INDEX `idx_status` (`status`),
    INDEX `idx_graph_status` (`graph_id`, `status`),
    FOREIGN KEY (`graph_id`) REFERENCES `graph_definitions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
