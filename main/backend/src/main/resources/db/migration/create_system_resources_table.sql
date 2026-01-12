-- 创建系统资源表
CREATE TABLE IF NOT EXISTS `system_resources` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `category` VARCHAR(50) NOT NULL COMMENT '分类：avatar, character, era, scenario, journal, general',
  `description` VARCHAR(500) NULL,
  `tags` VARCHAR(50) NULL COMMENT '标签（逗号分隔）',
  `file_size` BIGINT NULL,
  `mime_type` VARCHAR(100) NULL,
  `width` INT NULL,
  `height` INT NULL,
  `created_by_admin_id` BIGINT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_category` (`category`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



