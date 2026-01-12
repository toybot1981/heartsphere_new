#!/bin/bash
# convert-all.sh - 批量转换所有软件说明书为Word格式

# 设置工作目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 检查Pandoc是否安装
if ! command -v pandoc &> /dev/null; then
    echo "错误: Pandoc未安装"
    echo "请先安装Pandoc:"
    echo "  macOS: brew install pandoc"
    echo "  Linux: sudo apt-get install pandoc"
    echo "  或访问: https://pandoc.org/installing.html"
    exit 1
fi

# 转换函数
convert_doc() {
    local input="$1"
    local output="$2"
    local template="$3"
    
    if [ ! -f "$input" ]; then
        echo "警告: 文件不存在 $input"
        return 1
    fi
    
    echo "转换: $input -> $output"
    
    if [ -f "$template" ]; then
        pandoc "$input" -o "$output" \
            --reference-doc="$template" \
            --toc \
            --toc-depth=2 \
            --standalone \
            --wrap=none
    else
        echo "警告: 模板文件不存在 $template，使用默认格式"
        pandoc "$input" -o "$output" \
            --toc \
            --toc-depth=2 \
            --standalone \
            --wrap=none
    fi
    
    if [ $? -eq 0 ]; then
        echo "✓ 成功: $output"
    else
        echo "✗ 失败: $output"
        return 1
    fi
}

# 转换所有产品
echo "开始转换软件说明书..."
echo ""

convert_doc "main-client/软件说明书.md" "main-client/软件说明书.docx" "template.docx"
convert_doc "admin-platform/软件说明书.md" "admin-platform/软件说明书.docx" "template.docx"
convert_doc "mentis/软件说明书.md" "mentis/软件说明书.docx" "template.docx"
convert_doc "education-edition/软件说明书.md" "education-edition/软件说明书.docx" "template.docx"

echo ""
echo "转换完成！"
echo ""
echo "注意："
echo "1. 请检查生成的Word文档格式"
echo "2. 请添加页眉页脚（软件名称和页码）"
echo "3. 请添加架构图、流程图和功能截图"
echo "4. 请扩展内容至60页（前30页+后30页）"
