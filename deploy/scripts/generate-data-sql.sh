#!/bin/bash

# 生成数据同步 SQL 脚本
# 基于本地数据库生成用于同步系统数据和用户图片数据的 SQL 脚本
#
# 使用方法:
#   ./generate-data-sql.sh [options]

set -euo pipefail

# 设置 UTF-8 编码环境
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

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
SQL_OUTPUT_DIR="${SCRIPT_DIR}/sql"

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
    --output-dir)
      SQL_OUTPUT_DIR="$2"
      shift 2
      ;;
    --help)
      echo "生成数据同步 SQL 脚本"
      echo ""
      echo "使用方法:"
      echo "  $0 [options]"
      echo ""
      echo "选项:"
      echo "  --config FILE      指定配置文件路径"
      echo "  --env ENV          指定目标环境 (默认: prod)"
      echo "  --output-dir DIR   指定 SQL 脚本输出目录 (默认: ./sql)"
      echo "  --help             显示帮助信息"
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

# 创建目录
mkdir -p "$TEMP_DIR"
mkdir -p "$SQL_OUTPUT_DIR"

# 日志函数
log_info() {
  echo -e "[INFO] $@"
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
  
  # 添加字符集参数确保 UTF-8 编码
  echo "-h$host -P$port -u$user -p$password --default-character-set=utf8mb4 $name"
}

# 获取表列表
get_table_list() {
  local env=$1
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME" 2>/dev/null
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
  
  mysql $args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND CONSTRAINT_NAME = 'PRIMARY' ORDER BY ORDINAL_POSITION LIMIT 1" 2>/dev/null
}

