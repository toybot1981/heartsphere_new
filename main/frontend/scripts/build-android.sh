#!/bin/bash
# 构建脚本：为 Android 构建 Mobile 版本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔨 开始构建 Android 版本...${NC}"

# 进入前端目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_DIR"

# 环境检查
echo -e "${BLUE}🔍 检查构建环境...${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 Node.js，请先安装 Node.js${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js 版本: $NODE_VERSION${NC}"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 npm，请先安装 npm${NC}"
    exit 1
fi
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ npm 版本: $NPM_VERSION${NC}"

# 检查 Capacitor CLI
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 npx，请先安装 npm${NC}"
    exit 1
fi

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  警告: node_modules 目录不存在，正在安装依赖...${NC}"
    npm install
fi

# 检查 Capacitor
if [ ! -d "node_modules/@capacitor/cli" ]; then
    echo -e "${YELLOW}⚠️  警告: Capacitor CLI 未安装，正在安装...${NC}"
    npm install @capacitor/cli @capacitor/core @capacitor/android --save
fi

# 检查 Android 目录
if [ ! -d "android" ]; then
    echo -e "${RED}❌ 错误: android 目录不存在，请先运行 'npx cap add android'${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"
echo ""

# 1. 构建 Web 版本
echo -e "${BLUE}📦 步骤 1/5: 构建 Web 版本...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ 错误: Web 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Web 构建完成${NC}"
echo ""

# 2. 检查 mobile.html 是否存在
echo -e "${BLUE}📱 步骤 2/5: 检查构建产物...${NC}"
if [ ! -f "dist/mobile.html" ]; then
    echo -e "${RED}❌ 错误: dist/mobile.html 不存在，构建失败${NC}"
    echo -e "${YELLOW}提示: 请确保 vite.config.ts 中配置了 mobile.html 作为构建入口${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 找到 mobile.html${NC}"

if [ ! -d "dist/assets" ]; then
    echo -e "${YELLOW}⚠️  警告: dist/assets 目录不存在，资源文件可能缺失${NC}"
fi
echo ""

# 3. 备份原始的 index.html（如果存在）
echo -e "${BLUE}💾 步骤 3/5: 准备 Android 构建...${NC}"
INDEX_BACKUP_EXISTS=false
if [ -f "dist/index.html" ]; then
    echo -e "${YELLOW}备份原始的 index.html...${NC}"
    cp dist/index.html dist/index.html.backup
    INDEX_BACKUP_EXISTS=true
    echo -e "${GREEN}✅ 备份完成${NC}"
else
    echo -e "${YELLOW}未找到 index.html，无需备份${NC}"
fi

# 4. 将 mobile.html 复制为 index.html（供 Android 使用）
echo -e "${YELLOW}将 mobile.html 复制为 index.html（Android 专用）...${NC}"
cp dist/mobile.html dist/index.html
echo -e "${GREEN}✅ 复制完成${NC}"
echo ""

# 5. 同步到 Android
echo -e "${BLUE}🔄 步骤 4/5: 同步到 Android 项目...${NC}"
if ! npx cap sync android; then
    echo -e "${RED}❌ 错误: Android 同步失败${NC}"
    # 清理：恢复原始的 index.html
    if [ "$INDEX_BACKUP_EXISTS" = true ] && [ -f "dist/index.html.backup" ]; then
        echo -e "${YELLOW}清理: 恢复原始的 index.html...${NC}"
        mv dist/index.html.backup dist/index.html
    fi
    exit 1
fi
echo -e "${GREEN}✅ 同步完成${NC}"
echo ""

# 6. 恢复原始的 index.html（如果有备份）
echo -e "${BLUE}♻️  步骤 5/5: 清理临时文件...${NC}"
if [ "$INDEX_BACKUP_EXISTS" = true ] && [ -f "dist/index.html.backup" ]; then
    echo -e "${YELLOW}恢复原始的 index.html...${NC}"
    mv dist/index.html.backup dist/index.html
    echo -e "${GREEN}✅ 恢复完成${NC}"
fi
echo ""

# 完成
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Android 构建完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}📱 下一步操作:${NC}"
echo -e "   1. 打开 Android Studio: ${YELLOW}npm run cap:open:android${NC}"
echo -e "   2. 在 Android Studio 中选择设备并运行"
echo -e "   3. 或使用命令行运行: ${YELLOW}npm run cap:run:android${NC}"
echo ""
