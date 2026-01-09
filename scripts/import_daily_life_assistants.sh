#!/bin/bash
# 导入日常生活助手角色数据脚本

# 数据库配置（请根据实际情况修改）
DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"
SQL_FILE="backend/src/main/resources/db/migration/add_daily_life_assistant_characters.sql"

echo "========================================="
echo "导入日常生活助手角色数据"
echo "========================================="

# 检查SQL文件是否存在
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL文件不存在: $SQL_FILE"
    exit 1
fi

echo "📁 SQL文件: $SQL_FILE"
echo "🔌 数据库: $DB_NAME @ $DB_HOST"
echo ""

# 执行导入
echo "开始导入数据..."
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 < $SQL_FILE

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据导入成功！"
    echo ""
    echo "验证导入结果..."
    echo ""
    
    # 验证时代表
    echo "📋 时代表："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT id, name, description, is_active, sort_order 
        FROM system_eras 
        WHERE name = '日常生活助手';
    " 2>/dev/null
    
    echo ""
    echo "👥 角色列表："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT id, name, role, age, gender, sort_order 
        FROM system_characters 
        WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1) 
        ORDER BY sort_order;
    " 2>/dev/null
    
    echo ""
    echo "📊 统计信息："
    mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT 
            '时代表' as type,
            COUNT(*) as count
        FROM system_eras WHERE name = '日常生活助手'
        UNION ALL
        SELECT 
            '角色' as type,
            COUNT(*) as count
        FROM system_characters 
        WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1);
    " 2>/dev/null
    
    echo ""
    echo "========================================="
    echo "✅ 导入完成！"
    echo "========================================="
else
    echo ""
    echo "❌ 数据导入失败！"
    echo "请检查："
    echo "1. 数据库连接信息是否正确"
    echo "2. 数据库用户是否有足够权限"
    echo "3. SQL文件语法是否正确"
    exit 1
fi
