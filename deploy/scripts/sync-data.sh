#!/bin/bash

# 数据同步脚本
# 同步系统数据（system_* 表）和用户图片数据
#
# 使用方法:
#   ./sync-data.sh --config FILE --env ENV

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

# 检查表是否存在
table_exists() {
  local env=$1
  local table=$2
  
  local tables=$(get_table_list "$env")
  echo "$tables" | grep -q "^${table}$"
}

# 获取主键字段
get_primary_key() {
  local env=$1
  local table=$2
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND CONSTRAINT_NAME = 'PRIMARY' ORDER BY ORDINAL_POSITION LIMIT 1" 2>/dev/null
}

# 同步系统数据表
sync_system_tables() {
  log_info "开始同步系统数据表..."
  
  local local_tables=$(get_table_list "LOCAL")
  local system_tables=$(echo "$local_tables" | grep "^system_")
  
  if [[ -z "$system_tables" ]]; then
    log_info "没有找到系统数据表"
    return 0
  fi
  
  echo "$system_tables" | while read table; do
    if [[ -z "$table" ]]; then
      continue
    fi
    
    # 检查远程表是否存在
    if ! table_exists "$TARGET_ENV" "$table"; then
      log_warn "远程表不存在，跳过: $table"
      continue
    fi
    
    log_info "同步表: $table"
    
    # 获取主键
    local primary_key=$(get_primary_key "LOCAL" "$table")
    if [[ -z "$primary_key" ]]; then
      log_warn "表 $table 没有主键，跳过"
      continue
    fi
    
    # 导出数据
    local data_file="${TEMP_DIR}/data_${table}.sql"
    local local_args=$(build_mysql_args "LOCAL")
    
    if [[ "$DRY_RUN" == "true" ]]; then
      log_warn "[DRY-RUN] 将同步表: $table"
      # 获取数据行数
      local count=$(mysql $local_args -N -e "SELECT COUNT(*) FROM \`$table\`" 2>/dev/null)
      log_info "  本地数据行数: $count"
    else
      # 导出数据为 INSERT ... ON DUPLICATE KEY UPDATE 格式
      mysqldump $local_args --no-create-info --skip-triggers --complete-insert --extended-insert=false --where="1=1" "$table" 2>/dev/null | \
        sed "s/^INSERT INTO/INSERT INTO \`$table\`/" | \
        sed "s/;$/,/; s/)$/)\nON DUPLICATE KEY UPDATE/" > "$data_file"
      
      # 为每个字段生成 ON DUPLICATE KEY UPDATE 子句
      local columns=$(mysql $local_args -N -e "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND COLUMN_NAME != '$primary_key' ORDER BY ORDINAL_POSITION" 2>/dev/null)
      
      {
        echo "UPDATE \`$table\` SET"
        local first=true
        echo "$columns" | while read column; do
          if [[ -n "$column" ]]; then
            if [[ "$first" == "true" ]]; then
              echo -n "  \`$column\` = VALUES(\`$column\`)"
              first=false
            else
              echo ","
              echo -n "  \`$column\` = VALUES(\`$column\`)"
            fi
          fi
        done
        echo ";"
      } >> "$data_file"
      
      # 执行同步
      local remote_args=$(build_mysql_args "$TARGET_ENV")
      if mysql $remote_args < "$data_file" 2>/dev/null; then
        local count=$(mysql $local_args -N -e "SELECT COUNT(*) FROM \`$table\`" 2>/dev/null)
        log_success "表同步成功: $table (共 $count 行)"
      else
        log_error "表同步失败: $table"
      fi
    fi
  done
}

# 同步用户图片数据
sync_user_image_data() {
  log_info "开始同步用户图片数据..."
  
  # 定义包含图片字段的用户表
  local user_tables=(
    "users:avatar_url"
    "characters:avatar_url,background_url"
    "user_profiles:avatar_url"
  )
  
  for table_def in "${user_tables[@]}"; do
    local table="${table_def%%:*}"
    local image_fields="${table_def##*:}"
    
    # 检查表是否存在
    if ! table_exists "LOCAL" "$table" || ! table_exists "$TARGET_ENV" "$table"; then
      continue
    fi
    
    log_info "检查表: $table"
    
    # 获取主键
    local primary_key=$(get_primary_key "LOCAL" "$table")
    if [[ -z "$primary_key" ]]; then
      log_warn "表 $table 没有主键，跳过"
      continue
    fi
    
    # 构建更新语句
    IFS=',' read -ra fields <<< "$image_fields"
    
    if [[ "$DRY_RUN" == "true" ]]; then
      log_warn "[DRY-RUN] 将更新表: $table 的图片字段"
      local local_args=$(build_mysql_args "LOCAL")
      local count=$(mysql $local_args -N -e "SELECT COUNT(*) FROM \`$table\` WHERE " 2>/dev/null || echo "0")
      log_info "  将检查 $count 行数据"
    else
      # 这里应该实现具体的更新逻辑
      # 由于涉及复杂的数据对比和更新，建议使用存储过程或脚本化 SQL
      log_warn "用户图片数据同步需要手动实现详细逻辑"
      log_info "表: $table, 字段: $image_fields"
    fi
  done
}

# 主函数
main() {
  log_info "========================================="
  log_info "数据同步工具"
  log_info "目标环境: $TARGET_ENV"
  log_info "干运行模式: $DRY_RUN"
  log_info "========================================="
  
  # 同步系统数据表
  sync_system_tables
  
  # 同步用户图片数据
  sync_user_image_data
  
  log_success "数据同步完成"
}

# 执行主函数
main "$@"
