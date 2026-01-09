#!/bin/bash
# 系统状态检查脚本

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="heartsphere"
APP_HOME="/opt/${APP_NAME}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}数字生命体交互系统（心域）状态检查${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查后端服务
echo -e "\n${YELLOW}后端服务状态:${NC}"
if systemctl is-active --quiet ${APP_NAME}-backend; then
    echo -e "${GREEN}✓ 后端服务运行中${NC}"
    echo -e "  进程信息:"
    ps aux | grep "app.jar" | grep -v grep | awk '{print "  PID: "$2", CPU: "$3"%, MEM: "$4"%"}'
else
    echo -e "${RED}✗ 后端服务未运行${NC}"
fi

# 检查前端服务
echo -e "\n${YELLOW}前端服务状态:${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx 运行中${NC}"
else
    echo -e "${RED}✗ Nginx 未运行${NC}"
fi

# 检查端口
echo -e "\n${YELLOW}端口监听状态:${NC}"
if netstat -tlnp 2>/dev/null | grep -q ":8081"; then
    echo -e "${GREEN}✓ 端口 8081 (后端) 正在监听${NC}"
else
    echo -e "${RED}✗ 端口 8081 (后端) 未监听${NC}"
fi

if netstat -tlnp 2>/dev/null | grep -q ":80"; then
    echo -e "${GREEN}✓ 端口 80 (前端) 正在监听${NC}"
else
    echo -e "${RED}✗ 端口 80 (前端) 未监听${NC}"
fi

# 检查数据库
echo -e "\n${YELLOW}数据库服务状态:${NC}"
if systemctl is-active --quiet mysqld; then
    echo -e "${GREEN}✓ MySQL 运行中${NC}"
    
    # 测试数据库连接
    if [ -f "${APP_HOME}/.env" ]; then
        source ${APP_HOME}/.env
        if mysql -u ${DB_USER:-heartsphere} -p${DB_PASSWORD} -h ${DB_HOST:-localhost} -e "SELECT 1" ${DB_NAME:-heartsphere} &>/dev/null; then
            echo -e "${GREEN}✓ 数据库连接正常${NC}"
        else
            echo -e "${RED}✗ 数据库连接失败${NC}"
        fi
    fi
else
    echo -e "${RED}✗ MySQL 未运行${NC}"
fi

# 检查磁盘空间
echo -e "\n${YELLOW}磁盘空间:${NC}"
df -h ${APP_HOME} | tail -1 | awk '{print "  使用: "$3" / "$2" ("$5" 已使用)"}'

# 检查内存使用
echo -e "\n${YELLOW}内存使用:${NC}"
free -h | grep Mem | awk '{print "  使用: "$3" / "$2}'

# 检查日志文件
echo -e "\n${YELLOW}日志文件:${NC}"
if [ -f "${APP_HOME}/logs/backend.log" ]; then
    LOG_SIZE=$(du -h ${APP_HOME}/logs/backend.log | cut -f1)
    echo -e "  后端日志: ${LOG_SIZE}"
    echo -e "  最后错误:"
    tail -5 ${APP_HOME}/logs/backend.log 2>/dev/null | grep -i error | tail -1 || echo -e "  ${GREEN}无错误${NC}"
else
    echo -e "  后端日志: 不存在"
fi

# 检查最近的服务日志
echo -e "\n${YELLOW}最近服务日志 (最后5行):${NC}"
echo -e "${BLUE}后端服务:${NC}"
journalctl -u ${APP_NAME}-backend -n 5 --no-pager 2>/dev/null || echo -e "${RED}无法获取日志${NC}"

# 检查 API 健康状态
echo -e "\n${YELLOW}API 健康检查:${NC}"
if curl -s http://localhost:8081/api/health &>/dev/null; then
    echo -e "${GREEN}✓ 后端 API 响应正常${NC}"
else
    echo -e "${RED}✗ 后端 API 无响应${NC}"
fi

# 检查前端页面
echo -e "\n${YELLOW}前端页面检查:${NC}"
if curl -s http://localhost | grep -q "html"; then
    echo -e "${GREEN}✓ 前端页面可访问${NC}"
else
    echo -e "${RED}✗ 前端页面无法访问${NC}"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}检查完成${NC}"
echo -e "${BLUE}========================================${NC}"








