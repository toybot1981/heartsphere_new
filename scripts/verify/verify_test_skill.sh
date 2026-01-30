#!/bin/bash

# 验证测试技能是否已创建
# 使用方法: ./scripts/verify_test_skill.sh

echo "=== 验证测试技能创建 ==="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查迁移脚本是否存在
echo "1. 检查迁移脚本..."
if [ -f "main/backend/src/main/resources/db/migration/V20250104__create_test_skill.sql" ]; then
    echo -e "${GREEN}✓${NC} 迁移脚本存在"
else
    echo -e "${RED}✗${NC} 迁移脚本不存在"
    exit 1
fi

# 2. 检查后端服务是否运行
echo ""
echo "2. 检查后端服务..."
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 后端服务正在运行 (端口 8080)"
    BACKEND_RUNNING=true
else
    echo -e "${YELLOW}⚠${NC} 后端服务未运行 (端口 8080)"
    echo "   提示: 请先启动后端服务: cd main/backend && mvn spring-boot:run"
    BACKEND_RUNNING=false
fi

# 3. 测试 API（如果后端运行）
if [ "$BACKEND_RUNNING" = true ]; then
    echo ""
    echo "3. 测试 API..."
    
    # 获取所有技能
    echo "   测试: GET /api/skills"
    RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8080/api/skills 2>/dev/null)
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓${NC} API 响应正常 (HTTP $HTTP_CODE)"
        
        # 检查是否包含 test-skill
        if echo "$BODY" | grep -q "test-skill"; then
            echo -e "${GREEN}✓${NC} 找到测试技能 (test-skill)"
            
            # 提取技能信息
            echo ""
            echo "   技能信息:"
            echo "$BODY" | grep -A 5 "test-skill" | head -10 | sed 's/^/   /'
        else
            echo -e "${YELLOW}⚠${NC} 未找到测试技能 (test-skill)"
            echo "   提示: 技能可能还未创建，需要重启后端服务执行迁移"
        fi
    else
        echo -e "${RED}✗${NC} API 请求失败 (HTTP $HTTP_CODE)"
        echo "   响应: $BODY"
    fi
    
    # 获取单个技能
    echo ""
    echo "   测试: GET /api/skills/test-skill"
    RESPONSE2=$(curl -s -w "\n%{http_code}" http://localhost:8080/api/skills/test-skill 2>/dev/null)
    HTTP_CODE2=$(echo "$RESPONSE2" | tail -n1)
    
    if [ "$HTTP_CODE2" = "200" ]; then
        echo -e "${GREEN}✓${NC} 可以获取单个技能 (HTTP $HTTP_CODE2)"
    elif [ "$HTTP_CODE2" = "404" ]; then
        echo -e "${YELLOW}⚠${NC} 技能不存在 (HTTP 404)"
        echo "   提示: 需要重启后端服务执行迁移脚本"
    else
        echo -e "${RED}✗${NC} API 请求失败 (HTTP $HTTP_CODE2)"
    fi
else
    echo ""
    echo "3. 跳过 API 测试（后端服务未运行）"
fi

# 4. 检查前端代码
echo ""
echo "4. 检查前端代码..."
if [ -f "frontend/components/character/CharacterSkillManagement.tsx" ]; then
    echo -e "${GREEN}✓${NC} 前端技能管理组件存在"
else
    echo -e "${RED}✗${NC} 前端技能管理组件不存在"
fi

# 总结
echo ""
echo "=== 验证总结 ==="
echo ""
if [ "$BACKEND_RUNNING" = true ]; then
    echo "下一步操作:"
    echo "1. 打开浏览器访问管理后台"
    echo "2. 进入角色管理 → 编辑角色 → 技能管理标签页"
    echo "3. 查看是否显示'测试技能'"
else
    echo "下一步操作:"
    echo "1. 启动后端服务: cd main/backend && mvn spring-boot:run"
    echo "2. 等待服务启动完成（迁移脚本会自动执行）"
    echo "3. 重新运行此脚本验证"
fi

echo ""
echo "验证完成！"
