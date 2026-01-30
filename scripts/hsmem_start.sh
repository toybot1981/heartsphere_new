#!/bin/bash

# HSMem 服务启动脚本
# 启动 HSMem REST API 服务器，并将日志输出到 hsmem.log

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取项目根目录（scripts 的父目录）
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HSMEM_DIR="$PROJECT_ROOT/hsmem"

# 切换到 hsmem 目录
cd "$HSMEM_DIR"

# 日志文件路径（放在 hsmem 目录下）
LOG_FILE="$HSMEM_DIR/hsmem.log"
PID_FILE="$HSMEM_DIR/hsmem.pid"

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}  HSMem REST API 服务器启动脚本${NC}"
echo -e "${BLUE}==================================================${NC}"
echo ""

# 检查 hsmem 目录是否存在
if [ ! -d "$HSMEM_DIR" ]; then
    echo -e "${RED}❌ 错误: hsmem 目录不存在: $HSMEM_DIR${NC}"
    exit 1
fi

# 检查 rest_api_server.py 是否存在
if [ ! -f "$HSMEM_DIR/rest_api_server.py" ]; then
    echo -e "${RED}❌ 错误: rest_api_server.py 不存在: $HSMEM_DIR/rest_api_server.py${NC}"
    exit 1
fi

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ 错误: 未找到 python3${NC}"
    exit 1
fi

# 检查是否已经在运行
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  服务已在运行 (PID: $OLD_PID)${NC}"
        echo -e "${YELLOW}   如需重启，请先运行: ./scripts/hsmem_stop.sh${NC}"
        exit 1
    else
        # PID 文件存在但进程不存在，删除旧的 PID 文件
        rm -f "$PID_FILE"
    fi
fi

# 检查依赖
echo -e "${BLUE}📦 检查依赖...${NC}"
python3 -c "import fastapi, uvicorn" 2>/dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  缺少依赖，正在安装...${NC}"
    pip3 install fastapi uvicorn -q
fi
echo -e "${GREEN}✅ 依赖检查完成${NC}"
echo ""

# 创建日志目录（如果需要）
LOG_DIR=$(dirname "$LOG_FILE")
if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
fi

# 启动服务器
echo -e "${BLUE}🚀 启动 HSMem API 服务器...${NC}"
echo -e "   ${BLUE}服务地址:${NC} http://localhost:8000"
echo -e "   ${BLUE}API 文档:${NC} http://localhost:8000/docs"
echo -e "   ${BLUE}健康检查:${NC} http://localhost:8000/health"
echo -e "   ${BLUE}日志文件:${NC} $LOG_FILE"
echo ""

# 在后台启动服务器（在 hsmem 目录下运行）
nohup python3 "$HSMEM_DIR/rest_api_server.py" >> "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# 保存 PID
echo $SERVER_PID > "$PID_FILE"

# 等待服务器启动
echo -e "${BLUE}⏳ 等待服务器启动...${NC}"
sleep 3

# 检查服务器状态
if ps -p $SERVER_PID > /dev/null 2>&1; then
    # 检查健康检查端点
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ HSMem API 服务器启动成功！${NC}"
        echo -e "${GREEN}   PID: $SERVER_PID${NC}"
        echo ""
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}📋 日志文件位置和查看方法${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${GREEN}   日志文件:${NC} $LOG_FILE"
        echo ""
        echo -e "${BLUE}   常用查看日志命令:${NC}"
        echo -e "   ${YELLOW}1. 实时查看日志（推荐）:${NC}"
        echo -e "      ${GREEN}tail -f $LOG_FILE${NC}"
        echo ""
        echo -e "   ${YELLOW}2. 查看最后 N 行:${NC}"
        echo -e "      ${GREEN}tail -n 100 $LOG_FILE${NC}"
        echo ""
        echo -e "   ${YELLOW}3. 查看访问日志:${NC}"
        echo -e "      ${GREEN}grep \"uvicorn.access\" $LOG_FILE${NC}"
        echo ""
        echo -e "   ${YELLOW}4. 查看错误日志:${NC}"
        echo -e "      ${GREEN}grep \"ERROR\" $LOG_FILE${NC}"
        echo ""
        echo -e "   ${YELLOW}5. 搜索特定内容:${NC}"
        echo -e "      ${GREEN}grep \"关键词\" $LOG_FILE${NC}"
        echo ""
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}🛑 停止服务${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "   ${GREEN}./scripts/hsmem_stop.sh${NC} 或 ${GREEN}kill $SERVER_PID${NC}"
        echo ""
        
        # 显示最近几行日志
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}📄 最近的日志输出（最后 20 行）${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        if [ -f "$LOG_FILE" ] && [ -s "$LOG_FILE" ]; then
            tail -n 20 "$LOG_FILE" | sed 's/^/   /'
        else
            echo -e "   ${YELLOW}日志文件尚未生成，请稍候...${NC}"
        fi
        echo ""
        
        # 询问是否要继续查看日志
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "${BLUE}💡 提示${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
        echo -e "   ${YELLOW}要实时查看日志，请在另一个终端运行:${NC}"
        echo -e "   ${GREEN}tail -f $LOG_FILE${NC}"
        echo ""
    else
        echo -e "${YELLOW}⚠️  服务器进程已启动，但健康检查失败${NC}"
        echo -e "${YELLOW}   请检查日志: tail -f $LOG_FILE${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ 服务器启动失败${NC}"
    echo -e "${RED}   请检查日志: tail -f $LOG_FILE${NC}"
    rm -f "$PID_FILE"
    exit 1
fi
