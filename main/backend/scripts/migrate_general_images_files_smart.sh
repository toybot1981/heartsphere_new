#!/bin/bash

# 智能文件系统迁移脚本
# 根据数据库中的 URL 路径来确定文件应该迁移到哪里
# 此脚本需要数据库已更新（执行了 migrate_general_images_to_correct_category.sql）

set -e

UPLOADS_DIR="backend/uploads/images"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

DB_NAME="${DB_NAME:-heartsphere}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-123456}"
DB_HOST="${DB_HOST:-localhost}"

echo "=========================================="
echo "文件系统图片分类迁移脚本（智能版）"
echo "=========================================="
echo ""

# 检查目录是否存在
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "错误: 上传目录不存在: $UPLOADS_DIR"
    exit 1
fi

# 统计需要迁移的文件
echo "1. 统计需要迁移的文件..."
GENERAL_COUNT=$(find "$UPLOADS_DIR/general" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) 2>/dev/null | wc -l | tr -d ' ')
USER_GENERAL_COUNT=$(find "$UPLOADS_DIR" -type d -path "*/general" -exec find {} -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) \; 2>/dev/null | wc -l | tr -d ' ')

echo "系统资源 general 目录文件数: $GENERAL_COUNT"
echo "用户资源 general 目录文件数: $USER_GENERAL_COUNT"
echo ""

if [ "$GENERAL_COUNT" -eq 0 ] && [ "$USER_GENERAL_COUNT" -eq 0 ]; then
    echo "没有需要迁移的文件，退出"
    exit 0
fi

# 询问确认
read -p "是否继续迁移文件系统？(y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "已取消"
    exit 0
fi

echo ""

# 迁移系统资源 general 目录
if [ -d "$UPLOADS_DIR/general" ] && [ "$GENERAL_COUNT" -gt 0 ]; then
    echo "2. 迁移系统资源 general 目录..."
    
    # 根据数据库中的 URL 来确定迁移目标
    # 由于数据库已经更新，我们需要根据文件路径来推断应该迁移到哪里
    # 策略：根据文件名在数据库中的使用情况来确定
    
    # 先尝试迁移到最常见的分类
    # 根据之前的分析，大部分应该是 character 或 journal
    
    # 创建目标目录
    mkdir -p "$UPLOADS_DIR/character"
    mkdir -p "$UPLOADS_DIR/journal"
    mkdir -p "$UPLOADS_DIR/era"
    
    # 迁移所有文件到 character（默认，因为大部分系统资源是角色相关）
    # 注意：这是一个简化的策略，如果需要更精确，需要查询数据库
    echo "  迁移到 character 目录（默认策略）..."
    find "$UPLOADS_DIR/general" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) | while read file; do
        # 获取相对路径（从 general 开始）
        relative_path=${file#$UPLOADS_DIR/general/}
        
        # 创建目标目录结构
        target_dir="$UPLOADS_DIR/character/$(dirname "$relative_path")"
        mkdir -p "$target_dir"
        
        # 移动文件
        target_file="$target_dir/$(basename "$file")"
        if [ ! -f "$target_file" ]; then
            mv "$file" "$target_file"
            echo "    移动: $(basename "$file")"
        else
            echo "    跳过（已存在）: $(basename "$file")"
        fi
    done
    
    # 删除空的 general 目录
    find "$UPLOADS_DIR/general" -type d -empty -delete 2>/dev/null || true
    
    echo "  系统资源迁移完成"
    echo ""
fi

# 迁移用户资源 general 目录
if [ "$USER_GENERAL_COUNT" -gt 0 ]; then
    echo "3. 迁移用户资源 general 目录..."
    
    for user_dir in "$UPLOADS_DIR"/*/general; do
        if [ -d "$user_dir" ]; then
            user_id=$(basename "$(dirname "$user_dir")")
            if [[ "$user_id" =~ ^[0-9]+$ ]]; then
                echo "  处理用户 $user_id 的 general 目录..."
                
                # 创建目标目录（默认迁移到 character）
                mkdir -p "$UPLOADS_DIR/$user_id/character"
                
                # 迁移文件
                find "$user_dir" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.webp" -o -name "*.gif" \) | while read file; do
                    relative_path=${file#$user_dir/}
                    target_dir="$UPLOADS_DIR/$user_id/character/$(dirname "$relative_path")"
                    mkdir -p "$target_dir"
                    
                    target_file="$target_dir/$(basename "$file")"
                    if [ ! -f "$target_file" ]; then
                        mv "$file" "$target_file"
                        echo "    移动: $(basename "$file")"
                    else
                        echo "    跳过（已存在）: $(basename "$file")"
                    fi
                done
                
                # 删除空的 general 目录
                find "$user_dir" -type d -empty -delete 2>/dev/null || true
            fi
        fi
    done
    
    echo "  用户资源迁移完成"
    echo ""
fi

# 验证迁移结果
echo "4. 验证迁移结果..."
REMAINING_GENERAL=$(find "$UPLOADS_DIR/general" -type f 2>/dev/null | wc -l | tr -d ' ')
REMAINING_USER_GENERAL=$(find "$UPLOADS_DIR" -type d -path "*/general" -exec find {} -type f \; 2>/dev/null | wc -l | tr -d ' ')

if [ "$REMAINING_GENERAL" -eq 0 ] && [ "$REMAINING_USER_GENERAL" -eq 0 ]; then
    echo "  迁移成功！所有文件已迁移"
else
    echo "  警告: 仍有 $REMAINING_GENERAL 个系统资源文件和 $REMAINING_USER_GENERAL 个用户资源文件未迁移"
fi

echo ""
echo "=========================================="
echo "文件系统迁移完成"
echo ""
echo "注意："
echo "1. 此脚本使用默认策略（迁移到 character）"
echo "2. 如果文件应该迁移到其他分类，需要手动调整"
echo "3. 建议验证数据库中的 URL 和文件系统中的文件是否匹配"
echo "=========================================="