# 获取表的记录数
get_table_count() {
  local env=$1
  local table=$2
  local args=$(build_mysql_args "$env")
  
  mysql $args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT COUNT(*) FROM \`$table\`" 2>/dev/null || echo "0"
}

# 生成系统数据同步 SQL
generate_system_data_sql() {
  local sql_file=$1
  local local_tables=$(get_table_list "LOCAL")
  local system_tables=$(echo "$local_tables" | grep "^system_" | sort)
  
  if [[ -z "$system_tables" ]]; then
    echo "-- 没有找到系统数据表" >> "$sql_file"
    echo "" >> "$sql_file"
    return 0
  fi
  
  echo "-- ========================================" >> "$sql_file"
  echo "-- 同步系统数据表 (system_*)" >> "$sql_file"
  echo "-- ========================================" >> "$sql_file"
  echo "" >> "$sql_file"
  
  local local_args=$(build_mysql_args "LOCAL")
  
  echo "$system_tables" | while read table; do
    if [[ -z "$table" ]]; then
      continue
    fi
    
    # 检查远程表是否存在
    if ! table_exists "$TARGET_ENV" "$table"; then
      echo "-- 警告: 远程表不存在，跳过: $table" >> "$sql_file"
      echo "" >> "$sql_file"
      continue
    fi
    
    log_info "生成系统数据同步 SQL: $table"
    
    # 获取主键
    local primary_key=$(get_primary_key "LOCAL" "$table")
    if [[ -z "$primary_key" ]]; then
      echo "-- 警告: 表 $table 没有主键，跳过" >> "$sql_file"
      echo "" >> "$sql_file"
      continue
    fi
    
    # 获取表的记录数
    local count=$(get_table_count "LOCAL" "$table")
    echo "-- 表: $table (共 $count 行数据)" >> "$sql_file"
    
    # 导出数据为 INSERT ... ON DUPLICATE KEY UPDATE 格式
    local temp_file="${TEMP_DIR}/data_${table}.tmp"
    
    # 使用 mysqldump 导出数据（指定 UTF-8 字符集）
    mysqldump $local_args --no-create-info --skip-triggers --complete-insert --extended-insert=false --default-character-set=utf8mb4 --set-charset --where="1=1" "$table" 2>/dev/null | \
      sed "s/^INSERT INTO \`[^\`]*\` \`[^\`]*\`/INSERT INTO \`${table}\`/" | \
      sed "s/^INSERT INTO \`[^\`]*\`/INSERT INTO \`${table}\`/" > "$temp_file"
    
    # 获取所有字段（除了主键），确保使用 UTF-8 字符集
    local columns=$(mysql $local_args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND COLUMN_NAME != '$primary_key' ORDER BY ORDINAL_POSITION" 2>/dev/null)
    
    # 处理 INSERT 语句，添加 ON DUPLICATE KEY UPDATE
    cat "$temp_file" | while IFS= read -r line; do
      if [[ "$line" =~ ^INSERT ]]; then
        # 将行末的 ; 替换为 ,
        echo "${line%;}" | sed 's/;$/,/' >> "$sql_file"
        echo "ON DUPLICATE KEY UPDATE" >> "$sql_file"
        
        # 添加 UPDATE 子句
        local first=true
        echo "$columns" | while read column; do
          if [[ -n "$column" ]]; then
            if [[ "$first" == "true" ]]; then
              echo -n "  \`$column\` = VALUES(\`$column\`)" >> "$sql_file"
              first=false
            else
              echo "," >> "$sql_file"
              echo -n "  \`$column\` = VALUES(\`$column\`)" >> "$sql_file"
            fi
          fi
        done
        echo ";" >> "$sql_file"
      fi
    done
    
    echo "" >> "$sql_file"
    rm -f "$temp_file"
  done
}

# 生成用户图片数据同步 SQL
generate_user_image_sql() {
  local sql_file=$1
  
  # 定义包含图片字段的用户表
  local user_tables=(
    "users:avatar_url"
    "characters:avatar_url,background_url"
    "user_profiles:avatar_url"
  )
  
  echo "-- ========================================" >> "$sql_file"
  echo "-- 同步用户图片数据" >> "$sql_file"
  echo "-- ========================================" >> "$sql_file"
  echo "" >> "$sql_file"
  echo "-- 注意: 用户图片数据同步需要手动实现详细逻辑" >> "$sql_file"
  echo "-- 以下仅提供框架，实际使用时需要根据具体需求调整" >> "$sql_file"
  echo "" >> "$sql_file"
  
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
      echo "-- 警告: 表 $table 没有主键，跳过" >> "$sql_file"
      echo "" >> "$sql_file"
      continue
    fi
    
    echo "-- 表: $table" >> "$sql_file"
    echo "-- 图片字段: $image_fields" >> "$sql_file"
    echo "-- 待实现: 根据主键对比本地和远程数据，更新图片字段" >> "$sql_file"
    echo "" >> "$sql_file"
  done
}

# 生成 SQL 脚本
generate_sql_script() {
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local sql_file="${SQL_OUTPUT_DIR}/data_sync_${TARGET_ENV}_${timestamp}.sql"
  
  log_info "正在生成数据同步 SQL 脚本..."
  
  {
    # 确保输出使用 UTF-8 编码
    echo "-- 数据同步 SQL 脚本"
    echo "-- 生成时间: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "-- 目标环境: $TARGET_ENV"
    local env_upper=$(to_upper "$TARGET_ENV")
    local name_var="${env_upper}_DB_NAME"
    echo "-- 数据库: ${!name_var}"
    echo "-- 字符集: UTF-8 (utf8mb4)"
    echo ""
    echo "SET NAMES utf8mb4;"
    echo "SET CHARACTER SET utf8mb4;"
    echo "SET FOREIGN_KEY_CHECKS=0;"
    echo "SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';"
    echo "SET AUTOCOMMIT=0;"
    echo "START TRANSACTION;"
    echo ""
    
  } > "$sql_file"
  
  # 生成系统数据同步 SQL
  generate_system_data_sql "$sql_file"
  
  # 生成用户图片数据同步 SQL
  generate_user_image_sql "$sql_file"
  
  {
    echo "COMMIT;"
    echo "SET FOREIGN_KEY_CHECKS=1;"
    
  } >> "$sql_file"
  
  log_success "SQL 脚本已生成: $sql_file"
  echo "$sql_file"
}

# 主函数
main() {
  log_info "========================================="
  log_info "生成数据同步 SQL 脚本"
  log_info "目标环境: $TARGET_ENV"
  log_info "输出目录: $SQL_OUTPUT_DIR"
  log_info "========================================="
  
  # 测试本地数据库连接
  local env_upper_local=$(to_upper "LOCAL")
  local host_var_local="${env_upper_local}_DB_HOST"
  local port_var_local="${env_upper_local}_DB_PORT"
  local user_var_local="${env_upper_local}_DB_USER"
  local name_var_local="${env_upper_local}_DB_NAME"
  local password_local=$(get_password "LOCAL")
  
  local host_local="${!host_var_local}"
  local port_local="${!port_var_local}"
  local user_local="${!user_var_local}"
  local name_local="${!name_var_local}"
  
  if ! mysql -h"$host_local" -P"$port_local" -u"$user_local" -p"$password_local" "$name_local" -e "SELECT 1" &> /dev/null; then
    log_error "本地数据库连接失败"
    exit 1
  fi
  
  # 测试远程数据库连接
  local env_upper_target=$(to_upper "$TARGET_ENV")
  local host_var_target="${env_upper_target}_DB_HOST"
  local port_var_target="${env_upper_target}_DB_PORT"
  local user_var_target="${env_upper_target}_DB_USER"
  local name_var_target="${env_upper_target}_DB_NAME"
  local password_target=$(get_password "$TARGET_ENV")
  
  local host_target="${!host_var_target}"
  local port_target="${!port_var_target}"
  local user_target="${!user_var_target}"
  local name_target="${!name_var_target}"
  
  if ! mysql -h"$host_target" -P"$port_target" -u"$user_target" -p"$password_target" "$name_target" -e "SELECT 1" &> /dev/null; then
    log_error "远程数据库连接失败"
    exit 1
  fi
  
  # 生成 SQL 脚本
  local sql_file=$(generate_sql_script)
  
  log_info "========================================="
  log_success "SQL 脚本生成完成"
  log_info "脚本文件: $sql_file"
  log_info "========================================="
  log_info "请审查 SQL 脚本后执行："
  log_info "  mysql -h <host> -u <user> -p <database> < $sql_file"
}

# 执行主函数
main "$@"
