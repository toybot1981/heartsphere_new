#!/bin/bash
# 检查日常生活助手角色数据是否已导入

# 数据库配置（请根据实际情况修改）
DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

echo "========================================="
echo "检查日常生活助手角色数据"
echo "========================================="
echo ""

# 检查时代表
echo "📋 时代表检查："
ERA_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -se "
    SELECT COUNT(*) FROM system_eras WHERE name = '日常生活助手';
" 2>/dev/null)

if [ "$ERA_COUNT" -eq "1" ]; then
    echo "✅ 时代表存在"
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT id, name, description, is_active, sort_order 
        FROM system_eras 
        WHERE name = '日常生活助手';
    " 2>/dev/null
else
    echo "❌ 时代表不存在"
fi

echo ""
echo "👥 角色检查："
CHARACTER_COUNT=$(mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -se "
    SELECT COUNT(*) FROM system_characters 
    WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1);
" 2>/dev/null)

if [ "$CHARACTER_COUNT" -eq "6" ]; then
    echo "✅ 角色数据完整（共 $CHARACTER_COUNT 个角色）"
    echo ""
    echo "角色列表："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT 
            id,
            name,
            role,
            age,
            gender,
            sort_order,
            is_active
        FROM system_characters 
        WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1) 
        ORDER BY sort_order;
    " 2>/dev/null
elif [ "$CHARACTER_COUNT" -gt "0" ]; then
    echo "⚠️  角色数据不完整（只有 $CHARACTER_COUNT 个角色，应该是 6 个）"
    echo ""
    echo "现有角色："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT id, name, role, sort_order 
        FROM system_characters 
        WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1) 
        ORDER BY sort_order;
    " 2>/dev/null
else
    echo "❌ 角色数据不存在"
fi

echo ""
echo "========================================="
echo "检查完成"
echo "========================================="
