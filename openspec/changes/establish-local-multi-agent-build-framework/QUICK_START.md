# 快速开始指南

## 本地多智能体构建框架 - 快速开始

### 第一步：设置环境

```bash
# 设置本地开发环境
./scripts/dev/setup-local-env.sh
```

这会自动：
- 检查所有依赖（Java、Maven、Node.js、npm）
- 创建必要的目录（`.build-cache`, `.deps-cache`, `logs`）
- 更新 `.gitignore` 文件

### 第二步：检查环境

```bash
# 检查开发环境状态
./scripts/dev/check-env.sh
```

### 第三步：构建项目

```bash
# 构建所有模块
./scripts/build/build-all.sh

# 或构建单个模块
./scripts/build/build-module.sh main
```

### 第四步：管理缓存

```bash
# 查看缓存状态
./scripts/build/cache-clean.sh

# 清理过期缓存（7天以上）
./scripts/build/cache-clean.sh --expired

# 清理所有缓存
./scripts/build/cache-clean.sh --all

# 清理特定模块缓存
./scripts/build/cache-clean.sh --module main
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `./scripts/dev/setup-local-env.sh` | 设置本地环境 |
| `./scripts/dev/check-env.sh` | 检查环境 |
| `./scripts/dev/start-local-services.sh` | 启动本地服务 |
| `./scripts/build/build-all.sh` | 构建所有模块 |
| `./scripts/build/build-module.sh <name>` | 构建单个模块 |
| `./scripts/build/check-dependencies.sh` | 检查依赖 |
| `./scripts/build/cache-dependencies.sh` | 缓存依赖 |
| `./scripts/build/cache-clean.sh` | 管理缓存 |
| `./scripts/build/cache-stats.sh` | 查看缓存统计 |
| `./scripts/dev/generate-code.sh` | 生成代码 |
| `./scripts/dev/view-logs.sh` | 查看日志 |

## 并行构建

使用并行构建可以加快构建速度：

```bash
PARALLEL=true ./scripts/build/build-all.sh
```

## 故障排除

### 构建失败

1. 检查依赖：
   ```bash
   ./scripts/build/check-dependencies.sh
   ```

2. 清理缓存后重试：
   ```bash
   ./scripts/build/cache-clean.sh --all
   ./scripts/build/build-all.sh
   ```

### 环境问题

1. 重新设置环境：
   ```bash
   ./scripts/dev/setup-local-env.sh
   ```

2. 检查环境：
   ```bash
   ./scripts/dev/check-env.sh
   ```

## 额外功能

### 依赖缓存

```bash
# 缓存项目依赖
./scripts/build/cache-dependencies.sh

# 查看缓存统计
./scripts/build/cache-stats.sh
```

### 代码生成

```bash
# 生成 Controller
./scripts/dev/generate-code.sh controller UserController

# 生成 Service
./scripts/dev/generate-code.sh service UserService

# 生成 Entity
./scripts/dev/generate-code.sh entity User
```

### 日志查看

```bash
# 列出所有日志
./scripts/dev/view-logs.sh

# 查看特定服务日志
./scripts/dev/view-logs.sh -s backend -f
```

## 更多信息

- **构建系统文档**: `scripts/build/README.md` 和 `scripts/build/USAGE.md`
- **开发工具文档**: `scripts/dev/README.md` 和 `scripts/dev/USAGE.md`
- **架构设计**: `design.md`
- **实施报告**: `IMPLEMENTATION_STATUS.md` 和 `FINAL_REPORT.md`
- **更新总结**: `UPDATE_SUMMARY.md`