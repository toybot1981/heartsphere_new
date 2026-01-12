#!/bin/bash

# 将错误存储在 character 目录下的 general 图片移动到 general 目录
# 基于数据库中的 system_resources (category='general') 记录

set -e

UPLOADS_DIR="backend/uploads/images"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "移动 general 图片从 character 目录到 general 目录"
echo "=========================================="
echo ""

# 检查目录是否存在
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "错误: 上传目录不存在: $UPLOADS_DIR"
    exit 1
fi

# 检查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo "错误: 未找到 mysql 命令"
    exit 1
fi

echo "1. 从数据库查询 general 相关的文件名..."
echo ""

# 查询 system_resources 表中 category='general' 的图片文件名
GENERAL_FILES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT SUBSTRING_INDEX(url, '/', -1) as filename
FROM system_resources
WHERE category = 'general'
  AND (url LIKE 'general/%' OR url LIKE 'character/%' OR url LIKE 'era/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';
" 2>/dev/null | grep -v "Warning" | grep -v "^$")

FILE_COUNT=$(echo "$GENERAL_FILES" | grep -v "^$" | wc -l | tr -d ' ')

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "数据库中没有找到需要移动的 general 图片记录"
    echo "可能所有 general 图片已经在 general 目录下"
    exit 0
fi

echo "找到 $FILE_COUNT 个 general 相关的文件名"
echo ""

# 询问确认
read -p "是否继续移动文件？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "2. 开始移动文件..."
echo ""

# 创建 general 目录
mkdir -p "$UPLOADS_DIR/general/2025/12"

MOVED_COUNT=0
NOT_FOUND_COUNT=0
ALREADY_IN_GENERAL=0

# 遍历每个文件名
echo "$GENERAL_FILES" | while read -r filename; do
    if [ -z "$filename" ]; then
        continue
    fi
    
    # 检查 character 目录下是否有这个文件
    character_file=$(find "$UPLOADS_DIR/character" -name "$filename" -type f 2>/dev/null | head -1)
    
    if [ -n "$character_file" ]; then
        # 获取相对路径（从 character 开始）
        relative_path=${character_file#$UPLOADS_DIR/character/}
        year_month=$(dirname "$relative_path")
        
        # 构建目标路径
        target_dir="$UPLOADS_DIR/general/$year_month"
        target_file="$target_dir/$filename"
        
        # 创建目标目录
        mkdir -p "$target_dir"
        
        # 检查目标文件是否已存在
        if [ -f "$target_file" ]; then
            echo "  跳过（general目录已存在）: $filename"
            ALREADY_IN_GENERAL=$((ALREADY_IN_GENERAL + 1))
            # 删除 character 目录下的文件（因为 general 目录已经有了）
            rm "$character_file"
            echo "  删除 character 目录下的重复文件: $filename"
        else
            # 移动文件
            mv "$character_file" "$target_file"
            echo "  移动: $filename (从 character/$year_month 到 general/$year_month)"
            MOVED_COUNT=$((MOVED_COUNT + 1))
        fi
    fi
    
    # 检查 era 目录下是否有这个文件
    era_file=$(find "$UPLOADS_DIR/era" -name "$filename" -type f 2>/dev/null | head -1)
    
    if [ -n "$era_file" ]; then
        # 获取相对路径（从 era 开始）
        relative_path=${era_file#$UPLOADS_DIR/era/}
        year_month=$(dirname "$relative_path")
        
        # 构建目标路径
        target_dir="$UPLOADS_DIR/general/$year_month"
        target_file="$target_dir/$filename"
        
        # 创建目标目录
        mkdir -p "$target_dir"
        
        # 检查目标文件是否已存在
        if [ -f "$target_file" ]; then
            echo "  跳过（general目录已存在）: $filename"
            ALREADY_IN_GENERAL=$((ALREADY_IN_GENERAL + 1))
            # 删除 era 目录下的文件
            rm "$era_file"
            echo "  删除 era 目录下的重复文件: $filename"
        else
            # 移动文件
            mv "$era_file" "$target_file"
            echo "  移动: $filename (从 era/$year_month 到 general/$year_month)"
            MOVED_COUNT=$((MOVED_COUNT + 1))
        fi
    fi
    
    # 检查 general 目录下是否已有
    general_file=$(find "$UPLOADS_DIR/general" -name "$filename" -type f 2>/dev/null | head -1)
    if [ -z "$general_file" ] && [ -z "$character_file" ] && [ -z "$era_file" ]; then
        echo "  未找到: $filename"
        NOT_FOUND_COUNT=$((NOT_FOUND_COUNT + 1))
    fi
done

echo ""
echo "3. 清理空目录..."
find "$UPLOADS_DIR/character" -type d -empty -delete 2>/dev/null || true
find "$UPLOADS_DIR/era" -type d -empty -delete 2>/dev/null || true

echo ""
echo "=========================================="
echo "文件移动完成"
echo ""
echo "统计："
echo "  移动文件数: $MOVED_COUNT"
echo "  已在 general 目录: $ALREADY_IN_GENERAL"
echo "  未找到文件数: $NOT_FOUND_COUNT"
echo ""
echo "注意："
echo "  1. 如果文件未找到，可能已经被移动或删除"
echo "  2. 请验证数据库中的 URL 是否已更新为 general 目录"
echo "=========================================="
