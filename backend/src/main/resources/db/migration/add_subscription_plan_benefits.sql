-- 为订阅计划表添加AI服务权益字段
-- 执行方法：mysql -u root -p123456 heartsphere < add_subscription_plan_benefits.sql

ALTER TABLE `subscription_plans` 
ADD COLUMN `max_text_generations_per_month` INT NULL COMMENT '每月最多文本生成次数（NULL表示无限制）' AFTER `max_videos_per_month`,
ADD COLUMN `max_audio_generations_per_month` INT NULL COMMENT '每月最多语音生成次数（NULL表示无限制）' AFTER `max_text_generations_per_month`,
ADD COLUMN `allowed_ai_models` TEXT NULL COMMENT '允许使用的AI模型列表（JSON格式，如：["qwen3-max", "gpt-4", "gemini-pro"]）' AFTER `max_audio_generations_per_month`,
ADD COLUMN `max_image_resolution` VARCHAR(20) NULL COMMENT '最大图片分辨率（如：2k, 4k, 8k）' AFTER `allowed_ai_models`,
ADD COLUMN `max_video_duration` INT NULL COMMENT '最大视频时长（秒，NULL表示无限制）' AFTER `max_image_resolution`,
ADD COLUMN `allow_priority_queue` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否允许优先队列（加速处理）' AFTER `max_video_duration`,
ADD COLUMN `allow_watermark_removal` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否允许去除水印' AFTER `allow_priority_queue`,
ADD COLUMN `allow_batch_processing` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否允许批量处理' AFTER `allow_watermark_removal`,
ADD COLUMN `allow_api_access` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否允许API访问' AFTER `allow_batch_processing`,
ADD COLUMN `max_api_calls_per_day` INT NULL COMMENT '每日最多API调用次数（NULL表示无限制）' AFTER `allow_api_access`,
ADD COLUMN `ai_benefits` TEXT NULL COMMENT 'AI服务权益详情（JSON格式，包含详细权限配置）' AFTER `max_api_calls_per_day`;

-- 更新索引
CREATE INDEX `idx_max_text_generations` ON `subscription_plans` (`max_text_generations_per_month`);
CREATE INDEX `idx_allow_api_access` ON `subscription_plans` (`allow_api_access`);

