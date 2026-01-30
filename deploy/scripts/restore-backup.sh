#!/bin/bash

# 数据库备份恢复脚本
# 用于从备份文件恢复数据库
#
# 使用方法:
#   ./restore-backup.sh <backup_file> [options]

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

# 解析命令行参数
BACKUP_FILE=""
TARGET_ENV="prod"
SKIP_CONFIRM=false

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
    --yes|-y)
      SKIP_CONFIRM=true
      shift
      ;;
    --help)
      echo "数据库备份恢复脚本"
      echo ""
      echo "使用方法:"
      echo "  $0 <backup_file> [options]"
      echo ""
      echo "选项:"
      echo "  --config FILE     指定配置文件路径"
      echo "  --env ENV         指定目标环境 (默认: prod)"
      echo "  --yes, -y         跳过确认提示"
      echo "  --help            显示帮助信息"
      exit 0
      ;;
    *)
      if [[ -z "$BACKUP_FILE" ]]; then
        BACKUP_FILE="$1"
      else
        echo -e "${RED}错误: 未知参数: $1${NC}"
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ -z "$BACKUP_FILE" ]]; then
  echo -e "${RED}错误: 请指定备份文件${NC}"
  echo "使用方法: $0 <backup_file> [options]"
  exit 1
fi

# 加载配置文件
source "$CONFIG_FILE"

# 日志函数
log_error() {
  echo -e "${RED}[ERROR]${NC} $@"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $@"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $@"
}

log_info() {
  echo "[INFO] $@"
}

# 检查备份文件
if [[ ! -f "$BACKUP_FILE" ]]; then
  log_error "备份文件不存在: $BACKUP_FILE"
  exit 1
fi

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

# 确认操作
if [[ "$SKIP_CONFIRM" != "true" ]]; then
  log_warn "警告: 此操作将覆盖目标数据库的所有数据！"
  log_info "备份文件: $BACKUP_FILE"
  log_info "目标环境: $TARGET_ENV"
  read -p "确认要继续吗? (yes/no): " confirm
  if [[ "$confirm" != "yes" ]]; then
    log_info "操作已取消"
    exit 0
  fi
fi

# 处理压缩的备份文件
TEMP_BACKUP="$BACKUP_FILE"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  log_info "解压备份文件..."
  TEMP_BACKUP="${BACKUP_FILE%.gz}"
  gunzip -c "$BACKUP_FILE" > "$TEMP_BACKUP"
fi

# 恢复备份
log_info "开始恢复备份..."
log_warn "这可能需要一些时间，请耐心等待..."

local args=$(build_mysql_args "$TARGET_ENV")

if mysql $args < "$TEMP_BACKUP" 2>/dev/null; then
  log_success "备份恢复成功"
else
  log_error "备份恢复失败"
  if [[ "$TEMP_BACKUP" != "$BACKUP_FILE" ]]; then
    rm -f "$TEMP_BACKUP"
  fi
  exit 1
fi

# 清理临时文件
if [[ "$TEMP_BACKUP" != "$BACKUP_FILE" ]]; then
  rm -f "$TEMP_BACKUP"
fi

log_success "数据库恢复完成"
