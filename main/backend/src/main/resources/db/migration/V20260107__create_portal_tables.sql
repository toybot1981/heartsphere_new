-- 传送门系统数据库迁移脚本
-- 创建时间: 2026-01-07
-- 版本: V20260107
-- 说明: 创建传送门相关表，作为独立模块，不创建外键约束

-- 创建传送门配置表
CREATE TABLE IF NOT EXISTS portal_config (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  user_id BIGINT NOT NULL COMMENT '用户ID（心域主人）',
  scene_id BIGINT NOT NULL COMMENT '场景ID（era_id）',
  portal_name VARCHAR(100) NOT NULL COMMENT '传送门名称',
  portal_type ENUM('stargate', 'wormhole', 'quantum') NOT NULL DEFAULT 'stargate' COMMENT '传送门类型：stargate-星门，wormhole-虫洞，quantum-量子',
  target_heartsphere_id BIGINT COMMENT '目标心域ID（user_id，通过逻辑关联）',
  target_share_code VARCHAR(20) COMMENT '目标心域共享码（用于快速查找）',
  position_x DECIMAL(10, 2) DEFAULT 0.0 COMMENT 'X坐标位置',
  position_y DECIMAL(10, 2) DEFAULT 0.0 COMMENT 'Y坐标位置',
  position_z DECIMAL(10, 2) DEFAULT 0.0 COMMENT 'Z坐标位置',
  size DECIMAL(5, 2) DEFAULT 3.0 COMMENT '传送门尺寸（米，默认3米）',
  permission_type ENUM('public', 'approval', 'invite') NOT NULL DEFAULT 'approval' COMMENT '权限类型：public-公开，approval-需要审批，invite-邀请制',
  description TEXT COMMENT '传送门描述',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_scene_id (scene_id),
  INDEX idx_target_share_code (target_share_code),
  INDEX idx_is_active (is_active),
  INDEX idx_user_scene (user_id, scene_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传送门配置表';

-- 创建传送门权限表
CREATE TABLE IF NOT EXISTS portal_permission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  portal_id BIGINT NOT NULL COMMENT '传送门ID',
  user_id BIGINT NOT NULL COMMENT '用户ID',
  permission_type ENUM('approved', 'invited') NOT NULL COMMENT '权限类型：approved-已批准，invited-已邀请',
  invited_by BIGINT COMMENT '邀请人ID',
  invited_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '邀请/批准时间',
  INDEX idx_portal_id (portal_id),
  INDEX idx_user_id (user_id),
  INDEX idx_portal_user (portal_id, user_id),
  UNIQUE KEY uk_portal_user (portal_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传送门权限表';

-- 创建传送门传送记录表
CREATE TABLE IF NOT EXISTS portal_teleportation_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  portal_id BIGINT NOT NULL COMMENT '传送门ID',
  visitor_id BIGINT NOT NULL COMMENT '访问者ID',
  source_heartsphere_id BIGINT COMMENT '源心域ID（user_id，通过逻辑关联）',
  source_scene_id BIGINT COMMENT '源场景ID（era_id）',
  target_heartsphere_id BIGINT COMMENT '目标心域ID（user_id，通过逻辑关联）',
  target_scene_id BIGINT COMMENT '目标场景ID（era_id）',
  teleported_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '传送时间',
  duration_ms INT DEFAULT 0 COMMENT '传送动画时长（毫秒）',
  status ENUM('success', 'failed', 'cancelled') NOT NULL DEFAULT 'success' COMMENT '传送状态：success-成功，failed-失败，cancelled-取消',
  error_message TEXT COMMENT '错误信息（如果失败）',
  INDEX idx_portal_id (portal_id),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_teleported_at (teleported_at DESC),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='传送门传送记录表';
