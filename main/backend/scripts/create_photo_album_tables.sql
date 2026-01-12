-- 创建相册表
CREATE TABLE IF NOT EXISTS `photo_albums` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `plugin_instance_id` BIGINT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `cover_photo_id` BIGINT,
  `cover_photo_url` VARCHAR(500),
  `photo_count` INT NOT NULL DEFAULT 0,
  `tags` TEXT,
  `is_public` BOOLEAN NOT NULL DEFAULT FALSE,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_user_plugin` (`user_id`, `plugin_instance_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建照片表
CREATE TABLE IF NOT EXISTS `photos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `album_id` BIGINT NOT NULL,
  `user_id` BIGINT NOT NULL,
  `title` VARCHAR(255),
  `description` TEXT,
  `photo_url` VARCHAR(500) NOT NULL,
  `thumbnail_url` VARCHAR(500),
  `file_name` VARCHAR(255),
  `file_size` BIGINT,
  `width` INT,
  `height` INT,
  `mime_type` VARCHAR(100),
  `taken_at` DATETIME,
  `location` VARCHAR(255),
  `tags` TEXT,
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_album` (`album_id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_deleted` (`is_deleted`),
  INDEX `idx_sort` (`album_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
