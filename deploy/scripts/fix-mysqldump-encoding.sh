#!/bin/bash

# 修复 mysqldump 导出数据的编码问题
# 此脚本用于重新处理已生成的 SQL 文件，修复字符编码问题

if [[ $# -lt 1 ]]; then
  echo "使用方法: $0 <sql_file>"
  echo "功能: 修复 SQL 文件中的字符编码问题"
  exit 1
fi

SQL_FILE="$1"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "错误: SQL 文件不存在: $SQL_FILE"
  exit 1
fi

# 备份原文件
cp "$SQL_FILE" "${SQL_FILE}.bak"

# 修复编码问题
# 1. 确保文件使用 UTF-8 编码
iconv -f UTF-8 -t UTF-8 "$SQL_FILE" > "${SQL_FILE}.tmp" 2>/dev/null || cp "$SQL_FILE" "${SQL_FILE}.tmp"

# 2. 修复重复的表名问题
sed -i.bak2 's/INSERT INTO `\([^`]*\)` `[^`]*`/INSERT INTO `\1`/g' "${SQL_FILE}.tmp"

# 3. 确保文件头部包含字符集设置
if ! grep -q "SET NAMES utf8mb4" "${SQL_FILE}.tmp"; then
  sed -i.bak3 '1a\
SET NAMES utf8mb4;\
SET CHARACTER SET utf8mb4;
' "${SQL_FILE}.tmp"
fi

# 替换原文件
mv "${SQL_FILE}.tmp" "$SQL_FILE"
rm -f "${SQL_FILE}.bak2" "${SQL_FILE}.bak3"

echo "已修复 SQL 文件: $SQL_FILE"
echo "备份文件: ${SQL_FILE}.bak"
