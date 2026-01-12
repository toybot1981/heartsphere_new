-- 康小健技能绑定 - 第一部分（技能1-2）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_07__bind_health_skills_part1.sql
-- 
-- 说明：本文件绑定康小健的前2个技能
-- 1. 健康数据追踪（Health Data Tracking）
-- 2. 个性化饮食建议（Personalized Nutrition Advice）

SET NAMES utf8mb4;

-- ============================================
-- 获取康小健的角色ID
-- ============================================
SET @character_id = (SELECT id FROM system_characters WHERE name = '康小健' LIMIT 1);

-- 验证角色是否存在
SELECT 
    CASE 
        WHEN @character_id IS NULL THEN '错误：未找到康小健角色，请先导入角色数据'
        ELSE CONCAT('成功：找到康小健角色，ID = ', @character_id)
    END AS status;

-- ============================================
-- 绑定技能1-2
-- ============================================

-- 技能1：健康数据追踪（Health Data Tracking）
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'health_data_tracking',
    true,
    true,
    1,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 技能2：个性化饮食建议（Personalized Nutrition Advice）
INSERT INTO character_skill_bindings (
    character_id,
    skill_id,
    is_enabled,
    auto_trigger,
    priority,
    usage_count,
    equipped_at,
    created_at,
    updated_at
) VALUES (
    @character_id,
    'personalized_nutrition_advice',
    true,
    false,
    2,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- ============================================
-- 验证绑定结果
-- ============================================
SELECT 
    '康小健技能绑定验证（Part 1）' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN ('health_data_tracking', 'personalized_nutrition_advice');

-- 显示详细的绑定信息
SELECT 
    csb.skill_id,
    sd.name AS skill_name,
    csb.is_enabled,
    csb.auto_trigger,
    csb.priority,
    csb.usage_count,
    csb.equipped_at
FROM character_skill_bindings csb
INNER JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE csb.character_id = @character_id
    AND csb.skill_id IN ('health_data_tracking', 'personalized_nutrition_advice')
ORDER BY csb.priority;
