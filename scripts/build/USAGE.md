# 构建系统使用指南

## 快速开始

### 1. 检查依赖

在开始构建之前，建议先检查所有依赖是否已安装：

```bash
./scripts/build/check-dependencies.sh
```

### 2. 构建所有模块

构建所有项目模块：

```bash
./scripts/build/build-all.sh
```

使用并行构建（更快）：

```bash
PARALLEL=true ./scripts/build/build-all.sh
```

### 3. 构建单个模块

构建特定模块：

```bash
./scripts/build/build-module.sh main
./scripts/build/build-module.sh admin
./scripts/build/build-module.sh mentis
```

## 构建缓存

### 查看缓存状态

```bash
# 查看缓存统计
./scripts/build/cache-stats.sh

# 查看缓存清理选项
./scripts/build/cache-clean.sh
```

### 清理缓存

清理所有缓存：

```bash
./scripts/build/cache-clean.sh --all
```

清理特定模块缓存：

```bash
./scripts/build/cache-clean.sh --module main
```

清理过期缓存（7天以上）：

```bash
./scripts/build/cache-clean.sh --expired
```

### 依赖缓存

缓存项目依赖到本地：

```bash
./scripts/build/cache-dependencies.sh
```

这会：
- 缓存 Maven 依赖信息
- 缓存 npm 依赖信息
- 生成依赖清单文件

## 配置

构建配置在 `scripts/build/build-config.yml` 中定义，包括：

- 模块列表和路径
- 构建类型（Maven/npm）
- 依赖关系
- 并行构建设置
- 缓存配置

## 与现有脚本的兼容性

新构建系统与现有构建脚本完全兼容：

- 如果模块有 `build-fast.sh`，会优先使用
- 如果没有，会使用标准的 Maven 或 npm 构建
- 所有现有构建脚本保持不变

## 故障排除

### 构建失败

1. 检查依赖是否完整：
   ```bash
   ./scripts/build/check-dependencies.sh
   ```

2. 清理缓存后重试：
   ```bash
   ./scripts/build/cache-clean.sh --all
   ./scripts/build/build-all.sh
   ```

3. 查看具体模块的错误信息

### 缓存问题

如果缓存导致构建问题：

```bash
# 清理所有缓存
./scripts/build/cache-clean.sh --all

# 重新构建
./scripts/build/build-all.sh
```

## 性能优化

- 使用并行构建可以显著提升速度
- 构建缓存可以避免重复构建未变更的模块
- 定期清理过期缓存可以节省磁盘空间
