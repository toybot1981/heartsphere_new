#!/bin/bash

#######################################################################
#
# 技能应用和调试增强功能 - 项目初始化脚本
# 一键启动项目开发环境
#
# 使用方式: bash project-init.sh
#
#######################################################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

#######################################################################
# 检查环境
#######################################################################

check_environment() {
    log_info "检查开发环境..."
    
    # 检查 Java
    if command -v java &> /dev/null; then
        JAVA_VERSION=$(java -version 2>&1 | head -n 1)
        log_success "✅ Java 已安装: $JAVA_VERSION"
    else
        log_error "❌ Java 未安装或不在 PATH 中"
        exit 1
    fi
    
    # 检查 Maven
    if command -v mvn &> /dev/null; then
        MVN_VERSION=$(mvn -v 2>&1 | head -n 1)
        log_success "✅ Maven 已安装: $MVN_VERSION"
    else
        log_error "❌ Maven 未安装或不在 PATH 中"
        exit 1
    fi
    
    # 检查 Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        log_success "✅ Node.js 已安装: $NODE_VERSION"
    else
        log_warn "⚠️  Node.js 未安装（前端开发需要）"
    fi
    
    # 检查 MySQL
    if command -v mysql &> /dev/null; then
        log_success "✅ MySQL 客户端已安装"
    else
        log_warn "⚠️  MySQL 客户端未安装（可能需要）"
    fi
    
    # 检查 Git
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        log_success "✅ Git 已安装: $GIT_VERSION"
    else
        log_error "❌ Git 未安装"
        exit 1
    fi
}

#######################################################################
# 初始化项目结构
#######################################################################

init_project_structure() {
    log_info "初始化项目结构..."
    
    # 创建必要的目录
    mkdir -p main/backend/src/main/java/com/heartsphere/ai/skill/{entity,enums,dto,repository,service,engine,controller}
    mkdir -p main/backend/src/test/java/com/heartsphere/ai/skill/{repository,service}
    mkdir -p main/backend/src/main/resources/db/migration
    mkdir -p frontend/src/components/skill
    mkdir -p frontend/src/services
    mkdir -p frontend/src/types
    mkdir -p frontend/src/hooks
    
    log_success "✅ 项目目录结构已创建"
}

#######################################################################
# 配置数据库
#######################################################################

setup_database() {
    log_info "设置数据库..."
    
    read -p "请输入 MySQL 主机 (默认: localhost): " db_host
    db_host=${db_host:-localhost}
    
    read -p "请输入 MySQL 用户名 (默认: root): " db_user
    db_user=${db_user:-root}
    
    read -s -p "请输入 MySQL 密码: " db_password
    echo ""
    
    read -p "请输入数据库名称 (默认: heartsphere): " db_name
    db_name=${db_name:-heartsphere}
    
    read -p "请输入 MySQL 端口 (默认: 3306): " db_port
    db_port=${db_port:-3306}
    
    # 保存配置到环境变量
    export SPRING_DATASOURCE_URL="jdbc:mysql://${db_host}:${db_port}/${db_name}"
    export SPRING_DATASOURCE_USERNAME="${db_user}"
    export SPRING_DATASOURCE_PASSWORD="${db_password}"
    
    log_success "✅ 数据库配置完成"
}

#######################################################################
# 构建后端
#######################################################################

build_backend() {
    log_info "构建后端项目..."
    
    cd main/backend
    
    # 清理旧构建
    log_info "清理旧构建..."
    mvn clean -q
    
    # 编译
    log_info "编译代码..."
    mvn compile -q
    
    # 运行测试
    log_info "运行单元测试..."
    mvn test -q
    
    # 打包
    log_info "打包应用..."
    mvn package -q
    
    cd ../..
    
    log_success "✅ 后端构建完成"
}

#######################################################################
# 数据库迁移
#######################################################################

run_migrations() {
    log_info "运行数据库迁移..."
    
    cd main/backend
    
    mvn flyway:migrate \
        -Ddb.driver=com.mysql.cj.jdbc.Driver \
        -Ddb.url="${SPRING_DATASOURCE_URL}" \
        -Ddb.user="${SPRING_DATASOURCE_USERNAME}" \
        -Ddb.password="${SPRING_DATASOURCE_PASSWORD}" \
        -q
    
    cd ../..
    
    log_success "✅ 数据库迁移完成"
}

#######################################################################
# 设置前端
#######################################################################

setup_frontend() {
    log_info "设置前端项目..."
    
    cd frontend
    
    # 安装依赖
    log_info "安装 npm 依赖..."
    npm install --legacy-peer-deps
    
    cd ..
    
    log_success "✅ 前端设置完成"
}

#######################################################################
# 创建启动脚本
#######################################################################

create_startup_scripts() {
    log_info "创建启动脚本..."
    
    # 后端启动脚本
    cat > start-backend.sh << 'EOF'
#!/bin/bash
cd main/backend
mvn spring-boot:run
EOF
    chmod +x start-backend.sh
    
    # 前端启动脚本
    cat > start-frontend.sh << 'EOF'
#!/bin/bash
cd frontend
npm run dev
EOF
    chmod +x start-frontend.sh
    
    # 停止脚本
    cat > stop-all.sh << 'EOF'
#!/bin/bash
pkill -f "java.*spring-boot:run"
pkill -f "node.*next"
echo "All services stopped"
EOF
    chmod +x stop-all.sh
    
    log_success "✅ 启动脚本已创建"
    echo "  📄 start-backend.sh"
    echo "  📄 start-frontend.sh"
    echo "  📄 stop-all.sh"
}

#######################################################################
# 生成配置文件
#######################################################################

generate_config() {
    log_info "生成配置文件..."
    
    # application.yml
    cat > main/backend/src/main/resources/application-dev.yml << 'EOF'
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/heartsphere
    username: root
    password: 
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  flyway:
    enabled: true
    baseline-on-migrate: true
    
logging:
  level:
    root: INFO
    com.heartsphere: DEBUG
    
server:
  port: 8080
EOF
    
    log_success "✅ 配置文件已生成"
}

#######################################################################
# 主函数
#######################################################################

main() {
    clear
    
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║   🚀 技能应用和调试增强功能 - 项目初始化                      ║"
    echo "║      Project Initialization Script                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    
    # 执行初始化步骤
    check_environment
    echo ""
    
    init_project_structure
    echo ""
    
    setup_database
    echo ""
    
    read -p "是否现在运行数据库迁移? (y/n): " run_migration
    if [[ $run_migration == "y" ]]; then
        run_migrations
        echo ""
    fi
    
    read -p "是否现在构建后端? (y/n): " build_be
    if [[ $build_be == "y" ]]; then
        build_backend
        echo ""
    fi
    
    read -p "是否现在设置前端? (y/n): " setup_fe
    if [[ $setup_fe == "y" ]]; then
        setup_frontend
        echo ""
    fi
    
    create_startup_scripts
    generate_config
    echo ""
    
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                    🎉 初始化完成！                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "快速启动命令:"
    echo "  后端:   ./start-backend.sh"
    echo "  前端:   ./start-frontend.sh"
    echo "  停止:   ./stop-all.sh"
    echo ""
    echo "下一步:"
    echo "  1. 查看 PHASE_1_IMPLEMENTATION_GUIDE.md"
    echo "  2. 开始编码！"
    echo ""
}

# 运行
main
