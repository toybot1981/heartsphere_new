#!/bin/bash

# 数据库迁移主脚本
# 用于将本地数据库的变更同步到生产环境
#
# 使用方法:
#   ./migrate-database.sh [options]
#
# 选项:
#   --env local|prod        指定目标环境 (默认: prod)
#   --dry-run               干运行模式，只显示将要执行的操作，不实际执行
#   --generate-sql          生成 SQL 脚本文件而不是直接执行
#   --skip-backup           跳过备份步骤
#   --skip-schema           跳过表结构同步
#   --skip-data             跳过数据同步
#   --config FILE           指定配置文件路径 (默认: ./db-migration.config)
#   --help                  显示帮助信息

set -euo pipefail

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="${SCRIPT_DIR}/scripts"
CONFIG_FILE="${SCRIPT_DIR}/db-migration.config"
LOG_DIR="${SCRIPT_DIR}/logs"
BACKUP_DIR="${SCRIPT_DIR}/backups"
SQL_OUTPUT_DIR="${SCRIPT_DIR}/sql"

# 默认参数
TARGET_ENV="prod"
DRY_RUN=false
GENERATE_SQL=false
SKIP_BACKUP=false
SKIP_SCHEMA=false
SKIP_DATA=false
SQL_OUTPUT_DIR="${SCRIPT_DIR}/sql"

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      TARGET_ENV="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --generate-sql)
      GENERATE_SQL=true
      shift
      ;;
    --sql-output-dir)
      SQL_OUTPUT_DIR="$2"
      shift 2
      ;;
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --skip-schema)
      SKIP_SCHEMA=true
      shift
      ;;
    --skip-data)
      SKIP_DATA=true
      shift
      ;;
    --config)
      CONFIG_FILE="$2"
      shift 2
      ;;
    --help)
      echo "数据库迁移脚本"
      echo ""
      echo "使用方法:"
      echo "  $0 [options]"
      echo ""
      echo "选项:"
      echo "  --env local|prod        指定目标环境 (默认: prod)"
      echo "  --dry-run               干运行模式，只显示将要执行的操作"
      echo "  --generate-sql          生成 SQL 脚本文件而不是直接执行"
      echo "  --sql-output-dir DIR    指定 SQL 脚本输出目录 (默认: ./sql)"
      echo "  --skip-backup           跳过备份步骤"
      echo "  --skip-schema           跳过表结构同步"
      echo "  --skip-data             跳过数据同步"
      echo "  --config FILE           指定配置文件路径"
      echo "  --help                  显示帮助信息"
      exit 0
      ;;
    *)
      echo -e "${RED}错误: 未知参数: $1${NC}"
      echo "使用 --help 查看帮助信息"
      exit 1
      ;;
  esac
done

# 加载配置文件
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo -e "${RED}错误: 配置文件不存在: $CONFIG_FILE${NC}"
  exit 1
fi

source "$CONFIG_FILE"

# 创建必要的目录
mkdir -p "$LOG_DIR"
mkdir -p "$BACKUP_DIR"

# 日志文件
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="${LOG_DIR}/migration_${TIMESTAMP}.log"

