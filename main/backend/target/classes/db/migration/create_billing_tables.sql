-- 大模型API计费系统数据库表结构
-- 创建日期: 2025-12-22

-- 1. 模型提供商表
CREATE TABLE IF NOT EXISTS ai_providers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '提供商名称：dashscope, openai, gemini, doubao',
  display_name VARCHAR(200) NOT NULL COMMENT '显示名称：阿里云通义千问',
  enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型提供商表';

-- 2. 模型表
CREATE TABLE IF NOT EXISTS ai_models (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_code VARCHAR(100) NOT NULL COMMENT '模型代码：qwen-max, gpt-4',
  model_name VARCHAR(200) NOT NULL COMMENT '模型名称：通义千问-Max',
  model_type VARCHAR(50) NOT NULL COMMENT '模型类型：text, image, audio, video',
  enabled BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
  UNIQUE KEY uk_provider_model (provider_id, model_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI模型表';

-- 3. 模型资费配置表
CREATE TABLE IF NOT EXISTS ai_model_pricing (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  model_id BIGINT NOT NULL COMMENT '模型ID',
  pricing_type VARCHAR(50) NOT NULL COMMENT '计费类型：input_token, output_token, image, audio_minute, video_second',
  unit_price DECIMAL(12, 6) NOT NULL COMMENT '单价',
  unit VARCHAR(50) NOT NULL COMMENT '单位：per_1k_tokens, per_image, per_minute, per_second',
  min_charge_unit DECIMAL(12, 6) DEFAULT 0 COMMENT '最低计费单位',
  effective_date DATETIME NOT NULL COMMENT '生效日期',
  expiry_date DATETIME NULL COMMENT '失效日期（NULL表示永久有效）',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否生效',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (model_id) REFERENCES ai_model_config(id),
  INDEX idx_model_effective (model_id, effective_date, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='模型资费配置表';

-- 4. 扩展订阅计划表，添加Token配额字段
ALTER TABLE subscription_plans 
  ADD COLUMN IF NOT EXISTS text_token_quota BIGINT DEFAULT 0 COMMENT '文本Token配额（每月）',
  ADD COLUMN IF NOT EXISTS image_generation_quota INT DEFAULT 0 COMMENT '图片生成配额（每月）',
  ADD COLUMN IF NOT EXISTS audio_processing_quota INT DEFAULT 0 COMMENT '语音处理配额（每月，分钟）',
  ADD COLUMN IF NOT EXISTS video_generation_quota INT DEFAULT 0 COMMENT '视频生成配额（每月，秒）',
  ADD COLUMN IF NOT EXISTS permanent_token_quota BIGINT DEFAULT 0 COMMENT '永久Token配额';

-- 5. 用户Token配额表
CREATE TABLE IF NOT EXISTS user_token_quota (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  text_token_total BIGINT DEFAULT 0 COMMENT '文本Token总配额',
  text_token_used BIGINT DEFAULT 0 COMMENT '文本Token已使用',
  text_token_monthly_quota BIGINT DEFAULT 0 COMMENT '月度文本Token配额',
  text_token_monthly_used BIGINT DEFAULT 0 COMMENT '月度文本Token已使用',
  image_quota_total INT DEFAULT 0 COMMENT '图片生成总配额',
  image_quota_used INT DEFAULT 0 COMMENT '图片生成已使用',
  image_quota_monthly INT DEFAULT 0 COMMENT '月度图片配额',
  image_quota_monthly_used INT DEFAULT 0 COMMENT '月度图片已使用',
  audio_quota_total INT DEFAULT 0 COMMENT '语音处理总配额（分钟）',
  audio_quota_used INT DEFAULT 0 COMMENT '语音处理已使用（分钟）',
  audio_quota_monthly INT DEFAULT 0 COMMENT '月度语音配额（分钟）',
  audio_quota_monthly_used INT DEFAULT 0 COMMENT '月度语音已使用（分钟）',
  video_quota_total INT DEFAULT 0 COMMENT '视频生成总配额（秒）',
  video_quota_used INT DEFAULT 0 COMMENT '视频生成已使用（秒）',
  video_quota_monthly INT DEFAULT 0 COMMENT '月度视频配额（秒）',
  video_quota_monthly_used INT DEFAULT 0 COMMENT '月度视频已使用（秒）',
  last_reset_date DATE COMMENT '上次重置日期',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uk_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户Token配额表';

-- 6. Token配额变动记录表
CREATE TABLE IF NOT EXISTS token_quota_transaction (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  transaction_type VARCHAR(50) NOT NULL COMMENT '变动类型：grant（授予）, consume（消费）, purchase（购买）, refund（退款）',
  quota_type VARCHAR(50) NOT NULL COMMENT '配额类型：text_token, image, audio, video',
  amount BIGINT NOT NULL COMMENT '变动数量',
  balance_after BIGINT NOT NULL COMMENT '变动后余额',
  source VARCHAR(100) COMMENT '来源：membership, purchase, admin_grant, usage',
  reference_id BIGINT COMMENT '关联ID（订单ID、会员ID等）',
  description VARCHAR(500) COMMENT '描述',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user_type (user_id, transaction_type, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Token配额变动记录表';

-- 7. AI使用记录表
CREATE TABLE IF NOT EXISTS ai_usage_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '用户ID',
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_id BIGINT NOT NULL COMMENT '模型ID',
  usage_type VARCHAR(50) NOT NULL COMMENT '使用类型：text_generation, image_generation, audio_tts, audio_stt, video_generation',
  input_tokens INT DEFAULT 0 COMMENT '输入Token数',
  output_tokens INT DEFAULT 0 COMMENT '输出Token数',
  total_tokens INT DEFAULT 0 COMMENT '总Token数',
  image_count INT DEFAULT 0 COMMENT '图片数量',
  audio_duration INT DEFAULT 0 COMMENT '音频时长（秒）',
  video_duration INT DEFAULT 0 COMMENT '视频时长（秒）',
  cost_amount DECIMAL(12, 6) NOT NULL COMMENT '费用（元）',
  token_consumed BIGINT NOT NULL COMMENT '消耗的Token配额',
  status VARCHAR(20) DEFAULT 'success' COMMENT '状态：success, failed, timeout',
  request_id VARCHAR(100) COMMENT '请求ID（用于追踪）',
  error_message TEXT COMMENT '错误信息',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (provider_id) REFERENCES ai_providers(id),
  FOREIGN KEY (model_id) REFERENCES ai_model_config(id),
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_provider_created (provider_id, created_at),
  INDEX idx_model_created (model_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI使用记录表';

-- 8. 成本统计表（每日汇总）
CREATE TABLE IF NOT EXISTS ai_cost_daily (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  stat_date DATE NOT NULL COMMENT '统计日期',
  provider_id BIGINT NOT NULL COMMENT '提供商ID',
  model_id BIGINT NOT NULL COMMENT '模型ID',
  usage_type VARCHAR(50) NOT NULL COMMENT '使用类型',
  total_usage BIGINT NOT NULL COMMENT '总使用量',
  total_cost DECIMAL(12, 6) NOT NULL COMMENT '总成本',
  call_count INT NOT NULL COMMENT '调用次数',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_date_provider_model_type (stat_date, provider_id, model_id, usage_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成本统计表（每日汇总）';

-- 9. Token包配置表
CREATE TABLE IF NOT EXISTS token_packages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL COMMENT '包名称：100万Token包',
  quota_type VARCHAR(50) NOT NULL COMMENT '配额类型：text_token, image, audio, video',
  amount BIGINT NOT NULL COMMENT 'Token数量',
  price DECIMAL(10, 2) NOT NULL COMMENT '价格',
  original_price DECIMAL(10, 2) COMMENT '原价（用于显示折扣）',
  bonus_amount BIGINT DEFAULT 0 COMMENT '赠送数量',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Token包配置表';

