-- 创建系统预设剧本表
-- 执行方法：mysql -u root -p123456 heartsphere < create_system_scripts_table.sql

CREATE TABLE IF NOT EXISTS `system_scripts` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL COMMENT '剧本标题',
  `description` TEXT NULL COMMENT '剧本描述',
  `content` TEXT NULL COMMENT '剧本内容（JSON格式）',
  `scene_count` INT NOT NULL DEFAULT 1 COMMENT '场景数量',
  `system_era_id` BIGINT NULL COMMENT '关联的系统时代ID',
  `character_ids` TEXT NULL COMMENT '关联的角色ID列表（JSON数组）',
  `tags` VARCHAR(200) NULL COMMENT '标签（逗号分隔）',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_system_era_id` (`system_era_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_system_script_era` FOREIGN KEY (`system_era_id`) REFERENCES `system_eras` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统预设剧本表';



