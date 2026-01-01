#!/bin/bash
# 检查 memory 包下的文件是否都在 Git 中

cd "$(dirname "$0")"

echo "=========================================="
echo "检查 memory 包文件 Git 状态"
echo "=========================================="
echo ""

# 检查本地文件
echo "【本地文件检查】"
LOCAL_FILES=$(find backend/src/main/java/com/heartsphere/memory -type f -name "*.java" ! -name "*.bak" 2>/dev/null | wc -l | tr -d ' ')
echo "  本地 Java 文件数: $LOCAL_FILES"

# 检查 Git 跟踪的文件
echo ""
echo "【Git 跟踪检查】"
GIT_FILES=$(git ls-files backend/src/main/java/com/heartsphere/memory/ 2>/dev/null | grep "\.java$" | grep -v "\.bak" | wc -l | tr -d ' ')
echo "  Git 跟踪的文件数: $GIT_FILES"

# 检查各个子目录
echo ""
echo "【各子目录检查】"
echo ""
echo "1. Controller:"
CONTROLLER_LOCAL=$(find backend/src/main/java/com/heartsphere/memory/controller -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
CONTROLLER_GIT=$(git ls-files backend/src/main/java/com/heartsphere/memory/controller/ 2>/dev/null | wc -l | tr -d ' ')
echo "  本地: $CONTROLLER_LOCAL 个文件"
echo "  Git: $CONTROLLER_GIT 个文件"

echo ""
echo "2. Service 接口:"
SERVICE_LOCAL=$(find backend/src/main/java/com/heartsphere/memory/service -maxdepth 1 -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
SERVICE_GIT=$(git ls-files backend/src/main/java/com/heartsphere/memory/service/*.java 2>/dev/null | wc -l | tr -d ' ')
echo "  本地: $SERVICE_LOCAL 个文件"
echo "  Git: $SERVICE_GIT 个文件"

echo ""
echo "3. Service 实现 (impl):"
IMPL_LOCAL=$(find backend/src/main/java/com/heartsphere/memory/service/impl -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
IMPL_GIT=$(git ls-files backend/src/main/java/com/heartsphere/memory/service/impl/ 2>/dev/null | wc -l | tr -d ' ')
echo "  本地: $IMPL_LOCAL 个文件"
echo "  Git: $IMPL_GIT 个文件"

echo ""
echo "4. Repository:"
REPO_LOCAL=$(find backend/src/main/java/com/heartsphere/memory/repository -name "*.java" ! -name "*.bak" 2>/dev/null | wc -l | tr -d ' ')
REPO_GIT=$(git ls-files backend/src/main/java/com/heartsphere/memory/repository/ 2>/dev/null | grep "\.java$" | grep -v "\.bak" | wc -l | tr -d ' ')
echo "  本地: $REPO_LOCAL 个文件"
echo "  Git: $REPO_GIT 个文件"

echo ""
echo "5. Entity:"
ENTITY_LOCAL=$(find backend/src/main/java/com/heartsphere/memory/entity -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
ENTITY_GIT=$(git ls-files backend/src/main/java/com/heartsphere/memory/entity/ 2>/dev/null | wc -l | tr -d ' ')
echo "  本地: $ENTITY_LOCAL 个文件"
echo "  Git: $ENTITY_GIT 个文件"

echo ""
echo "=========================================="
echo "【文件列表】"
echo "=========================================="
echo ""
echo "Service 实现类 (impl):"
find backend/src/main/java/com/heartsphere/memory/service/impl -name "*.java" 2>/dev/null | while read f; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
        echo "  ✓ $(basename $f)"
    else
        echo "  ✗ $(basename $f) (未跟踪)"
    fi
done

echo ""
echo "Repository 接口:"
find backend/src/main/java/com/heartsphere/memory/repository -name "*.java" ! -name "*.bak" 2>/dev/null | while read f; do
    if git ls-files --error-unmatch "$f" >/dev/null 2>&1; then
        echo "  ✓ $(basename $f)"
    else
        echo "  ✗ $(basename $f) (未跟踪)"
    fi
done
