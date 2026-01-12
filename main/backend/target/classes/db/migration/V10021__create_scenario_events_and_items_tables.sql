-- 创建剧本事件表
CREATE TABLE IF NOT EXISTS `scenario_events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '事件名称',
  `event_id` VARCHAR(100) NOT NULL UNIQUE COMMENT '事件ID（唯一标识，用于剧本中引用）',
  `description` TEXT COMMENT '事件描述',
  `era_id` BIGINT NULL COMMENT '所属场景ID',
  `user_id` BIGINT NULL COMMENT '创建者用户ID',
  `is_system` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为系统预设事件',
  `icon_url` VARCHAR(500) NULL COMMENT '事件图标URL',
  `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已删除（软删除）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_event_id` (`event_id`),
  INDEX `idx_era_id` (`era_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_system` (`is_system`),
  INDEX `idx_is_deleted` (`is_deleted`),
  FOREIGN KEY (`era_id`) REFERENCES `eras` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本事件表';

-- 创建剧本物品表
CREATE TABLE IF NOT EXISTS `scenario_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '物品名称',
  `item_id` VARCHAR(100) NOT NULL UNIQUE COMMENT '物品ID（唯一标识，用于剧本中引用）',
  `description` TEXT COMMENT '物品描述',
  `era_id` BIGINT NULL COMMENT '所属场景ID',
  `user_id` BIGINT NULL COMMENT '创建者用户ID',
  `is_system` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为系统预设物品',
  `icon_url` VARCHAR(500) NULL COMMENT '物品图标URL',
  `item_type` VARCHAR(50) NULL COMMENT '物品类型：weapon, tool, key, consumable, collectible等',
  `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已删除（软删除）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_item_id` (`item_id`),
  INDEX `idx_era_id` (`era_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_system` (`is_system`),
  INDEX `idx_is_deleted` (`is_deleted`),
  INDEX `idx_item_type` (`item_type`),
  FOREIGN KEY (`era_id`) REFERENCES `eras` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='剧本物品表';

