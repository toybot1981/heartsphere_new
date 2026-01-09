#!/bin/bash

# 将资源图片文件从其他目录移动到 item 和 event 目录
# 基于数据库中的 system_resources 记录（category='item' 或 'event'）

set -e

UPLOADS_DIR="backend/uploads/images"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "移动资源图片到 item 和 event 目录"
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

# 创建 item 和 event 目录
mkdir -p "$UPLOADS_DIR/item/2025/12"
mkdir -p "$UPLOADS_DIR/event/2025/12"

echo "1. 从数据库查询 item 和 event 相关的文件名..."
echo ""

# 查询 item 类别的资源文件名
ITEM_FILES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT 
    id,
    name,
    url,
    SUBSTRING_INDEX(url, '/', -1) as filename,
    SUBSTRING_INDEX(SUBSTRING_INDEX(url, '/', -2), '/', 1) as year_month_part
FROM system_resources
WHERE category = 'item'
  AND (url LIKE 'item/%' OR url LIKE 'general/%' OR url LIKE 'character/%' OR url LIKE 'scenario/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url LIKE '%/%/%';
" 2>/dev/null | grep -v "Warning" | grep -v "^$")

# 查询 event 类别的资源文件名
EVENT_FILES=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -N -e "
SELECT 
    id,
    name,
    url,
    SUBSTRING_INDEX(url, '/', -1) as filename,
    SUBSTRING_INDEX(SUBSTRING_INDEX(url, '/', -2), '/', 1) as year_month_part
FROM system_resources
WHERE category = 'event'
  AND (url LIKE 'event/%' OR url LIKE 'general/%' OR url LIKE 'character/%' OR url LIKE 'scenario/%')
  AND url NOT LIKE 'placeholder://%'
  AND url NOT LIKE 'http://%'
  AND url NOT LIKE 'https://%'
  AND url LIKE '%/%/%';
" 2>/dev/null | grep -v "Warning" | grep -v "^$")

ITEM_COUNT=$(echo "$ITEM_FILES" | grep -v "^$" | wc -l | tr -d ' ')
EVENT_COUNT=$(echo "$EVENT_FILES" | grep -v "^$" | wc -l | tr -d ' ')

if [ "$ITEM_COUNT" -eq 0 ] && [ "$EVENT_COUNT" -eq 0 ]; then
    echo "数据库中没有找到需要移动的资源文件记录"
    exit 0
fi

echo "找到 $ITEM_COUNT 个 item 相关的文件记录"
echo "找到 $EVENT_COUNT 个 event 相关的文件记录"
echo ""

# 询问确认
read -p "是否继续移动文件？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""
echo "2. 开始移动 item 文件..."
echo ""

ITEM_MOVED=0
ITEM_ALREADY_IN_PLACE=0
ITEM_NOT_FOUND=0

# 处理 item 文件
if [ -n "$ITEM_FILES" ]; then
    echo "$ITEM_FILES" | while IFS=$'\t' read -r id name url filename year_month_part; do
        if [ -z "$filename" ] || [ -z "$id" ]; then
            continue
        fi
        
        # 提取年份和月份（从 year_month_part 或从 URL）
        if [[ "$year_month_part" =~ ^[0-9]{4}/[0-9]{2}$ ]]; then
            YEAR=$(echo "$year_month_part" | cut -d'/' -f1)
            MONTH=$(echo "$year_month_part" | cut -d'/' -f2)
        else
            # 从 URL 中提取
            YEAR="2025"
            MONTH="12"
        fi
        
        # 查找源文件（可能在 general, character, scenario 等目录）
        SOURCE_FILE=""
        for dir in general character scenario item; do
            potential_file=$(find "$UPLOADS_DIR/$dir" -type f -name "$filename" 2>/dev/null | head -1)
            if [ -n "$potential_file" ]; then
                SOURCE_FILE="$potential_file"
                break
            fi
        done
        
        if [ -n "$SOURCE_FILE" ]; then
            # 构建目标路径
            TARGET_DIR="$UPLOADS_DIR/item/$YEAR/$MONTH"
            TARGET_FILE="$TARGET_DIR/$filename"
            
            # 创建目标目录
            mkdir -p "$TARGET_DIR"
            
            # 检查目标文件是否已存在
            if [ -f "$TARGET_FILE" ]; then
                # echo "  跳过（item目录已存在）: $filename"
                ITEM_ALREADY_IN_PLACE=$((ITEM_ALREADY_IN_PLACE + 1))
                # 删除源文件（因为目标文件已存在）
                if [ "$SOURCE_FILE" != "$TARGET_FILE" ]; then
                    rm "$SOURCE_FILE"
                    echo "  删除重复文件: $filename (从 $(dirname "$SOURCE_FILE"))"
                fi
            else
                # 移动文件
                mv "$SOURCE_FILE" "$TARGET_FILE"
                echo "  移动: $filename (到 item/$YEAR/$MONTH)"
                ITEM_MOVED=$((ITEM_MOVED + 1))
            fi
        else
            # 检查是否已经在 item 目录
            ALREADY_IN_ITEM=$(find "$UPLOADS_DIR/item" -type f -name "$filename" 2>/dev/null | head -1)
            if [ -n "$ALREADY_IN_ITEM" ]; then
                # echo "  已在 item 目录: $filename"
                ITEM_ALREADY_IN_PLACE=$((ITEM_ALREADY_IN_PLACE + 1))
            else
                echo "  未找到文件: $filename (可能已被移动或删除)"
                ITEM_NOT_FOUND=$((ITEM_NOT_FOUND + 1))
            fi
        fi
    done
fi

echo ""
echo "3. 开始移动 event 文件..."
echo ""

EVENT_MOVED=0
EVENT_ALREADY_IN_PLACE=0
EVENT_NOT_FOUND=0

# 处理 event 文件
if [ -n "$EVENT_FILES" ]; then
    echo "$EVENT_FILES" | while IFS=$'\t' read -r id name url filename year_month_part; do
        if [ -z "$filename" ] || [ -z "$id" ]; then
            continue
        fi
        
        # 提取年份和月份
        if [[ "$year_month_part" =~ ^[0-9]{4}/[0-9]{2}$ ]]; then
            YEAR=$(echo "$year_month_part" | cut -d'/' -f1)
            MONTH=$(echo "$year_month_part" | cut -d'/' -f2)
        else
            YEAR="2025"
            MONTH="12"
        fi
        
        # 查找源文件
        SOURCE_FILE=""
        for dir in general character scenario event; do
            potential_file=$(find "$UPLOADS_DIR/$dir" -type f -name "$filename" 2>/dev/null | head -1)
            if [ -n "$potential_file" ]; then
                SOURCE_FILE="$potential_file"
                break
            fi
        done
        
        if [ -n "$SOURCE_FILE" ]; then
            # 构建目标路径
            TARGET_DIR="$UPLOADS_DIR/event/$YEAR/$MONTH"
            TARGET_FILE="$TARGET_DIR/$filename"
            
            # 创建目标目录
            mkdir -p "$TARGET_DIR"
            
            # 检查目标文件是否已存在
            if [ -f "$TARGET_FILE" ]; then
                # echo "  跳过（event目录已存在）: $filename"
                EVENT_ALREADY_IN_PLACE=$((EVENT_ALREADY_IN_PLACE + 1))
                # 删除源文件
                if [ "$SOURCE_FILE" != "$TARGET_FILE" ]; then
                    rm "$SOURCE_FILE"
                    echo "  删除重复文件: $filename (从 $(dirname "$SOURCE_FILE"))"
                fi
            else
                # 移动文件
                mv "$SOURCE_FILE" "$TARGET_FILE"
                echo "  移动: $filename (到 event/$YEAR/$MONTH)"
                EVENT_MOVED=$((EVENT_MOVED + 1))
            fi
        else
            # 检查是否已经在 event 目录
            ALREADY_IN_EVENT=$(find "$UPLOADS_DIR/event" -type f -name "$filename" 2>/dev/null | head -1)
            if [ -n "$ALREADY_IN_EVENT" ]; then
                # echo "  已在 event 目录: $filename"
                EVENT_ALREADY_IN_PLACE=$((EVENT_ALREADY_IN_PLACE + 1))
            else
                echo "  未找到文件: $filename (可能已被移动或删除)"
                EVENT_NOT_FOUND=$((EVENT_NOT_FOUND + 1))
            fi
        fi
    done
fi

echo ""
echo "4. 清理空目录..."
find "$UPLOADS_DIR/general" -type d -empty -delete 2>/dev/null || true
find "$UPLOADS_DIR/character" -type d -empty -delete 2>/dev/null || true
find "$UPLOADS_DIR/scenario" -type d -empty -delete 2>/dev/null || true

echo ""
echo "=========================================="
echo "文件移动完成"
echo ""
echo "Item 统计："
echo "  移动文件数: $ITEM_MOVED"
echo "  已在 item 目录: $ITEM_ALREADY_IN_PLACE"
echo "  未找到文件数: $ITEM_NOT_FOUND"
echo ""
echo "Event 统计："
echo "  移动文件数: $EVENT_MOVED"
echo "  已在 event 目录: $EVENT_ALREADY_IN_PLACE"
echo "  未找到文件数: $EVENT_NOT_FOUND"
echo ""
echo "注意："
echo "  1. 如果文件未找到，可能已经被移动或删除"
echo "  2. 请验证数据库中的 URL 是否已更新为 item/ 或 event/ 目录"
echo "=========================================="
