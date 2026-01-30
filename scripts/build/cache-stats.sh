#!/bin/bash
# 缓存统计脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/common.sh"

CACHE_DIR="$PROJECT_ROOT/.build-cache"
DEPS_CACHE_DIR="$PROJECT_ROOT/.deps-cache"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}构建缓存统计${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 构建缓存统计
if [ -d "$CACHE_DIR" ]; then
    echo -e "${GREEN}构建缓存:${NC}"
    cache_size=$(du -sh "$CACHE_DIR" 2>/dev/null | cut -f1)
    cache_count=$(find "$CACHE_DIR" -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')
    cache_count=$((cache_count - 1))  # 减去 .build-cache 本身
    
    echo -e "  目录: $CACHE_DIR"
    echo -e "  大小: $cache_size"
    echo -e "  模块数: $cache_count"
    
    # 列出缓存的模块
    if [ $cache_count -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}缓存的模块:${NC}"
        for module_dir in "$CACHE_DIR"/*; do
            if [ -d "$module_dir" ]; then
                module_name=$(basename "$module_dir")
                module_size=$(du -sh "$module_dir" 2>/dev/null | cut -f1)
                cache_file="$module_dir/.cache-info"
                
                if [ -f "$cache_file" ]; then
                    cache_date=$(grep "^date=" "$cache_file" 2>/dev/null | cut -d'=' -f2-)
                    echo -e "  • $module_name: $module_size (缓存时间: ${cache_date:-未知})"
                else
                    echo -e "  • $module_name: $module_size"
                fi
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠ 构建缓存目录不存在${NC}"
fi

# 依赖缓存统计
echo ""
if [ -d "$DEPS_CACHE_DIR" ]; then
    echo -e "${GREEN}依赖缓存:${NC}"
    deps_size=$(du -sh "$DEPS_CACHE_DIR" 2>/dev/null | cut -f1)
    deps_count=$(find "$DEPS_CACHE_DIR" -type f -name "*.txt" 2>/dev/null | wc -l | tr -d ' ')
    
    echo -e "  目录: $DEPS_CACHE_DIR"
    echo -e "  大小: $deps_size"
    echo -e "  清单文件: $deps_count"
    
    # 列出依赖清单文件
    if [ $deps_count -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}依赖清单:${NC}"
        find "$DEPS_CACHE_DIR" -name "*.txt" -type f 2>/dev/null | while read file; do
            file_name=$(basename "$file")
            file_size=$(du -h "$file" 2>/dev/null | cut -f1)
            echo -e "  • $file_name: $file_size"
        done
    fi
else
    echo -e "${YELLOW}⚠ 依赖缓存目录不存在${NC}"
fi

# 总统计
echo ""
echo -e "${BLUE}========================================${NC}"
total_size=0
if [ -d "$CACHE_DIR" ]; then
    cache_bytes=$(du -sb "$CACHE_DIR" 2>/dev/null | cut -f1)
    total_size=$((total_size + cache_bytes))
fi
if [ -d "$DEPS_CACHE_DIR" ]; then
    deps_bytes=$(du -sb "$DEPS_CACHE_DIR" 2>/dev/null | cut -f1)
    total_size=$((total_size + deps_bytes))
fi

if [ $total_size -gt 0 ]; then
    total_size_human=$(numfmt --to=iec-i --suffix=B $total_size 2>/dev/null || echo "${total_size} bytes")
    echo -e "${GREEN}总缓存大小: $total_size_human${NC}"
else
    echo -e "${YELLOW}⚠ 暂无缓存数据${NC}"
fi
echo -e "${BLUE}========================================${NC}"
