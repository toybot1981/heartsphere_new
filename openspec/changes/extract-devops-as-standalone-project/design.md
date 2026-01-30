# DevOps 独立项目迁移设计文档

## Context

当前 DevOps 工作台功能集成在 `admin` 项目中，作为管理后台的一个模块。随着 DevOps 平台功能的不断完善，需要将其独立出来，作为基础设施服务供多个项目复用。

### 当前架构

```
admin/
├── backend/
│   ├── controller/
│   │   ├── DevOpsWorkbenchController
│   │   ├── DeploymentPipelineController
│   │   └── ...
│   ├── service/
│   │   ├── DevOpsWorkbenchService
│   │   └── ...
│   └── ...
└── frontend/
    ├── components/
    │   └── DevOpsWorkbench/
    └── ...
```

### 目标架构

```
devops/
├── backend/          # 独立的 DevOps 后端服务
├── frontend/         # 独立的 DevOps 前端界面
├── scripts/          # DevOps 相关脚本
└── docs/             # DevOps 项目文档

admin/                # Admin 项目不再包含 DevOps 功能
├── backend/
└── frontend/
```

## Goals / Non-Goals

### Goals

1. **独立性**：DevOps 项目完全独立，可以单独构建、部署和运行
2. **可复用性**：提供统一的 API 接口，供多个项目（main、mentis、edu、admin）复用
3. **向后兼容**：迁移过程中保持 API 兼容性，确保现有功能不受影响
4. **基础设施定位**：明确 DevOps 作为基础设施服务的定位

### Non-Goals

1. **不改变 DevOps 功能**：只迁移代码位置，不改变现有功能
2. **不改变数据库结构**：只迁移数据库，不改变表结构
3. **不改变 API 接口**：保持 API 接口不变，只改变路径前缀（通过兼容层）

## Decisions

### Decision 1: 项目结构

**决策**：创建独立的 `devops/` 项目，采用与 `admin` 项目相同的结构（前后端分离）

**理由**：
- 保持项目结构一致性，便于维护
- 前后端分离架构便于独立部署和扩展
- 符合现有项目的架构模式

**替代方案**：
- 微服务架构：过于复杂，当前阶段不需要
- 单体应用：不符合前后端分离的原则

### Decision 2: 数据库策略

**决策**：使用独立的数据库或独立的 schema，但共享 `system_admin` 表

**选项 A：独立数据库 + 共享 SystemAdmin 表**
- DevOps 项目使用独立的数据库存储 DevOps 相关数据
- DevOps 项目通过数据库连接访问 admin 项目的 `system_admin` 表（跨数据库查询）
- 优点：数据隔离，但管理员账户统一管理
- 缺点：需要配置跨数据库查询（如果使用不同数据库实例）

**选项 B：独立 schema + 共享 SystemAdmin 表**
- DevOps 项目使用独立的 schema 存储 DevOps 相关数据
- DevOps 项目访问 admin schema 的 `system_admin` 表
- 优点：共享数据库实例，节省资源，跨 schema 查询简单
- 缺点：需要数据库支持多 schema

**选择**：优先使用独立 schema（选项 B），如果使用独立数据库，则通过数据库连接配置访问 `system_admin` 表

**推荐方案**：使用独立 schema，通过多数据源配置访问 `system_admin` 表（参考 admin 项目的多数据源实现）

**SystemAdmin 表共享方式**：
- DevOps 项目配置数据源，可以访问 `system_admin` 表
- DevOps 项目定义 `SystemAdmin` 实体类（与 admin 项目结构相同）
- DevOps 项目通过 JPA Repository 查询 `system_admin` 表
- 不依赖 admin 项目的代码，只依赖数据库表结构

### Decision 3: API 路径变更

**决策**：API 路径从 `/api/admin/devops/*` 变更为 `/api/devops/*`

**兼容性方案**：
1. **API Gateway**：通过 API Gateway 或反向代理保持向后兼容
2. **迁移期支持**：在迁移期间同时支持新旧路径
3. **直接变更**：直接变更，要求调用方更新

**选择**：采用方案 2（迁移期支持），在迁移期间同时支持新旧路径，逐步迁移调用方

### Decision 6: 前端集成方式

