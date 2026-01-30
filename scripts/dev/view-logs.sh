#!/bin/bash
# 日志查看工具

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../build/common.sh"

LOG_DIR="$PROJECT_ROOT"
FOLLOW=false
LINES=50
SERVICE=""

# 解析参数
while [[ $# -gt 0 ]]; do
    case $1 in
        -f|--follow)
            FOLLOW=true
            shift
            ;;
        -n|--lines)
            LINES="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE="$2"
            shift 2
            ;;
        -h|--help)
            echo "用法: $0 [选项]"
            echo ""
            echo "选项:"
            echo "  -f, --follow        实时跟踪日志"
            echo "  -n, --lines N      显示最后 N 行（默认: 50）"
            echo "  -s, --service NAME 查看特定服务的日志"
            echo "  -h, --help         显示帮助信息"
            echo ""
            echo "示例:"
            echo "  $0                          # 列出所有日志文件"
            echo "  $0 -s backend               # 查看 backend 服务日志"
            echo "  $0 -s backend -f            # 实时跟踪 backend 日志"
            echo "  $0 -s backend -n 100         # 查看最后 100 行"
            exit 0
            ;;
        *)
            echo "未知参数: $1"
            echo "使用 -h 查看帮助"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}日志查看工具${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 查找日志文件
if [ -n "$SERVICE" ]; then
    # 查找特定服务的日志
    log_files=$(find "$LOG_DIR" -maxdepth 1 -name "*${SERVICE}*.log" -type f 2>/dev/null)
    
    if [ -z "$log_files" ]; then
        echo -e "${RED}未找到服务 '$SERVICE' 的日志文件${NC}"
        echo ""
        echo -e "${YELLOW}可用的日志文件:${NC}"
        find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f 2>/dev/null | while read file; do
            echo "  • $(basename "$file")"
        done
        exit 1
    fi
    
    # 显示日志
    for log_file in $log_files; do
        echo -e "${GREEN}查看日志: $(basename "$log_file")${NC}"
        echo ""
        
        if [ "$FOLLOW" = true ]; then
            tail -f "$log_file"
        else
            tail -n "$LINES" "$log_file"
        fi
    done
else
    # 列出所有日志文件
    log_files=$(find "$LOG_DIR" -maxdepth 1 -name "*.log" -type f 2>/dev/null | sort)
    
    if [ -z "$log_files" ]; then
        echo -e "${YELLOW}⚠ 未找到日志文件${NC}"
        exit 0
    fi
    
    echo -e "${GREEN}可用的日志文件:${NC}"
    echo ""
    
    for log_file in $log_files; do
        file_name=$(basename "$log_file")
        file_size=$(du -h "$log_file" 2>/dev/null | cut -f1)
        file_lines=$(wc -l < "$log_file" 2>/dev/null | tr -d ' ')
        
        echo -e "${BLUE}  • $file_name${NC}"
        echo -e "    大小: $file_size, 行数: $file_lines"
        echo ""
    done
    
    echo -e "${YELLOW}使用 -s <service> 查看特定服务的日志${NC}"
    echo -e "${YELLOW}示例: $0 -s backend -f${NC}"
fi
