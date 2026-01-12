-- 会员体系优化 - 数据库模型扩展
-- 执行时间：2026-01-06
-- 说明：扩展订阅计划和会员表，添加配额管理相关字段，创建配额使用记录表和超量付费记录表

-- ============================================
-- 1. 扩展 subscription_plans 表
-- ============================================

-- 存储配额（如果字段不存在，手动执行前需要检查）
ALTER TABLE `subscription_plans` 
  ADD COLUMN `storage_quota_mb` INT DEFAULT 1024 COMMENT '存储配额（MB）';

-- 超量付费价格
ALTER TABLE `subscription_plans` 
  ADD COLUMN `overage_token_price` DECIMAL(10,4) DEFAULT 0.02 COMMENT '超量Token价格（元/1K tokens）',
  ADD COLUMN `overage_image_price` DECIMAL(10,2) DEFAULT 2.00 COMMENT '超量图片价格（元/张）',
  ADD COLUMN `overage_video_price` DECIMAL(10,2) DEFAULT 0.50 COMMENT '超量视频价格（元/秒）';

-- 营销字段
ALTER TABLE `subscription_plans` 
  ADD COLUMN `recommended` BOOLEAN DEFAULT FALSE COMMENT '是否推荐',
  ADD COLUMN `badge_text` VARCHAR(50) COMMENT '徽章文字（如：最划算、热门）';

-- 团队协作功能权限
ALTER TABLE `subscription_plans` 
  ADD COLUMN `allow_team_collaboration` BOOLEAN DEFAULT FALSE COMMENT '允许团队协作';

-- ============================================
-- 2. 扩展 memberships 表
-- ============================================

-- 配额使用记录
ALTER TABLE `memberships` 
  ADD COLUMN `text_token_used` BIGINT DEFAULT 0 COMMENT '已使用文本Token',
  ADD COLUMN `image_generation_used` INT DEFAULT 0 COMMENT '已使用图片生成次数',
  ADD COLUMN `video_generation_used` INT DEFAULT 0 COMMENT '已使用视频生成时长（秒）',
  ADD COLUMN `api_calls_used_today` INT DEFAULT 0 COMMENT '今日API调用次数',
  ADD COLUMN `api_calls_reset_date` DATE COMMENT 'API调用重置日期';

-- 配额重置日期
ALTER TABLE `memberships` 
  ADD COLUMN `quota_reset_date` DATE COMMENT '配额重置日期',
  ADD COLUMN `last_quota_reset_date` DATE COMMENT '上次配额重置日期';

-- 升级信息
ALTER TABLE `memberships` 
  ADD COLUMN `upgrade_discount` DECIMAL(5,2) DEFAULT 0 COMMENT '升级折扣（百分比）',
  ADD COLUMN `upgrade_from_plan_id` BIGINT COMMENT '升级前计划ID';

-- 添加索引（如果索引已存在，Flyway会跳过）
ALTER TABLE `memberships` 
  ADD INDEX `idx_quota_reset_date` (`quota_reset_date`);

ALTER TABLE `memberships` 
  ADD INDEX `idx_upgrade_from_plan` (`upgrade_from_plan_id`);

-- ============================================
-- 3. 创建配额使用记录表
-- ============================================

CREATE TABLE IF NOT EXISTS `quota_usage_records` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `membership_id` BIGINT NOT NULL COMMENT '会员ID',
    `quota_type` VARCHAR(50) NOT NULL COMMENT '配额类型：text_token/image/video/api_call',
    `amount_used` BIGINT NOT NULL COMMENT '使用量',
    `quota_before` BIGINT NOT NULL COMMENT '使用前配额',
    `quota_after` BIGINT NOT NULL COMMENT '使用后配额',
    `related_record_id` BIGINT COMMENT '关联记录ID（如对话ID、图片ID等）',
    `related_record_type` VARCHAR(50) COMMENT '关联记录类型：conversation/image_generation/video_generation/api_call',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_quota_type` (`user_id`, `quota_type`, `created_at`),
    INDEX `idx_membership_date` (`membership_id`, `created_at`),
    INDEX `idx_related_record` (`related_record_id`, `related_record_type`),
    INDEX `idx_quota_type_date` (`quota_type`, `created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='配额使用记录表';

-- ============================================
-- 4. 创建超量付费记录表
-- ============================================

CREATE TABLE IF NOT EXISTS `overage_charges` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL COMMENT '用户ID',
    `membership_id` BIGINT NOT NULL COMMENT '会员ID',
    `quota_type` VARCHAR(50) NOT NULL COMMENT '配额类型：text_token/image/video',
    `amount_used` BIGINT NOT NULL COMMENT '超量使用量',
    `unit_price` DECIMAL(10,4) NOT NULL COMMENT '单价',
    `total_amount` DECIMAL(10,2) NOT NULL COMMENT '总金额',
    `order_id` BIGINT COMMENT '支付订单ID',
    `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态：pending/paid/failed/cancelled',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `paid_at` DATETIME COMMENT '支付时间',
    PRIMARY KEY (`id`),
    INDEX `idx_user_status` (`user_id`, `status`),
    INDEX `idx_order` (`order_id`),
    INDEX `idx_membership` (`membership_id`, `created_at`),
    INDEX `idx_status_created` (`status`, `created_at`),
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`membership_id`) REFERENCES `memberships` (`id`) ON DELETE CASCADE,
    FOREIGN KEY (`order_id`) REFERENCES `payment_orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='超量付费记录表';

-- 注意：如果字段已存在，ALTER TABLE会报错，需要手动处理或使用存储过程检查
-- 对于生产环境，建议先检查字段是否存在再执行

-- ============================================
-- 5. 初始化数据（可选）
-- ============================================

-- 为现有会员设置配额重置日期（设置为下个月1日）
UPDATE `memberships` 
SET `quota_reset_date` = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 MONTH), '%Y-%m-01'),
    `last_quota_reset_date` = DATE_FORMAT(CURDATE(), '%Y-%m-01')
WHERE `quota_reset_date` IS NULL AND `status` = 'active';

-- 为现有会员设置API调用重置日期（设置为明天）
UPDATE `memberships` 
SET `api_calls_reset_date` = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
WHERE `api_calls_reset_date` IS NULL AND `status` = 'active';

-- ============================================
-- 完成
-- ============================================
