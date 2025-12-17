-- 插入默认订阅计划
-- 执行方法：mysql -u root -p123456 heartsphere < insert_default_subscription_plans.sql

-- 免费会员
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('免费', 'free', 'monthly', 0.00, 0, 0, 0, '["每天赠送积分"]', TRUE, 0);

-- 基础会员 - 连续包年
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('基础会员', 'basic', 'continuous_yearly', 659.00, NULL, 30, 1080, 4320, 216, '["Seedream 4.5 2k免费用1年", "Seedream 4.1 2k免费用1年", "Seedream 4.0 2k免费用1年", "每天赠送积分", "生图生视频无限次加速", "生成作品去除品牌水印"]', TRUE, 1);

-- 标准会员 - 连续包年
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('标准会员', 'standard', 'continuous_yearly', 1899.00, NULL, 30, 4000, 16000, 800, '["Seedream 4.5 2k免费用1年", "Seedream 4.1 2k免费用1年", "Seedream 4.0 2k免费用1年", "每天赠送积分", "生图生视频无限次加速", "生成作品去除品牌水印"]', TRUE, 2);

-- 高级会员 - 连续包年
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('高级会员', 'premium', 'continuous_yearly', 5199.00, NULL, 30, 15000, 60000, 3000, '["Seedream 4.5 4k免费用1年", "Seedream 4.1 4k免费用1年", "Seedream 4.0 4k免费用1年", "每天赠送积分", "生图生视频无限次加速(最快)", "生成作品去除品牌水印"]', TRUE, 3);

-- 基础会员 - 连续包月
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('基础会员', 'basic', 'continuous_monthly', 659.00, NULL, 12, 1080, 4320, 216, '["Seedream 4.5 2k免费用1年", "Seedream 4.1 2k免费用1年", "Seedream 4.0 2k免费用1年", "每天赠送积分", "生图生视频无限次加速", "生成作品去除品牌水印"]', TRUE, 4);

-- 标准会员 - 连续包月
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('标准会员', 'standard', 'continuous_monthly', 1899.00, NULL, 12, 4000, 16000, 800, '["Seedream 4.5 2k免费用1年", "Seedream 4.1 2k免费用1年", "Seedream 4.0 2k免费用1年", "每天赠送积分", "生图生视频无限次加速", "生成作品去除品牌水印"]', TRUE, 5);

-- 高级会员 - 连续包月
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('高级会员', 'premium', 'continuous_monthly', 649.00, NULL, 12, 15000, 60000, 3000, '["Seedream 4.5 4k免费用1年", "Seedream 4.1 4k免费用1年", "Seedream 4.0 4k免费用1年", "每天赠送积分", "生图生视频无限次加速(最快)", "生成作品去除品牌水印"]', TRUE, 6);

-- 高级会员 - 单月购买
INSERT INTO `subscription_plans` (`name`, `type`, `billing_cycle`, `price`, `original_price`, `discount_percent`, `points_per_month`, `max_images_per_month`, `max_videos_per_month`, `features`, `is_active`, `sort_order`) VALUES
('高级会员', 'premium', 'monthly', 649.00, NULL, NULL, 15000, 60000, 3000, '["Seedream 4.5 4k免费用1年", "Seedream 4.1 4k免费用1年", "Seedream 4.0 4k免费用1年", "每天赠送积分", "生图生视频无限次加速(最快)", "生成作品去除品牌水印"]', TRUE, 7);

