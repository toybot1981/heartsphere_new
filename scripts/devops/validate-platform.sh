#!/bin/bash

# DevOps 平台验证脚本

set -e

echo "🔍 开始验证 DevOps 平台..."

ERRORS=0
WARNINGS=0

# 检查数据库表
echo "📊 检查数据库表..."
if [ -f "sql/create_cmdb_tables.sql" ]; then
    echo "  ✅ CMDB 表脚本存在"
else
    echo "  ❌ CMDB 表脚本不存在"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "sql/create_pipeline_quality_tables.sql" ]; then
    echo "  ✅ 流程质量表脚本存在"
else
    echo "  ❌ 流程质量表脚本不存在"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "sql/create_auto_fix_tables.sql" ]; then
    echo "  ✅ 自动修复表脚本存在"
else
    echo "  ❌ 自动修复表脚本不存在"
    ERRORS=$((ERRORS + 1))
fi

# 检查后端文件
echo "📦 检查后端文件..."
BACKEND_FILES=(
    "admin/backend/src/main/java/com/heartsphere/admin/entity/cmdb/Asset.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/cmdb/CMDBService.java"
    "admin/backend/src/main/java/com/heartsphere/admin/controller/cmdb/CMDBController.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/CodeScanResultParser.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/TestResultParser.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/QualityGateService.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/ProblemDetectionService.java"
    "admin/backend/src/main/java/com/heartsphere/admin/service/AutoFixService.java"
    "admin/backend/src/main/java/com/heartsphere/admin/controller/AutoFixController.java"
)

for file in "${BACKEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ❌ $(basename $file) 不存在"
        ERRORS=$((ERRORS + 1))
    fi
done

# 检查前端文件
echo "🎨 检查前端文件..."
FRONTEND_FILES=(
    "admin/frontend/src/services/api/admin/cmdb.ts"
    "admin/frontend/src/services/api/admin/autoFix.ts"
    "admin/frontend/src/components/DevOpsWorkbench/CMDBManager.tsx"
    "admin/frontend/src/components/DevOpsWorkbench/AutoFixManager.tsx"
)

for file in "${FRONTEND_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ❌ $(basename $file) 不存在"
        ERRORS=$((ERRORS + 1))
    fi
done

# 检查测试项目
echo "🧪 检查测试项目..."
if [ -d "test-project" ]; then
    echo "  ✅ 测试项目目录存在"
    if [ -f "test-project/backend/pom.xml" ]; then
        echo "    ✅ 后端配置存在"
    else
        echo "    ⚠️  后端配置不存在"
        WARNINGS=$((WARNINGS + 1))
    fi
    if [ -f "test-project/frontend/package.json" ]; then
        echo "    ✅ 前端配置存在"
    else
        echo "    ⚠️  前端配置不存在"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "  ❌ 测试项目目录不存在"
    ERRORS=$((ERRORS + 1))
fi

# 检查文档
echo "📚 检查文档..."
DOC_FILES=(
    "DEVOPS_PLATFORM_QUICK_START.md"
    "DEVOPS_PLATFORM_IMPLEMENTATION_REPORT.md"
    "docs/DEVOPS_PLATFORM_GUIDE.md"
    "docs/DEVOPS_PLATFORM_ARCHITECTURE.md"
)

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $(basename $file)"
    else
        echo "  ⚠️  $(basename $file) 不存在"
        WARNINGS=$((WARNINGS + 1))
    fi
done

# 检查工具脚本
echo "🛠️  检查工具脚本..."
SCRIPT_FILES=(
    "scripts/devops/setup-devops-platform.sh"
    "scripts/devops/run-pipeline-example.sh"
    "scripts/devops/check-platform-health.sh"
)

for file in "${SCRIPT_FILES[@]}"; do
    if [ -f "$file" ]; then
        if [ -x "$file" ]; then
            echo "  ✅ $(basename $file) (可执行)"
        else
            echo "  ⚠️  $(basename $file) (不可执行)"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo "  ❌ $(basename $file) 不存在"
        ERRORS=$((ERRORS + 1))
    fi
done

# 总结
echo ""
echo "📊 验证结果:"
echo "  错误: $ERRORS"
echo "  警告: $WARNINGS"

if [ $ERRORS -eq 0 ]; then
    echo "✅ 平台验证通过！"
    exit 0
else
    echo "❌ 平台验证失败，发现 $ERRORS 个错误"
    exit 1
fi
