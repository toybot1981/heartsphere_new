-- 添加唯一性约束：UNIQUE(category, name)
SET NAMES utf8mb4;
USE heartsphere;

-- 1. 先检查是否还有重复的名称（必须没有重复才能添加唯一性约束）
SELECT 
    '=== 检查是否还有重复的名称 ===' as info;

SELECT 
    category,
    name,
    COUNT(*) as duplicate_count
FROM system_resources
GROUP BY category, name
HAVING COUNT(*) > 1
LIMIT 20;

-- 2. 如果还有重复，需要先清理名称重复但描述不同的记录
-- 对于名称相同但描述不同的记录，保留ID最小的，删除其他的
DELETE sr1 FROM system_resources sr1
INNER JOIN system_resources sr2
WHERE sr1.category = sr2.category
  AND sr1.name = sr2.name
  AND sr1.id > sr2.id;

-- 3. 再次验证是否还有重复
SELECT 
    '=== 再次验证是否还有重复 ===' as info;

SELECT 
    category,
    name,
    COUNT(*) as duplicate_count
FROM system_resources
GROUP BY category, name
HAVING COUNT(*) > 1;

-- 4. 检查是否已存在唯一性约束
SELECT 
    '=== 检查现有约束 ===' as info;

SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME
FROM information_schema.TABLE_CONSTRAINTS
WHERE TABLE_SCHEMA = 'heartsphere'
  AND TABLE_NAME = 'system_resources'
  AND CONSTRAINT_TYPE = 'UNIQUE';

-- 5. 如果不存在唯一性约束，则添加
-- 注意：如果约束已存在，会报错，但可以忽略
ALTER TABLE system_resources
ADD UNIQUE KEY uk_category_name (category, name);

-- 6. 验证约束是否添加成功
SELECT 
    '=== 约束添加结果 ===' as info;

SELECT 
    CONSTRAINT_NAME,
    CONSTRAINT_TYPE,
    TABLE_NAME,
    COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'heartsphere'
  AND TABLE_NAME = 'system_resources'
  AND CONSTRAINT_NAME = 'uk_category_name';
