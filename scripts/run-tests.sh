#!/bin/bash

# 测试运行脚本
# 用于运行 enhance-main-project-ux 和 add-character-memory-tab 提案的测试

set -e

echo "=========================================="
echo "开始运行测试"
echo "=========================================="

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 检查 Node.js 和 npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: 未找到 Node.js${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}错误: 未找到 npm${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js 版本: $(node --version)"
echo -e "${GREEN}✓${NC} npm 版本: $(npm --version)"

# 进入前端目录
cd main/frontend

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}警告: node_modules 不存在，正在安装依赖...${NC}"
    npm install
fi

# 运行测试
echo ""
echo "=========================================="
echo "运行单元测试"
echo "=========================================="

if npm run test 2>&1 | tee test-results.log; then
    echo -e "${GREEN}✓${NC} 单元测试通过"
else
    echo -e "${RED}✗${NC} 单元测试失败，请查看 test-results.log"
    exit 1
fi

# 运行类型检查
echo ""
echo "=========================================="
echo "运行类型检查"
echo "=========================================="

if npm run check:types 2>&1 | tee type-check-results.log; then
    echo -e "${GREEN}✓${NC} 类型检查通过"
else
    echo -e "${YELLOW}⚠${NC} 类型检查有警告，请查看 type-check-results.log"
fi

# 运行代码质量检查
echo ""
echo "=========================================="
echo "运行代码质量检查"
echo "=========================================="

if npm run check:quality 2>&1 | tee quality-check-results.log; then
    echo -e "${GREEN}✓${NC} 代码质量检查通过"
else
    echo -e "${YELLOW}⚠${NC} 代码质量检查有警告，请查看 quality-check-results.log"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
echo ""
echo "测试结果文件："
echo "  - test-results.log: 单元测试结果"
echo "  - type-check-results.log: 类型检查结果"
echo "  - quality-check-results.log: 代码质量检查结果"
echo ""
echo "详细测试指南："
echo "  - docs/TESTING_GUIDE_ENHANCE_MAIN_PROJECT_UX.md"
echo "  - docs/TESTING_GUIDE_CHARACTER_MEMORY_TAB.md"
echo "  - docs/TESTING_CHECKLIST.md"
echo ""
