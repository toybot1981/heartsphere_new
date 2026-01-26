# Scripts Directory Structure

本文档描述了 `scripts/` 目录的组织结构和脚本分类规则。

## 目录结构

```
scripts/
├── deploy/          # 部署脚本（本地和远程）
├── start/           # 服务启动脚本
├── stop/            # 服务停止脚本
├── migrate/         # 数据库和数据迁移脚本
├── verify/          # 验证和校验脚本
├── test/            # 测试脚本
├── scan/            # 代码扫描脚本
├── build/           # 构建脚本
├── server/          # 服务器管理脚本
├── dev/             # 开发工具脚本
└── utils/           # 工具脚本（共享函数）
```

## 脚本分类规则

### 1. `scripts/deploy/` - 部署操作
- **用途**: 部署应用程序、服务或构建产物到目标环境
- **示例**: `deploy-local.sh`, `deploy-remote.sh`, `deploy-module.sh`
- **标准**: 复制文件、配置服务或激活部署的脚本
- **不包括**: 服务管理（启动/停止），这些脚本放在 `start/` 或 `stop/`

### 2. `scripts/start/` - 服务启动
- **用途**: 启动服务、应用程序或进程
- **示例**: `start-all.sh`, `start-main-backend.sh`, `start-admin-frontend.sh`
- **标准**: 使用 `nohup`、`screen` 或 systemd 启动服务的脚本
- **命名模式**: 通常命名为 `start-*.sh`

### 3. `scripts/stop/` - 服务停止
- **用途**: 停止服务、应用程序或进程
- **示例**: `stop-all.sh`, `stop-databases.sh`
- **标准**: 使用 `kill` 或 systemd 终止服务的脚本
- **命名模式**: 通常命名为 `stop-*.sh`

### 4. `scripts/migrate/` - 数据和架构迁移
- **用途**: 迁移数据库架构、数据或系统配置
- **示例**: `execute-guest-mode-migration.sh`, `execute_audio_models_migration.sh`
- **标准**: 修改数据库结构或数据的脚本，通常是一次性操作
- **不包括**: 验证脚本（放在 `verify/`）

### 5. `scripts/verify/` - 验证和校验
- **用途**: 验证系统状态、数据完整性或配置正确性
- **示例**: `verify-prompt-management.sh`, `verify_skills_system.sh`, `verify_import.sh`
- **标准**: 检查、验证或校验但不修改数据的脚本
- **不包括**: 测试（放在 `test/`），迁移（放在 `migrate/`）

### 6. `scripts/test/` - 测试脚本
- **用途**: 运行自动化测试（单元、集成、E2E）
- **示例**: `run-unit-tests.sh`, `run-integration-tests.sh`, `test-all.sh`
- **标准**: 执行测试套件并报告结果的脚本
- **命名模式**: 通常命名为 `test-*.sh` 或 `run-*-tests.sh`

### 7. `scripts/scan/` - 代码扫描
- **用途**: 扫描代码质量、安全性或风格问题
- **示例**: `eslint-scan.sh`, `sonar-scan.sh`, `security-scan.sh`
- **标准**: 静态分析、代码质量检查、安全扫描

### 8. `scripts/build/` - 构建脚本
- **用途**: 编译、打包或构建构建产物
- **示例**: `build-all.sh`, `build-module.sh`, `build-backend.sh`
- **标准**: 将源代码转换为可部署产物的脚本

### 9. `scripts/server/` - 服务器管理
- **用途**: 管理服务器操作（健康检查、状态、日志）
- **示例**: `health-check.sh`, `server-status.sh`, `view-logs.sh`
- **标准**: 与运行中的服务交互的脚本（不是启动/停止）
- **不包括**: 启动/停止脚本（放在 `start/` 或 `stop/`）

### 10. `scripts/dev/` - 开发工具
- **用途**: 辅助开发工作流的脚本
- **示例**: `setup-local-env.sh`, `generate-code.sh`, `check-env.sh`
- **标准**: 开发时工具、本地环境设置

### 11. `scripts/utils/` - 工具脚本
- **用途**: 共享工具函数和辅助脚本
- **示例**: `port-utils.sh`, `common.sh`（如果从 build/ 移动）
- **标准**: 可重用的函数、被其他脚本使用的辅助工具

## 脚本依赖关系

### 依赖类型

1. **直接依赖**: 调用其他脚本的脚本
   - 示例: `start-all.sh` 调用各个 `start-*.sh` 脚本
   - **处理**: 重组后更新相对路径

2. **共享工具**: 引用公共函数的脚本
   - 示例: 脚本中 `source scripts/build/common.sh`
   - **处理**: 确保工具脚本可以从新位置访问

3. **路径依赖**: 通过相对路径引用文件的脚本
   - 示例: 脚本引用 `../sql/` 或 `../../target/`
   - **处理**: 更新相对路径或使用从项目根目录的绝对路径

### 依赖解析策略

1. **迁移前**:
   - 分析所有脚本的 `source`、`bash`、`sh` 调用
   - 识别相对路径引用
   - 创建依赖图

2. **迁移中**:
   - 首先移动工具脚本到 `scripts/utils/`
   - 更新所有 `source` 语句使用新路径
   - 尽可能使用项目根目录相对路径

3. **迁移后**:
   - 验证所有依赖正确解析
   - 从新位置测试脚本执行
   - 更新文档中的新路径

## 迁移指南

### 对于开发者

如果您需要在代码中引用脚本：

1. **使用相对路径**: 从项目根目录使用相对路径
   ```bash
   # 正确
   ./scripts/start/start-main-backend.sh
   ./scripts/build/build-module.sh main
   ```

2. **使用绝对路径**: 从项目根目录构建绝对路径
   ```java
   // Java 示例
   String scriptPath = projectRoot + "/scripts/start/start-main-backend.sh";
   ```

3. **避免硬编码**: 使用配置或环境变量
   ```yaml
   # scripts-config.yml
   script: scripts/start/start-main-backend.sh
   ```

### 向后兼容性

在迁移过渡期间，我们提供了向后兼容的符号链接（如果适用）。这些链接将在迁移完成后移除。

## 脚本执行

所有脚本都应该：
- 可执行（`chmod +x`）
- 使用 `#!/bin/bash` 或适当的 shebang
- 包含错误处理（`set -e` 或类似）
- 记录执行日志
- 支持 `--help` 或 `-h` 参数（如果适用）

## 维护

- 添加新脚本时，请遵循分类规则
- 更新脚本时，请检查并更新依赖关系
- 删除脚本时，请检查是否有其他脚本依赖它
- 定期运行 `scripts/validate-script-paths.sh` 验证所有路径

## 相关文档

- [DevOps Workbench 用户指南](../admin/frontend/docs/devops-workbench.md)
- [脚本配置说明](../admin/backend/src/main/resources/scripts/README.md)
