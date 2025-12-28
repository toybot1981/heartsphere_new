-- 创建用户场景物品表和事件表
-- 这些表用于存储用户在创建场景时，与场景节点关联的物品和事件
-- 一个节点可以有多个物品和事件

SET NAMES utf8mb4;

-- 1. 创建用户场景物品表
-- 注意：这里假设场景是通过 scripts 表管理的，节点信息可能存储在 scripts.content 的JSON中
-- 或者有单独的 nodes 表。根据实际情况调整外键关联
CREATE TABLE IF NOT EXISTS `user_scenario_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `script_id` BIGINT NOT NULL COMMENT '关联的剧本ID（用户场景）',
  `node_id` VARCHAR(100) NULL COMMENT '节点ID（在剧本内容中的节点标识）',
  `system_era_item_id` BIGINT NULL COMMENT '关联的系统预置物品ID（从system_era_items引用）',
  `name` VARCHAR(100) NOT NULL COMMENT '物品名称（如果使用系统物品，则为系统物品名称；否则为用户自定义名称）',
  `item_id` VARCHAR(100) NOT NULL COMMENT '物品ID（唯一标识，用于剧本中引用）',
  `description` TEXT COMMENT '物品描述',
  `icon_url` VARCHAR(500) NULL COMMENT '物品图标URL',
  `item_type` VARCHAR(50) NULL COMMENT '物品类型：weapon, tool, key, consumable, collectible等',
  `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）',
  `quantity` INT DEFAULT 1 COMMENT '数量',
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为用户自定义物品（false表示使用系统物品）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_script_id` (`script_id`),
  INDEX `idx_node_id` (`node_id`),
  INDEX `idx_system_era_item_id` (`system_era_item_id`),
  INDEX `idx_item_id` (`item_id`),
  FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`system_era_item_id`) REFERENCES `system_era_items` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户场景物品表（与场景节点关联）';

-- 2. 创建用户场景事件表
CREATE TABLE IF NOT EXISTS `user_scenario_events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `script_id` BIGINT NOT NULL COMMENT '关联的剧本ID（用户场景）',
  `node_id` VARCHAR(100) NULL COMMENT '节点ID（在剧本内容中的节点标识）',
  `system_era_event_id` BIGINT NULL COMMENT '关联的系统预置事件ID（从system_era_events引用）',
  `name` VARCHAR(100) NOT NULL COMMENT '事件名称（如果使用系统事件，则为系统事件名称；否则为用户自定义名称）',
  `event_id` VARCHAR(100) NOT NULL COMMENT '事件ID（唯一标识，用于剧本中引用）',
  `description` TEXT COMMENT '事件描述',
  `icon_url` VARCHAR(500) NULL COMMENT '事件图标URL',
  `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）',
  `is_custom` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否为用户自定义事件（false表示使用系统事件）',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_script_id` (`script_id`),
  INDEX `idx_node_id` (`node_id`),
  INDEX `idx_system_era_event_id` (`system_era_event_id`),
  INDEX `idx_event_id` (`event_id`),
  FOREIGN KEY (`script_id`) REFERENCES `scripts` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`system_era_event_id`) REFERENCES `system_era_events` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户场景事件表（与场景节点关联）';

