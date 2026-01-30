#!/bin/bash
# 分析脚本依赖关系

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== 脚本依赖关系分析 ==="
echo ""

# 查找所有脚本
find "$PROJECT_ROOT/scripts" -type f \( -name "*.sh" -o -name "*.py" \) | while read script; do
    rel_path="${script#$PROJECT_ROOT/}"
    echo "=== $rel_path ==="
    
    # 查找 source, . , bash, sh 调用
    deps=$(grep -E "^(source|\. |bash |sh )" "$script" 2>/dev/null | sed 's/^[[:space:]]*//' | head -10 || true)
    
    if [ -n "$deps" ]; then
        echo "$deps" | while read line; do
            # 提取路径
            path=$(echo "$line" | sed -E 's/^(source|\.|bash|sh)[[:space:]]+["'\'']?([^"'\''[:space:]]+)["'\'']?.*/\2/' | head -1)
            if [ -n "$path" ] && [[ "$path" != /* ]] && [[ "$path" != "http"* ]]; then
                echo "  -> $path"
            fi
        done
    else
        echo "  (无依赖)"
    fi
    echo ""
done

echo "=== 分析完成 ==="
