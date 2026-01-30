#!/bin/bash
# 构建脚本：为 Electron 构建 PC 版本

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🖥️  开始构建 Electron 版本...${NC}"

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

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  警告: node_modules 目录不存在，正在安装依赖...${NC}"
    npm install
fi

# 检查 Electron（仅提示；electron:pack 前需 npm install）
if [ ! -d "node_modules/electron" ]; then
    echo -e "${YELLOW}⚠️  提示: Electron 未安装。${NC}"
    echo -e "${YELLOW}   如果遇到网络超时，请使用镜像源：${NC}"
    echo -e "${YELLOW}   ELECTRON_MIRROR=\"https://npmmirror.com/mirrors/electron/\" npm install${NC}"
    echo -e "${YELLOW}   或查看: ELECTRON_INSTALL_TROUBLESHOOTING.md${NC}"
fi

# 检查 electron 目录
if [ ! -d "electron" ]; then
    echo -e "${RED}❌ 错误: electron 目录不存在，请先创建 Electron 主进程文件${NC}"
    exit 1
fi

if [ ! -f "electron/main.cjs" ]; then
    echo -e "${RED}❌ 错误: electron/main.cjs 不存在，请先创建主进程文件${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"
echo ""

# 1. 构建 Web 版本
echo -e "${BLUE}📦 步骤 1/2: 构建 Web 版本...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ 错误: Web 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Web 构建完成${NC}"
echo ""

# 2. 检查构建产物
echo -e "${BLUE}📱 步骤 2/2: 检查构建产物...${NC}"
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ 错误: dist/index.html 不存在，构建失败${NC}"
    echo -e "${YELLOW}提示: 请确保 vite.config.ts 中配置了 index.html 作为构建入口${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 找到 index.html${NC}"

if [ ! -d "dist/assets" ]; then
    echo -e "${YELLOW}⚠️  警告: dist/assets 目录不存在，资源文件可能缺失${NC}"
fi
echo ""

# 完成
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Electron 构建完成！${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}🖥️  下一步操作:${NC}"
echo -e "   1. 开发模式: ${YELLOW}npm run electron:dev${NC}"
echo -e "   2. 打包应用: ${YELLOW}npm run electron:pack${NC}"
echo ""
