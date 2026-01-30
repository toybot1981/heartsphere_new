# Mentis 服务启动指南

## 📋 快速启动

### 方式 1: 使用启动脚本（推荐）

```bash
# 确保已设置 E2B API Key
export E2B_API_KEY="your-e2b-api-key-here"

# 启动后端和前端
./scripts/start-mentis.sh both

# 或单独启动
./scripts/start-mentis.sh backend   # 仅启动后端
./scripts/start-mentis.sh frontend  # 仅启动前端
```

### 方式 2: 手动启动

#### 启动后端

```bash
cd mentis/backend
mvn spring-boot:run
```

后端服务将运行在: http://localhost:8082

#### 启动前端

```bash
cd mentis/frontend
npm install  # 首次运行需要安装依赖
npm run dev
```

前端服务将运行在: http://localhost:3002

## 🔧 前置条件

### 1. 环境变量

```bash
# 必需: E2B API Key
export E2B_API_KEY="your-e2b-api-key-here"

# 可选: 数据库配置（如果使用默认值则不需要）
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=heartsphere
export DB_USER=root
export DB_PASSWORD=123456
```

### 2. 软件要求

- **Java 17+** - 后端运行环境
- **Maven 3.6+** - Java 构建工具
- **Node.js 18+** - 前端运行环境
- **MySQL 8.0+** - 数据库（可选，如果配置了数据库）

### 3. 数据库（可选）

如果使用数据库，确保 MySQL 服务正在运行：

```bash
# 检查 MySQL 状态
mysql -u root -p -e "SHOW DATABASES;"
```

## 🚀 启动步骤

### 步骤 1: 检查环境

```bash
# 检查 Java 版本
java -version  # 应该显示 Java 17 或更高版本

# 检查 Maven 版本
mvn -version   # 应该显示 Maven 3.6 或更高版本

# 检查 Node.js 版本
node -v        # 应该显示 v18 或更高版本

# 检查 E2B API Key
echo $E2B_API_KEY  # 应该显示你的 API Key
```

### 步骤 2: 启动服务

**使用启动脚本**:

```bash
./scripts/start-mentis.sh both
```

**或手动启动**:

```bash
# 终端 1: 启动后端
cd mentis/backend
mvn spring-boot:run

# 终端 2: 启动前端
cd mentis/frontend
npm install  # 首次运行
npm run dev
```

### 步骤 3: 验证服务

```bash
# 检查后端健康状态
curl http://localhost:8082/actuator/health

# 检查前端
open http://localhost:3002  # macOS
# 或访问 http://localhost:3002 在浏览器中
```

## 📍 服务地址

- **后端 API**: http://localhost:8082
- **前端界面**: http://localhost:3002
- **API 文档 (Swagger)**: http://localhost:8082/swagger-ui.html
- **健康检查**: http://localhost:8082/actuator/health

## 🔍 常见问题

### 问题 1: 端口被占用

**错误**: `Port 8082 is already in use`

**解决**:
```bash
# 查找占用端口的进程
lsof -ti:8082

# 杀死进程
kill -9 $(lsof -ti:8082)

# 或更改端口（在 application.yml 中修改）
server:
  port: 8083
```

### 问题 2: E2B API Key 未设置

**错误**: `E2B_API_KEY environment variable not set`

**解决**:
```bash
export E2B_API_KEY="your-e2b-api-key-here"
```

### 问题 3: 数据库连接失败

**错误**: `Could not connect to database`

**解决**:
1. 检查 MySQL 服务是否运行
2. 检查数据库配置是否正确
3. 或使用 H2 内存数据库（测试用）

### 问题 4: 前端依赖安装失败

**错误**: `npm install` 失败

**解决**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 问题 5: Maven 构建失败

**错误**: `Maven build failed`

**解决**:
```bash
# 清除 Maven 缓存
mvn clean

# 重新编译
mvn compile

# 或强制更新依赖
mvn clean install -U
```

## 📝 日志

### 后端日志

- **控制台输出**: 实时显示
- **日志文件**: `mentis/backend/logs/application.log`
- **启动日志**: `mentis/backend.log` (使用脚本启动时)

### 前端日志

- **控制台输出**: 实时显示
- **Vite 日志**: 包含构建和热更新信息

## 🛑 停止服务

### 使用启动脚本

按 `Ctrl+C` 停止服务

### 手动停止

```bash
# 查找后端进程
lsof -ti:8082

# 停止后端
kill $(lsof -ti:8082)

# 查找前端进程
lsof -ti:3002

# 停止前端
kill $(lsof -ti:3002)
```

## 🎯 下一步

服务启动后，可以：

1. ✅ 访问前端界面: http://localhost:3002/mentis/manus
2. ✅ 查看 API 文档: http://localhost:8082/swagger-ui.html
3. ✅ 测试 E2B VM 功能
4. ✅ 运行端到端测试

参考文档：
- [E2B API Key 获取指南](./E2B_API_KEY_GUIDE.md)
- [端到端测试指南](../openspec/changes/implement-manus-virtual-computer/E2E_TEST_GUIDE.md)