# 日志函数
log() {
  local level=$1
  shift
  local message="$@"
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() {
  log "INFO" "$@"
}

log_warn() {
  log "WARN" -e "${YELLOW}$@${NC}"
}

log_error() {
  log "ERROR" -e "${RED}$@${NC}"
}

log_success() {
  log "SUCCESS" -e "${GREEN}$@${NC}"
}

# 检查必需的命令
check_requirements() {
  local missing=()
  
  for cmd in mysql mysqldump; do
    if ! command -v "$cmd" &> /dev/null; then
      missing+=("$cmd")
    fi
  done
  
  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "缺少必需的命令: ${missing[*]}"
    log_error "请安装 MySQL 客户端工具"
    exit 1
  fi
  
  log_info "必需的命令检查通过"
}

# 转换为大写（兼容不同 shell）
to_upper() {
  echo "$1" | tr '[:lower:]' '[:upper:]'
}

# 获取数据库密码（并保存到环境变量以便子脚本使用）
get_password() {
  local env=$1
  local env_upper=$(to_upper "$env")
  local password_var="${env_upper}_DB_PASSWORD"
  local password="${!password_var:-}"
  
  if [[ -z "$password" ]]; then
    local host_var="${env_upper}_DB_HOST"
    local user_var="${env_upper}_DB_USER"
    local host="${!host_var}"
    local user="${!user_var}"
    echo -n "请输入${env}数据库密码 (host=$host, user=$user): " >&2
    read -s password
    echo >&2
    if [[ -z "$password" ]]; then
      log_error "密码不能为空"
      exit 1
    fi
    # 将密码保存到环境变量，以便子脚本使用
    export "$password_var=$password"
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

# 测试数据库连接
test_connection() {
  local env=$1
  log_info "测试${env}数据库连接..."
  
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
  
  log_info "连接信息: host=$host, port=$port, user=$user, database=$name"
  
  # 使用临时文件存储错误信息
  local error_file=$(mktemp)
  
  # 测试连接，将错误输出到临时文件
  if mysql -h"$host" -P"$port" -u"$user" -p"$password" "$name" -e "SELECT 1" 2>"$error_file"; then
    log_success "${env}数据库连接成功"
    rm -f "$error_file"
    return 0
  else
    local error_msg=$(cat "$error_file" 2>/dev/null | head -1)
    log_error "${env}数据库连接失败"
    if [[ -n "$error_msg" ]]; then
      log_error "错误详情: $error_msg"
    fi
    rm -f "$error_file"
    return 1
  fi
}

# 备份远程数据库
backup_remote_database() {
  if [[ "$SKIP_BACKUP" == "true" ]]; then
    log_warn "跳过备份步骤"
    return 0
  fi
  
  log_info "开始备份远程数据库..."
  
  local env_upper=$(to_upper "$TARGET_ENV")
  local host_var="${env_upper}_DB_HOST"
  local port_var="${env_upper}_DB_PORT"
  local user_var="${env_upper}_DB_USER"
  local name_var="${env_upper}_DB_NAME"
  
  local host="${!host_var}"
  local port="${!port_var}"
  local user="${!user_var}"
  local name="${!name_var}"
  local password=$(get_password "$TARGET_ENV")
  
  local backup_file="${BACKUP_DIR}/backup_${TARGET_ENV}_${TIMESTAMP}.sql"
  
  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[DRY-RUN] 将执行备份: mysqldump -h$host -P$port -u$user -p*** $name > $backup_file"
    return 0
  fi
  
  if mysqldump -h"$host" -P"$port" -u"$user" -p"$password" "$name" --single-transaction --routines --triggers > "$backup_file" 2>> "$LOG_FILE"; then
    log_success "备份完成: $backup_file"
    
    # 压缩备份文件
    if command -v gzip &> /dev/null; then
      gzip "$backup_file"
      backup_file="${backup_file}.gz"
      log_info "备份文件已压缩: $backup_file"
    fi
    
    # 清理旧备份
    find "$BACKUP_DIR" -name "backup_${TARGET_ENV}_*.sql*" -mtime +${BACKUP_RETENTION_DAYS:-7} -delete 2>/dev/null || true
    
    return 0
  else
    log_error "备份失败"
    return 1
  fi
}

# 主函数
main() {
  log_info "========================================="
  log_info "数据库迁移脚本启动"
  log_info "目标环境: $TARGET_ENV"
  log_info "干运行模式: $DRY_RUN"
  log_info "日志文件: $LOG_FILE"
  log_info "========================================="
  
  # 检查必需命令
  check_requirements
  
  # 测试数据库连接
  if ! test_connection "LOCAL"; then
    exit 1
  fi
  
  if ! test_connection "$TARGET_ENV"; then
    exit 1
  fi
  
  # 备份远程数据库（仅在非生成 SQL 模式下执行）
  if [[ "$GENERATE_SQL" != "true" && "$SKIP_BACKUP" != "true" ]]; then
    if ! backup_remote_database; then
      log_error "备份失败，停止迁移"
      exit 1
    fi
  elif [[ "$GENERATE_SQL" == "true" ]]; then
    log_info "生成 SQL 模式，跳过备份步骤"
  fi
  
  # 创建 SQL 输出目录
  mkdir -p "$SQL_OUTPUT_DIR"
  
  # 生成 SQL 脚本模式
  if [[ "$GENERATE_SQL" == "true" ]]; then
    log_info "生成 SQL 脚本模式..."
    
    # 确保密码已保存到环境变量（通过测试连接时已获取）
    # 重新获取密码以确保环境变量已设置（不会重复提示，因为已缓存）
    local local_pwd=$(get_password "LOCAL")
    local target_pwd=$(get_password "$TARGET_ENV")
    export LOCAL_DB_PASSWORD="$local_pwd"
    export PROD_DB_PASSWORD="$target_pwd"
    
    # 生成表结构同步 SQL
    if [[ "$SKIP_SCHEMA" != "true" ]]; then
      log_info "生成表结构同步 SQL 脚本..."
      if [[ -f "${SCRIPTS_DIR}/generate-schema-sql.sh" ]]; then
        "${SCRIPTS_DIR}/generate-schema-sql.sh" --config "$CONFIG_FILE" --env "$TARGET_ENV" --output-dir "$SQL_OUTPUT_DIR" 2>&1 | tee -a "$LOG_FILE"
      else
        log_warn "表结构 SQL 生成脚本不存在，跳过"
      fi
    else
      log_warn "跳过表结构 SQL 生成"
    fi
    
    # 生成数据同步 SQL
    if [[ "$SKIP_DATA" != "true" ]]; then
      log_info "生成数据同步 SQL 脚本..."
      if [[ -f "${SCRIPTS_DIR}/generate-data-sql.sh" ]]; then
        "${SCRIPTS_DIR}/generate-data-sql.sh" --config "$CONFIG_FILE" --env "$TARGET_ENV" --output-dir "$SQL_OUTPUT_DIR" 2>&1 | tee -a "$LOG_FILE"
      else
        log_warn "数据同步 SQL 生成脚本不存在，跳过"
      fi
    else
      log_warn "跳过数据同步 SQL 生成"
    fi
    
    log_success "SQL 脚本已生成到: $SQL_OUTPUT_DIR"
    log_info "请审查 SQL 脚本后手动执行"
  else
    # 直接执行模式
    # 表结构同步
    if [[ "$SKIP_SCHEMA" != "true" ]]; then
      log_info "开始表结构同步..."
      if [[ -f "${SCRIPTS_DIR}/sync-schema.sh" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
          "${SCRIPTS_DIR}/sync-schema.sh" --dry-run --config "$CONFIG_FILE" --env "$TARGET_ENV" 2>&1 | tee -a "$LOG_FILE"
        else
          "${SCRIPTS_DIR}/sync-schema.sh" --config "$CONFIG_FILE" --env "$TARGET_ENV" 2>&1 | tee -a "$LOG_FILE"
        fi
      else
        log_warn "表结构同步脚本不存在，跳过"
      fi
    else
      log_warn "跳过表结构同步"
    fi
    
    # 数据同步
    if [[ "$SKIP_DATA" != "true" ]]; then
      log_info "开始数据同步..."
      if [[ -f "${SCRIPTS_DIR}/sync-data.sh" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
          "${SCRIPTS_DIR}/sync-data.sh" --dry-run --config "$CONFIG_FILE" --env "$TARGET_ENV" 2>&1 | tee -a "$LOG_FILE"
        else
          "${SCRIPTS_DIR}/sync-data.sh" --config "$CONFIG_FILE" --env "$TARGET_ENV" 2>&1 | tee -a "$LOG_FILE"
        fi
      else
        log_warn "数据同步脚本不存在，跳过"
      fi
    else
      log_warn "跳过数据同步"
    fi
  fi
  
  log_success "========================================="
  log_success "数据库迁移完成"
  log_success "日志文件: $LOG_FILE"
  log_success "========================================="
}

# 执行主函数
main "$@"
