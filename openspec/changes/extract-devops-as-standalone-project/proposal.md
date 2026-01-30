# Change: 将 DevOps 作为独立项目迁移，作为一体化部署基础设施

## Why

当前 DevOps 工作台功能集成在 `admin` 项目中，作为管理后台的一个模块存在。但随着 DevOps 平台功能的不断完善（CMDB、完整发布流程、自动化测试、问题自动修复等），将其作为独立项目具有以下优势：

1. **职责清晰**：DevOps 平台作为基础设施服务，应该独立于业务管理后台，专注于提供部署、运维、监控等基础设施能力
2. **复用性**：作为独立项目，可以被多个业务项目（main、mentis、edu、admin 等）复用，提供统一的一体化部署能力
3. **可扩展性**：独立项目更容易扩展，可以支持更多项目类型和部署场景
4. **维护性**：独立的代码库和部署流程，降低与 admin 项目的耦合，便于独立维护和升级
5. **部署灵活性**：可以独立部署和扩展，不依赖 admin 项目的部署周期

**目标**：
- 将 DevOps 相关代码从 `admin/backend` 和 `admin/frontend` 中迁移到独立的 `devops/` 项目
- 建立 DevOps 项目作为基础设施服务的定位
- 提供统一的 API 接口，供其他项目调用进行部署和运维
- 保持向后兼容，确保现有功能不受影响

## What Changes

### 项目结构变更

- **BREAKING**: 创建独立的 `devops/` 项目目录
  - `devops/backend/` - DevOps 后端服务（Spring Boot，独立部署）
  - `devops/frontend/` - DevOps 前端界面（React + TypeScript，独立应用，可通过 iframe 嵌入）
  - `devops/scripts/` - DevOps 相关脚本（从 `scripts/devops/` 迁移）
  - `devops/docs/` - DevOps 项目文档

- **BREAKING**: 从 `admin/backend` 中迁移 DevOps 相关代码
  - Controller: `DevOpsWorkbenchController`, `DeploymentPipelineController`, `EnvironmentVariableController`, `RemoteServerController`, `AutoFixController`
  - Service: `DevOpsWorkbenchService`, `PipelineExecutionEngine`, `ScheduledTaskService`
  - Entity: DevOps 相关的所有实体类（ScriptExecution, PipelineExecution, CMDB 相关实体等）
  - Repository: DevOps 相关的所有 Repository
  - DTO: DevOps 相关的所有 DTO

- **MODIFIED**: DevOps 前端集成到 Admin 管理后台
  - DevOps 前端作为独立应用，可以独立部署和访问
  - Admin 前端通过 iframe 或组件嵌入的方式集成 DevOps 前端
  - Admin 左侧边栏保留 DevOps 菜单和子菜单（已存在）
  - 点击 DevOps 菜单时，在 Admin 主内容区域显示 DevOps 前端界面
  - DevOps 前端通过共享的 JWT Token 进行认证

- **BREAKING**: 迁移 DevOps 相关脚本
  - 从 `scripts/devops/` 迁移到 `devops/scripts/`
  - 更新脚本中的路径引用

### 数据库变更

- **BREAKING**: DevOps 项目使用独立的数据库或独立的数据库 schema
  - 创建 `devops` 数据库或 `devops_*` schema
  - 迁移 DevOps 相关的数据库表（脚本执行、部署流程、CMDB 等）
  - **共享 `system_admin` 表**：DevOps 项目通过数据库连接访问 admin 项目的 `system_admin` 表
  - 更新数据库连接配置（支持访问 `system_admin` 表）

### API 接口变更

- **MODIFIED**: DevOps API 路径调整
  - 从 `/api/admin/devops/*` 调整为 `/api/devops/*`
  - 从 `/api/admin/pipeline/*` 调整为 `/api/devops/pipeline/*`
  - 保持 API 接口的向后兼容性（通过 API Gateway 或反向代理）

### 认证和授权

- **ADDED**: DevOps 项目认证系统（共享 SystemAdmin 表）
  - 共享 `system_admin` 数据库表（通过数据库连接，不依赖 admin 项目代码）
  - 使用共享的 JWT Secret（与 admin 项目相同，实现单点登录）
  - 实现独立的 `DevOpsAuthService`，查询共享的 `system_admin` 表
  - 支持管理员认证（SystemAdmin JWT Token）
  - 支持 API Token 认证（供其他项目调用，存储在 DevOps 自己的数据库中）
  - 使用 `shared/backend` 中的 `JwtUtils`（共享 JWT 工具）

### 配置管理

