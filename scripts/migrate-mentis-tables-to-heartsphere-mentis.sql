-- ========================================
-- Mentis 相关表迁移脚本
-- 将 heartsphere 数据库中的 mentis 相关表迁移到 heartsphere_mentis 数据库
-- 执行时间: 2026-01-16
-- ========================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- ========================================
-- 步骤 1: 在 heartsphere_mentis 数据库中创建表结构
-- ========================================

USE heartsphere_mentis;

-- 1. 创建 mcp_service_templates 表（无外键依赖，最先创建）
DROP TABLE IF EXISTS `mcp_service_templates`;
CREATE TABLE `mcp_service_templates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `template_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '模板名称',
  `server_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '服务器类型',
  `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分类（search, storage, communication, etc.）',
  `default_url` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '默认 URL',
  `default_url_template` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL 模板（支持变量）',
  `required_params` text COLLATE utf8mb4_unicode_ci COMMENT '必需参数（JSON 格式）',
  `optional_params` text COLLATE utf8mb4_unicode_ci COMMENT '可选参数（JSON 格式）',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '模板描述',
  `setup_instructions` text COLLATE utf8mb4_unicode_ci COMMENT '设置说明',
  `icon_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图标 URL',
  `is_popular` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否为主流服务',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_template_name` (`template_name`),
  KEY `idx_server_type` (`server_type`),
  KEY `idx_category` (`category`),
  KEY `idx_is_popular` (`is_popular`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MCP 服务模板表';

-- 2. 创建 mcp_server_configs 表（依赖 mcp_service_templates）
DROP TABLE IF EXISTS `mcp_server_configs`;
CREATE TABLE `mcp_server_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `template_id` bigint DEFAULT NULL COMMENT '模板ID',
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '配置名称',
  `server_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '服务器类型',
  `server_url` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '服务器 URL',
  `api_key` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'API Key',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '配置描述',
  `extra_config` text COLLATE utf8mb4_unicode_ci COMMENT '额外配置（JSON）',
  `user_id` bigint DEFAULT NULL COMMENT '用户ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_tested_at` datetime DEFAULT NULL COMMENT '最后测试时间',
  `connection_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'DISCONNECTED' COMMENT '连接状态',
  `last_error` text COLLATE utf8mb4_unicode_ci COMMENT '最后错误信息',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_server_type` (`server_type`),
  KEY `idx_template_id` (`template_id`),
  CONSTRAINT `fk_mcp_config_template` FOREIGN KEY (`template_id`) REFERENCES `mcp_service_templates` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='MCP 服务器配置表';

-- 3. 创建 tool_configs 表（无外键依赖）
DROP TABLE IF EXISTS `tool_configs`;
CREATE TABLE `tool_configs` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `tool_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '工具名称，与 Tool.getName() 对应',
    `description` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '工具描述（可编辑）',
    `category` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '工具分类（browser、terminal、filesystem、code、system）',
    `prompt_template_category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '提示词模板的分类代码（关联 PromptTemplate）',
    `instruction_template` text COLLATE utf8mb4_unicode_ci COMMENT '指令模板（JSON 格式）',
    `script_template` text COLLATE utf8mb4_unicode_ci COMMENT '脚本模板（对于需要脚本的工具，如 Python）',
    `parameters_schema` json DEFAULT NULL COMMENT '参数模式（JSON Schema 格式，可编辑）',
    `is_active` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
    `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_tool_name` (`tool_name`),
    KEY `idx_tool_name` (`tool_name`),
    KEY `idx_category` (`category`),
    KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工具配置表';

-- 4. 创建 mentis_agent_configs 表（无外键依赖）
DROP TABLE IF EXISTS `mentis_agent_configs`;
CREATE TABLE `mentis_agent_configs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `agent_id` bigint NOT NULL COMMENT 'Agent ID（引用 main 系统的 character ID）',
  `agent_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Agent 名称',
  `configuration` text COLLATE utf8mb4_unicode_ci COMMENT '配置信息（JSON 格式）',
  `enabled` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否启用',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_agent_id` (`agent_id`),
  KEY `idx_enabled` (`enabled`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis Agent 配置表';

-- 5. 创建 mentis_sessions 表（无外键依赖，但被其他表引用）
DROP TABLE IF EXISTS `mentis_sessions`;
CREATE TABLE `mentis_sessions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '会话唯一标识',
  `user_id` bigint NOT NULL COMMENT '用户ID',
  `title` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '会话标题',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE' COMMENT '会话状态：ACTIVE, PAUSED, COMPLETED, ARCHIVED',
  `vm_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'IDLE' COMMENT '虚拟机状态：IDLE, RUNNING, ERROR',
  `vm_image_id` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '虚拟机镜像ID或标识',
  `vm_config` text COLLATE utf8mb4_unicode_ci COMMENT '虚拟机配置信息（JSON格式）',
  `context` text COLLATE utf8mb4_unicode_ci COMMENT '会话上下文信息（JSON格式）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `last_active_at` datetime DEFAULT NULL COMMENT '最后活跃时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_status` (`status`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_last_active_at` (`last_active_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis会话表';

-- 6. 创建 mentis_messages 表（依赖 mentis_sessions）
DROP TABLE IF EXISTS `mentis_messages`;
CREATE TABLE `mentis_messages` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `message_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息唯一标识',
  `session_id` bigint NOT NULL COMMENT '会话ID',
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息角色：USER, MENTIS, SYSTEM',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '消息内容',
  `message_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXT' COMMENT '消息类型：TEXT, COMMAND, RESULT, ERROR, ACTION',
  `task_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联的任务ID（如果消息与任务相关）',
  `metadata` text COLLATE utf8mb4_unicode_ci COMMENT '元数据（JSON格式）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_id` (`message_id`),
  KEY `idx_message_id` (`message_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_role` (`role`),
  KEY `idx_message_type` (`message_type`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_session_created` (`session_id`,`created_at`),
  CONSTRAINT `mentis_messages_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `mentis_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis消息表';

-- 7. 创建 mentis_tasks 表（依赖 mentis_sessions）
DROP TABLE IF EXISTS `mentis_tasks`;
CREATE TABLE `mentis_tasks` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务唯一标识',
  `session_id` bigint NOT NULL COMMENT '会话ID',
  `task_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务类型：COMMAND, SCRIPT, INTERACTIVE, COMPUTER_USE',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING' COMMENT '任务状态：PENDING, RUNNING, COMPLETED, FAILED, CANCELLED',
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '任务描述/指令',
  `command` text COLLATE utf8mb4_unicode_ci COMMENT '执行的命令或脚本',
  `parameters` text COLLATE utf8mb4_unicode_ci COMMENT '任务参数（JSON格式）',
  `result` text COLLATE utf8mb4_unicode_ci COMMENT '任务结果（JSON格式）',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `started_at` datetime DEFAULT NULL COMMENT '执行开始时间',
  `completed_at` datetime DEFAULT NULL COMMENT '执行结束时间',
  `duration` bigint DEFAULT NULL COMMENT '执行耗时（毫秒）',
  `execution_id` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '任务执行ID，用于查询任务进度',
  `message_id` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联的用户消息ID，用于查询当前对话的任务',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_id` (`task_id`),
  KEY `idx_task_id` (`task_id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_status` (`status`),
  KEY `idx_task_type` (`task_type`),
  KEY `idx_session_status` (`session_id`,`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_execution_id` (`execution_id`),
  KEY `idx_message_id` (`message_id`),
  CONSTRAINT `mentis_tasks_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `mentis_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis任务表';

-- 8. 创建 mentis_vm_states 表（依赖 mentis_sessions）
DROP TABLE IF EXISTS `mentis_vm_states`;
CREATE TABLE `mentis_vm_states` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `session_id` bigint NOT NULL COMMENT '会话ID',
  `vm_id` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '虚拟机标识',
  `state_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '状态类型：SNAPSHOT, CHECKPOINT, SCREENSHOT',
  `state_data` text COLLATE utf8mb4_unicode_ci COMMENT '状态数据（JSON格式，包含屏幕截图、文件系统状态等）',
  `screenshot_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '屏幕截图URL或路径',
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '状态描述',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_session_id` (`session_id`),
  KEY `idx_vm_id` (`vm_id`),
  KEY `idx_state_type` (`state_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `mentis_vm_states_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `mentis_sessions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Mentis虚拟机状态表';

-- ========================================
-- 步骤 2: 从 heartsphere 数据库复制数据到 heartsphere_mentis
-- ========================================

-- 复制 mcp_service_templates 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mcp_service_templates');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mcp_service_templates` SELECT * FROM `heartsphere`.`mcp_service_templates` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "mcp_service_templates table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mcp_server_configs 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mcp_server_configs');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mcp_server_configs` SELECT * FROM `heartsphere`.`mcp_server_configs` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "mcp_server_configs table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 tool_configs 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'tool_configs');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`tool_configs` SELECT * FROM `heartsphere`.`tool_configs` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "tool_configs table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mentis_agent_configs 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mentis_agent_configs');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mentis_agent_configs` SELECT * FROM `heartsphere`.`mentis_agent_configs` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "mentis_agent_configs table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mentis_sessions 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mentis_sessions');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mentis_sessions` SELECT * FROM `heartsphere`.`mentis_sessions` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "mentis_sessions table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mentis_messages 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mentis_messages');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mentis_messages` SELECT * FROM `heartsphere`.`mentis_messages` ON DUPLICATE KEY UPDATE `created_at` = VALUES(`created_at`)',
    'SELECT "mentis_messages table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mentis_tasks 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mentis_tasks');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mentis_tasks` SELECT * FROM `heartsphere`.`mentis_tasks` ON DUPLICATE KEY UPDATE `updated_at` = VALUES(`updated_at`)',
    'SELECT "mentis_tasks table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 复制 mentis_vm_states 表数据（如果源表存在）
SET @table_exists = (SELECT COUNT(*) FROM information_schema.tables 
                     WHERE table_schema = 'heartsphere' AND table_name = 'mentis_vm_states');
SET @sql = IF(@table_exists > 0,
    'INSERT INTO `heartsphere_mentis`.`mentis_vm_states` SELECT * FROM `heartsphere`.`mentis_vm_states` ON DUPLICATE KEY UPDATE `created_at` = VALUES(`created_at`)',
    'SELECT "mentis_vm_states table does not exist in heartsphere, skipping data migration" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ========================================
-- 步骤 3: 验证迁移结果
-- ========================================

-- 验证表数量
SELECT 
    'mcp_service_templates' AS table_name,
    COUNT(*) AS record_count
FROM `heartsphere_mentis`.`mcp_service_templates`
UNION ALL
SELECT 
    'mcp_server_configs',
    COUNT(*)
FROM `heartsphere_mentis`.`mcp_server_configs`
UNION ALL
SELECT 
    'tool_configs',
    COUNT(*)
FROM `heartsphere_mentis`.`tool_configs`
UNION ALL
SELECT 
    'mentis_agent_configs',
    COUNT(*)
FROM `heartsphere_mentis`.`mentis_agent_configs`
UNION ALL
SELECT 
    'mentis_sessions',
    COUNT(*)
FROM `heartsphere_mentis`.`mentis_sessions`
UNION ALL
SELECT 
    'mentis_messages',
    COUNT(*)
FROM `heartsphere_mentis`.`mentis_messages`
UNION ALL
SELECT 
    'mentis_tasks',
    COUNT(*)
FROM `heartsphere_mentis`.`mentis_tasks`
UNION ALL
SELECT 
    'mentis_vm_states',
    COUNT(*)
FROM `heartsphere_mentis`.`mentis_vm_states`;

SET FOREIGN_KEY_CHECKS=1;

-- ========================================
-- 迁移完成
-- ========================================
-- 注意：迁移完成后，需要：
-- 1. 验证数据完整性
-- 2. 更新应用配置，确保使用 heartsphere_mentis 数据库
-- 3. 考虑是否从 heartsphere 数据库中删除这些表（建议先备份）
-- ========================================
