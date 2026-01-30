#!/bin/bash
# 全量构建脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}开始全量构建${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查依赖
if ! check_dependencies; then
    echo -e "${RED}请先安装缺失的依赖${NC}"
    exit 1
fi

# 读取配置（简化版，直接使用模块列表）
modules=("main" "admin" "mentis" "edu" "company" "frontend")

# 检查是否启用并行构建
PARALLEL=${PARALLEL:-false}
if [ "$PARALLEL" = "true" ]; then
    echo -e "${YELLOW}使用并行构建模式${NC}"
    # 简单的并行实现（使用后台任务）
    pids=()
    for module in "${modules[@]}"; do
        build_module "$module" &
        pids+=($!)
    done
    
    # 等待所有任务完成
    failed=0
    for pid in "${pids[@]}"; do
        if ! wait $pid; then
            failed=1
        fi
    done
    
    if [ $failed -eq 1 ]; then
        echo -e "${RED}部分模块构建失败${NC}"
        exit 1
    fi
else
    # 串行构建
    for module in "${modules[@]}"; do
        if ! build_module "$module"; then
            echo -e "${RED}构建失败，停止构建${NC}"
            exit 1
        fi
    done
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}全量构建完成${NC}"
echo -e "${GREEN}========================================${NC}"
