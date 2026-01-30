#!/bin/bash

# 技能系统验证脚本
# 用于验证六个生活助手角色的技能是否正确导入和配置

DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

echo "=========================================="
echo "六个生活助手角色技能系统验证"
echo "=========================================="
echo ""

# 1. 检查角色是否存在
echo "1. 检查角色是否存在..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    name AS '角色名称',
    role AS '角色',
    is_active AS '是否激活'
FROM system_characters
WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
ORDER BY name;
" 2>/dev/null | grep -v "Warning"

echo ""
echo "2. 检查技能定义完整性..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    COUNT(*) AS '技能定义总数',
    COUNT(DISTINCT category) AS '分类数量',
    COUNT(DISTINCT skill_type) AS '技能类型数量',
    COUNT(DISTINCT execution_type) AS '执行类型数量'
FROM skill_definitions
WHERE skill_id IN (
    SELECT skill_id FROM character_skill_bindings 
    WHERE character_id IN (
        SELECT id FROM system_characters 
        WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
    )
);
" 2>/dev/null | grep -v "Warning"

echo ""
echo "3. 检查技能指令完整性..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    COUNT(*) AS '技能指令总数',
    COUNT(DISTINCT skill_id) AS '有指令的技能数'
FROM skill_instructions
WHERE skill_id IN (
    SELECT skill_id FROM character_skill_bindings 
    WHERE character_id IN (
        SELECT id FROM system_characters 
        WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
    )
)
AND instruction_level = 2;
" 2>/dev/null | grep -v "Warning"

echo ""
echo "4. 检查技能绑定完整性..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    sc.name AS '角色',
    COUNT(csb.skill_id) AS '技能数',
    SUM(CASE WHEN csb.is_enabled = 1 THEN 1 ELSE 0 END) AS '已启用',
    SUM(CASE WHEN csb.auto_trigger = 1 THEN 1 ELSE 0 END) AS '自动触发'
FROM system_characters sc
LEFT JOIN character_skill_bindings csb ON sc.id = csb.character_id
WHERE sc.name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
GROUP BY sc.id, sc.name
ORDER BY sc.name;
" 2>/dev/null | grep -v "Warning"

echo ""
echo "5. 检查数据完整性（缺失定义检查）..."
MISSING_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -Nse "
SELECT COUNT(DISTINCT csb.skill_id)
FROM character_skill_bindings csb
LEFT JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
WHERE csb.character_id IN (
    SELECT id FROM system_characters 
    WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
)
AND sd.skill_id IS NULL;
" 2>/dev/null)

if [ "$MISSING_COUNT" -eq 0 ]; then
    echo "  ✓ 所有技能绑定都有对应的定义"
else
    echo "  ⚠ 有 $MISSING_COUNT 个技能绑定缺少定义"
fi

echo ""
echo "6. 检查缺失指令..."
MISSING_INSTR_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -Nse "
SELECT COUNT(DISTINCT sd.skill_id)
FROM skill_definitions sd
LEFT JOIN skill_instructions si ON sd.skill_id = si.skill_id AND si.instruction_level = 2
WHERE sd.skill_id IN (
    SELECT skill_id FROM character_skill_bindings 
    WHERE character_id IN (
        SELECT id FROM system_characters 
        WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
    )
)
AND si.skill_id IS NULL;
" 2>/dev/null)

if [ "$MISSING_INSTR_COUNT" -eq 0 ]; then
    echo "  ✓ 所有技能都有Level 2指令"
else
    echo "  ⚠ 有 $MISSING_INSTR_COUNT 个技能缺少Level 2指令"
fi

echo ""
echo "7. 检查执行类型分布..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    execution_type AS '执行类型',
    COUNT(*) AS '数量'
FROM skill_definitions
WHERE skill_id IN (
    SELECT skill_id FROM character_skill_bindings 
    WHERE character_id IN (
        SELECT id FROM system_characters 
        WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
    )
)
GROUP BY execution_type;
" 2>/dev/null | grep -v "Warning"

echo ""
echo "=========================================="
echo "验证完成！"
echo "=========================================="
