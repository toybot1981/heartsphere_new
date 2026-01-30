-- 更新订阅计划名称和配额配置
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20260121__update_subscription_plan_names_and_quotas.sql
-- 
-- 说明：
-- 1. 将"体验会员"改为"体验用户"，默认提供10000文本token，其他均为0
-- 2. 将"免费"（注册会员）改为"注册用户"，提供100000文本token和10张图片

SET NAMES utf8mb4;

-- 更新体验会员为体验用户，并设置配额
UPDATE `subscription_plans`
SET 
    `name` = '体验用户',
    `text_token_quota` = 10000,
    `image_generation_quota` = 0,
    `audio_processing_quota` = 0,
    `video_generation_quota` = 0,
    `permanent_token_quota` = 0,
    `updated_at` = NOW()
WHERE `type` = 'trial';

-- 更新免费会员为注册用户，并设置配额
UPDATE `subscription_plans`
SET 
    `name` = '注册用户',
    `text_token_quota` = 100000,
    `image_generation_quota` = 10,
    `audio_processing_quota` = 0,
    `video_generation_quota` = 0,
    `permanent_token_quota` = 0,
    `updated_at` = NOW()
WHERE `type` = 'free';

-- 验证更新结果
SELECT 
    id,
    name,
    type,
    billing_cycle,
    text_token_quota,
    image_generation_quota,
    audio_processing_quota,
    video_generation_quota,
    is_active
FROM `subscription_plans`
WHERE `type` IN ('trial', 'free')
ORDER BY `type`, `sort_order`;
