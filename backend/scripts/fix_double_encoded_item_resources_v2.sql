-- 修复双重编码的物品资源（id 1640-1647）
-- 这些数据的HEX编码是双重编码的，需要从 system_era_items 表中获取正确的中文名称
SET NAMES utf8mb4;
USE heartsphere;

-- 1. 直接根据已知的对应关系更新
-- 学生证
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '学生证'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1640 AND sr.category = 'item';

-- 课本
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '课本'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1641 AND sr.category = 'item';

-- 笔记本
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '笔记本'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1642 AND sr.category = 'item';

-- 校园卡
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '校园卡'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1643 AND sr.category = 'item';

-- 社团徽章
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '社团徽章'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1644 AND sr.category = 'item';

-- 奖学金证书
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '奖学金证书'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1645 AND sr.category = 'item';

-- 实验报告
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '实验报告'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1646 AND sr.category = 'item';

-- 毕业设计
UPDATE system_resources sr
INNER JOIN system_era_items sei ON sei.name = '毕业设计'
SET 
    sr.name = sei.name,
    sr.description = COALESCE(NULLIF(sei.description, ''), sr.description)
WHERE sr.id = 1647 AND sr.category = 'item';

-- 2. 显示更新结果
SELECT 
    '更新结果' as info,
    sr.id,
    sr.name,
    LEFT(sr.description, 50) as description_preview,
    HEX(sr.name) as name_hex,
    CASE 
        WHEN HEX(sr.name) LIKE 'C3A5%' OR HEX(sr.name) LIKE 'C3A8%' OR HEX(sr.name) LIKE 'C3A6%' OR HEX(sr.name) LIKE 'C3A7%' THEN '双重编码'
        WHEN HEX(sr.name) LIKE 'E5%' OR HEX(sr.name) LIKE 'E8%' OR HEX(sr.name) LIKE 'E6%' OR HEX(sr.name) LIKE 'E7%' THEN '正确编码'
        ELSE '其他'
    END as encoding_status
FROM system_resources sr
WHERE sr.category = 'item'
  AND sr.id BETWEEN 1640 AND 1647
ORDER BY sr.id;
