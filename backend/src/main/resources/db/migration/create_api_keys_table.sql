-- 创建API Key表
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `key_name` VARCHAR(100) NOT NULL,
  `api_key` VARCHAR(64) NOT NULL UNIQUE,
  `user_id` BIGINT NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `expires_at` DATETIME NULL,
  `last_used_at` DATETIME NULL,
  `usage_count` BIGINT NOT NULL DEFAULT 0,
  `rate_limit` INT NULL,
  `description` VARCHAR(500) NULL,
  `created_by_admin_id` BIGINT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_api_key` (`api_key`),
  INDEX `idx_key_name` (`key_name`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




