-- 康小健技能绑定 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_10__bind_health_skills_part4.sql
-- 
-- 说明：本文件绑定康小健的第7-8个技能
-- 7. 健康风险评估（Health Risk Assessment）
-- 8. 体重管理（Weight Management）

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
-- 绑定技能7-8
-- ============================================

-- 技能7：健康风险评估（Health Risk Assessment）
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
    'health_risk_assessment',
    true,
    false,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 技能8：体重管理（Weight Management）
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
    'weight_management',
    true,
    false,
    8,
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
    '康小健技能绑定验证（Part 4）' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN ('health_risk_assessment', 'weight_management');

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
    AND csb.skill_id IN ('health_risk_assessment', 'weight_management')
ORDER BY csb.priority;

-- ============================================
-- 最终验证：所有8个技能绑定情况
-- ============================================
SELECT 
    '康小健所有技能绑定总览' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN (
        'health_data_tracking',
        'personalized_nutrition_advice',
        'exercise_plan_creation',
        'sleep_quality_improvement',
        'stress_management',
        'health_habit_formation',
        'health_risk_assessment',
        'weight_management'
    );

-- 显示所有技能绑定详情
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
    AND csb.skill_id IN (
        'health_data_tracking',
        'personalized_nutrition_advice',
        'exercise_plan_creation',
        'sleep_quality_improvement',
        'stress_management',
        'health_habit_formation',
        'health_risk_assessment',
        'weight_management'
    )
ORDER BY csb.priority;
