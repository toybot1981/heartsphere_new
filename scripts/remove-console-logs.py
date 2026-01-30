#!/usr/bin/env python3
"""
删除所有 console.log，但保留图片展示相关的日志
"""
import os
import re
import sys

# 图片展示相关的日志标签
IMAGE_LOG_PATTERNS = [
    r'\[ImageResolution\]',
    r'\[LazyImage\]',
    r'\[MobileLazyImage\]'
]

def should_keep_line(line):
    """检查是否应该保留这一行（包含图片展示日志）"""
    for pattern in IMAGE_LOG_PATTERNS:
        if re.search(pattern, line):
            return True
    return False

def process_file(filepath):
    """处理单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        modified = False
        new_lines = []
        
        for line in lines:
            # 如果包含 console.log
            if 'console.log' in line:
                # 检查是否应该保留（图片展示相关）
                if should_keep_line(line):
                    new_lines.append(line)
                else:
                    modified = True
                    # 删除这一行
                    continue
            else:
                new_lines.append(line)
        
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"✓ 已处理: {filepath}")
            return True
        return False
    except Exception as e:
        print(f"✗ 处理失败 {filepath}: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("用法: python remove-console-logs.py <目录>")
        sys.exit(1)
    
    root_dir = sys.argv[1]
    processed = 0
    
    for root, dirs, files in os.walk(root_dir):
        # 跳过 node_modules 和 e2e 目录
        dirs[:] = [d for d in dirs if d not in ['node_modules', 'e2e', '.git']]
        
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                filepath = os.path.join(root, file)
                if process_file(filepath):
                    processed += 1
    
    print(f"\n处理完成，共处理 {processed} 个文件")

if __name__ == '__main__':
    main()
