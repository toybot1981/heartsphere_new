-- 暖小阳技能绑定 - 第一部分（技能1-2）
-- 执行方法：mysql -h 127.0.0.1 -u root -p123456 heartsphere --default-character-set=utf8mb4 < V20250106_23__bind_emotional_companion_skills_part1.sql
-- 
-- 说明：本文件绑定暖小阳的前2个技能
-- 1. 日常聊天陪伴（Daily Chat Companion）
-- 2. 小确幸分享（Small Happiness Sharing）

SET NAMES utf8mb4;

-- ============================================
-- 获取暖小阳的角色ID
-- ============================================
SET @character_id = (SELECT id FROM system_characters WHERE name = '暖小阳' LIMIT 1);

-- 验证角色是否存在
SELECT 
    CASE 
        WHEN @character_id IS NULL THEN '错误：未找到暖小阳角色，请先导入角色数据'
        ELSE CONCAT('成功：找到暖小阳角色，ID = ', @character_id)
    END AS status;

-- ============================================
-- 绑定技能1-2
-- ============================================

-- 技能1：日常聊天陪伴（Daily Chat Companion）
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
    'daily_chat_companion',
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

-- 技能2：小确幸分享（Small Happiness Sharing）
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
    'small_happiness_sharing',
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
    '暖小阳技能绑定验证（Part 1）' AS title,
    COUNT(*) AS total_skills,
    SUM(CASE WHEN is_enabled = true THEN 1 ELSE 0 END) AS enabled_skills,
    SUM(CASE WHEN auto_trigger = true THEN 1 ELSE 0 END) AS auto_trigger_skills
FROM character_skill_bindings 
WHERE character_id = @character_id
    AND skill_id IN ('daily_chat_companion', 'small_happiness_sharing');

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
    AND csb.skill_id IN ('daily_chat_companion', 'small_happiness_sharing')
ORDER BY csb.priority;
