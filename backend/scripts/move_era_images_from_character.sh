#!/bin/bash

# 将错误存储在 character 目录下的 era 图片移动到 era 目录
# 基于数据库中的记录来确定哪些文件需要移动

set -e

UPLOADS_DIR="backend/uploads/images"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "移动 era 图片从 character 目录到 era 目录"
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
    echo "请手动检查数据库中的 era 图片URL，然后移动文件"
    exit 1
fi

echo "1. 从数据库查询需要移动的文件..."
echo ""

# 查询 system_eras 表中使用 character 目录的图片
ERA_FILES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT REPLACE(REPLACE(image_url, 'character/', ''), '/character/', '')
FROM system_eras
WHERE (image_url LIKE 'character/%' OR image_url LIKE '%/character/%')
  AND image_url NOT LIKE 'placeholder://%'
  AND image_url NOT LIKE 'http://%'
  AND image_url NOT LIKE 'https://%';
" 2>/dev/null | grep -v "Warning")

# 查询 system_resources 表中 category='era' 且使用 character 目录的图片
RESOURCE_FILES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT REPLACE(REPLACE(url, 'character/', ''), '/character/', '')
FROM system_resources
WHERE category = 'era'
  AND (url LIKE 'character/%' OR url LIKE '%/character/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%';
" 2>/dev/null | grep -v "Warning")

# 合并文件列表（去重）
ALL_FILES=$(echo -e "$ERA_FILES\n$RESOURCE_FILES" | sort -u)

FILE_COUNT=$(echo "$ALL_FILES" | grep -v "^$" | wc -l | tr -d ' ')

if [ "$FILE_COUNT" -eq 0 ]; then
    echo "没有需要移动的文件（数据库中的URL可能已经修复）"
    echo ""
    echo "检查文件系统中是否有需要移动的文件..."
    
    # 检查 character 目录下是否有 era 相关的文件（根据文件名判断）
    # 这里需要根据实际情况来判断，暂时先列出所有文件
    echo "character 目录下的文件（可能需要手动检查）："
    find "$UPLOADS_DIR/character" -type f -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | head -10
    exit 0
fi

echo "找到 $FILE_COUNT 个需要移动的文件"
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

# 创建 era 目录
mkdir -p "$UPLOADS_DIR/era"

MOVED_COUNT=0
NOT_FOUND_COUNT=0

# 移动文件
echo "$ALL_FILES" | while read -r file_path; do
    if [ -z "$file_path" ]; then
        continue
    fi
    
    # 构建源文件路径和目标文件路径
    source_file="$UPLOADS_DIR/character/$file_path"
    target_file="$UPLOADS_DIR/era/$file_path"
    
    # 检查源文件是否存在
    if [ -f "$source_file" ]; then
        # 创建目标目录
        target_dir=$(dirname "$target_file")
        mkdir -p "$target_dir"
        
        # 移动文件
        if [ ! -f "$target_file" ]; then
            mv "$source_file" "$target_file"
            echo "  移动: $file_path"
            MOVED_COUNT=$((MOVED_COUNT + 1))
        else
            echo "  跳过（目标已存在）: $file_path"
        fi
    else
        echo "  未找到: $file_path"
        NOT_FOUND_COUNT=$((NOT_FOUND_COUNT + 1))
    fi
done

echo ""
echo "3. 清理空目录..."
find "$UPLOADS_DIR/character" -type d -empty -delete 2>/dev/null || true

echo ""
echo "=========================================="
echo "文件移动完成"
echo ""
echo "统计："
echo "  移动文件数: $MOVED_COUNT"
echo "  未找到文件数: $NOT_FOUND_COUNT"
echo ""
echo "注意："
echo "  1. 如果文件未找到，可能已经被移动或删除"
echo "  2. 请验证数据库中的 URL 是否已更新为 era 目录"
echo "=========================================="
