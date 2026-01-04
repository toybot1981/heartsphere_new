#!/bin/bash

# 检查 system_resources 表中图片URL的存储格式
# 使用方法: ./scripts/check-system-resources-urls.sh

DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_NAME="${DB_NAME:-heartsphere}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "检查 system_resources 表中的图片URL存储格式"
echo "数据库: $DB_NAME"
echo "=========================================="
echo ""

# 执行检查SQL
mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
-- 统计URL格式
SELECT 
    'system_resources' AS table_name,
    COUNT(*) AS total_count,
    SUM(CASE WHEN url LIKE 'http://%' OR url LIKE 'https://%' THEN 1 ELSE 0 END) AS absolute_url_count,
    SUM(CASE WHEN url LIKE '%localhost%' THEN 1 ELSE 0 END) AS localhost_count,
    SUM(CASE WHEN url NOT LIKE 'http://%' AND url NOT LIKE 'https://%' AND url IS NOT NULL AND url != '' THEN 1 ELSE 0 END) AS relative_path_count,
    SUM(CASE WHEN url IS NULL OR url = '' THEN 1 ELSE 0 END) AS null_or_empty_count
FROM system_resources;

-- 显示包含 localhost 的记录示例（最多20条）
SELECT '包含 localhost 的记录:' AS note;
SELECT id, name, category, url FROM system_resources WHERE url LIKE '%localhost%' LIMIT 20;

-- 显示包含绝对路径（非localhost）的记录示例
SELECT '包含绝对路径（非localhost）的记录:' AS note;
SELECT id, name, category, url FROM system_resources WHERE (url LIKE 'http://%' OR url LIKE 'https://%') AND url NOT LIKE '%localhost%' LIMIT 20;

-- 显示相对路径示例
SELECT '相对路径示例:' AS note;
SELECT id, name, category, url FROM system_resources WHERE url NOT LIKE 'http://%' AND url NOT LIKE 'https://%' AND url IS NOT NULL AND url != '' LIMIT 20;

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
