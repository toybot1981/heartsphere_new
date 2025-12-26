-- 清理 user_token_quota 表中的重复数据
-- 保留每个 user_id 的第一条记录（ID最小的），删除其他重复记录

-- 1. 查找重复的 user_id
-- SELECT user_id, COUNT(*) as count 
-- FROM user_token_quota 
-- GROUP BY user_id 
-- HAVING COUNT(*) > 1;

-- 2. 删除重复记录，只保留每个 user_id 的 ID 最小的记录
DELETE t1 FROM user_token_quota t1
INNER JOIN user_token_quota t2 
WHERE t1.user_id = t2.user_id 
  AND t1.id > t2.id;

-- 3. 验证清理结果（应该返回空结果）
-- SELECT user_id, COUNT(*) as count 
-- FROM user_token_quota 
-- GROUP BY user_id 
-- HAVING COUNT(*) > 1;


