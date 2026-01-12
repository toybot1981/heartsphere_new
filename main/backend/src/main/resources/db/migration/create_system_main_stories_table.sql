-- 创建系统主线剧情表
-- 执行方法：mysql -u root -p123456 heartsphere < create_system_main_stories_table.sql

CREATE TABLE IF NOT EXISTS `system_main_stories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `system_era_id` BIGINT NOT NULL,
  `name` VARCHAR(200) NOT NULL COMMENT '主线剧情名称',
  `age` INT NULL COMMENT '叙事者年龄',
  `role` VARCHAR(50) NULL DEFAULT '叙事者' COMMENT '角色定位',
  `bio` TEXT NULL COMMENT '剧情简介',
  `avatar_url` TEXT NULL COMMENT '叙事者头像URL',
  `background_url` TEXT NULL COMMENT '背景图URL',
  `theme_color` VARCHAR(50) NULL COMMENT '主题色',
  `color_accent` VARCHAR(20) NULL COMMENT '强调色',
  `first_message` TEXT NULL COMMENT '开场白',
  `system_instruction` TEXT NULL COMMENT '系统指令（核心：故事结构、节奏控制、目标）',
  `voice_name` VARCHAR(50) NULL COMMENT '语音名称',
  `tags` TEXT NULL COMMENT '标签（逗号分隔）',
  `speech_style` TEXT NULL COMMENT '语言风格',
  `catchphrases` TEXT NULL COMMENT '口头禅（逗号分隔）',
  `secrets` TEXT NULL COMMENT '秘密',
  `motivations` TEXT NULL COMMENT '动机',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_system_era_id` (`system_era_id`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`),
  CONSTRAINT `fk_system_main_story_era` FOREIGN KEY (`system_era_id`) REFERENCES `system_eras` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_era_main_story` (`system_era_id`) COMMENT '每个场景只能有一个主线剧情'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统主线剧情表';