**决策**：DevOps 前端作为独立应用，通过 iframe 集成到 Admin 管理后台

**集成方案**：
1. **iframe 嵌入**：Admin 前端通过 iframe 嵌入 DevOps 前端（推荐）
2. **组件嵌入**：将 DevOps 组件直接集成到 Admin 前端（不推荐，增加耦合）
3. **独立访问**：DevOps 前端完全独立，不集成到 Admin（不符合需求）

**选择**：采用方案 1（iframe 嵌入）

**实现细节**：
- DevOps 前端作为独立应用部署（独立端口，如 3006）
- Admin 前端通过 iframe 嵌入 DevOps 前端
- DevOps 前端通过 URL 参数或 postMessage 接收 JWT Token
- Admin 左侧边栏保留 DevOps 菜单（已存在，无需修改）
- 点击 DevOps 菜单时，在 Admin 主内容区域显示 DevOps iframe
- 支持直接访问 DevOps 前端（独立访问，不通过 Admin）

**优点**：
- ✅ 完全独立：DevOps 前端可以独立部署和访问
- ✅ 低耦合：Admin 和 DevOps 前端完全解耦
- ✅ 易于维护：两个前端项目独立维护
- ✅ 灵活性：可以独立更新 DevOps 前端，不影响 Admin

**缺点**：
- ⚠️ iframe 通信：需要通过 postMessage 进行跨 iframe 通信
- ⚠️ Token 传递：需要安全地传递 JWT Token

### Decision 4: 认证和授权

**决策**：DevOps 项目共享 SystemAdmin 数据库表，使用共享的 JWT Secret，实现统一的管理员认证

**认证方案**：
1. **共享 SystemAdmin 表**：DevOps 项目访问 admin 项目的 `system_admin` 表（通过数据库连接，不是代码依赖）
2. **共享 JWT Secret**：使用与 admin 项目相同的 JWT secret，实现单点登录
3. **独立认证实现**：DevOps 项目实现自己的认证逻辑，但使用共享的表和 JWT secret
4. **API Token 认证**：其他项目通过 API Token 调用 DevOps API

**实现细节**：
- DevOps 项目配置数据库连接，可以访问 `system_admin` 表
- DevOps 项目使用 `shared/backend` 中的 `JwtUtils`（共享 JWT 工具）
- DevOps 项目实现自己的 `DevOpsAuthService`，但查询共享的 `system_admin` 表
- 使用 Spring Security 实现认证和授权
- API Token 存储在 DevOps 自己的数据库中，支持创建、撤销、过期管理
- 不同认证方式使用不同的 Security Filter

**优点**：
- 统一管理：管理员账户在 admin 项目中统一管理
- 单点登录：使用相同的 JWT secret，管理员登录一次可以访问多个系统
- 独立性：DevOps 项目代码独立，不依赖 admin 项目代码
- 灵活性：DevOps 项目可以有自己的认证逻辑和权限控制

**替代方案**：
- **独立管理员表**：DevOps 项目有自己的管理员表，需要单独管理账户（不推荐，增加管理成本）
- **调用 Admin API**：DevOps 项目通过 HTTP 调用 admin 项目的认证 API（不推荐，增加依赖和延迟）

### Decision 5: 配置管理

**决策**：使用 Spring Boot 标准配置方式，支持多环境配置

**配置结构**：
- `application.yml` - 基础配置
- `application-dev.yml` - 开发环境配置
- `application-test.yml` - 测试环境配置
- `application-prod.yml` - 生产环境配置

**配置内容**：
- 数据库连接配置
- API Token 配置
- 外部服务配置（如 AI 服务）
- 日志配置

## Risks / Trade-offs

### Risk 1: API 兼容性问题

**风险**：API 路径变更可能导致现有调用方无法访问

**缓解措施**：
- 在迁移期间同时支持新旧路径
- 提供详细的迁移文档
- 提供 API 兼容层

### Risk 2: 数据库迁移风险

**风险**：数据库迁移可能导致数据丢失或服务中断

**缓解措施**：
- 在迁移前备份所有数据
- 使用 Flyway 进行数据库版本管理
- 在低峰期进行迁移
- 提供回滚方案

### Risk 3: 功能回归

**风险**：迁移过程中可能引入 bug 或功能缺失

