#!/bin/bash
# 代码统计脚本

cd "$(dirname "$0")"

echo "=========================================="
echo "HeartSphere 项目代码统计"
echo "=========================================="
echo ""

# 前端代码统计
echo "【前端代码统计】"
TS_FILES=$(find frontend -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null | wc -l | tr -d ' ')
TS_LINES=$(find frontend -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')

echo "  TypeScript/TSX 文件数: $TS_FILES"
echo "  TypeScript/TSX 代码行数: $TS_LINES"
echo ""

# 后端代码统计
echo "【后端代码统计】"
JAVA_FILES=$(find backend/src/main/java -type f -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
JAVA_LINES=$(find backend/src/main/java -type f -name "*.java" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')

echo "  Java 文件数: $JAVA_FILES"
echo "  Java 代码行数: $JAVA_LINES"
echo ""

# 部署脚本统计
echo "【部署脚本统计】"
SH_FILES=$(find deploy -type f -name "*.sh" 2>/dev/null | wc -l | tr -d ' ')
SH_LINES=$(find deploy -type f -name "*.sh" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')

echo "  Shell 脚本数: $SH_FILES"
echo "  Shell 脚本行数: $SH_LINES"
echo ""

# 文档统计
echo "【文档统计】"
MD_FILES=$(find docs -type f -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
MD_LINES=$(find docs -type f -name "*.md" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')

echo "  Markdown 文档数: $MD_FILES"
echo "  Markdown 文档行数: $MD_LINES"
echo ""

# 配置文件统计
echo "【配置文件统计】"
CONFIG_FILES=$(find . -type f \( -name "*.yml" -o -name "*.yaml" -o -name "*.properties" -o -name "*.json" \) ! -path "*/node_modules/*" ! -path "*/target/*" ! -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
CONFIG_LINES=$(find . -type f \( -name "*.yml" -o -name "*.yaml" -o -name "*.properties" -o -name "*.json" \) ! -path "*/node_modules/*" ! -path "*/target/*" ! -path "*/.git/*" -exec cat {} \; 2>/dev/null | wc -l | tr -d ' ')

echo "  配置文件数: $CONFIG_FILES"
echo "  配置文件行数: $CONFIG_LINES"
echo ""

# 总计
TOTAL_FILES=$((TS_FILES + JAVA_FILES + SH_FILES))
TOTAL_LINES=$((TS_LINES + JAVA_LINES + SH_LINES))

echo "=========================================="
echo "【总计】"
echo "  源代码文件数: $TOTAL_FILES"
echo "  源代码行数: $TOTAL_LINES"
echo "=========================================="
