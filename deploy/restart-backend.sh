#!/bin/bash
# 重启后端服务脚本（支持本地和生产环境）

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_NAME="heartsphere"
BACKEND_DIR="/opt/heartsphere/backend"
JAR_FILE="${BACKEND_DIR}/app.jar"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}重启 HeartSphere 后端服务${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检测环境：检查是否有 systemctl
if command -v systemctl &> /dev/null && systemctl list-units --type=service | grep -q "${APP_NAME}-backend"; then
    # 生产环境：使用 systemctl
    echo -e "${BLUE}检测到生产环境（systemd）${NC}"
    
    # 检查是否为 root 用户
    if [ "$EUID" -ne 0 ]; then 
        echo -e "${RED}请使用 root 用户运行此脚本${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}[1/2] 停止后端服务...${NC}"
    if systemctl is-active --quiet "${APP_NAME}-backend"; then
        systemctl stop "${APP_NAME}-backend"
        sleep 2
        echo -e "${GREEN}后端服务已停止${NC}"
    else
        echo -e "${YELLOW}后端服务未运行${NC}"
    fi
    
    echo -e "${YELLOW}[2/2] 启动后端服务...${NC}"
    systemctl start "${APP_NAME}-backend"
    sleep 3
    
    if systemctl is-active --quiet "${APP_NAME}-backend"; then
        echo -e "${GREEN}✓ 后端服务启动成功！${NC}"
        echo ""
        echo -e "${BLUE}服务状态:${NC}"
        systemctl status "${APP_NAME}-backend" --no-pager -l | head -15
    else
        echo -e "${RED}✗ 后端服务启动失败${NC}"
        echo ""
        echo -e "${YELLOW}查看服务状态:${NC}"
        systemctl status "${APP_NAME}-backend" --no-pager -l
        echo ""
        echo -e "${YELLOW}查看日志:${NC}"
        journalctl -u "${APP_NAME}-backend" -n 50 --no-pager
        exit 1
    fi
    
else
    # 本地开发环境：查找并重启 Java 进程
    echo -e "${BLUE}检测到本地开发环境${NC}"
    
    # 查找运行中的 Spring Boot 进程
    JAVA_PID=$(pgrep -f "heartsphere.*jar\|spring-boot.*heartsphere" | head -1)
    
    if [ -n "$JAVA_PID" ]; then
        echo -e "${YELLOW}[1/2] 停止后端服务 (PID: $JAVA_PID)...${NC}"
        kill $JAVA_PID
        sleep 3
        
        # 检查进程是否已停止
        if ps -p $JAVA_PID > /dev/null 2>&1; then
            echo -e "${YELLOW}进程仍在运行，强制停止...${NC}"
            kill -9 $JAVA_PID
            sleep 1
        fi
        echo -e "${GREEN}后端服务已停止${NC}"
    else
        echo -e "${YELLOW}未找到运行中的后端服务${NC}"
    fi
    
    echo -e "${YELLOW}[2/2] 启动后端服务...${NC}"
    
    # 检查是否有 JAR 文件
    if [ -f "$JAR_FILE" ]; then
        echo -e "${BLUE}使用 JAR 文件启动: $JAR_FILE${NC}"
        cd "$BACKEND_DIR"
        nohup java -jar -Xms512m -Xmx1024m \
            -Dspring.profiles.active=prod \
            app.jar > /tmp/heartsphere-backend.log 2>&1 &
        NEW_PID=$!
        sleep 3
        
        if ps -p $NEW_PID > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 后端服务启动成功！(PID: $NEW_PID)${NC}"
            echo -e "${BLUE}日志文件: /tmp/heartsphere-backend.log${NC}"
        else
            echo -e "${RED}✗ 后端服务启动失败${NC}"
            echo -e "${YELLOW}查看日志:${NC}"
            tail -50 /tmp/heartsphere-backend.log
            exit 1
        fi
    else
        echo -e "${YELLOW}未找到 JAR 文件，尝试使用 Maven 启动...${NC}"
        cd "$(dirname "$0")/../backend"
        
        # 检查是否有 Maven
        if ! command -v mvn &> /dev/null; then
            echo -e "${RED}错误: 未找到 Maven，无法启动服务${NC}"
            exit 1
        fi
        
        echo -e "${BLUE}使用 Maven Spring Boot 插件启动...${NC}"
        nohup mvn spring-boot:run > /tmp/heartsphere-backend.log 2>&1 &
        NEW_PID=$!
        sleep 5
        
        if ps -p $NEW_PID > /dev/null 2>&1; then
            echo -e "${GREEN}✓ 后端服务启动成功！(PID: $NEW_PID)${NC}"
            echo -e "${BLUE}日志文件: /tmp/heartsphere-backend.log${NC}"
        else
            echo -e "${RED}✗ 后端服务启动失败${NC}"
            echo -e "${YELLOW}查看日志:${NC}"
            tail -50 /tmp/heartsphere-backend.log
            exit 1
        fi
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}后端服务重启完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${GREEN}常用命令:${NC}"
if command -v systemctl &> /dev/null; then
    echo -e "  查看日志: journalctl -u ${APP_NAME}-backend -f"
    echo -e "  查看状态: systemctl status ${APP_NAME}-backend"
else
    echo -e "  查看日志: tail -f /tmp/heartsphere-backend.log"
    echo -e "  查看进程: ps aux | grep heartsphere"
fi
