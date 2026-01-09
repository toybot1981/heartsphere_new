#!/bin/bash

# HeartSphere 详细代码统计脚本
# 使用方法: ./code-stats-detailed.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  HeartSphere 项目详细代码统计${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""

BASE_DIR="/Users/admin/Workspace/heartsphere_new"

# 统计函数
count_files() {
    local dir=$1
    local pattern=$2
    find "$dir" -name "$pattern" -type f 2>/dev/null | wc -l | tr -d ' '
}

count_lines() {
    local dir=$1
    local pattern=$2
    find "$dir" -name "$pattern" -type f 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}'
}

echo -e "${BLUE}📊 总体统计${NC}"
echo "----------"
echo ""

# 后端Java代码
BACKEND_JAVA_FILES=$(count_files "$BASE_DIR/backend/src/main/java" "*.java")
BACKEND_JAVA_LINES=$(count_lines "$BASE_DIR/backend/src/main/java" "*.java")
echo -e "后端Java代码: ${GREEN}$BACKEND_JAVA_LINES${NC} 行 (${BACKEND_JAVA_FILES} 个文件)"

# 后端测试代码
BACKEND_TEST_FILES=$(count_files "$BASE_DIR/backend/src/test/java" "*.java")
BACKEND_TEST_LINES=$(count_lines "$BASE_DIR/backend/src/test/java" "*.java")
echo -e "后端测试代码: ${YELLOW}$BACKEND_TEST_LINES${NC} 行 (${BACKEND_TEST_FILES} 个文件)"

# 数据库迁移脚本
SQL_FILES=$(count_files "$BASE_DIR/backend/src/main/resources/db/migration" "*.sql")
SQL_LINES=$(count_lines "$BASE_DIR/backend/src/main/resources/db/migration" "*.sql")
echo -e "数据库迁移脚本: ${BLUE}$SQL_LINES${NC} 行 (${SQL_FILES} 个文件)"

# 前端代码
FRONTEND_TS_FILES=$(find "$BASE_DIR/frontend/src" -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l | tr -d ' ')
FRONTEND_TS_LINES=$(find "$BASE_DIR/frontend/src" -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
echo -e "前端TS/TSX代码: ${GREEN}$FRONTEND_TS_LINES${NC} 行 (${FRONTEND_TS_FILES} 个文件)"

# 前端测试
FRONTEND_TEST_LINES=$(find "$BASE_DIR/frontend/src" -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}')
FRONTEND_TEST_FILES=$(find "$BASE_DIR/frontend/src" -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo -e "前端测试代码: ${YELLOW}$FRONTEND_TEST_LINES${NC} 行 (${FRONTEND_TEST_FILES} 个文件)"

echo ""
echo -e "${BLUE}📈 代码量汇总${NC}"
echo "------------"
TOTAL_LINES=$((BACKEND_JAVA_LINES + BACKEND_TEST_LINES + SQL_LINES + FRONTEND_TS_LINES))
echo -e "总代码行数: ${GREEN}$TOTAL_LINES${NC} 行"
echo -e "总文件数: ${GREEN}$((BACKEND_JAVA_FILES + BACKEND_TEST_FILES + SQL_FILES + FRONTEND_TS_FILES))${NC} 个"

echo ""
echo -e "${BLUE}🎯 规模评估${NC}"
echo "----------"
if [ $TOTAL_LINES -gt 200000 ]; then
    echo -e "项目规模: ${RED}超大型项目${NC} (>20万行)"
elif [ $TOTAL_LINES -gt 100000 ]; then
    echo -e "项目规模: ${YELLOW}大型项目${NC} (10-20万行) ✅"
elif [ $TOTAL_LINES -gt 50000 ]; then
    echo -e "项目规模: ${GREEN}中型项目${NC} (5-10万行)"
else
    echo -e "项目规模: ${GREEN}小型项目${NC} (<5万行)"
fi

echo ""
echo -e "${BLUE}📚 最大的文件 (Top 10)${NC}"
echo "-------------------"
find "$BASE_DIR/backend/src/main/java" -name "*.java" -type f -exec sh -c 'echo "$(wc -l < "$1") $1"' _ {} \; | sort -rn | head -10 | while read lines file; do
    filename=$(basename "$file")
    echo -e "${YELLOW}$lines${NC} 行 - ${GREEN}$filename${NC}"
done

echo ""
echo -e "${BLUE}🧪 测试覆盖率${NC}"
echo "------------"
if [ -n "$BACKEND_TEST_LINES" ] && [ -n "$BACKEND_JAVA_LINES" ]; then
    COVERAGE=$((BACKEND_TEST_LINES * 100 / (BACKEND_JAVA_LINES + BACKEND_TEST_LINES)))
    echo -e "测试代码占比: ${YELLOW}$COVERAGE%${NC}"
    echo -e "测试文件数: ${GREEN}$BACKEND_TEST_FILES${NC} 个"
fi

echo ""
echo -e "${BLUE}📊 代码分布${NC}"
echo "----------"
echo "后端代码: $BACKEND_JAVA_LINES 行 ($((BACKEND_JAVA_LINES * 100 / TOTAL_LINES))%)"
echo "测试代码: $BACKEND_TEST_LINES 行 ($((BACKEND_TEST_LINES * 100 / TOTAL_LINES))%)"
echo "数据库脚本: $SQL_LINES 行 ($((SQL_LINES * 100 / TOTAL_LINES))%)"
echo "前端代码: $FRONTEND_TS_LINES 行 ($((FRONTEND_TS_LINES * 100 / TOTAL_LINES))%)"

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  统计完成！${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}💡 详细分析报告: CODE_STATS_REPORT.md${NC}"
echo -e "${YELLOW}💡 优化建议: MAVEN_OPTIMIZATION_GUIDE.md${NC}"
