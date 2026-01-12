#!/bin/bash
# HSMem Python API 测试脚本
# 使用 Python 测试脚本进行更详细的测试

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "HSMem Python API 测试"
echo "=========================================="
echo ""

# 检查 hsmem 目录
if [ ! -d "$PROJECT_ROOT/hsmem" ]; then
    echo "❌ 错误: hsmem 目录不存在"
    exit 1
fi

# 检查 Python 环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python3"
    exit 1
fi

# 检查 hsmem 服务是否运行
echo "检查 HSMem 服务状态..."
if ! curl -s -f "http://localhost:8000/health" > /dev/null 2>&1; then
    echo "⚠️  HSMem 服务未运行"
    echo ""
    echo "请先启动 HSMem 服务:"
    echo "  cd $PROJECT_ROOT/hsmem"
    echo "  python3 rest_api_server.py"
    echo ""
    read -p "是否现在启动服务? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT/hsmem"
        python3 rest_api_server.py &
        HSMEM_PID=$!
        echo "HSMem 服务已启动 (PID: $HSMEM_PID)"
        echo "等待服务启动..."
        sleep 5
    else
        exit 1
    fi
fi

# 运行 Python 测试脚本
echo ""
echo "运行 HSMem Python API 测试..."
echo ""

cd "$PROJECT_ROOT/hsmem"

if [ -f "test_rest_api.py" ]; then
    python3 test_rest_api.py
else
    echo "❌ 错误: test_rest_api.py 不存在"
    exit 1
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
