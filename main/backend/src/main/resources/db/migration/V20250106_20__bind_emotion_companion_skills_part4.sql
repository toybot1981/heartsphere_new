-- 心小暖技能绑定 - 第四部分（技能7-8）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_20__bind_emotion_companion_skills_part4.sql
-- 
-- 说明：本文件绑定心小暖的第7-8个技能
-- 7. 危机支持（Crisis Support）
-- 8. 陪伴与鼓励（Companionship & Encouragement）

SET NAMES utf8mb4;

-- ============================================
-- 获取心小暖的角色ID
-- ============================================
SET @character_id = (SELECT id FROM system_characters WHERE name = '心小暖' LIMIT 1);

-- 验证角色是否存在
SELECT 
    CASE 
        WHEN @character_id IS NULL THEN '错误：未找到心小暖角色，请先导入角色数据'
        ELSE CONCAT('成功：找到心小暖角色，ID = ', @character_id)
    END AS status;

-- ============================================
-- 绑定技能7-8
-- ============================================

-- 技能7：危机支持（Crisis Support）
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
    'crisis_support',
    true,
    true,
    7,
    0,
    NOW(),
    NOW(),
    NOW()
) ON DUPLICATE KEY UPDATE
    is_enabled = VALUES(is_enabled),
    priority = VALUES(priority),
    updated_at = NOW();

-- 技能8：陪伴与鼓励（Companionship & Encouragement）
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
    'companionship_encouragement',
    true,
    true,
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
    '心小暖技能绑定验证（Part 4）' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN ('crisis_support', 'companionship_encouragement');

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
    AND csb.skill_id IN ('crisis_support', 'companionship_encouragement')
ORDER BY csb.priority;

-- ============================================
-- 最终验证：所有8个技能绑定情况
-- ============================================
SELECT 
    '心小暖所有技能绑定总览' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN (
        'emotion_recognition_expression',
        'emotion_regulation_techniques',
        'active_listening_empathy',
        'mindfulness_practice_guidance',
        'positive_psychology_intervention',
        'emotion_journal',
        'crisis_support',
        'companionship_encouragement'
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
        'emotion_recognition_expression',
        'emotion_regulation_techniques',
        'active_listening_empathy',
        'mindfulness_practice_guidance',
        'positive_psychology_intervention',
        'emotion_journal',
        'crisis_support',
        'companionship_encouragement'
    )
ORDER BY csb.priority;
