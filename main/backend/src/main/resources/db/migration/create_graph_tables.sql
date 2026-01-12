-- Graph流程编辑器相关表

-- Graph定义表
CREATE TABLE IF NOT EXISTS graph_definitions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT 'Graph名称',
    description VARCHAR(500) COMMENT '描述',
    graph_type VARCHAR(50) DEFAULT 'SCRIPT' COMMENT 'Graph类型：SCRIPT, SKILL_CHECK等',
    start_node_id VARCHAR(100) COMMENT '开始节点ID',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    version INT DEFAULT 1 COMMENT '版本号',
    created_by BIGINT COMMENT '创建者ID（管理员ID）',
    updated_by BIGINT COMMENT '更新者ID（管理员ID）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_graph_type (graph_type),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Graph定义表';

-- Graph节点表
CREATE TABLE IF NOT EXISTS graph_nodes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    graph_id BIGINT NOT NULL COMMENT '关联的Graph定义ID',
    node_id VARCHAR(100) NOT NULL COMMENT '节点ID（在Graph中唯一）',
    node_type VARCHAR(50) NOT NULL COMMENT '节点类型：dialogue, choice, condition等',
    node_config TEXT COMMENT '节点配置（JSON格式）',
    position_x DOUBLE COMMENT '节点在编辑器中的X坐标',
    position_y DOUBLE COMMENT '节点在编辑器中的Y坐标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_graph_node (graph_id, node_id),
    INDEX idx_graph_id (graph_id),
    FOREIGN KEY (graph_id) REFERENCES graph_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Graph节点表';

-- Graph边表
CREATE TABLE IF NOT EXISTS graph_edges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    graph_id BIGINT NOT NULL COMMENT '关联的Graph定义ID',
    source_node_id VARCHAR(100) NOT NULL COMMENT '源节点ID',
    target_node_id VARCHAR(100) NOT NULL COMMENT '目标节点ID',
    edge_type VARCHAR(50) COMMENT '边类型：default, true, false, condition等',
    edge_label VARCHAR(200) COMMENT '边的标签（用于显示）',
    condition_config TEXT COMMENT '条件配置（JSON格式，用于条件边）',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_graph_id (graph_id),
    INDEX idx_source_node (graph_id, source_node_id),
    INDEX idx_target_node (graph_id, target_node_id),
    FOREIGN KEY (graph_id) REFERENCES graph_definitions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Graph边表';
