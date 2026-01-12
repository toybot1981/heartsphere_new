-- 检查时小光（角色ID: 358）的技能配置

-- 1. 检查角色技能绑定
SELECT 
    '角色技能绑定检查' AS title,
    csb.id,
    csb.character_id,
    csb.skill_id,
    csb.is_enabled,
    csb.auto_trigger,
    csb.priority,
    csb.equipped_at
FROM character_skill_bindings csb
WHERE csb.character_id = 358;

-- 2. 检查技能定义和function_schema
SELECT 
    '技能定义检查' AS title,
    sd.skill_id,
    sd.name AS skill_name,
    sd.description,
    sd.function_schema IS NOT NULL AND sd.function_schema != '' AS has_function_schema,
    LENGTH(sd.function_schema) AS function_schema_length,
    sd.execution_type
FROM skill_definitions sd
WHERE sd.skill_id IN (
    SELECT skill_id FROM character_skill_bindings WHERE character_id = 358
);

-- 3. 完整关联查询
SELECT 
    '完整技能配置' AS title,
    csb.character_id,
    csb.skill_id,
    sd.name AS skill_name,
    sd.description,
    csb.is_enabled AS binding_enabled,
    sd.function_schema IS NOT NULL AND sd.function_schema != '' AS has_function_schema,
    CASE 
        WHEN sd.function_schema IS NOT NULL AND sd.function_schema != '' THEN 'Function Calling'
        ELSE '提示词驱动'
    END AS skill_type,
    csb.priority,
    csb.auto_trigger
FROM character_skill_bindings csb
LEFT JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE csb.character_id = 358
ORDER BY csb.priority DESC, csb.equipped_at DESC;

-- 4. 统计信息
SELECT 
    '技能配置统计' AS title,
    COUNT(*) AS total_bindings,
    SUM(CASE WHEN csb.is_enabled = TRUE THEN 1 ELSE 0 END) AS enabled_bindings,
    SUM(CASE WHEN sd.function_schema IS NOT NULL AND sd.function_schema != '' THEN 1 ELSE 0 END) AS function_calling_skills,
    SUM(CASE WHEN sd.function_schema IS NULL OR sd.function_schema = '' THEN 1 ELSE 0 END) AS prompt_driven_skills
FROM character_skill_bindings csb
LEFT JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE csb.character_id = 358;

-- 5. 查找时小光应该有的技能（时间管理相关）
SELECT 
    '时小光可用技能（时间管理类）' AS title,
    sd.skill_id,
    sd.name,
    sd.description,
    sd.function_schema IS NOT NULL AND sd.function_schema != '' AS has_function_schema
FROM skill_definitions sd
WHERE sd.name LIKE '%时间%' 
   OR sd.name LIKE '%管理%'
   OR sd.description LIKE '%时间%'
   OR sd.category = 'life'
ORDER BY sd.name;
