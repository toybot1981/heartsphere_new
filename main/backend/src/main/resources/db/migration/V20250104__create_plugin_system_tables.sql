-- 插件系统相关表
-- 功能：创建插件系统的核心数据表
-- 作者：HeartSphere Team
-- 日期：2025-01-04

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection=utf8mb4;

-- 插件表
CREATE TABLE IF NOT EXISTS plugins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plugin_id VARCHAR(100) UNIQUE NOT NULL COMMENT '插件唯一标识',
    name VARCHAR(255) NOT NULL COMMENT '插件名称',
    version VARCHAR(50) NOT NULL COMMENT '插件版本',
    description TEXT COMMENT '插件描述',
    author VARCHAR(255) COMMENT '作者',
    icon_url VARCHAR(500) COMMENT '插件图标URL',
    category VARCHAR(100) COMMENT '插件分类：lifestyle, education, entertainment等',
    status VARCHAR(20) DEFAULT 'INACTIVE' COMMENT '状态：ACTIVE, INACTIVE, DISABLED',
    permissions JSON COMMENT '所需权限列表，如：["FILE_UPLOAD", "DATA_STORAGE"]',
    dependencies JSON COMMENT '依赖的其他插件ID列表',
    min_system_version VARCHAR(50) COMMENT '最低系统版本要求',
    config_schema TEXT COMMENT '配置模式定义（JSON Schema格式）',
    default_config JSON COMMENT '默认配置（JSON格式）',
    is_system_plugin BOOLEAN DEFAULT FALSE COMMENT '是否为系统插件',
    usage_count INT DEFAULT 0 COMMENT '使用次数（冗余字段）',
    rating DECIMAL(3,2) COMMENT '评分（0-5分）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_status (status),
    INDEX idx_is_system_plugin (is_system_plugin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='插件表';

-- 用户插件表
CREATE TABLE IF NOT EXISTS user_plugins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    plugin_id VARCHAR(100) NOT NULL COMMENT '插件ID',
    status VARCHAR(20) DEFAULT 'INACTIVE' COMMENT '状态：ACTIVE, INACTIVE',
    config JSON COMMENT '用户配置（JSON格式）',
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '安装时间',
    activated_at DATETIME COMMENT '激活时间',
    
    UNIQUE KEY uk_user_plugin (user_id, plugin_id),
    INDEX idx_user_id (user_id, status),
    INDEX idx_plugin_id (plugin_id),
    FOREIGN KEY (plugin_id) REFERENCES plugins(plugin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户插件表';

-- 场景插件表
CREATE TABLE IF NOT EXISTS scene_plugins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scene_id VARCHAR(100) NOT NULL COMMENT '场景ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    plugin_id VARCHAR(100) NOT NULL COMMENT '插件ID',
    position_x INT COMMENT '位置X坐标',
    position_y INT COMMENT '位置Y坐标',
    width INT COMMENT '宽度',
    height INT COMMENT '高度',
    z_index INT DEFAULT 0 COMMENT '层级',
    is_visible BOOLEAN DEFAULT TRUE COMMENT '是否可见',
    config JSON COMMENT '场景中的插件配置（JSON格式）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_scene_id (scene_id, is_visible),
    INDEX idx_user_id (user_id),
    INDEX idx_plugin_id (plugin_id),
    FOREIGN KEY (plugin_id) REFERENCES plugins(plugin_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='场景插件表';

-- 插件数据表（通用存储）
CREATE TABLE IF NOT EXISTS plugin_data (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plugin_id VARCHAR(100) NOT NULL COMMENT '插件ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    scene_id VARCHAR(100) COMMENT '场景ID（可选）',
    data_key VARCHAR(255) NOT NULL COMMENT '数据键',
    data_value JSON COMMENT '数据值（JSON格式）',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY uk_plugin_data (plugin_id, user_id, scene_id, data_key),
    INDEX idx_plugin_id (plugin_id),
    INDEX idx_user_id (user_id),
    INDEX idx_scene_id (scene_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='插件数据表（通用存储）';
