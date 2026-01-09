-- 清理资源管理中的完全重复记录
-- 保留最早的记录（ID最小的），删除其他完全重复的记录
SET NAMES utf8mb4;
USE heartsphere;

-- 1. 检查要删除的重复记录（显示将要删除的记录）
SELECT 
    '=== 将要删除的重复记录 ===' as info;

SELECT 
    sr1.id as 待删除ID,
    sr1.category as 类别,
    sr1.name as 名称,
    sr1.description as 描述,
    sr1.url as URL,
    sr1.created_at as 创建时间,
    sr2.id as 保留ID,
    sr2.created_at as 保留记录创建时间
FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.description = sr2.description
  AND sr1.id > sr2.id  -- 保留ID较小的记录
ORDER BY sr1.category, sr1.name, sr1.id;

-- 2. 统计要删除的记录数量
SELECT 
    '=== 统计信息 ===' as info;

SELECT 
    COUNT(*) as 待删除记录数
FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.description = sr2.description
  AND sr1.id > sr2.id;

-- 3. 执行删除（保留ID最小的记录）
DELETE sr1 FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.description = sr2.description
  AND sr1.id > sr2.id;

-- 4. 显示删除结果
SELECT 
    '=== 删除结果 ===' as info;

SELECT 
    ROW_COUNT() as 已删除记录数;

-- 5. 验证清理结果
SELECT 
    '=== 验证清理结果 ===' as info;

SELECT 
    category as 类别,
    COUNT(*) as 总记录数,
    COUNT(DISTINCT name) as 唯一名称数,
    COUNT(*) - COUNT(DISTINCT name) as 剩余重复数
FROM system_resources
GROUP BY category
ORDER BY category;
