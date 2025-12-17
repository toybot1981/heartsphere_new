-- 删除重复的资源
-- 保留优先级：1. 有真实图片的资源（URL不是placeholder） 2. 有中国元素的资源（prompt包含Chinese） 3. 删除其他

-- 第一轮：删除没有真实图片的重复项（当存在有真实图片的版本时）
DELETE r1 FROM system_resources r1
INNER JOIN system_resources r2 
ON r1.name = r2.name AND r1.category = r2.category
WHERE 
    r1.url LIKE 'placeholder%'
    AND r2.url NOT LIKE 'placeholder%'
    AND r1.id != r2.id;

-- 第二轮：删除没有中国元素的重复项（当存在有中国元素的版本时，且都没有真实图片）
DELETE r1 FROM system_resources r1
INNER JOIN system_resources r2 
ON r1.name = r2.name AND r1.category = r2.category
WHERE 
    r1.prompt NOT LIKE '%Chinese%'
    AND r2.prompt LIKE '%Chinese%'
    AND r1.url LIKE 'placeholder%'
    AND r2.url LIKE 'placeholder%'
    AND r1.id != r2.id;

-- 第三轮：如果还有重复的，保留ID最小的，删除其他的
-- 使用临时表来避免MySQL的限制
CREATE TEMPORARY TABLE temp_duplicate_groups AS
SELECT name, category, MIN(id) as min_id
FROM system_resources
WHERE (name, category) IN (
    SELECT name, category 
    FROM system_resources 
    GROUP BY name, category 
    HAVING COUNT(*) > 1
)
GROUP BY name, category;

DELETE r1 FROM system_resources r1
INNER JOIN temp_duplicate_groups t
ON r1.name = t.name AND r1.category = t.category
WHERE r1.id > t.min_id;

DROP TEMPORARY TABLE temp_duplicate_groups;
