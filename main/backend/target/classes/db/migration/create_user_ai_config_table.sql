-- 创建用户AI配置表
-- 执行方法：mysql -u root -p123456 heartsphere < create_user_ai_config_table.sql

-- 用户AI配置表
CREATE TABLE IF NOT EXISTS `user_ai_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `text_provider` VARCHAR(50) NULL COMMENT '文本生成提供商：dashscope, gemini, openai',
  `text_model` VARCHAR(100) NULL COMMENT '文本生成模型：qwen-max, qwen-plus等',
  `image_provider` VARCHAR(50) NULL COMMENT '图片生成提供商',
  `image_model` VARCHAR(100) NULL COMMENT '图片生成模型',
  `audio_provider` VARCHAR(50) NULL COMMENT '音频处理提供商',
  `audio_model` VARCHAR(100) NULL COMMENT '音频处理模型',
  `video_provider` VARCHAR(50) NULL COMMENT '视频生成提供商',
  `video_model` VARCHAR(100) NULL COMMENT '视频生成模型',
  `default_temperature` DECIMAL(3, 2) NULL DEFAULT 0.7 COMMENT '默认温度参数',
  `default_max_tokens` INT NULL COMMENT '默认最大Token数',
  `config_json` TEXT NULL COMMENT '扩展配置（JSON格式）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户AI配置表';

-- 系统AI配置表（用于全局默认配置）
CREATE TABLE IF NOT EXISTS `system_ai_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `config_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `config_value` TEXT NULL COMMENT '配置值（JSON格式）',
  `description` VARCHAR(255) NULL COMMENT '配置描述',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统AI配置表';

-- 插入默认系统配置
INSERT INTO `system_ai_config` (`config_key`, `config_value`, `description`, `is_active`) VALUES
('default_text_provider', '"dashscope"', '默认文本生成提供商', TRUE),
('default_text_model', '"qwen-max"', '默认文本生成模型', TRUE),
('default_image_provider', '"dashscope"', '默认图片生成提供商', TRUE),
('default_image_model', '"wanx-v1"', '默认图片生成模型', TRUE),
('default_audio_provider', '"dashscope"', '默认音频处理提供商', TRUE),
('default_audio_model', '"sambert-zhichu-v1"', '默认音频处理模型', TRUE),
('default_video_provider', '"dashscope"', '默认视频生成提供商', TRUE),
('default_video_model', '"wanx-v1.1-video"', '默认视频生成模型', TRUE),
('default_temperature', '0.7', '默认温度参数', TRUE),
('default_max_tokens', '2000', '默认最大Token数', TRUE)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;


