#!/bin/bash

# 简单的分析脚本，检查 general 目录下的图片

UPLOADS_DIR="backend/uploads/images"

echo "=========================================="
echo "分析 general 目录下的图片"
echo "=========================================="
echo ""

# 1. 统计系统资源 general 目录
if [ -d "$UPLOADS_DIR/general" ]; then
    GENERAL_COUNT=$(find "$UPLOADS_DIR/general" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null | wc -l | tr -d ' ')
    echo "1. 系统资源 general 目录:"
    echo "   图片文件数: $GENERAL_COUNT"
    echo ""
    
    # 按年份/月份统计
    echo "   按年月分布:"
    find "$UPLOADS_DIR/general" -type d -mindepth 1 -maxdepth 1 | while read year_dir; do
        year=$(basename "$year_dir")
        find "$year_dir" -type d -mindepth 1 -maxdepth 1 | while read month_dir; do
            month=$(basename "$month_dir")
            count=$(find "$month_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null | wc -l | tr -d ' ')
            if [ "$count" -gt 0 ]; then
                echo "     $year/$month: $count 个文件"
            fi
        done
    done
    echo ""
fi

# 2. 统计用户资源 general 目录
echo "2. 用户资源 general 目录:"
USER_COUNT=0
TOTAL_USER_FILES=0
for user_dir in "$UPLOADS_DIR"/*/; do
    if [ -d "$user_dir/general" ]; then
        user_id=$(basename "$user_dir")
        if [[ "$user_id" =~ ^[0-9]+$ ]]; then
            USER_COUNT=$((USER_COUNT + 1))
            count=$(find "$user_dir/general" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null | wc -l | tr -d ' ')
            TOTAL_USER_FILES=$((TOTAL_USER_FILES + count))
            if [ "$count" -gt 0 ]; then
                echo "   用户 $user_id: $count 个图片文件"
            fi
        fi
    fi
done
echo "   涉及用户数: $USER_COUNT"
echo "   总计: $TOTAL_USER_FILES 个图片文件"
echo ""

# 3. 显示一些示例文件路径
echo "3. 示例文件路径（前5个）:"
if [ -d "$UPLOADS_DIR/general" ]; then
    find "$UPLOADS_DIR/general" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null | head -5 | while read file; do
        relative_path=${file#$UPLOADS_DIR/}
        echo "   $relative_path"
    done
fi
echo ""

echo "=========================================="
echo "分析完成"
echo ""
echo "下一步:"
echo "1. 检查数据库中的记录（需要手动运行 SQL 查询）"
echo "2. 根据查询结果确定需要迁移的图片"
echo "3. 执行迁移脚本"
echo "=========================================="
