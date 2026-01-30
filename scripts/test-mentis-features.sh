#!/bin/bash

# Mentis 功能测试脚本
# 测试新增的功能（任务关联、工具系统、结果展示等）

set -e

echo "🧪 Mentis 功能测试"
echo "=================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否在正确的目录
if [ ! -d "mentis/backend" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

cd mentis/backend

echo "📦 运行单元测试..."
echo ""

# 运行单元测试
echo "1. 测试任务与对话关联功能..."
mvn test -Dtest=MentisTaskServiceTest 2>&1 | grep -E "(Tests run|BUILD|ERROR)" || true

echo ""
echo "2. 测试工具注册表..."
mvn test -Dtest=ToolRegistryTest 2>&1 | grep -E "(Tests run|BUILD|ERROR)" || true

echo ""
echo "3. 测试工具执行器..."
mvn test -Dtest=ToolExecutorTest 2>&1 | grep -E "(Tests run|BUILD|ERROR)" || true

echo ""
echo "4. 测试工具系统集成..."
mvn test -Dtest=ToolSystemIntegrationTest 2>&1 | grep -E "(Tests run|BUILD|ERROR)" || true

echo ""
echo -e "${GREEN}✅ 单元测试完成${NC}"
echo ""
echo "📝 测试说明："
echo "  - 单元测试覆盖核心业务逻辑"
echo "  - 集成测试验证组件协作"
echo "  - 运行 'mvn test' 查看详细结果"
echo ""
echo "💡 提示："
echo "  - E2E 测试需要配置 E2B_API_KEY"
echo "  - 前端组件测试需要启动前端服务"
echo "  - 完整测试流程请参考测试文档"
