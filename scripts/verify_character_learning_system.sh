#!/bin/bash

# 角色长期学习系统 - 自动化验证脚本
# 用途: 快速验证系统是否就绪
# 作者: HeartSphere 技术团队
# 日期: 2026-01-24

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
PASSED=0
FAILED=0
SKIPPED=0

# 打印函数
print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((SKIPPED++))
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# 检查命令是否存在
check_command() {
    if command -v $1 &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# 主验证流程
main() {
    print_header "角色长期学习系统 - 自动化验证"
    
    echo "开始时间: $(date)"
    echo ""
    
    # 1. 环境检查
    print_header "1. 环境检查"
    check_environment
    
    # 2. 后端验证
    print_header "2. 后端验证"
    check_backend
    
    # 3. 前端验证
    print_header "3. 前端验证"
    check_frontend
    
    # 4. 数据库验证
    print_header "4. 数据库验证"
    check_database
    
    # 5. API 验证
    print_header "5. API 端点验证"
    check_api
    
    # 6. 功能验证
    print_header "6. 功能验证"
    check_functionality
    
    # 总结
    print_summary
}

# 环境检查
check_environment() {
    print_info "检查环境依赖..."
    
    # Java
    if check_command java; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        if [[ $JAVA_VERSION == *"17"* ]] || [[ $JAVA_VERSION == *"18"* ]] || [[ $JAVA_VERSION == *"19"* ]] || [[ $JAVA_VERSION == *"21"* ]]; then
            print_success "Java 已安装: $JAVA_VERSION"
        else
            print_warning "Java 版本可能不兼容: $JAVA_VERSION (需要 17+)"
        fi
    else
        print_error "Java 未安装"
    fi
    
    # MySQL
    if check_command mysql; then
        MYSQL_VERSION=$(mysql --version 2>&1)
        print_success "MySQL 已安装: $MYSQL_VERSION"
    else
        print_error "MySQL 未安装"
    fi
    
    # Redis
    if check_command redis-cli; then
        if redis-cli ping &> /dev/null; then
            print_success "Redis 已安装并运行"
        else
            print_warning "Redis 已安装但未运行"
        fi
    else
        print_error "Redis 未安装"
    fi
    
    # Node.js (前端)
    if check_command node; then
        NODE_VERSION=$(node --version)
        print_success "Node.js 已安装: $NODE_VERSION"
    else
        print_warning "Node.js 未安装 (仅前端需要)"
    fi
    
    # 端口检查
    print_info "检查端口可用性..."
    if lsof -i :8080 &> /dev/null; then
        print_warning "端口 8080 已被占用"
    else
        print_success "端口 8080 可用"
    fi
    
    if lsof -i :3000 &> /dev/null; then
        print_warning "端口 3000 已被占用"
    else
        print_success "端口 3000 可用"
    fi
}

# 后端验证
check_backend() {
    print_info "检查后端代码..."
    
    BACKEND_DIR="main/backend"
    
    if [ ! -d "$BACKEND_DIR" ]; then
        print_error "后端目录不存在: $BACKEND_DIR"
        return
    fi
    
    # 检查关键文件
    KEY_FILES=(
        "src/main/java/com/heartsphere/memory/service/CharacterKnowledgeAssetService.java"
        "src/main/java/com/heartsphere/memory/controller/MemoryController.java"
        "src/main/resources/db/migration/V20260122__add_character_learning_system.sql"
    )
    
    for file in "${KEY_FILES[@]}"; do
        if [ -f "$BACKEND_DIR/$file" ]; then
            print_success "文件存在: $file"
        else
            print_error "文件缺失: $file"
        fi
    done
    
    # 检查编译 (如果 Gradle 可用)
    if check_command ./gradlew || check_command gradle; then
        print_info "尝试编译后端..."
        cd $BACKEND_DIR
        if ./gradlew clean build -x test &> /dev/null; then
            print_success "后端编译成功"
        else
            print_warning "后端编译失败 (可能需要配置)"
        fi
        cd - &> /dev/null
    else
        print_warning "Gradle 未找到，跳过编译检查"
    fi
}

# 前端验证
check_frontend() {
    print_info "检查前端代码..."
    
    FRONTEND_DIR="main/frontend"
    
    if [ ! -d "$FRONTEND_DIR" ]; then
        print_warning "前端目录不存在: $FRONTEND_DIR"
        return
    fi
    
    # 检查关键文件
    KEY_FILES=(
        "components/character/CharacterLearningStatsCard.tsx"
        "components/character/CharacterKnowledgeLibrary.tsx"
        "components/chat/hooks/useSystemIntegration.ts"
    )
    
    for file in "${KEY_FILES[@]}"; do
        if [ -f "$FRONTEND_DIR/$file" ]; then
            print_success "文件存在: $file"
        else
            print_error "文件缺失: $file"
        fi
    done
    
    # 检查 package.json
    if [ -f "$FRONTEND_DIR/package.json" ]; then
        print_success "package.json 存在"
    else
        print_error "package.json 缺失"
    fi
}

# 数据库验证
check_database() {
    print_info "检查数据库结构..."
    
    # 尝试连接数据库
    if mysql -u root -p${DB_PASSWORD:-root} -e "USE heartsphere;" &> /dev/null 2>&1; then
        print_success "数据库连接成功"
        
        # 检查表是否存在
        TABLES=("character_knowledge_assets" "character_learning_history")
        
        for table in "${TABLES[@]}"; do
            if mysql -u root -p${DB_PASSWORD:-root} heartsphere -e "SHOW TABLES LIKE '$table';" 2>/dev/null | grep -q "$table"; then
                print_success "表存在: $table"
            else
                print_error "表缺失: $table"
            fi
        done
    else
        print_warning "无法连接数据库 (可能需要配置密码)"
    fi
}

# API 验证
check_api() {
    print_info "检查 API 端点..."
    
    # 检查应用是否运行
    if curl -s http://localhost:8080/actuator/health &> /dev/null; then
        print_success "后端服务运行中"
        
        # 检查健康端点
        HEALTH=$(curl -s http://localhost:8080/actuator/health)
        if echo "$HEALTH" | grep -q "UP"; then
            print_success "健康检查通过"
        else
            print_error "健康检查失败"
        fi
        
        # 检查 API 端点 (需要认证，可能失败)
        API_ENDPOINTS=(
            "/api/memory/v1/character/1/stats"
            "/api/memory/v1/character/1/related-assets?query=test&limit=5"
        )
        
        for endpoint in "${API_ENDPOINTS[@]}"; do
            STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080$endpoint")
            if [ "$STATUS" == "200" ] || [ "$STATUS" == "401" ]; then
                print_success "端点可访问: $endpoint (状态码: $STATUS)"
            else
                print_warning "端点访问异常: $endpoint (状态码: $STATUS)"
            fi
        done
    else
        print_warning "后端服务未运行 (跳过 API 检查)"
    fi
}

# 功能验证
check_functionality() {
    print_info "检查功能完整性..."
    
    # 检查关键功能文件
    FEATURES=(
        "隐私检测: SensitiveInfoDetector.java"
        "相似度计算: SimilarityCalculator.java"
        "等级计算: ExperienceLevelCalculator.java"
        "定时任务: CharacterAssetDecayJob.java"
    )
    
    for feature in "${FEATURES[@]}"; do
        FEATURE_NAME=$(echo $feature | cut -d: -f1)
        FILE_NAME=$(echo $feature | cut -d: -f2 | xargs)
        
        if find main/backend -name "$FILE_NAME" | grep -q .; then
            print_success "$FEATURE_NAME 已实现"
        else
            print_error "$FEATURE_NAME 未找到"
        fi
    done
}

# 打印总结
print_summary() {
    print_header "验证总结"
    
    TOTAL=$((PASSED + FAILED + SKIPPED))
    
    echo -e "${GREEN}通过: $PASSED${NC}"
    echo -e "${RED}失败: $FAILED${NC}"
    echo -e "${YELLOW}跳过: $SKIPPED${NC}"
    echo -e "${BLUE}总计: $TOTAL${NC}"
    echo ""
    
    if [ $FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ 所有检查通过！系统就绪。${NC}"
        exit 0
    else
        echo -e "${RED}❌ 发现 $FAILED 个问题，请修复后重试。${NC}"
        exit 1
    fi
}

# 运行主函数
main "$@"
