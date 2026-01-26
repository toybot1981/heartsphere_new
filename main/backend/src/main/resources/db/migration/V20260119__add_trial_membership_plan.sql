-- 添加体验用户订阅计划
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20260119__add_trial_membership_plan.sql
-- 
-- 说明：为游客模式创建体验用户计划，默认提供1万文本Token，其他配额为0

SET NAMES utf8mb4;

-- 插入体验会员订阅计划
INSERT INTO `subscription_plans` (
    `name`,
    `type`,
    `billing_cycle`,
    `price`,
    `original_price`,
    `discount_percent`,
    `points_per_month`,
    `max_images_per_month`,
    `max_videos_per_month`,
    `max_text_generations_per_month`,
    `max_audio_generations_per_month`,
    `text_token_quota`,
    `image_generation_quota`,
    `audio_processing_quota`,
    `video_generation_quota`,
    `permanent_token_quota`,
    `storage_quota_mb`,
    `allow_priority_queue`,
    `allow_watermark_removal`,
    `allow_batch_processing`,
    `allow_api_access`,
    `max_api_calls_per_day`,
    `allow_team_collaboration`,
    `is_active`,
    `sort_order`,
    `recommended`,
    `created_at`,
    `updated_at`
)
SELECT 
    '体验会员',
    'trial',
    'monthly',
    0.00,
    NULL,
    NULL,
    0,  -- 积分
    NULL,  -- 图片生成配额（无限制，但实际为0）
    NULL,  -- 视频生成配额（无限制，但实际为0）
    NULL,  -- 文本生成次数（无限制）
    NULL,  -- 音频生成次数（无限制）
    10000,  -- 文本Token配额：1万
    0,  -- 图片生成配额：0
    0,  -- 音频处理配额：0
    0,  -- 视频生成配额：0
    0,  -- 永久Token配额：0
    0,  -- 存储配额：0
    FALSE,  -- 不允许优先队列
    FALSE,  -- 不允许去除水印
    FALSE,  -- 不允许批量处理
    FALSE,  -- 不允许API访问
    NULL,  -- API调用次数限制（无限制）
    FALSE,  -- 不允许团队协作
    TRUE,  -- 启用
    0,  -- 排序（最前）
    FALSE,  -- 不推荐
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM `subscription_plans` WHERE `type` = 'trial'
);

-- 验证插入结果
SELECT 
    id,
    name,
    type,
    billing_cycle,
    text_token_quota,
    image_generation_quota,
    video_generation_quota,
    permanent_token_quota,
    is_active
FROM `subscription_plans`
WHERE `type` = 'trial';
