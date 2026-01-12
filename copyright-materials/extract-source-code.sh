#!/bin/bash
# extract-source-code.sh - 提取源代码并生成文档

# 检查参数
if [ $# -lt 1 ]; then
    echo "用法: $0 <产品名称>"
    echo "产品名称: main-client, admin-platform, mentis, education-edition"
    exit 1
fi

PRODUCT="$1"
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$BASE_DIR/copyright-materials/$PRODUCT"
OUTPUT_FILE="$OUTPUT_DIR/源代码提取.md"

# 检查产品目录
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "错误: 产品目录不存在: $OUTPUT_DIR"
    exit 1
fi

# 创建输出文件
cat > "$OUTPUT_FILE" << 'EOF'
# 源代码文档

本文档包含代表性源代码，用于软件著作权申请。

**说明**：
- 本文档为Markdown格式，需要转换为Word格式
- 转换时需要设置为等宽字体（Courier New）
- 每页需要不少于50行代码
- 敏感信息已使用占位符替代

---

EOF

# 提取函数
extract_with_header() {
    local file="$1"
    local desc="$2"
    local full_path="$BASE_DIR/$file"
    
    if [ -f "$full_path" ]; then
        echo "提取: $file" >&2
        cat >> "$OUTPUT_FILE" << EOF
## 文件：$file

**功能说明**：$desc

**文件路径**：$file

\`\`\`$(echo "$file" | grep -oE '\.(java|ts|tsx|js|jsx)$' | cut -d. -f2 || echo "text")
EOF
        cat "$full_path" >> "$OUTPUT_FILE"
        cat >> "$OUTPUT_FILE" << 'EOF'
```
---

EOF
    else
        echo "警告: 文件不存在: $full_path" >&2
    fi
}

# 根据产品提取文件
case "$PRODUCT" in
    main-client)
        echo "提取主客户端源代码..." >&2
        extract_with_header "frontend/src/pages/ChatPage.tsx" "AI对话页面组件"
        extract_with_header "frontend/src/services/api/chat.ts" "对话API服务"
        # 可以继续添加更多文件
        ;;
    admin-platform)
        echo "提取管理平台源代码..." >&2
        extract_with_header "admin/frontend/src/pages/edu/StudentManagePage.tsx" "学生管理页面"
        # 可以继续添加更多文件
        ;;
    mentis)
        echo "提取Mentis源代码..." >&2
        extract_with_header "mentis/frontend/src/pages/MentisPage.tsx" "Mentis主页面"
        extract_with_header "mentis/backend/src/main/java/com/heartsphere/mentis/ai/service/AIServiceImpl.java" "AI服务实现"
        # 可以继续添加更多文件
        ;;
    education-edition)
        echo "提取教育版源代码..." >&2
        extract_with_header "frontend-edu/src/pages/student/AIChatPage.tsx" "学生AI对话页面"
        # 可以继续添加更多文件
        ;;
    *)
        echo "错误: 未知产品名称: $PRODUCT" >&2
        echo "支持的产品: main-client, admin-platform, mentis, education-edition" >&2
        exit 1
        ;;
esac

echo "" >> "$OUTPUT_FILE"
echo "**提取完成**" >> "$OUTPUT_FILE"
echo "" >> "$OUTPUT_FILE"
echo "**下一步**：" >> "$OUTPUT_FILE"
echo "1. 检查提取的源代码" >> "$OUTPUT_FILE"
echo "2. 去除敏感信息" >> "$OUTPUT_FILE"
echo "3. 转换为Word格式" >> "$OUTPUT_FILE"
echo "4. 调整格式，确保每页不少于50行代码" >> "$OUTPUT_FILE"

echo ""
echo "提取完成: $OUTPUT_FILE"
echo ""
echo "注意："
echo "1. 请检查提取的源代码文件"
echo "2. 去除敏感信息（API密钥、密码等）"
echo "3. 参考'源代码文档说明.md'添加更多文件"
echo "4. 转换为Word格式后调整格式"
