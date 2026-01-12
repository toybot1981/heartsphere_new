-- 心域连接模块数据库表创建
-- 创建用户收藏表和访问历史表

SET NAMES utf8mb4;

-- 1. 创建用户收藏表
CREATE TABLE IF NOT EXISTS `user_favorites` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `character_id` BIGINT NOT NULL COMMENT '角色ID',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序（用于自定义排序）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_character` (`user_id`, `character_id`) COMMENT '唯一约束：一个用户不能重复收藏同一个角色',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_user_sort` (`user_id`, `sort_order`),
  INDEX `idx_character_id` (`character_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户收藏表';

-- 2. 创建访问历史表
CREATE TABLE IF NOT EXISTS `access_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `character_id` BIGINT NOT NULL COMMENT '角色ID',
  `access_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '访问时间',
  `access_duration` INT NOT NULL DEFAULT 0 COMMENT '访问时长（秒）',
  `conversation_rounds` INT NOT NULL DEFAULT 0 COMMENT '对话轮数',
  `session_id` VARCHAR(100) NULL COMMENT '会话ID（用于区分不同会话）',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_user_time` (`user_id`, `access_time` DESC),
  INDEX `idx_character_id` (`character_id`),
  INDEX `idx_character_time` (`character_id`, `access_time` DESC),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_access_time` (`access_time` DESC),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='访问历史表';




