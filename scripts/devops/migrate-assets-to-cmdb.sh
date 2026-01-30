#!/bin/bash

# 将现有资产迁移到 CMDB

set -e

echo "📦 开始迁移资产到 CMDB..."

if [ -z "$API_BASE_URL" ]; then
    API_BASE_URL="http://localhost:8080"
fi

if [ -z "$AUTH_TOKEN" ]; then
    echo "❌ 错误: 请设置 AUTH_TOKEN 环境变量"
    exit 1
fi

# 读取资产列表（从配置文件或环境变量）
ASSETS_FILE="${ASSETS_FILE:-assets.json}"

if [ ! -f "$ASSETS_FILE" ]; then
    echo "⚠️  资产文件不存在: $ASSETS_FILE"
    echo "   创建示例资产文件..."
    cat > "$ASSETS_FILE" << 'EOF'
[
    {
        "name": "示例服务器",
        "type": "SERVER",
        "status": "ACTIVE",
        "description": "示例服务器资产"
    }
]
EOF
fi

# 导入资产
echo "📥 导入资产..."
while IFS= read -r asset; do
    echo "  导入: $(echo $asset | jq -r '.name')"
    
    curl -s -X POST "$API_BASE_URL/api/cmdb/assets" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$asset" > /dev/null
    
    if [ $? -eq 0 ]; then
        echo "    ✅ 导入成功"
    else
        echo "    ❌ 导入失败"
    fi
done < <(jq -c '.[]' "$ASSETS_FILE")

echo "✅ 资产迁移完成"
