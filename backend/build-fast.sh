#!/bin/bash

# HeartSphere 快速构建脚本
# 使用方法: ./build-fast.sh [dev|test|prod|docker]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 默认profile
PROFILE="dev"
THREADS="4"

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        dev|test|prod|docker)
            PROFILE="$1"
            shift
            ;;
        -t|--threads)
            THREADS="$2"
            shift 2
            ;;
        -h|--help)
            echo "使用方法: $0 [dev|test|prod|docker] [-t|--threads 线程数]"
            echo ""
            echo "Profile说明:"
            echo "  dev   - 开发环境，跳过测试（默认）"
            echo "  test  - 测试环境，执行测试"
            echo "  prod  - 生产环境，完整构建"
            echo "  docker- Docker构建，最小化体积"
            echo ""
            echo "示例:"
            echo "  $0 dev -t 8    # 使用8线程快速编译"
            echo "  $0 test        # 执行测试"
            echo "  $0 prod        # 生产构建"
            exit 0
            ;;
        *)
            echo -e "${RED}未知参数: $1${NC}"
            echo "使用 -h 查看帮助"
            exit 1
            ;;
    esac
done

# 打印配置
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}HeartSphere 快速构建${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Profile: ${YELLOW}$PROFILE${NC}"
echo -e "线程数:  ${YELLOW}$THREADS${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 记录开始时间
START_TIME=$(date +%s)

# 根据profile执行不同的构建
case $PROFILE in
    dev)
        echo -e "${YELLOW}正在编译（跳过测试）...${NC}"
        mvn clean package -Pdev -T $THREADS -DskipTests
        ;;
    test)
        echo -e "${YELLOW}正在编译（执行测试）...${NC}"
        mvn clean test -Ptest -T $THREADS
        ;;
    prod)
        echo -e "${YELLOW}正在生产构建...${NC}"
        mvn clean package -Pprod -T $THREADS
        ;;
    docker)
        echo -e "${YELLOW}正在为Docker构建...${NC}"
        mvn clean package -Pdocker -T $THREADS -DskipTests
        echo -e "${YELLOW}构建Docker镜像...${NC}"
        docker build -t heartsphere:latest .
        ;;
esac

# 计算耗时
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# 打印结果
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "耗时: ${YELLOW}${MINUTES}分${SECONDS}秒${NC}"

# 显示JAR大小
if [ -f "target/heartsphere-service-0.0.1-SNAPSHOT.jar" ]; then
    SIZE=$(du -h target/heartsphere-service-0.0.1-SNAPSHOT.jar | cut -f1)
    echo -e "大小: ${YELLOW}$SIZE${NC}"
fi

echo -e "${GREEN}========================================${NC}"
