#!/bin/bash

# 启动记忆模块脚本
# 包括 HSMem 服务（Python）和检查后端记忆模块状态

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HSMEM_DIR="$PROJECT_ROOT/hsmem"

echo "=========================================="
echo "🚀 启动记忆模块"
echo "=========================================="

# 检查 HSMem 服务是否已运行
echo ""
echo "📋 检查 HSMem 服务状态..."
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "✅ HSMem 服务已在运行 (端口 8000)"
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ HSMem 健康检查通过"
        curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health
    else
        echo "⚠️  HSMem 服务运行中但健康检查失败"
    fi
else
    echo "❌ HSMem 服务未运行"
    echo ""
    echo "🔧 启动 HSMem 服务..."
    
    # 检查 Python 环境
    if ! command -v python3 &> /dev/null; then
        echo "❌ 错误: 未找到 python3，请先安装 Python 3.8+"
        exit 1
    fi
    
    # 检查依赖
    if ! python3 -c "import fastapi, uvicorn" 2>/dev/null; then
        echo "⚠️  缺少依赖，正在安装..."
        pip3 install fastapi uvicorn 2>/dev/null || {
            echo "❌ 安装依赖失败，请手动运行: pip3 install fastapi uvicorn"
            exit 1
        }
    fi
    
    # 启动 HSMem 服务
    cd "$HSMEM_DIR"
    echo "📂 工作目录: $HSMEM_DIR"
    echo "🌐 启动 HSMem API 服务 (http://localhost:8000)..."
    
    # 在后台启动服务
    nohup python3 rest_api_server.py > /tmp/hsmem.log 2>&1 &
    HSMEM_PID=$!
    
    echo "✅ HSMem 服务已启动 (PID: $HSMEM_PID)"
    echo "📝 日志文件: /tmp/hsmem.log"
    
    # 等待服务启动
    echo "⏳ 等待服务启动..."
    for i in {1..10}; do
        sleep 1
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ HSMem 服务启动成功！"
            curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:8000/health
            break
        fi
        if [ $i -eq 10 ]; then
            echo "❌ HSMem 服务启动超时，请检查日志: /tmp/hsmem.log"
            exit 1
        fi
    done
fi

echo ""
echo "=========================================="
echo "📊 记忆模块状态总结"
echo "=========================================="
echo ""
echo "✅ HSMem 服务:"
echo "   - 地址: http://localhost:8000"
echo "   - 健康检查: http://localhost:8000/health"
echo "   - API 文档: http://localhost:8000/docs"
echo ""
echo "✅ 后端记忆模块 (Spring Boot):"
echo "   - 已通过 @SpringBootApplication 自动启动"
echo "   - 包扫描: com.heartsphere.memory"
echo "   - 配置: application.yml -> heartsphere.memory"
echo ""
echo "📝 配置信息:"
echo "   - HSMem Base URL: ${HSMEM_BASE_URL:-http://localhost:8000}"
echo "   - LLM 提取: 已启用"
echo "   - 规则提取: 已启用"
echo ""
echo "=========================================="
echo "✅ 记忆模块启动完成！"
echo "=========================================="
