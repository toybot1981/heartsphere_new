#!/bin/bash

# 迁移验证脚本
# 验证迁移后的数据库结构和数据一致性
#
# 使用方法:
#   ./verify-migration.sh [options]

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
REPORT_DIR="${SCRIPT_DIR}/reports"

# 默认参数
TARGET_ENV="prod"

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
    --help)
      echo "迁移验证脚本"
      echo ""
      echo "使用方法:"
      echo "  $0 [options]"
      echo ""
      echo "选项:"
      echo "  --config FILE     指定配置文件路径"
      echo "  --env ENV         指定目标环境 (默认: prod)"
      echo "  --help            显示帮助信息"
      exit 0
      ;;
    *)
      echo "未知参数: $1"
      exit 1
      ;;
  esac
done

# 加载配置文件
source "$CONFIG_FILE"

# 创建报告目录
mkdir -p "$REPORT_DIR"

# 日志函数
log_info() {
  echo "[INFO] $@"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $@"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $@"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $@"
}

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

# 获取表列表
get_table_list() {
  local env=$1
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME" 2>/dev/null
}

# 获取表的记录数
get_table_count() {
  local env=$1
  local table=$2
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT COUNT(*) FROM \`$table\`" 2>/dev/null || echo "0"
}

# 验证表结构一致性
verify_schema() {
  log_info "验证表结构一致性..."
  
  local local_tables=$(get_table_list "LOCAL" | sort)
  local remote_tables=$(get_table_list "$TARGET_ENV" | sort)
  local missing_tables=$(comm -23 <(echo "$local_tables") <(echo "$remote_tables") 2>/dev/null || echo "")
  
  if [[ -n "$missing_tables" ]]; then
    log_error "发现缺失的表:"
    echo "$missing_tables" | while read table; do
      if [[ -n "$table" ]]; then
        log_error "  - $table"
      fi
    done
    return 1
  else
    log_success "所有表都存在"
  fi
  
  return 0
}

# 验证系统数据一致性
verify_system_data() {
  log_info "验证系统数据一致性..."
  
  local local_tables=$(get_table_list "LOCAL")
  local system_tables=$(echo "$local_tables" | grep "^system_" | sort)
  
  if [[ -z "$system_tables" ]]; then
    log_info "没有找到系统数据表"
    return 0
  fi
  
  local issues=0
  
  echo "$system_tables" | while read table; do
    if [[ -z "$table" ]]; then
      continue
    fi
    
    local local_count=$(get_table_count "LOCAL" "$table")
    local remote_count=$(get_table_count "$TARGET_ENV" "$table")
    
    if [[ "$local_count" != "$remote_count" ]]; then
      log_warn "表 $table 数据不一致: 本地=$local_count, 远程=$remote_count"
      issues=$((issues + 1))
    else
      log_success "表 $table 数据一致: $local_count 行"
    fi
  done
  
  return $issues
}

# 验证关键表
verify_critical_tables() {
  log_info "验证关键表..."
  
  local critical_tables=(
    "users"
    "system_config"
    "system_eras"
    "system_characters"
  )
  
  local all_exist=true
  
  for table in "${critical_tables[@]}"; do
    local local_count=$(get_table_count "LOCAL" "$table" 2>/dev/null || echo "0")
    local remote_count=$(get_table_count "$TARGET_ENV" "$table" 2>/dev/null || echo "0")
    
    if [[ "$local_count" == "0" && "$remote_count" == "0" ]]; then
      log_warn "关键表 $table 不存在或为空"
      all_exist=false
    elif [[ "$remote_count" == "0" ]]; then
      log_error "关键表 $table 在远程数据库中不存在或为空"
      all_exist=false
    else
      log_success "关键表 $table 存在: $remote_count 行"
    fi
  done
  
  if [[ "$all_exist" == "true" ]]; then
    return 0
  else
    return 1
  fi
}

# 生成验证报告
generate_report() {
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local report_file="${REPORT_DIR}/verification_${timestamp}.md"
  
  {
    echo "# 数据库迁移验证报告"
    echo ""
    echo "生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "目标环境: $TARGET_ENV"
    echo ""
    echo "## 验证结果"
    echo ""
    
    # 表结构验证
    echo "### 表结构一致性"
    echo ""
    if verify_schema; then
      echo "✅ 所有表都存在"
    else
      echo "❌ 发现缺失的表"
    fi
    echo ""
    
    # 系统数据验证
    echo "### 系统数据一致性"
    echo ""
    verify_system_data || true
    echo ""
    
    # 关键表验证
    echo "### 关键表验证"
    echo ""
    if verify_critical_tables; then
      echo "✅ 所有关键表都存在且有数据"
    else
      echo "❌ 部分关键表存在问题"
    fi
    
  } > "$report_file"
  
  log_info "验证报告已生成: $report_file"
  echo "$report_file"
}

# 主函数
main() {
  log_info "========================================="
  log_info "数据库迁移验证工具"
  log_info "目标环境: $TARGET_ENV"
  log_info "========================================="
  
  # 验证表结构
  local schema_ok=true
  if ! verify_schema; then
    schema_ok=false
  fi
  
  # 验证系统数据
  verify_system_data || true
  
  # 验证关键表
  local critical_ok=true
  if ! verify_critical_tables; then
    critical_ok=false
  fi
  
  # 生成报告
  local report_file=$(generate_report)
  
  log_info "========================================="
  log_info "验证完成"
  log_info "报告文件: $report_file"
  log_info "========================================="
  
  if [[ "$schema_ok" == "true" && "$critical_ok" == "true" ]]; then
    log_success "验证通过"
    exit 0
  else
    log_error "验证发现问题，请查看报告"
    exit 1
  fi
}

# 执行主函数
main "$@"
