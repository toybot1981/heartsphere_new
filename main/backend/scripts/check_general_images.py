#!/usr/bin/env python3
"""
分析 general 目录下的图片，检查数据库中哪些记录使用了 general 分类
"""
import os
import sys
import re
from pathlib import Path

# 添加项目路径
sys.path.insert(0, str(Path(__file__).parent.parent))

def analyze_general_images():
    """分析 general 目录下的图片"""
    uploads_dir = Path(__file__).parent.parent.parent / "uploads" / "images"
    
    if not uploads_dir.exists():
        print(f"错误: 上传目录不存在: {uploads_dir}")
        return
    
    print("=" * 60)
    print("分析 general 目录下的图片")
    print("=" * 60)
    print()
    
    # 1. 统计系统资源 general 目录
    general_dir = uploads_dir / "general"
    if general_dir.exists():
        general_files = list(general_dir.rglob("*.*"))
        image_files = [f for f in general_files if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']]
        print(f"1. 系统资源 general 目录:")
        print(f"   总文件数: {len(general_files)}")
        print(f"   图片文件数: {len(image_files)}")
        print()
        
        # 按年份/月份统计
        year_month_count = {}
        for img_file in image_files:
            parts = img_file.parts
            if len(parts) >= 3:
                year = parts[-3]
                month = parts[-2]
                key = f"{year}/{month}"
                year_month_count[key] = year_month_count.get(key, 0) + 1
        
        if year_month_count:
            print("   按年月分布:")
            for key in sorted(year_month_count.keys()):
                print(f"     {key}: {year_month_count[key]} 个文件")
        print()
    
    # 2. 统计用户资源 general 目录
    user_general_dirs = []
    for user_dir in uploads_dir.iterdir():
        if user_dir.is_dir() and user_dir.name.isdigit():
            general_subdir = user_dir / "general"
            if general_subdir.exists():
                user_general_dirs.append((user_dir.name, general_subdir))
    
    if user_general_dirs:
        print(f"2. 用户资源 general 目录:")
        print(f"   涉及用户数: {len(user_general_dirs)}")
        total_user_files = 0
        for user_id, general_subdir in user_general_dirs:
            files = list(general_subdir.rglob("*.*"))
            image_files = [f for f in files if f.suffix.lower() in ['.png', '.jpg', '.jpeg', '.webp', '.gif']]
            total_user_files += len(image_files)
            if len(image_files) > 0:
                print(f"   用户 {user_id}: {len(image_files)} 个图片文件")
        print(f"   总计: {total_user_files} 个图片文件")
        print()
    
    # 3. 提取所有 general 目录下的图片路径
    print("3. 需要检查的图片路径示例:")
    if general_dir.exists():
        sample_files = list(general_dir.rglob("*.*"))[:5]
        for f in sample_files:
            relative_path = f.relative_to(uploads_dir)
            print(f"   {relative_path}")
    print()
    
    print("=" * 60)
    print("分析完成")
    print()
    print("下一步:")
    print("1. 运行 SQL 查询脚本检查数据库中的记录")
    print("2. 根据查询结果确定需要迁移的图片")
    print("3. 执行迁移脚本")
    print("=" * 60)

if __name__ == "__main__":
    analyze_general_images()
