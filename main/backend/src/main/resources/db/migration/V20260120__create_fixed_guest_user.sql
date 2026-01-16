-- 创建固定的游客用户
-- 所有游客都使用这个用户，不每次创建新用户

-- 检查并创建固定的游客用户
INSERT INTO users (username, email, password, nickname, is_enabled, created_at, updated_at)
SELECT 
    '__guest__',
    'guest@heartsphere.temp',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', -- 随机密码（游客不需要密码，但User实体要求非空）
    '游客',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = '__guest__'
);

-- 为游客用户分配体验会员（如果还没有）
INSERT INTO memberships (
    user_id, 
    plan_id, 
    plan_type, 
    billing_cycle,
    status,
    start_date, 
    end_date, 
    auto_renew,
    current_points,
    total_points_earned,
    total_points_used,
    created_at, 
    updated_at
)
SELECT 
    u.id,
    sp.id AS plan_id, -- 从 subscription_plans 表获取 trial plan 的 id
    'trial',
    'monthly',
    'active', -- 状态：active
    NOW(),
    NULL, -- 体验会员没有结束时间
    FALSE, -- 不自动续费
    0, -- 当前积分
    0, -- 累计获得积分
    0, -- 累计使用积分
    NOW(),
    NOW()
FROM users u
CROSS JOIN (
    SELECT id FROM subscription_plans 
    WHERE type = 'trial' AND is_active = TRUE 
    ORDER BY sort_order ASC 
    LIMIT 1
) sp
WHERE u.username = '__guest__'
  AND NOT EXISTS (
      SELECT 1 FROM memberships m WHERE m.user_id = u.id AND m.plan_type = 'trial'
  );
