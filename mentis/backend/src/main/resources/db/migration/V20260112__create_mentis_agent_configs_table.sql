-- 创建 Mentis Agent 配置表
CREATE TABLE IF NOT EXISTS `mentis_agent_configs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `agent_id` BIGINT NOT NULL COMMENT 'Agent ID（引用 main 系统的 character ID）',
  `agent_name` VARCHAR(200) DEFAULT NULL COMMENT 'Agent 名称',
  `configuration` TEXT DEFAULT NULL COMMENT '配置信息（JSON 格式）',
  `enabled` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_id` (`agent_id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis Agent 配置表';
