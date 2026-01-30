-- 清理 system_resources 表中的重复记录
-- 对于相同 category 和 name 的记录，保留 ID 最小的（最早创建的），删除其他的

USE heartsphere;

-- 1. 查看重复记录
SELECT 
    category,
    name,
    COUNT(*) as duplicate_count,
    GROUP_CONCAT(id ORDER BY id) as ids
FROM system_resources
GROUP BY category, name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, category, name
LIMIT 20;

-- 2. 查看要删除的记录（保留最小的ID，删除其他）
SELECT 
    sr1.id,
    sr1.category,
    sr1.name,
    sr1.url,
    sr1.created_at
FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.id > sr2.id
ORDER BY sr1.category, sr1.name, sr1.id;

-- 3. 删除重复记录（保留ID最小的，删除其他的）
-- 注意：执行前请先备份数据库！
DELETE sr1 FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.id > sr2.id;

-- 4. 验证清理结果（应该返回空结果）
SELECT 
    category,
    name,
    COUNT(*) as duplicate_count
FROM system_resources
GROUP BY category, name
HAVING COUNT(*) > 1;
