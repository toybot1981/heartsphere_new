-- 清理 system_resources 表中的重复记录
-- 对于相同 category 和 name 的记录，保留 ID 最小的（最早创建的），删除其他的

SET NAMES utf8mb4;
USE heartsphere;

-- 1. 先查看有哪些重复的记录
SELECT 
    '=== 检查重复记录 ===' as info;

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

-- 2. 查看具体要删除的记录
SELECT 
    '=== 查看要删除的记录（保留最小的ID，删除其他） ===' as info;

SELECT 
    sr1.id,
    sr1.category,
    sr1.name,
    sr1.url,
    sr1.created_at,
    '将被删除' as status
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

-- 4. 验证是否还有重复
SELECT 
    '=== 验证清理结果 ===' as info;

SELECT 
    category,
    name,
    COUNT(*) as duplicate_count
FROM system_resources
GROUP BY category, name
HAVING COUNT(*) > 1;

-- 如果上面的查询返回空结果，说明清理成功
