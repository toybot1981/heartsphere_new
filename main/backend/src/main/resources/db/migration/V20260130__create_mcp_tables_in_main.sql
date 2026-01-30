-- MCP 表迁移至 main：创建 mcp_service_templates、mcp_server_configs（utf8mb4）
-- 与 ai/mcp 模块配套，和 ai/skill 并列作为 AI 基础设施

-- 1. MCP 服务模板表
CREATE TABLE IF NOT EXISTS `mcp_service_templates` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `template_name` VARCHAR(200) NOT NULL COMMENT '模板名称',
  `server_type` VARCHAR(100) NOT NULL COMMENT '服务器类型',
  `category` VARCHAR(50) DEFAULT NULL COMMENT '分类（search, storage, communication, etc.）',
  `default_url` VARCHAR(1000) DEFAULT NULL COMMENT '默认 URL',
  `default_url_template` VARCHAR(1000) DEFAULT NULL COMMENT 'URL 模板（支持变量）',
  `required_params` TEXT DEFAULT NULL COMMENT '必需参数（JSON 格式）',
  `optional_params` TEXT DEFAULT NULL COMMENT '可选参数（JSON 格式）',
  `description` TEXT DEFAULT NULL COMMENT '模板描述',
  `setup_instructions` TEXT DEFAULT NULL COMMENT '设置说明',
  `icon_url` VARCHAR(500) DEFAULT NULL COMMENT '图标 URL',
  `is_popular` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否为主流服务',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_name` (`template_name`),
  KEY `idx_server_type` (`server_type`),
  KEY `idx_category` (`category`),
  KEY `idx_is_popular` (`is_popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MCP 服务模板表';

-- 插入主流 MCP 服务模板
INSERT INTO `mcp_service_templates` (
  `template_name`, `server_type`, `category`, `default_url`, `default_url_template`,
  `required_params`, `optional_params`, `description`, `setup_instructions`, `is_popular`
) VALUES
('Tavily Search', 'tavily', 'search', NULL, 'https://mcp.tavily.com/mcp/?tavilyApiKey={apiKey}', '["apiKey"]', '{"maxResults": 5, "searchDepth": "basic"}', 'Tavily 是一个强大的网络搜索引擎，提供实时网络搜索功能。可以搜索最新的网页内容、新闻、文档等。', '1. 访问 https://tavily.com 注册账号\n2. 获取 API Key\n3. 在配置中填入 API Key', 1),
('GitHub', 'github', 'code', NULL, NULL, '["token"]', '{"baseUrl": "https://api.github.com"}', 'GitHub MCP 服务器，提供代码仓库操作功能，包括搜索代码、读取文件、创建 issue 等。', '1. 访问 GitHub Settings > Developer settings > Personal access tokens\n2. 创建 token（需要 repo 权限）\n3. 在配置中填入 token', 1),
('Filesystem', 'filesystem', 'storage', NULL, NULL, '[]', '{"basePath": "/"}', '文件系统 MCP 服务器，提供本地文件操作功能，包括读取、写入、列出文件等。', '配置本地文件系统路径，无需额外认证。', 1),
('PostgreSQL', 'postgres', 'database', NULL, NULL, '["host", "port", "database", "user", "password"]', '{"ssl": false}', 'PostgreSQL 数据库 MCP 服务器，提供数据库查询和操作功能。', '1. 准备 PostgreSQL 数据库连接信息\n2. 填入 host, port, database, user, password\n3. 测试连接', 1),
('Brave Search', 'brave', 'search', NULL, NULL, '["apiKey"]', '{"count": 10}', 'Brave Search API，提供隐私保护的网络搜索功能。', '1. 访问 https://brave.com/search/api 注册\n2. 获取 API Key\n3. 在配置中填入 API Key', 1),
('Google Drive', 'gdrive', 'storage', NULL, NULL, '["credentials"]', '{}', 'Google Drive MCP 服务器，提供 Google Drive 文件操作功能。', '1. 在 Google Cloud Console 创建项目\n2. 启用 Google Drive API\n3. 创建服务账号并下载凭证\n4. 上传凭证 JSON', 1),
('Slack', 'slack', 'communication', NULL, NULL, '["token"]', '{}', 'Slack MCP 服务器，提供 Slack 消息发送、频道管理等功能。', '1. 访问 https://api.slack.com/apps 创建应用\n2. 获取 Bot Token\n3. 在配置中填入 token', 1),
('Puppeteer', 'puppeteer', 'automation', NULL, NULL, '[]', '{"headless": true}', 'Puppeteer MCP 服务器，提供浏览器自动化功能，包括页面截图、PDF 生成等。', '无需额外配置，直接使用。', 1),
('SQLite', 'sqlite', 'database', NULL, NULL, '["dbPath"]', '{}', 'SQLite 数据库 MCP 服务器，提供轻量级数据库操作功能。', '1. 指定 SQLite 数据库文件路径\n2. 确保文件可读写', 1),
('Memory', 'memory', 'memory', NULL, NULL, '[]', '{}', 'Memory MCP 服务器，提供上下文记忆功能，可以存储和检索对话历史。', '无需额外配置，直接使用。', 1);

-- 2. MCP 服务器配置表（含 template_id FK）
CREATE TABLE IF NOT EXISTS `mcp_server_configs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `template_id` BIGINT DEFAULT NULL COMMENT '模板ID',
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
  KEY `idx_template_id` (`template_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_server_type` (`server_type`),
  CONSTRAINT `fk_mcp_config_template` FOREIGN KEY (`template_id`) REFERENCES `mcp_service_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MCP 服务器配置表';
