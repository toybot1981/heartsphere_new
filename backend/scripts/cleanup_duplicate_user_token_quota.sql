-- 清理 user_token_quota 表中的重复数据
-- 保留每个 user_id 的第一条记录（ID最小的），删除其他重复记录
-- 
-- 使用方法：
-- 1. 先执行查询语句查看重复数据
-- 2. 确认后执行删除语句
-- 3. 最后执行验证语句确认清理结果

-- ============================================
-- 步骤1: 查找重复的 user_id（执行前先查看）
-- ============================================
SELECT 
    user_id, 
    COUNT(*) as count,
    GROUP_CONCAT(id ORDER BY id) as quota_ids
FROM user_token_quota 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- ============================================
-- 步骤2: 删除重复记录（只保留每个 user_id 的 ID 最小的记录）
-- ============================================
-- 注意：执行前请先备份数据库！
DELETE t1 FROM user_token_quota t1
INNER JOIN user_token_quota t2 
WHERE t1.user_id = t2.user_id 
  AND t1.id > t2.id;

-- ============================================
-- 步骤3: 验证清理结果（应该返回空结果）
-- ============================================
SELECT 
    user_id, 
    COUNT(*) as count
FROM user_token_quota 
GROUP BY user_id 
HAVING COUNT(*) > 1;


