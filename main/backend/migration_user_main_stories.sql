-- 用户主线剧情表数据迁移脚本
-- 将现有的 role = '主线剧情' 的角色数据迁移到 user_main_stories 表
-- 执行前请先备份数据库！

-- 1. 检查需要迁移的数据
SELECT 
    COUNT(*) as total_count,
    COUNT(DISTINCT user_id) as user_count,
    COUNT(DISTINCT era_id) as era_count
FROM characters
WHERE role = '主线剧情' AND is_deleted = false;

-- 2. 查看需要迁移的详细数据（可选，用于验证）
-- SELECT 
--     id, user_id, era_id, name, description, role, bio,
--     avatar_url, background_url, theme_color, color_accent,
--     first_message, system_instruction, voice_name, mbti,
--     tags, speech_style, catchphrases, secrets, motivations, relationships,
--     created_at, updated_at
-- FROM characters
-- WHERE role = '主线剧情' AND is_deleted = false
-- ORDER BY user_id, era_id;

-- 3. 执行迁移：将主线剧情角色数据迁移到 user_main_stories 表
-- 注意：如果某个场景已经有多个主线剧情角色，只保留第一个（按ID排序）
INSERT INTO user_main_stories (
    user_id, era_id, name, description, role, bio, 
    avatar_url, background_url, theme_color, color_accent,
    first_message, system_instruction, voice_name, mbti,
    tags, speech_style, catchphrases, secrets, motivations, relationships,
    is_deleted, created_at, updated_at
)
SELECT 
    c.user_id,
    c.era_id,
    c.name,
    c.description,
    '叙事者' as role,  -- 统一设置为"叙事者"
    c.bio,
    c.avatar_url,
    c.background_url,
    c.theme_color,
    c.color_accent,
    c.first_message,
    c.system_instruction,
    c.voice_name,
    c.mbti,
    c.tags,
    c.speech_style,
    c.catchphrases,
    c.secrets,
    c.motivations,
    c.relationships,
    c.is_deleted,
    c.created_at,
    c.updated_at
FROM (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY user_id, era_id ORDER BY id) as rn
    FROM characters
    WHERE role = '主线剧情' AND is_deleted = false
) c
WHERE c.rn = 1  -- 只保留每个场景的第一个主线剧情
ON DUPLICATE KEY UPDATE
    -- 如果已存在（user_id + era_id 组合），更新数据
    name = VALUES(name),
    description = VALUES(description),
    bio = VALUES(bio),
    avatar_url = VALUES(avatar_url),
    background_url = VALUES(background_url),
    theme_color = VALUES(theme_color),
    color_accent = VALUES(color_accent),
    first_message = VALUES(first_message),
    system_instruction = VALUES(system_instruction),
    voice_name = VALUES(voice_name),
    mbti = VALUES(mbti),
    tags = VALUES(tags),
    speech_style = VALUES(speech_style),
    catchphrases = VALUES(catchphrases),
    secrets = VALUES(secrets),
    motivations = VALUES(motivations),
    relationships = VALUES(relationships),
    updated_at = NOW();

-- 4. 验证迁移结果
SELECT 
    '迁移后的数据统计' as info,
    COUNT(*) as total_main_stories,
    COUNT(DISTINCT user_id) as user_count,
    COUNT(DISTINCT era_id) as era_count
FROM user_main_stories
WHERE is_deleted = false;

-- 5. 标记已迁移的角色为已删除（软删除）
UPDATE characters 
SET 
    is_deleted = true, 
    deleted_at = NOW(),
    updated_at = NOW()
WHERE role = '主线剧情' AND is_deleted = false;

-- 6. 验证清理结果
SELECT 
    '清理后的角色统计' as info,
    COUNT(*) as remaining_main_story_characters
FROM characters
WHERE role = '主线剧情' AND is_deleted = false;

-- 7. 最终验证：检查是否有遗漏的数据
SELECT 
    '数据一致性检查' as info,
    (SELECT COUNT(*) FROM user_main_stories WHERE is_deleted = false) as main_stories_count,
    (SELECT COUNT(*) FROM characters WHERE role = '主线剧情' AND is_deleted = false) as remaining_characters_count;




