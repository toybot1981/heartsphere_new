-- 创建 MCP 服务器配置表
CREATE TABLE IF NOT EXISTS `mcp_server_configs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL COMMENT '配置名称',
  `server_type` VARCHAR(100) NOT NULL COMMENT '服务器类型',
  `server_url` VARCHAR(1000) NOT NULL COMMENT '服务器 URL',
  `api_key` VARCHAR(500) DEFAULT NULL COMMENT 'API Key',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `description` VARCHAR(1000) DEFAULT NULL COMMENT '配置描述',
  `extra_config` TEXT DEFAULT NULL COMMENT '额外配置（JSON）',
  `user_id` BIGINT DEFAULT NULL COMMENT '用户ID',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_tested_at` DATETIME DEFAULT NULL COMMENT '最后测试时间',
  `connection_status` VARCHAR(50) DEFAULT 'DISCONNECTED' COMMENT '连接状态',
  `last_error` TEXT DEFAULT NULL COMMENT '最后错误信息',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_server_type` (`server_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MCP 服务器配置表';

-- 插入示例配置（Tavily 搜索）
INSERT INTO `mcp_server_configs` (
  `name`, 
  `server_type`, 
  `server_url`, 
  `api_key`, 
  `enabled`, 
  `description`
) VALUES (
  'Tavily 搜索',
  'tavily',
  'https://mcp.tavily.com/mcp/?tavilyApiKey=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',
  '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',
  1,
  'Tavily 网络搜索 MCP 服务器，提供实时网络搜索功能'
) ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;
