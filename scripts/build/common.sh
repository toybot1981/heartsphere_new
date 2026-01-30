#!/bin/bash
# 构建系统公共函数库

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# 加载配置文件
load_config() {
    local config_file="$SCRIPT_DIR/$1"
    if [ -f "$config_file" ]; then
        echo "$config_file"
    else
        echo ""
    fi
}

# 检查依赖
check_dependencies() {
    local missing_deps=()
    
    # 检查 Java
    if ! command -v java &> /dev/null; then
        missing_deps+=("Java")
    fi
    
    # 检查 Maven
    if ! command -v mvn &> /dev/null; then
        missing_deps+=("Maven")
    fi
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("Node.js")
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        echo -e "${RED}错误: 缺少以下依赖: ${missing_deps[*]}${NC}"
        return 1
    fi
    
    return 0
}

# 检查模块缓存
is_cached() {
    local module=$1
    local cache_dir="$PROJECT_ROOT/.build-cache/$module"
    
    if [ ! -d "$cache_dir" ]; then
        return 1
    fi
    
    # 检查缓存是否过期（简单实现，基于文件时间戳）
    local cache_file="$cache_dir/.cache-info"
    if [ -f "$cache_file" ]; then
        local cache_time=$(stat -f "%m" "$cache_file" 2>/dev/null || stat -c "%Y" "$cache_file" 2>/dev/null)
        local now=$(date +%s)
        local age=$((now - cache_time))
        local ttl=604800  # 7 days in seconds
        
        if [ $age -lt $ttl ]; then
            return 0
        fi
    fi
    
    return 1
}

# 更新缓存
update_cache() {
    local module=$1
    local cache_dir="$PROJECT_ROOT/.build-cache/$module"
    mkdir -p "$cache_dir"
    
    # 创建缓存信息文件
    echo "module=$module" > "$cache_dir/.cache-info"
    echo "timestamp=$(date +%s)" >> "$cache_dir/.cache-info"
    echo "date=$(date)" >> "$cache_dir/.cache-info"
}

# 构建模块
build_module() {
    local module=$1
    local module_path="$PROJECT_ROOT/$module"
    
    echo -e "${BLUE}构建模块: $module${NC}"
    
    # 检查缓存
    if is_cached "$module"; then
        echo -e "${GREEN}使用缓存: $module${NC}"
        return 0
    fi
    
    # 进入模块目录
    if [ ! -d "$module_path" ]; then
        echo -e "${RED}错误: 模块目录不存在: $module_path${NC}"
        return 1
    fi
    
    cd "$module_path" || return 1
    
    # 尝试不同的构建方式
    if [ -f "backend/build-fast.sh" ]; then
        echo -e "${YELLOW}使用 build-fast.sh 构建${NC}"
        cd backend && ./build-fast.sh dev
    elif [ -f "backend/pom.xml" ]; then
        echo -e "${YELLOW}使用 Maven 构建${NC}"
        cd backend && mvn clean package -DskipTests
    elif [ -f "pom.xml" ]; then
        echo -e "${YELLOW}使用 Maven 构建${NC}"
        mvn clean package -DskipTests
    elif [ -f "package.json" ]; then
        echo -e "${YELLOW}使用 npm 构建${NC}"
        npm run build
    else
        echo -e "${RED}错误: 未找到构建配置文件${NC}"
        return 1
    fi
    
    local build_result=$?
    
    if [ $build_result -eq 0 ]; then
        # 更新缓存
        update_cache "$module"
        echo -e "${GREEN}构建成功: $module${NC}"
    else
        echo -e "${RED}构建失败: $module${NC}"
    fi
    
    return $build_result
}