- **ADDED**: DevOps 项目独立配置
  - `devops/backend/src/main/resources/application.yml` - 后端配置
  - `devops/frontend/.env` - 前端环境变量
  - 支持多环境配置（dev、test、prod）

### 部署脚本

- **ADDED**: DevOps 项目独立部署脚本
  - `devops/scripts/deploy-backend.sh` - 后端部署脚本
  - `devops/scripts/deploy-frontend.sh` - 前端部署脚本
  - `devops/scripts/setup-devops.sh` - 初始化脚本

## Impact

### Affected Specs

- **admin-unified-management**: 需要移除 DevOps 工作台相关规范，DevOps 功能迁移到独立项目
- **devops-workbench**: 需要更新为独立项目的规范，包括 API 接口、认证方式等
- **project-structure**: 需要更新项目结构说明，添加 `devops/` 项目

### Affected Code

- **admin/backend**: 
  - 移除所有 DevOps 相关的 Controller、Service、Entity、Repository
  - 更新依赖配置（移除 DevOps 相关依赖）
  
- **admin/frontend**:
  - 移除 `DevOpsWorkbench/` 组件目录（不再使用组件方式）
  - 移除 DevOps 相关的 API 服务（改为调用 DevOps 后端 API）
  - 添加 DevOps iframe 集成组件（在 Admin 主内容区域显示 DevOps 前端）
  - 保留 DevOps 菜单和子菜单（已存在，无需修改）

- **scripts/devops/**:
  - 迁移到 `devops/scripts/`
  - 更新脚本中的路径引用

### New Capabilities

- **devops-platform**: 独立的 DevOps 平台项目
  - 独立的部署和运维能力
  - 统一的 API 接口供其他项目调用
  - 独立的认证和授权系统
  - 独立的数据库和配置管理

### Breaking Changes

- **BREAKING**: DevOps API 路径从 `/api/admin/devops/*` 变更为 `/api/devops/*`
- **BREAKING**: DevOps 后端需要独立部署（独立端口，如 8086）
- **BREAKING**: DevOps 前端需要独立部署（独立端口，如 3006），通过 iframe 集成到 Admin
- **BREAKING**: DevOps 数据库需要独立配置，或使用独立的 schema
- **MODIFIED**: DevOps 前端访问方式从组件方式变更为 iframe 方式

### Migration Guide

1. **数据库迁移**：
   - 创建 `devops` 数据库或 schema
   - 迁移 DevOps 相关的表结构和数据
   - 更新数据库连接配置

2. **代码迁移**：
   - 从 `admin/backend` 和 `admin/frontend` 中提取 DevOps 相关代码
   - 创建新的 `devops/backend` 和 `devops/frontend` 项目结构
   - 更新包名和导入路径

3. **配置更新**：
   - 更新 DevOps 项目的配置文件
   - 更新其他项目调用 DevOps API 的配置
   - 更新部署脚本和反向代理配置

4. **API 兼容性**：
   - 通过 API Gateway 或反向代理保持向后兼容
   - 或提供迁移期，同时支持新旧 API 路径

5. **部署更新**：
   - 独立部署 DevOps 后端（独立端口，如 8086）
   - 独立部署 DevOps 前端（独立端口，如 3006）
   - 更新 Nginx 等反向代理配置
   - 更新 Admin 前端，添加 DevOps iframe 集成
   - 更新其他项目的部署脚本，调用 DevOps API

6. **前端集成**：
   - Admin 前端通过 iframe 嵌入 DevOps 前端
   - DevOps 前端通过 URL 参数或 postMessage 接收 JWT Token
   - 确保 DevOps 前端可以独立访问（不依赖 Admin）

## Design Principles

1. **独立性**：DevOps 项目完全独立，不依赖其他业务项目的代码
2. **可复用性**：提供统一的 API 接口，供多个项目复用
3. **向后兼容**：迁移过程中保持 API 兼容性，确保现有功能不受影响
4. **渐进式迁移**：分阶段迁移，先迁移代码结构，再迁移部署和配置
5. **文档完善**：提供完整的迁移文档和使用文档

## Acceptance Criteria

1. ✅ DevOps 项目可以独立构建和部署
2. ✅ DevOps 功能从 admin 项目中完全移除
3. ✅ DevOps API 可以正常访问（新路径或兼容路径）
4. ✅ 其他项目可以通过 API 调用 DevOps 功能
5. ✅ DevOps 数据库独立配置和迁移
6. ✅ 所有 DevOps 脚本迁移到新位置
7. ✅ 文档更新完成，包括迁移指南和使用文档
8. ✅ 现有 DevOps 功能不受影响，可以正常使用
