#!/bin/bash

# 温度感系统测试脚本

echo "=========================================="
echo "温度感系统测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -f "pom.xml" ]; then
    echo -e "${RED}错误: 请在backend目录下运行此脚本${NC}"
    exit 1
fi

echo -e "${YELLOW}1. 运行情绪服务单元测试...${NC}"
./mvnw test -Dtest=EmotionServiceTest
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 情绪服务测试通过${NC}"
else
    echo -e "${RED}✗ 情绪服务测试失败${NC}"
fi

echo ""
echo -e "${YELLOW}2. 运行温度感记忆服务测试...${NC}"
./mvnw test -Dtest=TemperatureMemoryServiceTest
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 记忆服务测试通过${NC}"
else
    echo -e "${RED}✗ 记忆服务测试失败${NC}"
fi

echo ""
echo -e "${YELLOW}3. 运行集成测试...${NC}"
./mvnw test -Dtest=EmotionMemoryIntegrationTest
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 集成测试通过${NC}"
else
    echo -e "${RED}✗ 集成测试失败${NC}"
fi

echo ""
echo -e "${YELLOW}4. 运行所有情绪相关测试...${NC}"
./mvnw test -Dtest=*Emotion*
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 所有情绪测试通过${NC}"
else
    echo -e "${RED}✗ 部分测试失败${NC}"
fi

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="



