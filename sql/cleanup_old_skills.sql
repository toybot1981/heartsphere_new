-- ============================================
-- 清理旧格式技能脚本
-- 用途：删除所有不符合新规范（Claude Skills）的旧技能
-- 执行前请务必备份数据！
-- ============================================

-- 步骤1：创建备份表
CREATE TABLE IF NOT EXISTS skill_definitions_backup AS 
SELECT * FROM skill_definitions;

CREATE TABLE IF NOT EXISTS character_skill_bindings_backup AS 
SELECT * FROM character_skill_bindings;

-- 步骤2：识别需要删除的旧技能
-- 条件：
-- 1. 使用 function_schema 的技能（旧格式）
-- 2. 缺少 skill_content 的技能（新规范要求）
-- 3. 缺少 mcp_tool_config 但需要工具调用的技能

-- 查看将要删除的技能（先执行此查询确认）
SELECT 
    id,
    skill_id,
    name,
    CASE 
        WHEN function_schema IS NOT NULL AND function_schema != '' THEN '使用 function_schema'
        WHEN skill_content IS NULL OR skill_content = '' THEN '缺少 skill_content'
        WHEN (mcp_tool_config IS NULL OR mcp_tool_config = '') 
             AND execution_type IN ('API', 'SCRIPT', 'GRAPH') THEN '缺少 mcp_tool_config'
        ELSE '其他原因'
    END AS delete_reason,
    function_schema IS NOT NULL AND function_schema != '' AS has_function_schema,
    (skill_content IS NULL OR skill_content = '') AS missing_skill_content,
    (mcp_tool_config IS NULL OR mcp_tool_config = '') AS missing_mcp_tool_config
FROM skill_definitions
WHERE 
    -- 条件1：使用 function_schema（旧格式）
    (function_schema IS NOT NULL AND function_schema != '')
    OR
    -- 条件2：缺少 skill_content（新规范要求）
    (skill_content IS NULL OR skill_content = '')
    OR
    -- 条件3：缺少 mcp_tool_config 但需要工具调用
    ((mcp_tool_config IS NULL OR mcp_tool_config = '') 
     AND execution_type IN ('API', 'SCRIPT', 'GRAPH'));

-- 步骤3：清理角色技能绑定（如果绑定到将要删除的技能）
-- 先查看将要清理的绑定
SELECT 
    csb.id,
    csb.character_id,
    csb.skill_id,
    sd.name AS skill_name,
    CASE 
        WHEN sd.function_schema IS NOT NULL AND sd.function_schema != '' THEN '使用 function_schema'
        WHEN sd.skill_content IS NULL OR sd.skill_content = '' THEN '缺少 skill_content'
        ELSE '其他原因'
    END AS skill_delete_reason
FROM character_skill_bindings csb
INNER JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE 
    (sd.function_schema IS NOT NULL AND sd.function_schema != '')
    OR
    (sd.skill_content IS NULL OR sd.skill_content = '')
    OR
    ((sd.mcp_tool_config IS NULL OR sd.mcp_tool_config = '') 
     AND sd.execution_type IN ('API', 'SCRIPT', 'GRAPH'));

-- 步骤4：删除角色技能绑定（绑定到旧技能的）
DELETE csb FROM character_skill_bindings csb
INNER JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE 
    (sd.function_schema IS NOT NULL AND sd.function_schema != '')
    OR
    (sd.skill_content IS NULL OR sd.skill_content = '')
    OR
    ((sd.mcp_tool_config IS NULL OR sd.mcp_tool_config = '') 
     AND sd.execution_type IN ('API', 'SCRIPT', 'GRAPH'));

-- 步骤5：删除旧格式技能
DELETE FROM skill_definitions
WHERE 
    -- 条件1：使用 function_schema（旧格式）
    (function_schema IS NOT NULL AND function_schema != '')
    OR
    -- 条件2：缺少 skill_content（新规范要求）
    (skill_content IS NULL OR skill_content = '')
    OR
    -- 条件3：缺少 mcp_tool_config 但需要工具调用
    ((mcp_tool_config IS NULL OR mcp_tool_config = '') 
     AND execution_type IN ('API', 'SCRIPT', 'GRAPH'));

-- 步骤6：验证删除操作
-- 检查是否还有旧格式技能
SELECT COUNT(*) AS remaining_old_skills
FROM skill_definitions
WHERE 
    (function_schema IS NOT NULL AND function_schema != '')
    OR
    (skill_content IS NULL OR skill_content = '')
    OR
    ((mcp_tool_config IS NULL OR mcp_tool_config = '') 
     AND execution_type IN ('API', 'SCRIPT', 'GRAPH'));

-- 步骤7：验证剩余技能都符合新规范
SELECT 
    COUNT(*) AS total_skills,
    SUM(CASE WHEN skill_content IS NOT NULL AND skill_content != '' THEN 1 ELSE 0 END) AS has_skill_content,
    SUM(CASE WHEN mcp_tool_config IS NOT NULL AND mcp_tool_config != '' THEN 1 ELSE 0 END) AS has_mcp_tool_config,
    SUM(CASE WHEN function_schema IS NOT NULL AND function_schema != '' THEN 1 ELSE 0 END) AS still_has_function_schema
FROM skill_definitions;

-- 步骤8：生成清理报告
SELECT 
    '清理完成' AS status,
    (SELECT COUNT(*) FROM skill_definitions_backup) AS total_backed_up,
    (SELECT COUNT(*) FROM skill_definitions) AS remaining_skills,
    (SELECT COUNT(*) FROM skill_definitions_backup) - (SELECT COUNT(*) FROM skill_definitions) AS deleted_count,
    NOW() AS cleanup_time;
