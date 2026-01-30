# DevOps 工作台脚本配置说明

## 概述

本文档说明了 DevOps 工作台中配置的所有脚本，这些脚本覆盖了项目的全流程操作。

## 脚本统计

- **代码扫描 (scan)**: 3 个脚本
- **测试 (test)**: 4 个脚本
- **构建 (build)**: 4 个脚本
- **部署 (deploy)**: 5 个脚本
- **数据库 (database)**: 5 个脚本
- **服务器 (server)**: 6 个脚本

**总计**: 27 个脚本

## 脚本详细列表

### 1. 代码扫描 (scan)

#### 1.1 ESLint 代码扫描
- **ID**: `code-scan-eslint`
- **脚本**: `scripts/scan/eslint-scan.sh`
- **功能**: 使用 ESLint 扫描前端代码质量
- **参数**:
  - `module`: 扫描模块（可选）
  - `fix`: 是否自动修复问题（默认: false）

#### 1.2 SonarQube 代码扫描
- **ID**: `code-scan-sonar`
- **脚本**: `scripts/scan/sonar-scan.sh`
- **功能**: 使用 SonarQube 进行代码质量分析
- **参数**:
  - `module`: 扫描模块（可选）

#### 1.3 安全漏洞扫描
- **ID**: `code-scan-security`
- **脚本**: `scripts/scan/security-scan.sh`
- **功能**: 扫描代码中的安全漏洞
- **参数**:
  - `severity`: 最低严重级别（low, medium, high, critical，默认: medium）

### 2. 测试 (test)

#### 2.1 单元测试
- **ID**: `test-unit`
- **脚本**: `scripts/test/run-unit-tests.sh`
- **功能**: 运行所有单元测试
- **参数**:
  - `module`: 测试模块（可选）
  - `coverage`: 是否生成覆盖率报告（默认: true）

#### 2.2 集成测试
- **ID**: `test-integration`
- **脚本**: `scripts/test/run-integration-tests.sh`
- **功能**: 运行集成测试
- **参数**:
  - `module`: 测试模块（可选）

#### 2.3 E2E 测试
- **ID**: `test-e2e`
- **脚本**: `scripts/test/run-e2e-tests.sh`
- **功能**: 运行端到端测试
- **参数**:
  - `browser`: 测试浏览器（chromium, firefox, webkit, all，默认: chromium）
  - `headless`: 无头模式（默认: true）

#### 2.4 运行所有测试
- **ID**: `test-all`
- **脚本**: `scripts/run-tests.sh`
- **功能**: 运行单元测试、集成测试和 E2E 测试
- **参数**:
  - `module`: 测试模块（可选）
  - `testType`: 测试类型（unit, integration, e2e, all，默认: all）

### 3. 构建 (build)

#### 3.1 全量构建
- **ID**: `build-all`
- **脚本**: `scripts/build/build-all.sh`
- **功能**: 构建所有模块（main, admin, company, edu, mentis）
- **参数**:
  - `clean`: 是否清理缓存（默认: false）
  - `skipTests`: 是否跳过测试（默认: false）

#### 3.2 单模块构建
- **ID**: `build-module`
- **脚本**: `scripts/build/build-module.sh`
- **功能**: 构建指定模块
- **参数**:
  - `module`: 模块名称（必填，main, admin, company, edu, mentis, shared）
  - `clean`: 是否清理缓存（默认: false）

#### 3.3 前端构建
- **ID**: `build-frontend`
- **脚本**: `scripts/build/build-frontend.sh`
- **功能**: 构建所有前端项目
- **参数**:
  - `module`: 前端模块（可选）
  - `mode`: 构建模式（development, production，默认: production）

#### 3.4 后端构建
- **ID**: `build-backend`
- **脚本**: `scripts/build/build-backend.sh`
- **功能**: 构建所有后端项目
- **参数**:
  - `module`: 后端模块（可选）
  - `skipTests`: 是否跳过测试（默认: false）

### 4. 部署 (deploy)

#### 4.1 开发环境后端部署
- **ID**: `deploy-backend-dev`
- **脚本**: `deploy/deploy-backend-dev.sh`
- **功能**: 部署后端到开发环境
- **参数**:
  - `module`: 部署模块（可选）

#### 4.2 开发环境前端部署
- **ID**: `deploy-frontend-dev`
- **脚本**: `deploy/deploy-frontend-dev.sh`
- **功能**: 部署前端到开发环境
- **参数**:
  - `module`: 部署模块（可选）

#### 4.3 生产环境后端部署
- **ID**: `deploy-backend-prod`
- **脚本**: `deploy/deploy-backend-prod.sh`
- **功能**: 部署后端到生产环境
- **风险级别**: 高
- **需要确认**: 是
- **参数**:
  - `version`: 部署版本（必填）
  - `module`: 部署模块（可选）

#### 4.4 生产环境前端部署
- **ID**: `deploy-frontend-prod`
- **脚本**: `deploy/deploy-frontend-prod.sh`
- **功能**: 部署前端到生产环境
- **风险级别**: 高
- **需要确认**: 是
- **参数**:
  - `version`: 部署版本（必填）
  - `module`: 部署模块（可选）

