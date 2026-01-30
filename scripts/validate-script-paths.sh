#!/bin/bash
# 验证脚本路径和依赖关系

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ERRORS=0
WARNINGS=0

echo "=== 脚本路径验证 ==="
echo ""

# 检查 scripts-config.yml 中的所有脚本路径
CONFIG_FILE="$PROJECT_ROOT/admin/backend/src/main/resources/scripts/scripts-config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ 错误: 找不到配置文件 $CONFIG_FILE"
    exit 1
fi

echo "【验证 scripts-config.yml 中的脚本路径】"
while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*script:[[:space:]]*(.+) ]]; then
        script_path="${BASH_REMATCH[1]}"
        # 移除引号
        script_path=$(echo "$script_path" | sed "s/^['\"]//;s/['\"]$//")
        
        # 如果是相对路径，从项目根目录解析
        if [[ "$script_path" != /* ]]; then
            full_path="$PROJECT_ROOT/$script_path"
        else
            full_path="$script_path"
        fi
        
        if [ ! -f "$full_path" ]; then
            echo "  ❌ 脚本不存在: $script_path (完整路径: $full_path)"
            ERRORS=$((ERRORS + 1))
        elif [ ! -x "$full_path" ]; then
            echo "  ⚠️  脚本不可执行: $script_path"
            WARNINGS=$((WARNINGS + 1))
        else
            echo "  ✅ $script_path"
        fi
    fi
done < "$CONFIG_FILE"

echo ""
echo "【验证脚本依赖关系】"
find "$PROJECT_ROOT/scripts" -type f \( -name "*.sh" -o -name "*.py" \) | while read script; do
    rel_path="${script#$PROJECT_ROOT/}"
    
    # 检查 source, . , bash, sh 调用
    grep -E "^(source|\. |bash |sh )" "$script" 2>/dev/null | while IFS= read -r line; do
        # 提取路径（简化处理）
        dep_path=$(echo "$line" | sed -E 's/^(source|\.|bash|sh)[[:space:]]+["'\'']?([^"'\''[:space:]]+)["'\'']?.*/\2/' | head -1)
        
        # 跳过空路径、系统命令和绝对路径
        if [ -z "$dep_path" ] || [[ "$dep_path" == /* ]] || [[ "$dep_path" == http* ]] || [[ "$dep_path" == \$* ]]; then
            continue
        fi
        
        # 解析相对路径
        script_dir=$(dirname "$rel_path")
        if echo "$dep_path" | grep -qE "^\./|^\.\./"; then
            # 相对路径，从脚本目录解析
            resolved=$(cd "$PROJECT_ROOT/$script_dir" && realpath -m "$dep_path" 2>/dev/null || echo "")
        else
            # 假设从项目根目录
            resolved="$PROJECT_ROOT/$dep_path"
        fi
        
        if [ -n "$resolved" ] && [ ! -f "$resolved" ]; then
            echo "  ⚠️  $rel_path 引用的依赖不存在: $dep_path"
            WARNINGS=$((WARNINGS + 1))
        fi
    done
done

echo ""
echo "=== 验证完成 ==="
echo "错误: $ERRORS"
echo "警告: $WARNINGS"

if [ $ERRORS -gt 0 ]; then
    exit 1
fi

exit 0
