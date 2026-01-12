-- ============================================
-- 技能系统数据库迁移测试脚本
-- 用于验证迁移脚本的正确性
-- ============================================

-- 1. 检查表是否存在
SELECT '=== 检查表是否存在 ===' AS test_step;
SHOW TABLES LIKE 'skill_%';
SHOW TABLES LIKE 'character_skill%';

-- 2. 检查 skill_definitions 表结构
SELECT '=== 检查 skill_definitions 表结构 ===' AS test_step;
DESCRIBE skill_definitions;

-- 3. 检查新创建的表结构
SELECT '=== 检查新创建的表结构 ===' AS test_step;
DESCRIBE skill_executions;
DESCRIBE character_skill_bindings;
DESCRIBE skill_prerequisites;
DESCRIBE skill_conflicts;

-- 4. 检查索引
SELECT '=== 检查索引 ===' AS test_step;
SHOW INDEX FROM skill_definitions;
SHOW INDEX FROM character_skill_bindings;
SHOW INDEX FROM skill_executions;

-- 5. 检查视图
SELECT '=== 检查视图 ===' AS test_step;
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- 6. 测试插入数据
SELECT '=== 测试插入数据 ===' AS test_step;
INSERT INTO skill_definitions (
    skill_id, name, description, category, skill_type,
    function_schema, execution_type, version, is_system_skill
) VALUES (
    'test-skill-001',
    '测试技能',
    '这是一个测试技能',
    'test',
    'ACTIVE',
    '{"type":"object","properties":{"param1":{"type":"string"}}}',
    'RULE_BASED',
    '1.0.0',
    FALSE
);

-- 7. 测试查询数据
SELECT '=== 测试查询数据 ===' AS test_step;
SELECT * FROM skill_definitions WHERE skill_id = 'test-skill-001';

-- 8. 测试角色技能装备
SELECT '=== 测试角色技能装备 ===' AS test_step;
INSERT INTO character_skill_bindings (
    character_id, skill_id, is_enabled, auto_trigger, priority
) VALUES (
    1,
    'test-skill-001',
    TRUE,
    FALSE,
    0
);

-- 9. 测试视图查询
SELECT '=== 测试视图查询 ===' AS test_step;
SELECT * FROM v_character_equipped_skills WHERE character_id = 1 LIMIT 5;
SELECT * FROM v_skill_usage_statistics LIMIT 5;

-- 10. 测试唯一约束
SELECT '=== 测试唯一约束 ===' AS test_step;
-- 尝试插入重复数据（应该失败）
-- INSERT INTO character_skill_bindings (
--     character_id, skill_id, is_enabled
-- ) VALUES (
--     1,
--     'test-skill-001',
--     TRUE
-- );
-- 如果上面的插入成功，说明唯一约束未生效

-- 11. 测试默认值
SELECT '=== 测试默认值 ===' AS test_step;
SELECT 
    execution_type,
    max_usage_per_day,
    version,
    is_system_skill
FROM skill_definitions
WHERE skill_id = 'test-skill-001';

-- 12. 测试索引性能
SELECT '=== 测试索引性能 ===' AS test_step;
EXPLAIN SELECT * FROM skill_definitions WHERE execution_type = 'RULE_BASED';
EXPLAIN SELECT * FROM character_skill_bindings WHERE character_id = 1;

-- 13. 清理测试数据
SELECT '=== 清理测试数据 ===' AS test_step;
DELETE FROM character_skill_bindings WHERE skill_id = 'test-skill-001';
DELETE FROM skill_definitions WHERE skill_id = 'test-skill-001';

SELECT '=== 测试完成 ===' AS test_step;
