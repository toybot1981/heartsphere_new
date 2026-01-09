#!/bin/bash

# 插件管理功能测试脚本
# 用于快速验证插件管理功能是否正常工作

set -e

echo "=========================================="
echo "插件管理功能测试脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查后端服务
echo "1. 检查后端服务状态..."
if lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务正在运行 (端口 8081)${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}✗ 后端服务未运行 (端口 8081)${NC}"
    echo -e "${YELLOW}  请先启动后端服务: cd backend && mvn spring-boot:run${NC}"
    BACKEND_RUNNING=false
fi
echo ""

# 检查前端服务
echo "2. 检查前端服务状态..."
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端服务正在运行 (端口 3000)${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${RED}✗ 前端服务未运行 (端口 3000)${NC}"
    echo -e "${YELLOW}  请先启动前端服务: cd frontend && npm run dev${NC}"
    FRONTEND_RUNNING=false
fi
echo ""

# 检查数据库迁移文件
echo "3. 检查数据库迁移文件..."
MIGRATION_FILES=$(ls -1 backend/src/main/resources/db/migration/V20250104*.sql 2>/dev/null | wc -l | tr -d ' ')
if [ "$MIGRATION_FILES" -ge 2 ]; then
    echo -e "${GREEN}✓ 找到 $MIGRATION_FILES 个迁移文件${NC}"
    echo "   - V20250104__create_plugin_system_tables.sql"
    echo "   - V20250104__insert_sample_plugins.sql"
else
    echo -e "${RED}✗ 迁移文件不完整 (找到 $MIGRATION_FILES 个)${NC}"
fi
echo ""

# 检查后端代码
echo "4. 检查后端代码..."
JAVA_FILES=$(find backend/src/main/java/com/heartsphere/plugin -name "*.java" 2>/dev/null | wc -l | tr -d ' ')
if [ "$JAVA_FILES" -gt 0 ]; then
    echo -e "${GREEN}✓ 找到 $JAVA_FILES 个Java文件${NC}"
else
    echo -e "${RED}✗ 未找到Java文件${NC}"
fi
echo ""

# 检查前端代码
echo "5. 检查前端代码..."
if [ -f "frontend/admin/components/PluginManagement.tsx" ] && \
   [ -f "frontend/services/api/admin/plugin.ts" ] && \
   [ -f "frontend/services/api/admin/pluginTypes.ts" ]; then
    echo -e "${GREEN}✓ 前端文件完整${NC}"
else
    echo -e "${RED}✗ 前端文件不完整${NC}"
fi
echo ""

# 如果后端运行，测试API
if [ "$BACKEND_RUNNING" = true ]; then
    echo "6. 测试API接口..."
    
    # 需要管理员token，这里只检查端点是否存在
    echo "   测试插件列表API..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
        -X GET "http://localhost:8081/api/admin/plugins?page=0&size=20" \
        -H "Authorization: Bearer test" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ API端点可访问 (HTTP $HTTP_CODE)${NC}"
    elif [ "$HTTP_CODE" = "000" ]; then
        echo -e "${RED}✗ 无法连接到后端服务${NC}"
    else
        echo -e "${YELLOW}⚠ API返回异常状态码: $HTTP_CODE${NC}"
    fi
    echo ""
fi

# 总结
echo "=========================================="
echo "测试总结"
echo "=========================================="

if [ "$BACKEND_RUNNING" = true ] && [ "$FRONTEND_RUNNING" = true ]; then
    echo -e "${GREEN}✓ 所有服务运行正常${NC}"
    echo ""
    echo "下一步："
    echo "1. 访问 http://localhost:3000/admin"
    echo "2. 登录管理后台"
    echo "3. 在侧边栏点击'插件管理'"
    echo "4. 测试插件列表、搜索、筛选、启用/禁用等功能"
else
    echo -e "${YELLOW}⚠ 部分服务未运行，请先启动服务${NC}"
fi

echo ""
echo "详细测试指南请参考: docs/测试/插件管理功能测试指南.md"
echo ""
