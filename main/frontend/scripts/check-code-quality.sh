#!/bin/bash

# 代码质量检查脚本
# Phase 5: 代码质量检查

echo "🔍 开始代码质量检查..."
echo ""

cd "$(dirname "$0")/.." || exit 1

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查结果
ERRORS=0
WARNINGS=0

# 1. 检查TypeScript类型错误
echo "📝 1. TypeScript类型检查..."
if command -v npx &> /dev/null; then
    if npx tsc --noEmit --skipLibCheck 2>&1 | tee /tmp/tsc-errors.log | grep -q "error"; then
        echo -e "${RED}❌ TypeScript类型错误发现${NC}"
        ERRORS=$((ERRORS + 1))
        echo "错误详情:"
        grep "error TS" /tmp/tsc-errors.log | head -10
    else
        echo -e "${GREEN}✅ TypeScript类型检查通过${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  TypeScript未安装，跳过类型检查${NC}"
fi
echo ""

# 2. 检查ESLint错误（如果配置了）
echo "📝 2. ESLint检查..."
if [ -f "package.json" ] && grep -q "eslint" package.json; then
    if command -v npx &> /dev/null; then
        if npx eslint . --ext .ts,.tsx 2>&1 | tee /tmp/eslint-errors.log | grep -q "error"; then
            echo -e "${RED}❌ ESLint错误发现${NC}"
            ERRORS=$((ERRORS + 1))
            echo "错误详情:"
            grep "error" /tmp/eslint-errors.log | head -10
        else
            echo -e "${GREEN}✅ ESLint检查通过${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  ESLint未安装，跳过检查${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  ESLint未配置，跳过检查${NC}"
fi
echo ""

# 3. 检查未使用的导入
echo "📝 3. 检查未使用的导入..."
UNUSED_IMPORTS=$(find mobile -name "*.tsx" -o -name "*.ts" | xargs grep -l "import.*from" | head -5)
if [ -n "$UNUSED_IMPORTS" ]; then
    echo -e "${YELLOW}⚠️  发现可能未使用的导入（需要手动检查）${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现明显的未使用导入${NC}"
fi
echo ""

# 4. 检查any类型使用
echo "📝 4. 检查any类型使用..."
ANY_COUNT=$(grep -r ":\s*any\|as any" mobile --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
if [ "$ANY_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $ANY_COUNT 处any类型使用${NC}"
    echo "建议替换为明确的类型定义"
    grep -r ":\s*any\|as any" mobile --include="*.ts" --include="*.tsx" | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现any类型使用${NC}"
fi
echo ""

# 5. 检查console.log使用
echo "📝 5. 检查console.log使用..."
CONSOLE_COUNT=$(grep -r "console\.log\|console\.warn\|console\.error" mobile --include="*.ts" --include="*.tsx" | grep -v "//.*console" | wc -l | tr -d ' ')
if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $CONSOLE_COUNT 处console使用${NC}"
    echo "建议使用logger替代console"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现console使用${NC}"
fi
echo ""

# 6. 检查TODO和FIXME注释
echo "📝 6. 检查TODO和FIXME注释..."
TODO_COUNT=$(grep -r "TODO\|FIXME" mobile --include="*.ts" --include="*.tsx" | wc -l | tr -d ' ')
if [ "$TODO_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  发现 $TODO_COUNT 处TODO/FIXME注释${NC}"
    grep -r "TODO\|FIXME" mobile --include="*.ts" --include="*.tsx" | head -5
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现TODO/FIXME注释${NC}"
fi
echo ""

# 7. 检查代码注释覆盖率
echo "📝 7. 检查代码注释..."
COMPONENT_COUNT=$(find mobile/components mobile/screens -name "*.tsx" | wc -l | tr -d ' ')
COMMENTED_COUNT=$(find mobile/components mobile/screens -name "*.tsx" -exec grep -l "/\*\*" {} \; | wc -l | tr -d ' ')
if [ "$COMPONENT_COUNT" -gt 0 ]; then
    COMMENT_RATE=$((COMMENTED_COUNT * 100 / COMPONENT_COUNT))
    echo "组件注释覆盖率: $COMMENT_RATE% ($COMMENTED_COUNT/$COMPONENT_COUNT)"
    if [ "$COMMENT_RATE" -lt 80 ]; then
        echo -e "${YELLOW}⚠️  注释覆盖率低于80%${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✅ 注释覆盖率达标${NC}"
    fi
fi
echo ""

# 8. 检查文件大小
echo "📝 8. 检查文件大小..."
LARGE_FILES=$(find mobile -name "*.tsx" -o -name "*.ts" | xargs wc -l | awk '$1 > 500 {print $2}' | head -5)
if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  发现大文件（>500行）${NC}"
    echo "$LARGE_FILES"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ 未发现超大文件${NC}"
fi
echo ""

# 总结
echo "========================================="
echo "📊 代码质量检查总结"
echo "========================================="
echo -e "错误数量: ${RED}$ERRORS${NC}"
echo -e "警告数量: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✅ 代码质量检查通过！${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  代码质量检查通过，但有警告需要关注${NC}"
    exit 0
else
    echo -e "${RED}❌ 代码质量检查失败，发现错误${NC}"
    exit 1
fi
