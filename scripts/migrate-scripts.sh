#!/bin/bash
# 脚本重组迁移脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

echo "=== 开始脚本重组 ==="
echo ""

# 创建备份
BACKUP_DIR="scripts/.backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "📦 创建备份: $BACKUP_DIR"

# 备份 scripts-config.yml
if [ -f "admin/backend/src/main/resources/scripts/scripts-config.yml" ]; then
    cp "admin/backend/src/main/resources/scripts/scripts-config.yml" "$BACKUP_DIR/scripts-config.yml.backup"
    echo "  ✅ 备份 scripts-config.yml"
fi

# 移动 start-*.sh 到 scripts/start/
echo ""
echo "【移动启动脚本】"
for script in scripts/start-*.sh; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        cp "$script" "$BACKUP_DIR/"
        mv "$script" "scripts/start/$filename"
        echo "  ✅ $filename -> scripts/start/"
    fi
done

# 移动 stop-*.sh 到 scripts/stop/
echo ""
echo "【移动停止脚本】"
for script in scripts/stop-*.sh; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        cp "$script" "$BACKUP_DIR/"
        mv "$script" "scripts/stop/$filename"
        echo "  ✅ $filename -> scripts/stop/"
    fi
done

# 移动迁移脚本到 scripts/migrate/
echo ""
echo "【移动迁移脚本】"
for script in scripts/execute*.sh scripts/*migration*.sh; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        cp "$script" "$BACKUP_DIR/"
        mv "$script" "scripts/migrate/$filename"
        echo "  ✅ $filename -> scripts/migrate/"
    fi
done

# 移动验证脚本到 scripts/verify/
echo ""
echo "【移动验证脚本】"
for script in scripts/verify*.sh; do
    if [ -f "$script" ]; then
        filename=$(basename "$script")
        cp "$script" "$BACKUP_DIR/"
        mv "$script" "scripts/verify/$filename"
        echo "  ✅ $filename -> scripts/verify/"
    fi
done

# 更新脚本中的路径引用
echo ""
echo "【更新脚本路径引用】"
find scripts/start scripts/stop scripts/migrate scripts/verify -type f -name "*.sh" | while read script; do
    # 更新 $SCRIPT_DIR/utils/port-utils.sh 引用
    if grep -q '\$SCRIPT_DIR/utils/port-utils.sh' "$script" 2>/dev/null; then
        # 计算相对路径
        rel_path=$(python3 -c "import os; print(os.path.relpath('scripts/utils/port-utils.sh', os.path.dirname('$script')))" 2>/dev/null || echo "../../utils/port-utils.sh")
        sed -i.bak "s|\$SCRIPT_DIR/utils/port-utils.sh|$rel_path|g" "$script" 2>/dev/null || true
        rm -f "${script}.bak" 2>/dev/null || true
        echo "  ✅ 更新 $script 中的路径引用"
    fi
done

echo ""
echo "=== 脚本重组完成 ==="
echo "📦 备份位置: $BACKUP_DIR"