**缓解措施**：
- 完整的测试覆盖
- 分阶段迁移，每阶段都进行验证
- 保持代码审查流程

### Trade-off 1: 独立部署 vs 集成部署

**独立部署**：
- 优点：灵活性高，可以独立扩展
- 缺点：需要额外的部署和运维成本

**集成部署**：
- 优点：部署简单，运维成本低
- 缺点：耦合度高，扩展性差

**选择**：独立部署，虽然增加了部署成本，但提供了更好的灵活性和可扩展性

### Trade-off 2: 数据库隔离 vs 共享

**独立数据库**：
- 优点：完全隔离，安全性高
- 缺点：资源消耗大

**共享数据库（独立 schema）**：
- 优点：资源消耗小
- 缺点：隔离性较差

**选择**：优先使用独立数据库，如果资源有限，可以使用独立 schema

## Migration Plan

### Phase 1: 项目结构创建（1-2 天）

1. 创建 `devops/` 项目目录结构
2. 创建后端和前端的基础框架
3. 配置构建工具（Maven、npm）

### Phase 2: 代码迁移（3-5 天）

1. 迁移后端代码（Controller、Service、Entity、Repository、DTO）
2. 迁移前端代码（组件、API 服务、路由）
3. 更新包名和导入路径
4. 配置数据库连接

### Phase 3: 数据库迁移（1-2 天）

1. 创建 DevOps 数据库或 schema
2. 迁移表结构和数据
3. 更新数据库连接配置
4. 验证数据完整性

### Phase 4: 认证和授权（2-3 天）

1. 实现 SystemAdmin 认证
2. 实现 API Token 认证
3. 配置 Spring Security
4. 测试认证功能

### Phase 5: API 路径更新（1-2 天）

1. 更新后端 API 路径
2. 更新前端 API 调用
3. 实现 API 兼容层（可选）
4. 测试 API 功能

### Phase 6: 从 Admin 移除代码（1-2 天）

1. 从 admin/backend 移除 DevOps 代码
2. 从 admin/frontend 移除 DevOps 代码
3. 更新依赖配置
4. 验证 Admin 项目功能

### Phase 7: 构建和部署（2-3 天）

1. 验证 DevOps 项目可以独立构建
2. 测试 DevOps 项目启动
3. 配置部署脚本
4. 部署到测试环境

### Phase 8: 测试和验证（3-5 天）

1. 功能测试
2. 集成测试
3. 性能测试
4. 安全测试

### Phase 9: 文档和清理（1-2 天）

1. 更新文档
2. 代码清理和优化
3. 最终验证

### Rollback Plan

如果迁移过程中出现严重问题，可以按以下步骤回滚：

1. **停止 DevOps 服务**：停止新部署的 DevOps 服务
2. **恢复 Admin 代码**：从 Git 历史恢复 Admin 项目中的 DevOps 代码
3. **恢复数据库**：从备份恢复数据库
4. **恢复配置**：恢复 Nginx 等配置
5. **验证功能**：验证 Admin 项目功能正常

## Open Questions

1. **API Token 管理界面**：是否需要提供 API Token 的管理界面？还是只通过 API 管理？
   - **决策**：提供管理界面，便于管理员管理 Token

2. **多项目支持**：如何区分不同项目调用 DevOps API？
   - **决策**：通过 API Token 或请求头中的项目标识来区分

3. **权限控制**：不同项目是否有不同的权限？
   - **决策**：初期所有项目权限相同，后续可以根据需要扩展

4. **监控和告警**：DevOps 项目的监控和告警如何实现？
   - **决策**：使用 Spring Boot Actuator 提供监控端点，集成 Prometheus 和 Grafana

5. **日志管理**：DevOps 项目的日志如何管理？
   - **决策**：使用统一的日志框架（Logback），支持日志聚合和分析

6. **管理员账户同步**：如果 admin 项目创建或修改管理员账户，DevOps 项目如何同步？
   - **决策**：通过共享数据库表，自动同步（无需额外同步机制）
   - 如果使用独立数据库，可以考虑：
     - 数据库复制/同步机制
     - 或 DevOps 项目通过 API 调用 admin 项目查询管理员信息（不推荐，增加依赖）
