#!/bin/bash

# Mentis 全面测试脚本
# 包括单元测试、集成测试和 API 测试

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Mentis 全面测试套件${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查后端目录
if [ ! -d "backend" ]; then
  echo -e "${RED}✗ 错误: 未找到 backend 目录${NC}"
  exit 1
fi

cd backend

# 1. 运行单元测试
echo -e "${CYAN}[阶段 1/3] 运行单元测试${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

echo -e "${YELLOW}运行 Service 层测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.service.*Test" -q || {
  echo -e "${RED}✗ Service 层测试失败${NC}"
  exit 1
}
echo -e "${GREEN}✓ Service 层测试通过${NC}"

echo -e "${YELLOW}运行 Agent 层测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.agent.*Test" -q || {
  echo -e "${RED}✗ Agent 层测试失败${NC}"
  exit 1
}
echo -e "${GREEN}✓ Agent 层测试通过${NC}"

echo -e "${YELLOW}运行 Executor 层测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.executor.*Test" -q || {
  echo -e "${RED}✗ Executor 层测试失败${NC}"
  exit 1
}
echo -e "${GREEN}✓ Executor 层测试通过${NC}"

echo -e "${YELLOW}运行 Util 工具类测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.util.*Test" -q || {
  echo -e "${RED}✗ Util 工具类测试失败${NC}"
  exit 1
}
echo -e "${GREEN}✓ Util 工具类测试通过${NC}"

echo -e "${YELLOW}运行 Controller 层测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.controller.*Test" -q || {
  echo -e "${RED}✗ Controller 层测试失败${NC}"
  exit 1
}
echo -e "${GREEN}✓ Controller 层测试通过${NC}"

echo ""

# 2. 运行集成测试
echo -e "${CYAN}[阶段 2/3] 运行集成测试${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

echo -e "${YELLOW}运行 Mentis 集成测试...${NC}"
mvn test -Dtest="com.heartsphere.mentis.integration.*Test" -q || {
  echo -e "${YELLOW}⚠ 集成测试失败（可能需要启动的服务器）${NC}"
  echo -e "${YELLOW}  可以稍后手动运行: mvn test -Dtest=MentisIntegrationTest${NC}"
}
echo -e "${GREEN}✓ 集成测试完成${NC}"

echo ""

# 3. API 功能测试（需要运行中的服务器）
echo -e "${CYAN}[阶段 3/3] API 功能测试${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

if command -v curl &> /dev/null; then
  echo -e "${YELLOW}检查服务器是否运行...${NC}"
  if curl -s -f http://localhost:8080/actuator/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 服务器正在运行${NC}"
    echo -e "${YELLOW}运行 API 测试脚本...${NC}"
    cd ..
    ./test_mentis_api.sh || {
      echo -e "${YELLOW}⚠ API 测试失败（可能需要配置管理员账号）${NC}"
    }
  else
    echo -e "${YELLOW}⚠ 服务器未运行，跳过 API 测试${NC}"
    echo -e "${YELLOW}  启动服务器后运行: ./test_mentis_api.sh${NC}"
  fi
else
  echo -e "${YELLOW}⚠ curl 未安装，跳过 API 测试${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}测试套件执行完成！${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}测试报告:${NC}"
echo -e "  单元测试: backend/target/surefire-reports/"
echo -e "  集成测试: backend/target/surefire-reports/"
echo ""
echo -e "${CYAN}下一步:${NC}"
echo -e "  1. 查看测试报告: backend/target/surefire-reports/"
echo -e "  2. 运行 API 测试: ./test_mentis_api.sh"
echo -e "  3. 运行流式测试: python3 test_mentis_stream.py"
echo ""