#### 4.5 开发环境全量部署
- **ID**: `deploy-all-dev`
- **脚本**: `deploy/deploy-all-dev.sh`
- **功能**: 部署所有模块到开发环境
- **参数**:
  - `skipBuild`: 是否跳过构建步骤（默认: false）

### 5. 数据库 (database)

#### 5.1 数据库备份
- **ID**: `backup-databases`
- **脚本**: `sql/backup_all_databases.sh`
- **功能**: 备份所有数据库
- **参数**:
  - `backupDir`: 备份目录（默认: sql/backups）
  - `compress`: 是否压缩备份文件（默认: true）

#### 5.2 数据库恢复
- **ID**: `restore-database`
- **脚本**: `sql/restore_database.sh`
- **功能**: 从备份文件恢复数据库
- **风险级别**: 高
- **需要确认**: 是
- **参数**:
  - `backupFile`: 备份文件路径（必填）
  - `database`: 目标数据库名称（必填）

#### 5.3 数据库迁移
- **ID**: `migrate-database`
- **脚本**: `deploy/migrate-database.sh`
- **功能**: 执行数据库迁移脚本
- **风险级别**: 中
- **需要确认**: 是
- **参数**:
  - `environment`: 目标环境（dev, test, prod，必填）
  - `version`: 迁移到指定版本（可选）

#### 5.4 数据库查询
- **ID**: `database-query`
- **脚本**: `sql/execute-query.sh`
- **功能**: 执行 SQL 查询
- **参数**:
  - `database`: 数据库名称（必填）
  - `query`: SQL 查询语句（必填）

#### 5.5 数据库统计
- **ID**: `database-stats`
- **脚本**: `sql/database-stats.sh`
- **功能**: 查看数据库统计信息
- **参数**:
  - `database`: 数据库名称（可选，不填则显示所有）

### 6. 服务器 (server)

#### 6.1 服务器状态
- **ID**: `server-status`
- **脚本**: `scripts/server/server-status.sh`
- **功能**: 查看服务器运行状态
- **参数**:
  - `service`: 服务名称（可选，如：main-backend, admin-backend）

#### 6.2 启动服务
- **ID**: `server-start`
- **脚本**: `scripts/server/start-service.sh`
- **功能**: 启动指定服务
- **参数**:
  - `service`: 服务名称（必填）
  - `environment`: 运行环境（dev, test, prod，默认: dev）

#### 6.3 停止服务
- **ID**: `server-stop`
- **脚本**: `scripts/server/stop-service.sh`
- **功能**: 停止指定服务
- **参数**:
  - `service`: 服务名称（必填）

#### 6.4 重启服务
- **ID**: `server-restart`
- **脚本**: `scripts/server/restart-service.sh`
- **功能**: 重启指定服务
- **风险级别**: 中
- **需要确认**: 是
- **参数**:
  - `service`: 服务名称（必填）

#### 6.5 查看服务日志
- **ID**: `server-logs`
- **脚本**: `scripts/server/view-logs.sh`
- **功能**: 查看指定服务的日志
- **参数**:
  - `service`: 服务名称（必填）
  - `lines`: 显示行数（默认: 100）
  - `follow`: 是否实时跟踪（默认: false）

#### 6.6 健康检查
- **ID**: `server-health-check`
- **脚本**: `scripts/server/health-check.sh`
- **功能**: 检查所有服务的健康状态
- **参数**: 无

## 权限要求

- **SUPER_ADMIN**: 所有脚本
- **ADMIN**: 大部分脚本（除高风险生产环境操作）

## 环境支持

- **dev**: 开发环境
- **test**: 测试环境
- **prod**: 生产环境（部分脚本）

## 使用说明

1. **访问 DevOps 工作台**: 在管理后台中点击"DevOps 工作台"
2. **选择脚本**: 在相应的标签页中选择要执行的脚本
3. **填写参数**: 根据脚本要求填写必要的参数
4. **确认执行**: 高风险操作需要二次确认
5. **查看结果**: 在执行历史中查看执行结果和日志

## 注意事项

1. **生产环境操作**: 生产环境的部署和数据库操作需要 SUPER_ADMIN 权限，且需要二次确认
2. **脚本路径**: 所有脚本路径相对于项目根目录
3. **依赖检查**: 执行脚本前会检查必要的依赖（如 java, maven, node 等）
4. **超时设置**: 每个脚本都有超时设置，长时间运行的脚本超时时间更长
5. **日志记录**: 所有脚本执行都会记录日志，可在执行历史中查看

## 脚本文件位置

- **配置文件**: `admin/backend/src/main/resources/scripts/scripts-config.yml`
- **扫描脚本**: `scripts/scan/`
- **测试脚本**: `scripts/test/`
- **构建脚本**: `scripts/build/`
- **部署脚本**: `deploy/`
- **数据库脚本**: `sql/`
- **服务器脚本**: `scripts/server/`

## 扩展脚本

如需添加新脚本，请：

1. 在 `scripts-config.yml` 中添加脚本配置
2. 创建对应的脚本文件
3. 设置脚本执行权限：`chmod +x <script-file>`
4. 重启后端服务以加载新配置
