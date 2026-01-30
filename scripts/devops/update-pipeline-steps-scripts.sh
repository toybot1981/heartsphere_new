#!/bin/bash

# 更新流程步骤的脚本 ID，使用实际存在的脚本

set -e

echo "🔧 开始更新流程步骤的脚本 ID..."

# 检查参数
if [ -z "$1" ]; then
    echo "用法: $0 <数据库名> [用户名] [密码]"
    echo "示例: $0 heartsphere root"
    echo "或者: $0 heartsphere root mypassword"
    exit 1
fi

DB_NAME=$1
DB_USER=${2:-root}
DB_PASSWORD=${3:-""}

# 构建 MySQL 命令
if [ -z "$DB_PASSWORD" ]; then
    MYSQL_CMD="mysql -u $DB_USER"
else
    MYSQL_CMD="mysql -u $DB_USER -p$DB_PASSWORD"
fi

echo "📝 更新脚本 ID 映射..."
echo ""

# 1. 更新扫描脚本：scan-code -> code-scan-eslint
echo "  ✅ 更新扫描脚本: scan-code -> code-scan-eslint"
$MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME -e "
    UPDATE pipeline_steps 
    SET script_id = 'code-scan-eslint'
    WHERE script_id = 'scan-code';
" 2>/dev/null

# 2. build-backend 已经存在，不需要更新

# 3. 更新部署脚本：根据环境选择正确的部署脚本
echo "  ✅ 更新部署脚本: deploy-backend -> 根据环境选择"
# test 环境使用 deploy-backend-dev
$MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME -e "
    UPDATE pipeline_steps ps
    JOIN deployment_pipelines p ON ps.pipeline_id = p.id
    SET ps.script_id = 'deploy-backend-dev'
    WHERE ps.script_id = 'deploy-backend' 
      AND p.environment = 'test';
" 2>/dev/null

# prod 环境使用 deploy-backend-prod
$MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME -e "
    UPDATE pipeline_steps ps
    JOIN deployment_pipelines p ON ps.pipeline_id = p.id
    SET ps.script_id = 'deploy-backend-prod'
    WHERE ps.script_id = 'deploy-backend' 
      AND p.environment = 'prod';
" 2>/dev/null

# 4. 更新测试脚本：test-all 已经存在，不需要更新

echo ""
echo "✅ 脚本 ID 更新完成！"
echo ""
echo "📊 验证结果："
$MYSQL_CMD --default-character-set=utf8mb4 $DB_NAME -e "
    SELECT 
        ps.pipeline_id,
        p.name as pipeline_name,
        p.environment,
        ps.\`order\`,
        ps.name as step_name,
        ps.script_id
    FROM pipeline_steps ps
    JOIN deployment_pipelines p ON ps.pipeline_id = p.id
    ORDER BY ps.pipeline_id, ps.\`order\`;
" 2>/dev/null
