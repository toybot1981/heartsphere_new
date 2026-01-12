-- 资源池管理表
CREATE TABLE IF NOT EXISTS provider_resource_pool (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    total_balance DECIMAL(15, 6) NOT NULL DEFAULT 0 COMMENT '总余额（元）',
    used_amount DECIMAL(15, 6) NOT NULL DEFAULT 0 COMMENT '已使用金额（元）',
    available_balance DECIMAL(15, 6) NOT NULL DEFAULT 0 COMMENT '可用余额（元）',
    warning_threshold DECIMAL(5, 2) NOT NULL DEFAULT 10.0 COMMENT '告警阈值（百分比）',
    is_low_balance BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否余额不足',
    last_recharge_date DATETIME COMMENT '最后充值日期',
    last_check_date DATETIME COMMENT '最后检查日期',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider (provider_id),
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='提供商资源池表';

-- 资源池充值记录表
CREATE TABLE IF NOT EXISTS resource_pool_recharge (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    recharge_amount DECIMAL(15, 6) NOT NULL COMMENT '充值金额（元）',
    balance_before DECIMAL(15, 6) NOT NULL COMMENT '充值前余额',
    balance_after DECIMAL(15, 6) NOT NULL COMMENT '充值后余额',
    recharge_type VARCHAR(50) NOT NULL DEFAULT 'manual' COMMENT '充值类型：manual, auto, refund',
    operator_id BIGINT COMMENT '操作员ID',
    remark VARCHAR(500) COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源池充值记录表';

-- 资费提醒记录表
CREATE TABLE IF NOT EXISTS billing_alert (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    provider_id BIGINT NOT NULL,
    alert_type VARCHAR(50) NOT NULL COMMENT '提醒类型：low_balance, insufficient_balance',
    alert_level VARCHAR(20) NOT NULL DEFAULT 'warning' COMMENT '提醒级别：warning, critical',
    balance_percentage DECIMAL(5, 2) NOT NULL COMMENT '余额百分比',
    available_balance DECIMAL(15, 6) NOT NULL COMMENT '可用余额',
    message TEXT COMMENT '提醒消息',
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已处理',
    resolved_at DATETIME COMMENT '处理时间',
    resolved_by BIGINT COMMENT '处理人ID',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES ai_providers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资费提醒记录表';

-- 创建索引
CREATE INDEX idx_provider_resource_pool_provider ON provider_resource_pool(provider_id);
CREATE INDEX idx_resource_pool_recharge_provider ON resource_pool_recharge(provider_id);
CREATE INDEX idx_resource_pool_recharge_created ON resource_pool_recharge(created_at);
CREATE INDEX idx_billing_alert_provider ON billing_alert(provider_id);
CREATE INDEX idx_billing_alert_resolved ON billing_alert(is_resolved, created_at);

