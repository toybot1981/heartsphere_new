#!/bin/bash

# 生成表结构同步 SQL 脚本
# 基于本地数据库生成用于同步到远程数据库的 SQL 脚本
#
# 使用方法:
#   ./generate-schema-sql.sh [options]

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
      echo "生成表结构同步 SQL 脚本"
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

# 导出单个表的创建语句
export_table_definition() {
  local env=$1
  local table=$2
  
  local args=$(build_mysql_args "$env")
  
  # 确保使用 UTF-8 字符集导出
  mysqldump $args --no-data --skip-comments --skip-triggers --routines=false --default-character-set=utf8mb4 --set-charset --tables "$table" 2>/dev/null | \
    grep -v "^--" | \
    grep -v "^/\*" | \
    grep -v "^$" | \
    sed 's/^USE `.*`;$//' | \
    grep -v "^SET @" | \
    grep -v "^LOCK TABLES" | \
    grep -v "^UNLOCK TABLES" | \
    sed 's/CHARSET=[^ ]*/CHARSET=utf8mb4/g' | \
    sed 's/CHARACTER SET [^ ]*/CHARACTER SET utf8mb4/g'
}

# 生成 SQL 脚本
generate_sql_script() {
  local timestamp=$(date +"%Y%m%d_%H%M%S")
  local sql_file="${SQL_OUTPUT_DIR}/schema_sync_${TARGET_ENV}_${timestamp}.sql"
  
  log_info "正在生成表结构同步 SQL 脚本..."
  
  {
    # 确保输出使用 UTF-8 编码
    echo "-- 表结构同步 SQL 脚本"
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
    
    # 获取表列表
    local local_tables=$(get_table_list "LOCAL")
    local remote_tables=$(get_table_list "$TARGET_ENV" 2>/dev/null || echo "")
    
    # 找出缺失的表
    local missing_tables=$(comm -23 <(echo "$local_tables" | sort) <(echo "$remote_tables" | sort) 2>/dev/null || echo "$local_tables")
    
    if [[ -n "$missing_tables" ]]; then
      echo "-- ========================================"
      echo "-- 创建缺失的表"
      echo "-- ========================================"
      echo ""
      
      echo "$missing_tables" | while read table; do
        if [[ -z "$table" ]]; then
          continue
        fi
        
        log_info "生成表创建语句: $table"
        echo "-- 创建表: $table"
        export_table_definition "LOCAL" "$table"
        echo ";"
        echo ""
      done
    else
      echo "-- 所有表都已存在，无需创建"
      echo ""
    fi
    
    # 生成 ALTER TABLE 语句（添加缺失的字段）
    echo "-- ========================================"
    echo "-- 添加缺失的字段"
    echo "-- ========================================"
    echo ""
    
    local common_tables=$(comm -12 <(echo "$local_tables" | sort) <(echo "$remote_tables" | sort) 2>/dev/null || echo "")
    
    if [[ -n "$common_tables" ]]; then
      echo "$common_tables" | while read table; do
        if [[ -z "$table" ]]; then
          continue
        fi
        
        # 获取字段列表
        local local_args=$(build_mysql_args "LOCAL")
        local remote_args=$(build_mysql_args "$TARGET_ENV")
        
        local local_columns=$(mysql $local_args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' ORDER BY ORDINAL_POSITION" 2>/dev/null | sort)
        local remote_columns=$(mysql $remote_args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' ORDER BY ORDINAL_POSITION" 2>/dev/null | sort)
        local missing_columns=$(comm -23 <(echo "$local_columns") <(echo "$remote_columns") 2>/dev/null || echo "")
        
        if [[ -n "$missing_columns" ]]; then
          echo "-- 表: $table"
          echo "$missing_columns" | while read column; do
            if [[ -z "$column" ]]; then
              continue
            fi
            
            # 获取字段定义（确保使用 UTF-8 字符集）
            # 使用 CONVERT 函数确保 COMMENT 正确编码
            local col_def=$(mysql $local_args -N -e "SET NAMES utf8mb4; SET CHARACTER SET utf8mb4; SELECT CONCAT(COLUMN_NAME, ' ', COLUMN_TYPE, IF(IS_NULLABLE='NO', ' NOT NULL', ''), IF(COLUMN_DEFAULT IS NOT NULL, CONCAT(' DEFAULT ', QUOTE(COLUMN_DEFAULT)), ''), IF(EXTRA != '', CONCAT(' ', EXTRA), ''), IF(COLUMN_COMMENT != '' AND COLUMN_COMMENT IS NOT NULL, CONCAT(' COMMENT ', QUOTE(COLUMN_COMMENT)), '')) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = '$table' AND COLUMN_NAME = '$column'" 2>/dev/null)
            
            echo "ALTER TABLE \`$table\` ADD COLUMN $col_def;"
          done
          echo ""
        fi
      done
    fi
    
    echo "COMMIT;"
    echo "SET FOREIGN_KEY_CHECKS=1;"
    
  } > "$sql_file"
  
  log_success "SQL 脚本已生成: $sql_file"
  echo "$sql_file"
}

# 主函数
main() {
  log_info "========================================="
  log_info "生成表结构同步 SQL 脚本"
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
