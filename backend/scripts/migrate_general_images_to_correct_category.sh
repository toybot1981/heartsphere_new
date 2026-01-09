#!/bin/bash

# 迁移 general 目录下的图片到正确的 category
# 此脚本需要先运行 analyze_general_images.sql 来确定哪些图片需要迁移

set -e

UPLOADS_DIR="backend/uploads/images"
BACKUP_DIR="backend/uploads/images_backup_$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "图片分类迁移脚本"
echo "=========================================="
echo ""

# 创建备份目录
echo "1. 创建备份目录: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r "$UPLOADS_DIR" "$BACKUP_DIR/"
echo "备份完成"
echo ""

# 统计需要迁移的文件
echo "2. 统计需要迁移的文件..."
GENERAL_COUNT=$(find "$UPLOADS_DIR/general" -type f 2>/dev/null | wc -l | tr -d ' ')
USER_GENERAL_COUNT=$(find "$UPLOADS_DIR" -type d -path "*/general" -exec find {} -type f \; 2>/dev/null | wc -l | tr -d ' ')

echo "系统资源 general 目录文件数: $GENERAL_COUNT"
echo "用户资源 general 目录文件数: $USER_GENERAL_COUNT"
echo ""

# 注意：实际迁移需要根据数据库查询结果来确定目标 category
# 这里只提供框架，具体迁移逻辑需要根据 analyze_general_images.sql 的结果来编写

echo "3. 请先运行 analyze_general_images.sql 来确定需要迁移的文件"
echo "4. 根据查询结果，编写具体的迁移逻辑"
echo ""
echo "迁移规则："
echo "  - journal_entries.image_url: general -> journal"
echo "  - characters.avatar_url/background_url: general -> character"
echo "  - eras.image_url: general -> era"
echo "  - system_characters.avatar_url/background_url: general -> character"
echo "  - system_eras.image_url: general -> era"
echo "  - system_main_stories.avatar_url/background_url: general -> character"
echo "  - system_resources: 根据 category 字段确定（如果 category='general' 但实际应该是其他分类）"
echo ""
echo "备份位置: $BACKUP_DIR"
echo "=========================================="
