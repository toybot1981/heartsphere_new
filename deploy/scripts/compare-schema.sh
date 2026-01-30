#!/bin/bash

# 数据库结构对比脚本
# 对比本地和远程数据库的表结构差异
#
# 使用方法:
#   ./compare-schema.sh --config FILE --env ENV

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/db-migration.config"
TEMP_DIR="${SCRIPT_DIR}/temp"
REPORT_DIR="${SCRIPT_DIR}/reports"

# 默认参数
TARGET_ENV="prod"
DRY_RUN=false

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    --env)
      TARGET_ENV="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

# 加载配置文件
source "$CONFIG_FILE"

# 创建临时目录
mkdir -p "$TEMP_DIR"
mkdir -p "$REPORT_DIR"

# 转换为大写（兼容不同 shell）
to_upper() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

# 获取数据库密码
get_password() {
  local env=$1
  local env_upper=$(to_upper "$env")
  local password_var="${env_upper}_DB_PASSWORD"
  local password="${!password_var:-}"
  
  if [[ -z "$password" ]]; then
    read -sp "请输入${env}数据库密码: " password
    echo
  fi
  
  echo "$password"
}

# 构建 MySQL 连接参数
build_mysql_args() {
  local env=$1
  local env_upper=$(to_upper "$env")
  local host_var="${env_upper}_DB_HOST"
  local port_var="${env_upper}_DB_PORT"
  local user_var="${env_upper}_DB_USER"
  local name_var="${env_upper}_DB_NAME"
  
  local host="${!host_var}"
  local port="${!port_var}"
  local user="${!user_var}"
  local name="${!name_var}"
  local password=$(get_password "$env")
  
  echo "-h$host -P$port -u$user -p$password $name"
}

# 导出数据库结构
export_schema() {
  local env=$1
  local output_file="$2"
  
  echo "正在导出${env}数据库结构..."
  
  local args=$(build_mysql_args "$env")
  
  if mysqldump $args --no-data --skip-comments --skip-triggers --routines=false > "$output_file" 2>/dev/null; then
    echo "✓ ${env}数据库结构导出完成"
    return 0
  else
    echo "✗ ${env}数据库结构导出失败"
    return 1
  fi
}

# 获取表列表
get_table_list() {
  local env=$1
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME" 2>/dev/null
}

# 对比表结构
compare_schemas() {
  local local_schema="$1"
  local remote_schema="$2"
  local report_file="$3"
  
  echo "正在对比数据库结构..."
  
  {
    echo "# 数据库结构对比报告"
    echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    echo "## 1. 缺失的表"
    echo ""
    
    # 获取本地和远程的表列表
    local local_tables=$(grep -E "^CREATE TABLE" "$local_schema" | sed 's/CREATE TABLE `\([^`]*\)`.*/\1/' | sort)
    local remote_tables=$(grep -E "^CREATE TABLE" "$remote_schema" 2>/dev/null | sed 's/CREATE TABLE `\([^`]*\)`.*/\1/' | sort || echo "")
    
    # 找出远程缺失的表
    local missing_tables=$(comm -23 <(echo "$local_tables") <(echo "$remote_tables") || echo "")
    
    if [[ -z "$missing_tables" ]]; then
      echo "无缺失的表"
    else
      echo "$missing_tables" | while read table; do
        echo "- \`$table\`"
      done
    fi
    
    echo ""
    echo "## 2. 表结构差异"
    echo ""
    
    # 对比每个表的结构
    echo "$local_tables" | while read table; do
      if echo "$remote_tables" | grep -q "^${table}$"; then
        # 提取表定义
        local local_table_def=$(awk "/^CREATE TABLE \`${table}\`/,/^);/" "$local_schema" | head -n -1 | tail -n +2)
        local remote_table_def=$(awk "/^CREATE TABLE \`${table}\`/,/^);/" "$remote_schema" 2>/dev/null | head -n -1 | tail -n +2 || echo "")
        
        if [[ "$local_table_def" != "$remote_table_def" ]]; then
          echo "### 表: \`$table\`"
          echo ""
          echo "**差异检测**: 表结构存在差异，建议手动检查"
          echo ""
        fi
      fi
    done
    
    echo ""
    echo "## 3. 额外说明"
    echo ""
    echo "- 此报告仅提供结构差异概览"
    echo "- 详细的字段和索引差异需要通过详细对比确认"
    echo "- 建议在执行迁移前仔细审查此报告"
    
  } > "$report_file"
  
  echo "✓ 对比报告已生成: $report_file"
}

# 主函数
main() {
  local local_schema="${TEMP_DIR}/local_schema.sql"
  local remote_schema="${TEMP_DIR}/remote_schema.sql"
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local report_file="${REPORT_DIR}/schema_diff_${timestamp}.md"
  
  echo "========================================="
  echo "数据库结构对比工具"
  echo "========================================="
  
  # 导出本地数据库结构
  if ! export_schema "LOCAL" "$local_schema"; then
    exit 1
  fi
  
  # 导出远程数据库结构
  if ! export_schema "$TARGET_ENV" "$remote_schema"; then
    exit 1
  fi
  
  # 对比结构
  compare_schemas "$local_schema" "$remote_schema" "$report_file"
  
  # 显示报告摘要
  echo ""
  echo "========================================="
  echo "对比完成"
  echo "报告文件: $report_file"
  echo "========================================="
  
  # 显示缺失的表数量
  local missing_count=$(grep -c "^- \`" "$report_file" 2>/dev/null || echo "0")
  if [[ "$missing_count" -gt 0 ]]; then
    echo -e "${YELLOW}警告: 发现 $missing_count 个缺失的表${NC}"
  else
    echo -e "${GREEN}所有表都存在${NC}"
  fi
}

# 执行主函数
main "$@"
