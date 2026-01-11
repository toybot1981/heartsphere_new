#!/bin/bash
# 端口管理工具函数
# 用于启动脚本中的端口检查和进程终止

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查端口是否被占用
# 参数: $1 - 端口号
# 返回: 0 - 端口可用, 1 - 端口被占用
check_port_available() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        return 1  # 端口被占用
    else
        return 0  # 端口可用
    fi
}

# 终止占用指定端口的进程
# 参数: $1 - 端口号
# 返回: 0 - 成功, 1 - 失败
kill_port_process() {
    local port=$1
    local pids
    
    # 获取占用端口的进程ID
    pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$pids" ]; then
        echo -e "${GREEN}端口 ${port} 未被占用${NC}"
        return 0
    fi
    
    # 终止进程
    echo -e "${YELLOW}发现端口 ${port} 被占用，正在终止进程...${NC}"
    for pid in $pids; do
        echo -e "${YELLOW}  终止进程 PID: ${pid}${NC}"
        kill -9 "$pid" 2>/dev/null
    done
    
    # 等待进程终止
    sleep 1
    
    # 验证端口是否已释放
    if check_port_available "$port"; then
        echo -e "${GREEN}端口 ${port} 已释放${NC}"
        return 0
    else
        echo -e "${RED}警告: 端口 ${port} 可能仍被占用${NC}"
        return 1
    fi
}

# 检查并终止端口进程（如果被占用）
# 参数: $1 - 端口号
# 返回: 0 - 成功
ensure_port_available() {
    local port=$1
    if ! check_port_available "$port"; then
        kill_port_process "$port"
    fi
    return 0
}

# 导出函数供其他脚本使用
export -f check_port_available
export -f kill_port_process
export -f ensure_port_available
