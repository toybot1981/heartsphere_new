#!/bin/bash
# 数字生命体交互系统（心域）部署脚本
# 适用于阿里云 ECS Aliyun Cloud Linux

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量
APP_NAME="heartsphere"
APP_USER="heartsphere"
APP_HOME="/opt/${APP_NAME}"
BACKEND_PORT=8081
FRONTEND_PORT=80

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}数字生命体交互系统（心域）部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    exit 1
fi

# 创建应用用户
if ! id "$APP_USER" &>/dev/null; then
    echo -e "${YELLOW}创建应用用户: ${APP_USER}${NC}"
    useradd -r -s /bin/bash -d ${APP_HOME} ${APP_USER}
fi

# 创建应用目录
mkdir -p ${APP_HOME}/{backend,frontend,logs,uploads/images}
chown -R ${APP_USER}:${APP_USER} ${APP_HOME}

# 执行后端部署
echo -e "${YELLOW}开始部署后端...${NC}"
bash $(dirname "$0")/deploy-backend.sh

# 执行前端部署
echo -e "${YELLOW}开始部署前端...${NC}"
bash $(dirname "$0")/deploy-frontend.sh

# 配置防火墙
echo -e "${YELLOW}配置防火墙...${NC}"
if command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=${BACKEND_PORT}/tcp
    firewall-cmd --permanent --add-port=${FRONTEND_PORT}/tcp
    firewall-cmd --reload
elif command -v ufw &> /dev/null; then
    ufw allow ${BACKEND_PORT}/tcp
    ufw allow ${FRONTEND_PORT}/tcp
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "后端服务: http://localhost:${BACKEND_PORT}"
echo -e "前端服务: http://localhost:${FRONTEND_PORT}"
echo -e ""
echo -e "管理命令:"
echo -e "  启动后端: systemctl start ${APP_NAME}-backend"
echo -e "  停止后端: systemctl stop ${APP_NAME}-backend"
echo -e "  重启后端: systemctl restart ${APP_NAME}-backend"
echo -e "  查看日志: journalctl -u ${APP_NAME}-backend -f"
echo -e ""
echo -e "  启动前端: systemctl start nginx"
echo -e "  重启前端: systemctl restart nginx"








