-- 测试脚本：验证技能系统增强迁移是否成功
-- 使用方法：在迁移脚本执行后运行此脚本进行验证

-- ============================================
-- 测试 1：检查 skill_definitions 表的新字段
-- ============================================

SELECT 
    'skill_definitions 表字段检查' AS test_name,
    CASE 
        WHEN COUNT(*) >= 9 THEN 'PASS: 所有新字段已添加'
        ELSE CONCAT('FAIL: 缺少字段，当前字段数: ', COUNT(*))
    END AS result
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'skill_definitions'
  AND COLUMN_NAME IN (
    'function_schema',
    'execution_type',
    'execution_config',
    'auto_trigger_keywords',
    'required_permissions',
    'max_usage_per_day',
    'version',
    'author',
    'is_system_skill'
  );

-- ============================================
-- 测试 2：检查 skill_executions 表
-- ============================================

SELECT 
    'skill_executions 表检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_executions'
        ) THEN 'PASS: skill_executions 表已创建'
        ELSE 'FAIL: skill_executions 表不存在'
    END AS result;

-- ============================================
-- 测试 3：检查 character_skill_bindings 表
-- ============================================

SELECT 
    'character_skill_bindings 表检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'character_skill_bindings'
        ) THEN 'PASS: character_skill_bindings 表已创建'
        ELSE 'FAIL: character_skill_bindings 表不存在'
    END AS result;

-- ============================================
-- 测试 4：检查 skill_prerequisites 表
-- ============================================

SELECT 
    'skill_prerequisites 表检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_prerequisites'
        ) THEN 'PASS: skill_prerequisites 表已创建'
        ELSE 'FAIL: skill_prerequisites 表不存在'
    END AS result;

-- ============================================
-- 测试 5：检查 skill_conflicts 表
-- ============================================

SELECT 
    'skill_conflicts 表检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_conflicts'
        ) THEN 'PASS: skill_conflicts 表已创建'
        ELSE 'FAIL: skill_conflicts 表不存在'
    END AS result;

-- ============================================
-- 测试 6：检查视图
-- ============================================

SELECT 
    '视图检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.VIEWS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'v_character_equipped_skills'
        ) AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.VIEWS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'v_skill_usage_statistics'
        ) THEN 'PASS: 所有视图已创建'
        ELSE 'FAIL: 视图缺失'
    END AS result;

-- ============================================
-- 测试 7：检查索引
-- ============================================

SELECT 
    '索引检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_definitions'
            AND INDEX_NAME = 'idx_execution_type'
        ) AND EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_definitions'
            AND INDEX_NAME = 'idx_is_system_skill'
        ) THEN 'PASS: 所有索引已创建'
        ELSE 'FAIL: 索引缺失'
    END AS result;

-- ============================================
-- 测试 8：检查外键约束
-- ============================================

SELECT 
    '外键约束检查' AS test_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'skill_executions'
            AND REFERENCED_TABLE_NAME = 'skill_definitions'
        ) THEN 'PASS: 外键约束已创建'
        ELSE 'FAIL: 外键约束缺失'
    END AS result;

-- ============================================
-- 汇总报告
-- ============================================

SELECT '=== 迁移验证完成 ===' AS summary;
