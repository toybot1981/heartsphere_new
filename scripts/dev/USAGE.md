# 开发工具链使用指南

## 快速开始

### 1. 设置本地环境

首次使用时，设置本地开发环境：

```bash
./scripts/dev/setup-local-env.sh
```

这会：
- 检查所有依赖
- 创建必要的目录（`.build-cache`, `.deps-cache`, `logs`）
- 更新 `.gitignore` 文件

### 2. 检查环境

随时检查开发环境状态：

```bash
./scripts/dev/check-env.sh
```

### 3. 启动本地服务

启动本地开发服务（包括 Docker 服务等）：

```bash
./scripts/dev/start-local-services.sh
```

## 与现有脚本的关系

### start-local-services.sh vs start-all.sh

- **`scripts/dev/start-local-services.sh`**：
  - 用于启动本地开发服务
  - 包括 Mock 服务、测试数据库等
  - 适合开发和测试环境

- **`scripts/start-all.sh`**：
  - 用于启动所有项目服务
  - 包括所有后端和前端服务
  - 适合完整系统运行

两者可以并行使用，根据需求选择。

## 环境要求

### 必需依赖

- Java 17+
- Maven 3.9+
- Node.js 18+
- npm

### 可选依赖

- Docker（用于本地数据库和服务）

## 故障排除

### 环境检查失败

1. 检查依赖版本：
   ```bash
   ./scripts/dev/check-env.sh
   ```

2. 安装缺失的依赖

3. 重新运行环境设置：
   ```bash
   ./scripts/dev/setup-local-env.sh
   ```

### 服务启动失败

1. 检查 Docker 是否运行（如果使用 Docker）
2. 检查端口是否被占用
3. 查看日志文件

## 代码生成

使用代码生成工具快速创建代码模板：

```bash
# 生成 Controller
./scripts/dev/generate-code.sh controller UserController

# 生成 Service
./scripts/dev/generate-code.sh service UserService

# 生成 Repository
./scripts/dev/generate-code.sh repository UserRepository

# 生成 Entity
./scripts/dev/generate-code.sh entity User

# 生成 DTO
./scripts/dev/generate-code.sh dto UserDTO
```

## 日志查看

使用日志查看工具查看服务日志：

```bash
# 列出所有日志文件
./scripts/dev/view-logs.sh

# 查看特定服务的日志
./scripts/dev/view-logs.sh -s backend

# 实时跟踪日志
./scripts/dev/view-logs.sh -s backend -f

# 查看最后 100 行
./scripts/dev/view-logs.sh -s backend -n 100
```

## 下一步

- 使用 `./scripts/build/build-all.sh` 构建项目
- 使用 `./scripts/start-all.sh` 启动所有服务
- 查看各模块的 README 了解详细信息
