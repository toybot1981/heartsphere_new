#!/bin/bash

# 技能引擎监控脚本
# 用途：监控技能引擎重构后的系统运行状态
# 使用方法：./monitor-skill-engine.sh [interval_seconds]

INTERVAL="${1:-60}"  # 默认60秒
BASE_URL="${BASE_URL:-http://localhost:8081}"
LOG_FILE="${LOG_FILE:-logs/skill-engine-monitor.log}"

# 创建日志目录
mkdir -p "$(dirname "$LOG_FILE")"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# 检查 API 健康状态
check_api_health() {
    local response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL/api/skills/available" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "200" ]; then
        local skill_count=$(echo "$body" | jq '.data | length' 2>/dev/null || echo "0")
        log "INFO" "API健康检查通过，可用技能数: $skill_count"
        return 0
    else
        log "ERROR" "API健康检查失败，HTTP状态码: $http_code"
        return 1
    fi
}

# 检查技能格式
check_skill_format() {
    local response=$(curl -s -X GET "$BASE_URL/api/skills" \
        -H "Content-Type: application/json" 2>/dev/null)
    
    if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
        local total=$(echo "$response" | jq '.data | length' 2>/dev/null || echo "0")
        local with_skill_content=$(echo "$response" | jq '[.data[] | select(.skillContent != null and .skillContent != "")] | length' 2>/dev/null || echo "0")
        local with_mcp_config=$(echo "$response" | jq '[.data[] | select(.mcpToolConfig != null and .mcpToolConfig != "")] | length' 2>/dev/null || echo "0")
        local with_old_format=$(echo "$response" | jq '[.data[] | select(.functionSchema != null and .functionSchema != "")] | length' 2>/dev/null || echo "0")
        
        if [ "$with_old_format" -gt 0 ]; then
            log "WARN" "发现旧格式技能: $with_old_format 个（应全部删除）"
        fi
        
        log "INFO" "技能格式检查 - 总数: $total, 有skillContent: $with_skill_content, 有mcpToolConfig: $with_mcp_config"
        
        if [ "$with_skill_content" = "$total" ] && [ "$with_old_format" = "0" ]; then
            return 0
        else
            return 1
        fi
    else
        log "ERROR" "无法获取技能列表"
        return 1
    fi
}

# 检查数据库中的旧技能
check_database_old_skills() {
    local db_host="${DB_HOST:-localhost}"
    local db_user="${DB_USER:-root}"
    local db_name="${DB_NAME:-heartsphere}"
    
    # 这里需要数据库访问权限
    # 可以添加 SQL 查询来检查旧格式技能
    log "INFO" "数据库检查需要数据库访问权限"
}

# 生成监控报告
generate_report() {
    local report_file="reports/skill-engine-monitor-$(date +%Y%m%d_%H%M%S).txt"
    mkdir -p "$(dirname "$report_file")"
    
    {
        echo "技能引擎监控报告"
        echo "生成时间: $(date)"
        echo "========================================="
        echo ""
        echo "API健康状态:"
        check_api_health && echo "✓ 正常" || echo "✗ 异常"
        echo ""
        echo "技能格式检查:"
        check_skill_format && echo "✓ 所有技能符合新规范" || echo "✗ 发现格式问题"
        echo ""
        echo "最近日志:"
        tail -n 20 "$LOG_FILE" 2>/dev/null || echo "无日志"
    } > "$report_file"
    
    log "INFO" "监控报告已生成: $report_file"
    echo "$report_file"
}

# 主监控循环
main() {
    log "INFO" "开始监控技能引擎，检查间隔: ${INTERVAL}秒"
    log "INFO" "日志文件: $LOG_FILE"
    
    local check_count=0
    local error_count=0
    
    while true; do
        ((check_count++))
        
        log "INFO" "执行第 $check_count 次检查"
        
        # 检查 API 健康状态
        if ! check_api_health; then
            ((error_count++))
        fi
        
        # 检查技能格式
        if ! check_skill_format; then
            ((error_count++))
        fi
        
        # 每10次检查生成一次报告
        if [ $((check_count % 10)) -eq 0 ]; then
            generate_report
            log "INFO" "累计检查: $check_count 次，错误: $error_count 次"
        fi
        
        # 如果错误过多，发出警告
        if [ $error_count -gt 10 ]; then
            log "ERROR" "错误次数过多 ($error_count)，请检查系统状态"
        fi
        
        sleep "$INTERVAL"
    done
}

# 信号处理
trap 'log "INFO" "监控已停止"; exit 0' INT TERM

# 运行主函数
main
