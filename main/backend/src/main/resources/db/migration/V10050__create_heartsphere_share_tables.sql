-- 心域共享功能数据库迁移脚本
-- 创建时间: 2025-12-28
-- 版本: V10050

-- 创建心域共享配置表
CREATE TABLE IF NOT EXISTS heartsphere_share_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID（心域主人）',
  share_code VARCHAR(20) NOT NULL UNIQUE COMMENT '共享码（如：HS-A3B7C9）',
  share_type ENUM('all', 'world', 'era') NOT NULL DEFAULT 'all' COMMENT '共享类型：all-全部，world-按世界，era-按场景',
  share_status ENUM('active', 'paused', 'closed') NOT NULL DEFAULT 'active' COMMENT '共享状态：active-已开启，paused-已暂停，closed-已关闭',
  access_permission ENUM('approval', 'free', 'invite') NOT NULL DEFAULT 'approval' COMMENT '访问权限：approval-需要审批，free-自由连接，invite-邀请连接',
  description TEXT COMMENT '共享描述',
  cover_image_url VARCHAR(500) COMMENT '封面图URL',
  view_count INT DEFAULT 0 COMMENT '查看次数',
  request_count INT DEFAULT 0 COMMENT '连接请求次数',
  approved_count INT DEFAULT 0 COMMENT '已批准连接次数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  expires_at DATETIME COMMENT '过期时间（可选）',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_share_code (share_code),
  INDEX idx_share_status (share_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='心域共享配置表';

-- 创建共享范围表（存储共享的世界或场景）
CREATE TABLE IF NOT EXISTS heartsphere_share_scope (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  share_config_id BIGINT NOT NULL COMMENT '共享配置ID',
  scope_type ENUM('world', 'era') NOT NULL COMMENT '范围类型：world-世界，era-场景',
  scope_id BIGINT NOT NULL COMMENT '范围ID（世界ID或场景ID）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (share_config_id) REFERENCES heartsphere_share_config(id) ON DELETE CASCADE,
  UNIQUE KEY uk_share_scope (share_config_id, scope_type, scope_id),
  INDEX idx_share_config_id (share_config_id),
  INDEX idx_scope (scope_type, scope_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='共享范围表';

-- 创建连接请求表
CREATE TABLE IF NOT EXISTS heartsphere_connection_request (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  share_config_id BIGINT NOT NULL COMMENT '共享配置ID',
  requester_id BIGINT NOT NULL COMMENT '请求者ID',
  request_status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending' COMMENT '请求状态：pending-待审批，approved-已批准，rejected-已拒绝，cancelled-已取消',
  request_message TEXT COMMENT '请求消息（可选）',
  response_message TEXT COMMENT '响应消息（主人回复）',
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '请求时间',
  responded_at DATETIME COMMENT '响应时间',
  expires_at DATETIME COMMENT '过期时间（可选）',
  FOREIGN KEY (share_config_id) REFERENCES heartsphere_share_config(id) ON DELETE CASCADE,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_share_config_id (share_config_id),
  INDEX idx_requester_id (requester_id),
  INDEX idx_request_status (request_status),
  INDEX idx_requested_at (requested_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='连接请求表';

-- 创建连接记录表（记录已建立的连接）
CREATE TABLE IF NOT EXISTS heartsphere_connection (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  share_config_id BIGINT NOT NULL COMMENT '共享配置ID',
  visitor_id BIGINT NOT NULL COMMENT '访问者ID',
  connection_status ENUM('active', 'ended', 'expired') NOT NULL DEFAULT 'active' COMMENT '连接状态：active-活跃，ended-已结束，expired-已过期',
  connected_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '连接时间',
  last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后访问时间',
  ended_at DATETIME COMMENT '结束时间',
  visit_duration INT DEFAULT 0 COMMENT '访问时长（秒）',
  FOREIGN KEY (share_config_id) REFERENCES heartsphere_share_config(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_share_config_id (share_config_id),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_connection_status (connection_status),
  INDEX idx_connected_at (connected_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='连接记录表';




