-- 性能优化：添加数据库索引
-- 创建日期: 2025-12-26
-- 目的: 解决N+1查询问题和提高查询性能

-- 1. JournalEntry表索引优化
-- 添加用户ID查询索引（针对getAllJournalEntries）
CREATE INDEX IF NOT EXISTS idx_journal_user_id
ON journal_entries(user_id);

-- 添加用户+日期复合索引（用于时间范围查询）
CREATE INDEX IF NOT EXISTS idx_journal_user_date
ON journal_entries(user_id, entry_date DESC);

-- 添加搜索优化索引（支持全文搜索）
CREATE INDEX IF NOT EXISTS idx_journal_user_title
ON journal_entries(user_id, title(200));

CREATE INDEX IF NOT EXISTS idx_journal_user_content
ON journal_entries(user_id, content(500));

-- 添加标签索引
CREATE INDEX IF NOT EXISTS idx_journal_user_tags
ON journal_entries(user_id, tags(100));

-- 添加关联查询索引（优化JOIN查询）
CREATE INDEX IF NOT EXISTS idx_journal_world_id
ON journal_entries(world_id);

CREATE INDEX IF NOT EXISTS idx_journal_era_id
ON journal_entries(era_id);

CREATE INDEX IF NOT EXISTS idx_journal_character_id
ON journal_entries(character_id);

-- 2. User表索引优化
-- 添加用户名索引（用于登录查询）
CREATE INDEX IF NOT EXISTS idx_user_username
ON users(username);

-- 添加微信OpenID索引（用于微信登录）
CREATE INDEX IF NOT EXISTS idx_user_wechat_openid
ON users(wechat_openid);

-- 添加微信UnionID索引
CREATE INDEX IF NOT EXISTS idx_user_wechat_unionid
ON users(wechat_unionid);

-- 3. Character表索引优化
-- 添加用户+时代复合索引
CREATE INDEX IF NOT EXISTS idx_character_user_era
ON characters(user_id, era_id);

-- 添加系统角色ID索引
CREATE INDEX IF NOT EXISTS idx_character_system_id
ON characters(system_character_id);

-- 4. World表索引优化
CREATE INDEX IF NOT EXISTS idx_world_user_id
ON worlds(user_id);

-- 添加系统世界ID索引
CREATE INDEX IF NOT EXISTS idx_world_system_id
ON worlds(system_world_id);

-- 5. Era表索引优化
CREATE INDEX IF NOT EXISTS idx_era_user_id
ON eras(user_id);

-- 添加系统时代ID索引
CREATE INDEX IF NOT EXISTS idx_era_system_id
ON eras(system_era_id);

-- 6. Script表索引优化
CREATE INDEX IF NOT EXISTS idx_script_world_era
ON scripts(world_id, era_id);

-- 添加剧本标签索引
CREATE INDEX IF NOT EXISTS idx_script_tags
ON scripts(tags(100));

-- 7. AIModelConfig表索引优化
-- 添加provider+capability复合索引（用于模型选择）
CREATE INDEX IF NOT EXISTS idx_ai_model_config_provider_capability
ON ai_model_config(provider, capability);

-- 添加默认模型索引
CREATE INDEX IF NOT EXISTS idx_ai_model_config_default
ON ai_model_config(is_default, capability, is_active);

-- 添加优先级索引（用于容错模式排序）
CREATE INDEX IF NOT EXISTS idx_ai_model_config_priority
ON ai_model_config(capability, priority DESC, is_active);

-- 8. AIUsageRecord表索引优化
-- 添加用户+创建时间复合索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_created
ON ai_usage_records(user_id, created_at DESC);

-- 添加模型+创建时间复合索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_model_created
ON ai_usage_records(model_id, created_at DESC);

-- 添加状态索引
CREATE INDEX IF NOT EXISTS idx_ai_usage_status
ON ai_usage_records(status, created_at);

-- 9. AIModelPricing表索引优化
-- 添加模型+生效日期索引
CREATE INDEX IF NOT EXISTS idx_ai_pricing_model_date
ON ai_model_pricing(model_id, effective_date DESC);

-- 添加激活状态索引
CREATE INDEX IF NOT EXISTS idx_ai_pricing_active
ON ai_model_pricing(model_id, is_active, effective_date);

-- 10. UserTokenQuota表索引优化
-- 添加用户ID主键索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_user_token_quota_user_id
ON user_token_quota(user_id);

-- 11. TokenQuotaTransaction表索引优化
CREATE INDEX IF NOT EXISTS idx_token_quota_user_type
ON token_quota_transaction(user_id, transaction_type, created_at DESC);

-- 12. Membership表索引优化
CREATE INDEX IF NOT EXISTS idx_membership_user_id
ON memberships(user_id);

-- 添加订阅状态索引
CREATE INDEX IF NOT EXISTS idx_membership_status
ON memberships(status, end_date);

-- 13. InviteCode表索引优化
-- 添加代码索引
CREATE INDEX IF NOT EXISTS idx_invite_code_code
ON invite_codes(code);

-- 添加使用状态索引
CREATE INDEX IF NOT EXISTS idx_invite_code_used
ON invite_codes(is_used, created_at);

-- 14. MainStory表索引优化
CREATE INDEX IF NOT EXISTS idx_main_story_user_era
ON user_main_stories(user_id, era_id);

CREATE INDEX IF NOT EXISTS idx_system_main_story_era
ON system_main_stories(era_id);

-- 15. ChronosLetter表索引优化
CREATE INDEX IF NOT EXISTS idx_chronos_letter_user_created
ON chronos_letters(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chronos_letter_read
ON chronos_letters(user_id, is_read);

-- 16. Mail表索引优化
CREATE INDEX IF NOT EXISTS idx_mail_user_created
ON mails(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mail_read
ON mails(user_id, is_read);

-- 执行分析表以更新查询优化器统计信息
ANALYZE TABLE journal_entries;
ANALYZE TABLE users;
ANALYZE TABLE characters;
ANALYZE TABLE worlds;
ANALYZE TABLE eras;
ANALYZE TABLE scripts;
ANALYZE TABLE ai_model_config;
ANALYZE TABLE ai_usage_records;
ANALYZE TABLE ai_model_pricing;
ANALYZE TABLE user_token_quota;
ANALYZE TABLE token_quota_transaction;
ANALYZE TABLE memberships;
ANALYZE TABLE invite_codes;
ANALYZE TABLE user_main_stories;
ANALYZE TABLE system_main_stories;
ANALYZE TABLE chronos_letters;
ANALYZE TABLE mails;
