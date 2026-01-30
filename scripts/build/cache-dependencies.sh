#!/bin/bash
# 依赖缓存脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/common.sh"

DEPS_CACHE_DIR="$PROJECT_ROOT/.deps-cache"
MAVEN_REPO="${HOME}/.m2/repository"
NPM_CACHE="${HOME}/.npm"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}缓存项目依赖${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 创建依赖缓存目录
mkdir -p "$DEPS_CACHE_DIR"

# 缓存 Maven 依赖
echo -e "${YELLOW}[1/2] 缓存 Maven 依赖...${NC}"
if [ -d "$MAVEN_REPO" ]; then
    echo -e "${BLUE}Maven 本地仓库: $MAVEN_REPO${NC}"
    
    # 计算 Maven 仓库大小
    maven_size=$(du -sh "$MAVEN_REPO" 2>/dev/null | cut -f1)
    echo -e "${GREEN}Maven 仓库大小: $maven_size${NC}"
    
    # 创建 Maven 依赖清单
    maven_list="$DEPS_CACHE_DIR/maven-dependencies.txt"
    echo "Maven 依赖清单 (生成时间: $(date))" > "$maven_list"
    echo "========================================" >> "$maven_list"
    
    # 列出所有依赖（简化版）
    find "$MAVEN_REPO" -name "*.jar" -type f 2>/dev/null | head -100 >> "$maven_list" || true
    
    echo -e "${GREEN}✓ Maven 依赖信息已保存到: $maven_list${NC}"
else
    echo -e "${YELLOW}⚠ Maven 本地仓库不存在${NC}"
fi

# 缓存 npm 依赖
echo ""
echo -e "${YELLOW}[2/2] 缓存 npm 依赖...${NC}"
if [ -d "$NPM_CACHE" ]; then
    echo -e "${BLUE}npm 缓存目录: $NPM_CACHE${NC}"
    
    # 计算 npm 缓存大小
    npm_size=$(du -sh "$NPM_CACHE" 2>/dev/null | cut -f1)
    echo -e "${GREEN}npm 缓存大小: $npm_size${NC}"
    
    # 创建 npm 依赖清单
    npm_list="$DEPS_CACHE_DIR/npm-dependencies.txt"
    echo "npm 依赖清单 (生成时间: $(date))" > "$npm_list"
    echo "========================================" >> "$npm_list"
    
    # 列出所有依赖（简化版）
    find "$NPM_CACHE" -name "package.json" -type f 2>/dev/null | head -100 >> "$npm_list" || true
    
    echo -e "${GREEN}✓ npm 依赖信息已保存到: $npm_list${NC}"
else
    echo -e "${YELLOW}⚠ npm 缓存目录不存在${NC}"
fi

# 创建依赖缓存信息
cache_info="$DEPS_CACHE_DIR/.cache-info"
echo "cache-date=$(date)" > "$cache_info"
echo "cache-timestamp=$(date +%s)" >> "$cache_info"
echo "maven-repo=$MAVEN_REPO" >> "$cache_info"
echo "npm-cache=$NPM_CACHE" >> "$cache_info"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}依赖缓存完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}依赖缓存目录: $DEPS_CACHE_DIR${NC}"
echo -e "${BLUE}使用说明:${NC}"
echo -e "${BLUE}  - Maven 依赖已缓存在本地仓库: $MAVEN_REPO${NC}"
echo -e "${BLUE}  - npm 依赖已缓存在: $NPM_CACHE${NC}"
echo -e "${BLUE}  - 依赖清单已保存到: $DEPS_CACHE_DIR${NC}"
