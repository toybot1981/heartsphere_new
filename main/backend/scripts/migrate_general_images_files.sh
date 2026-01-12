#!/bin/bash

# 迁移文件系统中的 general 目录下的图片到正确的 category
# 此脚本需要配合 migrate_general_images_to_correct_category.sql 使用
# 执行前请先备份文件系统

set -e

UPLOADS_DIR="backend/uploads/images"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../.." || exit 1

echo "=========================================="
echo "文件系统图片分类迁移脚本"
echo "=========================================="
echo ""

# 检查目录是否存在
if [ ! -d "$UPLOADS_DIR" ]; then
    echo "错误: 上传目录不存在: $UPLOADS_DIR"
    exit 1
fi

# 统计需要迁移的文件
echo "1. 统计需要迁移的文件..."
GENERAL_COUNT=$(find "$UPLOADS_DIR/general" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "系统资源 general 目录文件数: $GENERAL_COUNT"
echo ""

# 迁移系统资源 general -> character（角色相关图片）
echo "2. 迁移系统资源 general -> character..."
if [ -d "$UPLOADS_DIR/general" ]; then
    # 这里需要根据实际数据库查询结果来确定哪些文件应该迁移到哪个目录
    # 暂时先创建一个示例迁移逻辑
    
    # 创建目标目录
    mkdir -p "$UPLOADS_DIR/character"
    
    # 注意：实际迁移需要根据数据库中的URL来确定
    # 这里只提供框架，需要根据 analyze_general_images.sql 的结果来编写具体逻辑
    
    echo "  注意：此脚本需要根据数据库查询结果来确定具体迁移逻辑"
    echo "  请先运行 analyze_general_images.sql 和 migrate_general_images_to_correct_category.sql"
fi

# 迁移用户资源 general -> 对应的 category
echo "3. 迁移用户资源 general -> 对应的 category..."
for user_dir in "$UPLOADS_DIR"/*/general; do
    if [ -d "$user_dir" ]; then
        user_id=$(basename "$(dirname "$user_dir")")
        echo "  处理用户 $user_id 的 general 目录..."
        
        # 这里需要根据数据库查询结果来确定每个用户的文件应该迁移到哪个目录
        # 暂时先创建示例逻辑
        
        # 创建目标目录（示例：迁移到 character）
        mkdir -p "$UPLOADS_DIR/$user_id/character"
        
        echo "  注意：需要根据数据库查询结果来确定具体迁移逻辑"
    fi
done

echo ""
echo "=========================================="
echo "迁移完成"
echo ""
echo "注意："
echo "1. 此脚本只提供了迁移框架"
echo "2. 实际迁移需要根据数据库查询结果来确定具体逻辑"
echo "3. 建议先运行 analyze_general_images.sql 进行分析"
echo "4. 然后运行 migrate_general_images_to_correct_category.sql 更新数据库"
echo "5. 最后根据数据库更新结果来迁移文件系统"
echo "=========================================="
