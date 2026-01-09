-- 更新 Notion 数据库 ID
-- 将数据库 ID 更新到 note_syncs 表的 refresh_token 字段

-- 格式化的数据库 ID: 2cd16df3-7fc1-8056-9c73-000c52e5e100
UPDATE note_syncs 
SET refresh_token = '2cd16df3-7fc1-8056-9c73-000c52e5e100',
    updated_at = NOW()
WHERE provider = 'notion' 
  AND is_active = 1;

-- 查看更新结果
SELECT id, user_id, provider, refresh_token, is_active, updated_at 
FROM note_syncs 
WHERE provider = 'notion';
