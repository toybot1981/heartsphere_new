#!/bin/bash

# 检查数据库中图片URL的存储格式
# 使用方法: ./scripts/check-database-image-urls.sh

DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "检查数据库中的图片URL存储格式"
echo "数据库: $DB_NAME"
echo "=========================================="
echo ""

# 执行检查SQL
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
-- 统计各表的URL格式
SELECT 
    'system_eras' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM system_eras
UNION ALL
SELECT 
    'system_characters' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN avatar_url IS NULL OR avatar_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM system_characters
UNION ALL
SELECT 
    'characters' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' OR background_url LIKE 'http://%' OR background_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN (avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '') 
              OR (background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url IS NOT NULL AND background_url != '') THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN (avatar_url IS NULL OR avatar_url = '') AND (background_url IS NULL OR background_url = '') THEN 1 ELSE 0 END) AS null_or_empty_count
FROM characters
UNION ALL
SELECT 
    'eras' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM eras
UNION ALL
SELECT 
    'journal_entries' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN image_url LIKE 'http://%' OR image_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN image_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN image_url NOT LIKE 'http://%' AND image_url NOT LIKE 'https://%' AND image_url IS NOT NULL AND image_url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN image_url IS NULL OR image_url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM journal_entries
UNION ALL
SELECT 
    'users' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar LIKE 'http://%' OR avatar LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN avatar NOT LIKE 'http://%' AND avatar NOT LIKE 'https://%' AND avatar IS NOT NULL AND avatar != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN avatar IS NULL OR avatar = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM users
UNION ALL
SELECT 
    'user_main_stories' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN avatar_url LIKE 'http://%' OR avatar_url LIKE 'https://%' OR background_url LIKE 'http://%' OR background_url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN avatar_url LIKE '%localhost%' OR background_url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN (avatar_url NOT LIKE 'http://%' AND avatar_url NOT LIKE 'https://%' AND avatar_url IS NOT NULL AND avatar_url != '') 
              OR (background_url NOT LIKE 'http://%' AND background_url NOT LIKE 'https://%' AND background_url IS NOT NULL AND background_url != '') THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN (avatar_url IS NULL OR avatar_url = '') AND (background_url IS NULL OR background_url = '') THEN 1 ELSE 0 END) AS null_or_empty_count
FROM user_main_stories;

EOF

echo ""
echo "=========================================="
echo "检查完成"
echo "=========================================="
echo ""
echo "说明："
echo "- absolute_url_count: 绝对路径数量（http://或https://开头）"
echo "- localhost_count: 包含localhost的URL数量"
echo "- relative_path_count: 相对路径数量（正确的格式）"
echo "- null_or_empty_count: 空值数量"
echo ""
echo "理想情况：relative_path_count 应该等于 total_count（减去空值）"
