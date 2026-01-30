#!/bin/bash

# 初始化流程模板步骤的脚本

set -e

echo "🔧 开始初始化流程模板步骤..."

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

echo "📊 检查流程模板状态..."
echo ""

# 获取所有没有步骤的流程模板
PIPELINES_WITHOUT_STEPS=$($MYSQL_CMD $DB_NAME -N -e "
    SELECT p.id, p.name, p.project, p.environment
    FROM deployment_pipelines p
    LEFT JOIN pipeline_steps ps ON ps.pipeline_id = p.id
    WHERE ps.id IS NULL
    ORDER BY p.id;
" 2>/dev/null)

if [ -z "$PIPELINES_WITHOUT_STEPS" ]; then
    echo "✅ 所有流程模板都已包含步骤，无需初始化"
    exit 0
fi

echo "发现以下流程模板没有步骤："
echo "$PIPELINES_WITHOUT_STEPS"
echo ""

# 为每个流程模板添加默认步骤
echo "$PIPELINES_WITHOUT_STEPS" | while IFS=$'\t' read -r pipeline_id pipeline_name project environment; do
    echo "处理流程模板 ID: $pipeline_id, 名称: $pipeline_name, 项目: $project, 环境: $environment"
    
    # 根据环境确定默认步骤
    if [ "$environment" = "prod" ]; then
        # 生产环境：代码扫描 -> 测试 -> 构建 -> 部署
        $MYSQL_CMD $DB_NAME -e "
            INSERT INTO pipeline_steps (pipeline_id, name, script_id, \`order\`, parallel, required, created_at, updated_at)
            VALUES
            ($pipeline_id, '代码扫描', 'scan-code', 1, FALSE, TRUE, NOW(), NOW()),
            ($pipeline_id, '运行测试', 'test-all', 2, FALSE, TRUE, NOW(), NOW()),
            ($pipeline_id, '构建项目', 'build-backend', 3, FALSE, TRUE, NOW(), NOW()),
            ($pipeline_id, '部署应用', 'deploy-backend', 4, FALSE, TRUE, NOW(), NOW());
        " 2>/dev/null
        echo "  ✅ 已添加 4 个步骤（代码扫描、测试、构建、部署）"
    else
        # 测试环境：代码扫描 -> 构建 -> 部署
        $MYSQL_CMD $DB_NAME -e "
            INSERT INTO pipeline_steps (pipeline_id, name, script_id, \`order\`, parallel, required, created_at, updated_at)
            VALUES
            ($pipeline_id, '代码扫描', 'scan-code', 1, FALSE, FALSE, NOW(), NOW()),
            ($pipeline_id, '构建项目', 'build-backend', 2, FALSE, TRUE, NOW(), NOW()),
            ($pipeline_id, '部署应用', 'deploy-backend', 3, FALSE, TRUE, NOW(), NOW());
        " 2>/dev/null
        echo "  ✅ 已添加 3 个步骤（代码扫描、构建、部署）"
    fi
done

echo ""
echo "✅ 流程模板步骤初始化完成！"
echo ""
echo "📊 验证结果："
$MYSQL_CMD $DB_NAME -e "
    SELECT 
        p.id as pipeline_id,
        p.name as pipeline_name,
        p.environment,
        COUNT(ps.id) as step_count
    FROM deployment_pipelines p
    LEFT JOIN pipeline_steps ps ON ps.pipeline_id = p.id
    GROUP BY p.id, p.name, p.environment
    ORDER BY p.id;
" 2>/dev/null
