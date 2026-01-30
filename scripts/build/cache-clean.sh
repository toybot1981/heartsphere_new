#!/bin/bash
# 构建缓存清理脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/common.sh"

CACHE_DIR="$PROJECT_ROOT/.build-cache"
DEPS_CACHE_DIR="$PROJECT_ROOT/.deps-cache"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}清理构建缓存${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查参数
CLEAN_ALL=false
CLEAN_MODULE=""
CLEAN_EXPIRED=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            CLEAN_ALL=true
            shift
            ;;
        --module)
            CLEAN_MODULE="$2"
            shift 2
            ;;
        --expired)
            CLEAN_EXPIRED=true
            shift
            ;;
        *)
            echo "未知参数: $1"
            echo "用法: $0 [--all] [--module <module-name>] [--expired]"
            exit 1
            ;;
    esac
done

# 清理所有缓存
if [ "$CLEAN_ALL" = true ]; then
    echo -e "${YELLOW}清理所有构建缓存...${NC}"
    if [ -d "$CACHE_DIR" ]; then
        rm -rf "$CACHE_DIR"
        echo -e "${GREEN}✓ 已清理构建缓存${NC}"
    else
        echo -e "${YELLOW}⚠ 构建缓存目录不存在${NC}"
    fi
    
    if [ -d "$DEPS_CACHE_DIR" ]; then
        rm -rf "$DEPS_CACHE_DIR"
        echo -e "${GREEN}✓ 已清理依赖缓存${NC}"
    else
        echo -e "${YELLOW}⚠ 依赖缓存目录不存在${NC}"
    fi
    exit 0
fi

# 清理特定模块缓存
if [ -n "$CLEAN_MODULE" ]; then
    echo -e "${YELLOW}清理模块缓存: $CLEAN_MODULE${NC}"
    local module_cache="$CACHE_DIR/$CLEAN_MODULE"
    if [ -d "$module_cache" ]; then
        rm -rf "$module_cache"
        echo -e "${GREEN}✓ 已清理模块缓存: $CLEAN_MODULE${NC}"
    else
        echo -e "${YELLOW}⚠ 模块缓存不存在: $CLEAN_MODULE${NC}"
    fi
    exit 0
fi

# 清理过期缓存
if [ "$CLEAN_EXPIRED" = true ]; then
    echo -e "${YELLOW}清理过期缓存（TTL: 7天）...${NC}"
    local ttl=604800  # 7 days in seconds
    local now=$(date +%s)
    local cleaned=0
    
    if [ -d "$CACHE_DIR" ]; then
        for module_dir in "$CACHE_DIR"/*; do
            if [ -d "$module_dir" ]; then
                local cache_file="$module_dir/.cache-info"
                if [ -f "$cache_file" ]; then
                    local cache_time=$(stat -f "%m" "$cache_file" 2>/dev/null || stat -c "%Y" "$cache_file" 2>/dev/null)
                    local age=$((now - cache_time))
                    
                    if [ $age -ge $ttl ]; then
                        local module_name=$(basename "$module_dir")
                        rm -rf "$module_dir"
                        echo -e "${GREEN}✓ 已清理过期缓存: $module_name${NC}"
                        cleaned=$((cleaned + 1))
                    fi
                fi
            fi
        done
    fi
    
    if [ $cleaned -eq 0 ]; then
        echo -e "${YELLOW}⚠ 没有过期缓存${NC}"
    else
        echo -e "${GREEN}已清理 $cleaned 个过期缓存${NC}"
    fi
    exit 0
fi

# 显示缓存统计
echo -e "${BLUE}构建缓存统计:${NC}"
if [ -d "$CACHE_DIR" ]; then
    local cache_size=$(du -sh "$CACHE_DIR" 2>/dev/null | cut -f1)
    local cache_count=$(find "$CACHE_DIR" -maxdepth 1 -type d | wc -l | tr -d ' ')
    cache_count=$((cache_count - 1))  # 减去 .build-cache 本身
    
    echo -e "  目录: $CACHE_DIR"
    echo -e "  大小: $cache_size"
    echo -e "  模块数: $cache_count"
else
    echo -e "${YELLOW}⚠ 构建缓存目录不存在${NC}"
fi

echo ""
echo -e "${BLUE}使用说明:${NC}"
echo -e "  $0 --all          # 清理所有缓存"
echo -e "  $0 --module <name> # 清理特定模块缓存"
echo -e "  $0 --expired      # 清理过期缓存（7天）"
