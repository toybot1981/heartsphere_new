-- 创建会员相关表
-- 执行方法：mysql -u root -p123456 heartsphere < create_membership_tables.sql

-- 1. 订阅计划表
CREATE TABLE IF NOT EXISTS `subscription_plans` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '计划名称：免费、基础会员、标准会员、高级会员',
  `type` VARCHAR(50) NOT NULL COMMENT '类型：free, basic, standard, premium',
  `billing_cycle` VARCHAR(20) NOT NULL COMMENT '计费周期：monthly, yearly, continuous_monthly, continuous_yearly',
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '价格',
  `original_price` DECIMAL(10, 2) NULL COMMENT '原价（用于显示折扣）',
  `discount_percent` INT NULL COMMENT '折扣百分比',
  `points_per_month` INT NOT NULL DEFAULT 0 COMMENT '每月赠送积分',
  `max_images_per_month` INT NULL COMMENT '每月最多生成图片数',
  `max_videos_per_month` INT NULL COMMENT '每月最多生成视频数',
  `features` TEXT NULL COMMENT '功能特性（JSON格式）',
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_billing_cycle` (`billing_cycle`),
  INDEX `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订阅计划表';

-- 2. 用户会员表
CREATE TABLE IF NOT EXISTS `memberships` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `plan_id` BIGINT NOT NULL COMMENT '订阅计划ID',
  `plan_type` VARCHAR(50) NOT NULL COMMENT '计划类型：free, basic, standard, premium',
  `billing_cycle` VARCHAR(20) NOT NULL COMMENT '计费周期：monthly, yearly, continuous_monthly, continuous_yearly',
  `status` VARCHAR(20) NOT NULL DEFAULT 'active' COMMENT '状态：active, expired, cancelled, suspended',
  `start_date` DATETIME NOT NULL COMMENT '开始时间',
  `end_date` DATETIME NULL COMMENT '结束时间（连续包年/包月为NULL）',
  `auto_renew` BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否自动续费',
  `next_renewal_date` DATETIME NULL COMMENT '下次续费时间',
  `renewal_price` DECIMAL(10, 2) NULL COMMENT '续费价格',
  `current_points` INT NOT NULL DEFAULT 0 COMMENT '当前积分',
  `total_points_earned` INT NOT NULL DEFAULT 0 COMMENT '累计获得积分',
  `total_points_used` INT NOT NULL DEFAULT 0 COMMENT '累计使用积分',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  INDEX `idx_plan_id` (`plan_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_end_date` (`end_date`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会员表';

-- 3. 支付订单表
CREATE TABLE IF NOT EXISTS `payment_orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(64) NOT NULL UNIQUE COMMENT '订单号',
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `plan_id` BIGINT NOT NULL COMMENT '订阅计划ID',
  `payment_type` VARCHAR(20) NOT NULL COMMENT '支付方式：wechat, alipay',
  `amount` DECIMAL(10, 2) NOT NULL COMMENT '支付金额',
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态：pending, paid, failed, cancelled, refunded',
  `payment_provider` VARCHAR(50) NULL COMMENT '支付提供商',
  `transaction_id` VARCHAR(128) NULL COMMENT '第三方交易号',
  `qr_code_url` TEXT NULL COMMENT '支付二维码URL',
  `payment_url` TEXT NULL COMMENT '支付链接',
  `paid_at` DATETIME NULL COMMENT '支付时间',
  `expires_at` DATETIME NULL COMMENT '订单过期时间',
  `notify_data` TEXT NULL COMMENT '支付回调数据（JSON）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_plan_id` (`plan_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_transaction_id` (`transaction_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付订单表';

-- 4. 积分记录表
CREATE TABLE IF NOT EXISTS `point_transactions` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户ID',
  `membership_id` BIGINT NULL COMMENT '会员ID',
  `type` VARCHAR(20) NOT NULL COMMENT '类型：earn, use, expire, refund',
  `amount` INT NOT NULL COMMENT '积分数量（正数为获得，负数为使用）',
  `balance_after` INT NOT NULL COMMENT '操作后余额',
  `description` VARCHAR(500) NULL COMMENT '描述',
  `related_order_id` BIGINT NULL COMMENT '关联订单ID',
  `expires_at` DATETIME NULL COMMENT '积分过期时间',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_membership_id` (`membership_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分记录表';

