#!/bin/bash
# 详细验证导入结果

DB_HOST="127.0.0.1"
DB_USER="root"
DB_PASS="123456"
DB_NAME="heartsphere"

echo "========================================="
echo "详细验证导入结果"
echo "========================================="
echo ""

# 检查时代表
echo "1. 检查时代表："
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    id,
    name,
    LEFT(description, 50) as description_preview,
    is_active,
    sort_order
FROM system_eras 
WHERE name = '日常生活助手';
" 2>&1 | grep -v "Warning"

echo ""
echo "2. 检查角色数量："
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT COUNT(*) as total_characters
FROM system_characters 
WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1);
" 2>&1 | grep -v "Warning"

echo ""
echo "3. 检查所有角色："
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    id,
    name,
    role,
    age,
    gender,
    LEFT(description, 30) as description_preview,
    sort_order,
    is_active
FROM system_characters 
WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1)
ORDER BY sort_order;
" 2>&1 | grep -v "Warning"

echo ""
echo "4. 检查角色标签："
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS $DB_NAME --default-character-set=utf8mb4 -e "
SELECT 
    name,
    tags
FROM system_characters 
WHERE system_era_id = (SELECT id FROM system_eras WHERE name = '日常生活助手' LIMIT 1)
ORDER BY sort_order;
" 2>&1 | grep -v "Warning"

echo ""
echo "========================================="
