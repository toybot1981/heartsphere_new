#!/bin/bash

# 检查角色技能配置脚本
# 用于验证角色是否已装备技能，以及技能是否已启用和配置自动触发

DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

# 如果提供了角色名参数，只检查该角色，否则检查所有六个生活助手角色
CHARACTER_NAME="${1:-}"

if [ -z "$CHARACTER_NAME" ]; then
    # 检查所有六个生活助手角色
    CHARACTERS=("时小光" "康小健" "学小知" "心小暖" "心小安" "暖小阳")
    echo "=========================================="
    echo "检查六个生活助手角色的技能配置"
    echo "=========================================="
    echo ""
    
    for char in "${CHARACTERS[@]}"; do
        echo "📋 角色: $char"
        echo "----------------------------------------"
        
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
        SELECT 
            sd.name AS '技能名称',
            sd.skill_id AS '技能ID',
            CASE WHEN csb.is_enabled = 1 THEN '✓' ELSE '✗' END AS '启用',
            CASE WHEN csb.auto_trigger = 1 THEN '✓' ELSE '✗' END AS '自动触发',
            CASE 
                WHEN sd.auto_trigger_keywords IS NULL OR sd.auto_trigger_keywords = '' THEN '无'
                ELSE sd.auto_trigger_keywords
            END AS '触发关键词',
            csb.priority AS '优先级'
        FROM character_skill_bindings csb
        JOIN system_characters sc ON csb.character_id = sc.id
        JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
        WHERE sc.name = '$char'
        ORDER BY csb.priority ASC, sd.name ASC;
        " 2>/dev/null | grep -v "Warning"
        
        echo ""
    done
    
    echo "=========================================="
    echo "统计信息"
    echo "=========================================="
    
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
    
else
    # 只检查指定角色
    echo "=========================================="
    echo "检查角色: $CHARACTER_NAME 的技能配置"
    echo "=========================================="
    echo ""
    
    # 检查角色是否存在
    CHAR_EXISTS=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -Nse "
    SELECT COUNT(*) FROM system_characters WHERE name = '$CHARACTER_NAME';
    " 2>/dev/null)
    
    if [ "$CHAR_EXISTS" -eq 0 ]; then
        echo "❌ 错误: 角色 '$CHARACTER_NAME' 不存在"
        echo ""
        echo "可用的角色列表:"
        mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
        SELECT name AS '角色名称' FROM system_characters 
        WHERE name IN ('时小光', '康小健', '学小知', '心小暖', '心小安', '暖小阳')
        ORDER BY name;
        " 2>/dev/null | grep -v "Warning"
        exit 1
    fi
    
    # 显示角色信息
    echo "📋 角色信息:"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
    SELECT 
        name AS '角色名称',
        role AS '角色',
        is_active AS '是否激活'
    FROM system_characters
    WHERE name = '$CHARACTER_NAME';
    " 2>/dev/null | grep -v "Warning"
    
    echo ""
    echo "📋 已装备的技能:"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
    SELECT 
        sd.name AS '技能名称',
        sd.skill_id AS '技能ID',
        sd.description AS '技能描述',
        CASE WHEN csb.is_enabled = 1 THEN '✓' ELSE '✗' END AS '启用',
        CASE WHEN csb.auto_trigger = 1 THEN '✓' ELSE '✗' END AS '自动触发',
        CASE 
            WHEN sd.auto_trigger_keywords IS NULL OR sd.auto_trigger_keywords = '' THEN '无'
            ELSE sd.auto_trigger_keywords
        END AS '触发关键词',
        csb.priority AS '优先级'
    FROM character_skill_bindings csb
    JOIN system_characters sc ON csb.character_id = sc.id
    JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
    WHERE sc.name = '$CHARACTER_NAME'
    ORDER BY csb.priority ASC, sd.name ASC;
    " 2>/dev/null | grep -v "Warning"
    
    echo ""
    echo "📊 统计信息:"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
    SELECT 
        COUNT(*) AS '总技能数',
        SUM(CASE WHEN csb.is_enabled = 1 THEN 1 ELSE 0 END) AS '已启用',
        SUM(CASE WHEN csb.auto_trigger = 1 THEN 1 ELSE 0 END) AS '自动触发',
        SUM(CASE WHEN csb.is_enabled = 0 THEN 1 ELSE 0 END) AS '未启用'
    FROM character_skill_bindings csb
    JOIN system_characters sc ON csb.character_id = sc.id
    WHERE sc.name = '$CHARACTER_NAME';
    " 2>/dev/null | grep -v "Warning"
    
    echo ""
    echo "💡 测试建议:"
    echo "  1. 确保所有技能都已启用（启用列显示 ✓）"
    echo "  2. 查看自动触发技能的触发关键词"
    echo "  3. 在对话中使用关键词触发技能"
    echo ""
    echo "示例消息："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -Nse "
    SELECT CONCAT('  - \"', sd.name, '\" - 关键词: ', 
        CASE 
            WHEN sd.auto_trigger_keywords IS NULL OR sd.auto_trigger_keywords = '' THEN '无（Function Calling触发）'
            ELSE sd.auto_trigger_keywords
        END)
    FROM character_skill_bindings csb
    JOIN system_characters sc ON csb.character_id = sc.id
    JOIN skill_definitions sd ON csb.skill_id = sd.skill_id
    WHERE sc.name = '$CHARACTER_NAME' AND csb.is_enabled = 1
    LIMIT 5;
    " 2>/dev/null | grep -v "Warning"
fi

echo ""
echo "=========================================="
