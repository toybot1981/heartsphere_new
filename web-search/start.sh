#!/bin/bash

# HeartSphere Web Search Service 启动脚本

# 设置颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=================================${NC}"
echo -e "${GREEN}HeartSphere Web Search Service${NC}"
echo -e "${GREEN}=================================${NC}"
echo ""

# 检查Java版本
echo "检查Java环境..."
if ! command -v java &> /dev/null; then
    echo -e "${RED}错误: 未找到Java,请安装Java 17或更高版本${NC}"
    exit 1
fi

JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo -e "${RED}错误: Java版本过低,需要Java 17或更高版本${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Java版本检查通过${NC}"
echo ""

# 切换到后端目录
cd "$(dirname "$0")/backend" || exit 1

# 检查是否已经编译
if [ ! -f "target/web-search-1.0.0.jar" ]; then
    echo -e "${YELLOW}首次运行,正在编译项目...${NC}"
    mvn clean package -DskipTests
    if [ $? -ne 0 ]; then
        echo -e "${RED}编译失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ 编译完成${NC}"
    echo ""
fi

# 检查API Key
API_KEY=${TAVILY_API_KEY:-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}
echo "使用Tavily API Key: ${API_KEY:0:15}..."
echo ""

# 启动服务
echo -e "${GREEN}启动Web Search服务...${NC}"
echo ""
echo "服务地址: http://localhost:8086/api"
echo "API文档: http://localhost:8086/api/swagger-ui.html"
echo ""
echo -e "${YELLOW}按Ctrl+C停止服务${NC}"
echo ""

# 设置JVM参数
JAVA_OPTS="${JAVA_OPTS:--Xms512m -Xmx1024m}"

# 启动应用
export TAVILY_API_KEY="$API_KEY"
java $JAVA_OPTS -jar target/web-search-1.0.0.jar
