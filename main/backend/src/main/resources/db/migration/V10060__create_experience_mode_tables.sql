-- 体验模式功能数据库迁移脚本
-- 创建时间: 2025-12-28
-- 版本: V10060

-- 创建暖心留言表
CREATE TABLE IF NOT EXISTS warm_message (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  share_config_id BIGINT NOT NULL COMMENT '共享配置ID',
  visitor_id BIGINT NOT NULL COMMENT '访问者ID',
  visitor_name VARCHAR(100) COMMENT '访问者名称',
  message TEXT NOT NULL COMMENT '留言内容',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (share_config_id) REFERENCES heartsphere_share_config(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_share_config_id (share_config_id),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='暖心留言表';

-- 创建体验摘要表（可选，用于记录访问者的体验摘要）
CREATE TABLE IF NOT EXISTS experience_summary (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  share_config_id BIGINT NOT NULL COMMENT '共享配置ID',
  visitor_id BIGINT NOT NULL COMMENT '访问者ID',
  duration INT DEFAULT 0 COMMENT '体验时长（秒）',
  visited_scenes TEXT COMMENT '访问的场景ID列表（JSON数组）',
  interacted_characters TEXT COMMENT '交互的角色ID列表（JSON数组）',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  FOREIGN KEY (share_config_id) REFERENCES heartsphere_share_config(id) ON DELETE CASCADE,
  FOREIGN KEY (visitor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_share_config_id (share_config_id),
  INDEX idx_visitor_id (visitor_id),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='体验摘要表';




