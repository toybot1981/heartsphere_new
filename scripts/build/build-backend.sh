#!/bin/bash
# 后端构建脚本
# 支持构建所有后端项目或指定模块

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
source "$SCRIPT_DIR/common.sh"

# 解析参数
MODULE="${1:-}"
SKIP_TESTS="${2:-false}"

# 处理空字符串的 module 参数（当用户选择"全部"时，可能传递空字符串）
if [ -z "$MODULE" ] || [ "$MODULE" = '""' ] || [ "$MODULE" = "''" ]; then
    MODULE=""
fi

# 处理 skipTests 参数（可能是布尔值字符串或数字）
SKIP_TESTS_FLAG=false
if [ "$SKIP_TESTS" = "true" ] || [ "$SKIP_TESTS" = "1" ] || [ "$SKIP_TESTS" = "True" ]; then
    SKIP_TESTS_FLAG=true
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端构建${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${CYAN}参数:${NC}"
echo -e "  模块: ${MODULE:-全部}"
echo -e "  跳过测试: $SKIP_TESTS_FLAG"
echo ""

# 检查依赖
if ! check_dependencies; then
    echo -e "${RED}请先安装缺失的依赖${NC}"
    exit 1
fi

# 后端模块列表
BACKEND_MODULES=("main" "admin" "mentis" "edu" "company")

# 构建 Maven 参数
MAVEN_ARGS="clean package"
if [ "$SKIP_TESTS_FLAG" = "true" ]; then
    MAVEN_ARGS="$MAVEN_ARGS -DskipTests"
    echo -e "${YELLOW}跳过测试${NC}"
fi

# 构建函数
build_backend_module() {
    local module=$1
    local module_path="$PROJECT_ROOT/$module/backend"
    
    if [ ! -d "$module_path" ]; then
        echo -e "${YELLOW}警告: 模块 $module 的后端目录不存在，跳过${NC}"
        return 0
    fi
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}构建后端模块: $module${NC}"
    echo -e "${BLUE}========================================${NC}"
    
    cd "$module_path" || {
        echo -e "${RED}错误: 无法进入目录 $module_path${NC}"
        return 1
    }
    
    # 检查是否有 pom.xml
    if [ ! -f "pom.xml" ]; then
        echo -e "${YELLOW}警告: $module/backend 没有 pom.xml，跳过${NC}"
        return 0
    fi
    
    # 执行 Maven 构建
    echo -e "${CYAN}执行: mvn $MAVEN_ARGS${NC}"
    if mvn $MAVEN_ARGS; then
        echo -e "${GREEN}✅ $module 后端构建成功${NC}"
        return 0
    else
        echo -e "${RED}❌ $module 后端构建失败${NC}"
        return 1
    fi
}

# 如果指定了模块，只构建该模块
if [ -n "$MODULE" ] && [ "$MODULE" != "" ]; then
    # 验证模块是否在后端模块列表中
    if [[ " ${BACKEND_MODULES[@]} " =~ " ${MODULE} " ]]; then
        if ! build_backend_module "$MODULE"; then
            exit 1
        fi
    else
        echo -e "${RED}错误: 未知的后端模块: $MODULE${NC}"
        echo -e "${YELLOW}可用的后端模块: ${BACKEND_MODULES[*]}${NC}"
        exit 1
    fi
else
    # 构建所有后端模块
    echo -e "${CYAN}构建所有后端模块${NC}"
    echo ""
    
    failed_modules=()
    for module in "${BACKEND_MODULES[@]}"; do
        if ! build_backend_module "$module"; then
            failed_modules+=("$module")
        fi
        echo ""
    done
    
    # 检查是否有失败的模块
    if [ ${#failed_modules[@]} -gt 0 ]; then
        echo -e "${RED}========================================${NC}"
        echo -e "${RED}以下模块构建失败:${NC}"
        for module in "${failed_modules[@]}"; do
            echo -e "${RED}  - $module${NC}"
        done
        echo -e "${RED}========================================${NC}"
        exit 1
    else
        echo -e "${GREEN}========================================${NC}"
        echo -e "${GREEN}所有后端模块构建成功${NC}"
        echo -e "${GREEN}========================================${NC}"
    fi
fi
