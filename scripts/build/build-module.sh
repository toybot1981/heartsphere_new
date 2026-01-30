#!/bin/bash
# 单模块构建脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

if [ $# -eq 0 ]; then
    echo "用法: $0 <module-name>"
    echo "示例: $0 main"
    exit 1
fi

module=$1

echo -e "${GREEN}构建模块: $module${NC}"

# 检查依赖
if ! check_dependencies; then
    echo -e "${RED}请先安装缺失的依赖${NC}"
    exit 1
fi

# 构建模块
if ! build_module "$module"; then
    echo -e "${RED}模块构建失败: $module${NC}"
    exit 1
fi

echo -e "${GREEN}模块构建成功: $module${NC}"
