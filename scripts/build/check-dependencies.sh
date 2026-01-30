#!/bin/bash
# 依赖检查脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

echo -e "${BLUE}检查项目依赖...${NC}"
echo ""

missing_deps=()
warnings=()

# 检查 Java
if command -v java &> /dev/null; then
    java_version=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✓ Java: $java_version${NC}"
else
    missing_deps+=("Java 17+")
    echo -e "${RED}✗ Java: 未安装${NC}"
fi

# 检查 Maven
if command -v mvn &> /dev/null; then
    mvn_version=$(mvn -version | head -1)
    echo -e "${GREEN}✓ Maven: $mvn_version${NC}"
else
    missing_deps+=("Maven 3.9+")
    echo -e "${RED}✗ Maven: 未安装${NC}"
fi

# 检查 Node.js
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo -e "${GREEN}✓ Node.js: $node_version${NC}"
    
    # 检查版本
    node_major=$(echo "$node_version" | sed 's/v\([0-9]*\).*/\1/')
    if [ "$node_major" -lt 18 ]; then
        warnings+=("Node.js 版本应 >= 18，当前: $node_version")
    fi
else
    missing_deps+=("Node.js 18+")
    echo -e "${RED}✗ Node.js: 未安装${NC}"
fi

# 检查 npm
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo -e "${GREEN}✓ npm: $npm_version${NC}"
else
    missing_deps+=("npm")
    echo -e "${RED}✗ npm: 未安装${NC}"
fi

# 检查 Docker（可选）
if command -v docker &> /dev/null; then
    docker_version=$(docker --version)
    echo -e "${GREEN}✓ Docker: $docker_version${NC}"
else
    echo -e "${YELLOW}⚠ Docker: 未安装（可选）${NC}"
fi

echo ""

# 显示警告
if [ ${#warnings[@]} -gt 0 ]; then
    echo -e "${YELLOW}警告:${NC}"
    for warning in "${warnings[@]}"; do
        echo -e "${YELLOW}  - $warning${NC}"
    done
    echo ""
fi

# 显示缺失依赖
if [ ${#missing_deps[@]} -gt 0 ]; then
    echo -e "${RED}缺少以下依赖:${NC}"
    for dep in "${missing_deps[@]}"; do
        echo -e "${RED}  - $dep${NC}"
    done
    echo ""
    echo -e "${YELLOW}请安装缺失的依赖后重试${NC}"
    exit 1
fi

echo -e "${GREEN}所有依赖检查通过${NC}"
exit 0
