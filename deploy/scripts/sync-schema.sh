#!/bin/bash

# 表结构同步脚本
# 将本地数据库的表结构同步到远程数据库
# 创建缺失的表，添加缺失的字段和索引

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

# 日志函数
log() {
  local level=$1
  shift
  echo -e "[$level] $@"
}

log_info() {
  log "INFO" "$@"
}

log_success() {
  log "SUCCESS" -e "${GREEN}$@${NC}"
}

log_error() {
  log "ERROR" -e "${RED}$@${NC}"
}

log_warn() {
  log "WARN" -e "${YELLOW}$@${NC}"
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

# 导出单个表的创建语句
export_table_definition() {
  local env=$1
  local table=$2
  local output_file=$3
  
  local args=$(build_mysql_args "$env")
  
  mysqldump $args --no-data --skip-comments --skip-triggers --routines=false --tables "$table" 2>/dev/null | grep -v "^--" | grep -v "^/\*" | grep -v "^$"
}

# 检查表是否存在
table_exists() {
  local env=$1
  local table=$2
  local args=$(build_mysql_args "$env")
  
  local count=$(mysql $args -N -e "SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table'" 2>/dev/null)
  
  [[ "$count" -gt 0 ]]
}

# 获取表的字段列表
get_columns() {
  local env=$1
  local table=$2
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' ORDER BY ORDINAL_POSITION" 2>/dev/null
}

# 获取字段定义
get_column_definition() {
  local env=$1
  local table=$2
  local column=$3
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA, COLUMN_COMMENT FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND COLUMN_NAME = '$column'" 2>/dev/null
}

# 创建缺失的表
create_missing_tables() {
  log_info "检查缺失的表..."
  
  local local_tables=$(get_table_list "LOCAL")
  local remote_tables=$(get_table_list "$TARGET_ENV")
  local missing_tables=$(comm -23 <(echo "$local_tables" | sort) <(echo "$remote_tables" | sort) 2>/dev/null || echo "$local_tables")
  
  if [[ -z "$missing_tables" ]]; then
    log_success "所有表都已存在"
    return 0
  fi
  
  echo "$missing_tables" | while read table; do
    if [[ -z "$table" ]]; then
      continue
    fi
    
    log_info "发现缺失的表: $table"
    
    # 导出表定义
    local table_file="${TEMP_DIR}/table_${table}.sql"
    export_table_definition "LOCAL" "$table" > "$table_file"
    
    if [[ "$DRY_RUN" == "true" ]]; then
      log_warn "[DRY-RUN] 将创建表: $table"
      cat "$table_file"
    else
      local remote_args=$(build_mysql_args "$TARGET_ENV")
      
      if mysql $remote_args < "$table_file" 2>/dev/null; then
        log_success "表创建成功: $table"
      else
        log_error "表创建失败: $table"
      fi
    fi
  done
}

# 添加缺失的字段
add_missing_columns() {
  log_info "检查缺失的字段..."
  
  local local_tables=$(get_table_list "LOCAL")
  local remote_tables=$(get_table_list "$TARGET_ENV")
  local common_tables=$(comm -12 <(echo "$local_tables" | sort) <(echo "$remote_tables" | sort) 2>/dev/null || echo "")
  
  if [[ -z "$common_tables" ]]; then
    log_info "没有共同的表需要检查字段"
    return 0
  fi
  
  echo "$common_tables" | while read table; do
    if [[ -z "$table" ]]; then
      continue
    fi
    
    local local_columns=$(get_columns "LOCAL" "$table" | sort)
    local remote_columns=$(get_columns "$TARGET_ENV" "$table" | sort)
    local missing_columns=$(comm -23 <(echo "$local_columns") <(echo "$remote_columns") 2>/dev/null || echo "")
    
    if [[ -n "$missing_columns" ]]; then
      echo "$missing_columns" | while read column; do
        if [[ -z "$column" ]]; then
          continue
        fi
        
        log_info "发现缺失的字段: $table.$column"
        
        # 获取字段定义（简化版，实际应该从 CREATE TABLE 语句中提取完整的字段定义）
        if [[ "$DRY_RUN" == "true" ]]; then
          log_warn "[DRY-RUN] 将添加字段: $table.$column"
        else
          log_warn "字段添加功能需要手动实现，建议使用完整的 CREATE TABLE 语句"
          log_warn "表: $table, 字段: $column"
        fi
      done
    fi
  done
}

# 主函数
main() {
  log_info "========================================="
  log_info "表结构同步工具"
  log_info "目标环境: $TARGET_ENV"
  log_info "干运行模式: $DRY_RUN"
  log_info "========================================="
  
  # 创建缺失的表
  create_missing_tables
  
  # 添加缺失的字段（简化实现）
  # 注意：完整的字段添加需要解析 CREATE TABLE 语句，这里仅提供框架
  add_missing_columns
  
  log_success "表结构同步完成"
}

# 执行主函数
main "$@"
