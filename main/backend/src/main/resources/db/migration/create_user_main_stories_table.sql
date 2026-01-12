-- 创建用户主线剧情表
-- 执行方法：mysql -u root -p123456 heartsphere < create_user_main_stories_table.sql

CREATE TABLE IF NOT EXISTS `user_main_stories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `era_id` BIGINT NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `age` INT NULL,
  `role` VARCHAR(50) NULL DEFAULT '叙事者',
  `bio` TEXT NULL,
  `avatar_url` TEXT NULL,
  `background_url` TEXT NULL,
  `theme_color` VARCHAR(50) NULL,
  `color_accent` VARCHAR(20) NULL,
  `first_message` TEXT NULL,
  `system_instruction` TEXT NULL,
  `voice_name` VARCHAR(50) NULL,
  `mbti` VARCHAR(10) NULL,
  `tags` TEXT NULL,
  `speech_style` TEXT NULL,
  `catchphrases` TEXT NULL,
  `secrets` TEXT NULL,
  `motivations` TEXT NULL,
  `relationships` TEXT NULL,
  `is_deleted` BOOLEAN NOT NULL DEFAULT FALSE,
  `deleted_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_era_id` (`era_id`),
  INDEX `idx_user_era` (`user_id`, `era_id`),
  INDEX `idx_is_deleted` (`is_deleted`),
  UNIQUE KEY `uk_user_era` (`user_id`, `era_id`, `is_deleted`),
  CONSTRAINT `fk_user_main_story_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_main_story_era` FOREIGN KEY (`era_id`) REFERENCES `eras` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户主线剧情表';




