-- 创建AI模型配置表
CREATE TABLE IF NOT EXISTS ai_model_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider VARCHAR(50) NOT NULL COMMENT '提供商：gemini, openai, qwen, doubao',
    model_name VARCHAR(100) NOT NULL COMMENT '模型名称',
    capability VARCHAR(20) NOT NULL COMMENT '能力类型：text, image, audio, video',
    api_key TEXT COMMENT 'API密钥（加密存储）',
    base_url VARCHAR(500) COMMENT 'API基础URL',
    model_params TEXT COMMENT '模型参数（JSON格式）',
    is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为默认模型',
    priority INT NOT NULL DEFAULT 0 COMMENT '优先级（用于容错模式排序）',
    cost_per_token DECIMAL(10,8) COMMENT '每token成本（用于经济模式）',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    description VARCHAR(500) COMMENT '描述',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_capability (capability),
    INDEX idx_provider_capability (provider, capability),
    INDEX idx_is_default (is_default, capability, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI模型配置表';

-- 创建AI路由策略表
CREATE TABLE IF NOT EXISTS ai_routing_strategy (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    capability VARCHAR(20) NOT NULL COMMENT '能力类型：text, image, audio, video',
    strategy_type VARCHAR(50) NOT NULL COMMENT '策略类型：single, fallback, economy',
    config_json TEXT COMMENT '策略配置（JSON格式）',
    is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
    description VARCHAR(500) COMMENT '描述',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_capability (capability),
    INDEX idx_strategy_type (strategy_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI路由策略配置表';


