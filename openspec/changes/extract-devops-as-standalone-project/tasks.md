# Tasks: 将 DevOps 作为独立项目迁移

## 1. 项目结构创建

- [ ] 1.1 创建 `devops/` 项目根目录
- [ ] 1.2 创建 `devops/backend/` 目录结构（参照 admin/backend）
- [ ] 1.3 创建 `devops/frontend/` 目录结构（参照 admin/frontend）
- [ ] 1.4 创建 `devops/scripts/` 目录
- [ ] 1.5 创建 `devops/docs/` 目录

## 2. 后端代码迁移

- [ ] 2.1 从 `admin/backend` 迁移 DevOps Controller
  - [ ] 迁移 `DevOpsWorkbenchController`
  - [ ] 迁移 `DeploymentPipelineController`
  - [ ] 迁移 `EnvironmentVariableController`
  - [ ] 迁移 `RemoteServerController`
  - [ ] 迁移 `AutoFixController`
- [ ] 2.2 从 `admin/backend` 迁移 DevOps Service
  - [ ] 迁移 `DevOpsWorkbenchService`
  - [ ] 迁移 `PipelineExecutionEngine`
  - [ ] 迁移 `ScheduledTaskService`
- [ ] 2.3 从 `admin/backend` 迁移 DevOps Entity
  - [ ] 迁移所有 DevOps 相关的实体类
  - [ ] 更新包名和导入路径
- [ ] 2.4 从 `admin/backend` 迁移 DevOps Repository
  - [ ] 迁移所有 DevOps 相关的 Repository
  - [ ] 更新包名和导入路径
- [ ] 2.5 从 `admin/backend` 迁移 DevOps DTO
  - [ ] 迁移所有 DevOps 相关的 DTO
  - [ ] 更新包名和导入路径
- [ ] 2.6 创建 DevOps 项目主应用类
  - [ ] 创建 `DevOpsApplication.java`
  - [ ] 配置 Spring Boot 应用
- [ ] 2.7 创建 DevOps 项目配置文件
  - [ ] 创建 `application.yml`
  - [ ] 创建 `application-dev.yml`
  - [ ] 创建 `application-prod.yml`
- [ ] 2.8 创建 DevOps 项目 pom.xml
  - [ ] 配置 Maven 依赖
  - [ ] 配置构建插件

## 3. 前端代码迁移和集成

- [ ] 3.1 从 `admin/frontend` 迁移 DevOps 组件到独立项目
  - [ ] 迁移 `DevOpsWorkbench/` 目录到 `devops/frontend/src/components/`
  - [ ] 更新组件导入路径
- [ ] 3.2 从 `admin/frontend` 迁移 DevOps API 服务
  - [ ] 迁移 `services/api/admin/devops.ts` 到 `devops/frontend/src/services/api/devops.ts`
  - [ ] 迁移 `services/api/admin/autoFix.ts` 到 `devops/frontend/src/services/api/autoFix.ts`
  - [ ] 更新 API 路径为 `/api/devops/*`
  - [ ] 更新 API 基础 URL 为 DevOps 后端地址
- [ ] 3.3 创建 DevOps 前端主应用
  - [ ] 创建 `devops/frontend/src/App.tsx`
  - [ ] 创建路由配置
  - [ ] 支持通过 URL 参数接收 JWT Token
  - [ ] 支持通过 postMessage 接收 JWT Token
- [ ] 3.4 创建 DevOps 前端配置文件
  - [ ] 创建 `devops/frontend/package.json`
  - [ ] 创建 `devops/frontend/vite.config.ts`
  - [ ] 创建 `devops/frontend/.env` 文件
  - [ ] 配置独立端口（如 3006）
- [ ] 3.5 更新前端构建配置
  - [ ] 配置 Vite
  - [ ] 配置 TypeScript
  - [ ] 配置 Tailwind CSS
- [ ] 3.6 实现 Admin 前端集成 DevOps
  - [ ] 在 Admin 前端创建 DevOps iframe 组件
  - [ ] 实现 JWT Token 传递（通过 URL 参数或 postMessage）
  - [ ] 更新 Admin 主内容区域，支持显示 DevOps iframe
  - [ ] 确保 DevOps 菜单点击时显示 DevOps iframe
- [ ] 3.7 实现 DevOps 前端 Token 接收
  - [ ] 支持从 URL 参数读取 JWT Token
  - [ ] 支持通过 postMessage 接收 JWT Token
  - [ ] 实现 Token 存储和验证

## 4. 脚本迁移

- [ ] 4.1 从 `scripts/devops/` 迁移到 `devops/scripts/`
  - [ ] 迁移所有脚本文件
  - [ ] 更新脚本中的路径引用
- [ ] 4.2 创建 DevOps 部署脚本
  - [ ] 创建 `devops/scripts/deploy-backend.sh`
  - [ ] 创建 `devops/scripts/deploy-frontend.sh`
  - [ ] 创建 `devops/scripts/setup-devops.sh`

## 5. 数据库迁移

- [ ] 5.1 创建 DevOps 数据库或 schema
  - [ ] 创建 `devops` 数据库
  - [ ] 或创建 `devops_*` schema
- [ ] 5.2 迁移数据库表结构
  - [ ] 导出 DevOps 相关表结构（脚本执行、部署流程、CMDB 等）
  - [ ] 在 DevOps 数据库中创建表
- [ ] 5.3 迁移数据库数据（可选）
  - [ ] 导出 DevOps 相关数据
  - [ ] 导入到 DevOps 数据库
- [ ] 5.4 配置共享 SystemAdmin 表访问
  - [ ] 配置数据库连接，支持访问 `system_admin` 表
  - [ ] 如果使用独立数据库，配置跨数据库查询（或使用数据库连接池）
  - [ ] 如果使用独立 schema，配置跨 schema 查询
- [ ] 5.5 更新数据库连接配置
  - [ ] 更新 `application.yml` 中的数据库配置
  - [ ] 配置主数据源（DevOps 数据库）和辅助数据源（访问 system_admin 表，如果需要）
  - [ ] 更新 Flyway 配置

## 6. 认证和授权

- [ ] 6.1 配置共享 SystemAdmin 表访问
  - [ ] 配置数据库连接，支持访问 `system_admin` 表
  - [ ] 创建 `SystemAdmin` 实体类（与 admin 项目结构相同）
  - [ ] 创建 `SystemAdminRepository` 查询共享表
- [ ] 6.2 配置共享 JWT Secret
  - [ ] 在 `application.yml` 中配置与 admin 项目相同的 JWT secret
  - [ ] 使用 `shared/backend` 中的 `JwtUtils`
- [ ] 6.3 实现 DevOps 认证服务
  - [ ] 创建 `DevOpsAuthService`（类似 `AdminAuthService`）
  - [ ] 实现登录逻辑（查询共享的 `system_admin` 表）
  - [ ] 实现 Token 验证逻辑
- [ ] 6.4 配置 Spring Security
  - [ ] 配置认证过滤器（JWT Authentication Filter）
  - [ ] 配置授权规则
  - [ ] 配置 API Token 认证过滤器
- [ ] 6.5 实现 API Token 管理
  - [ ] 创建 API Token 实体和表
  - [ ] 创建 Token 生成接口
  - [ ] 创建 Token 验证逻辑
  - [ ] 创建 Token 管理界面（可选）

## 7. API 路径更新

- [ ] 7.1 更新后端 API 路径
  - [ ] 从 `/api/admin/devops/*` 更新为 `/api/devops/*`
  - [ ] 从 `/api/admin/pipeline/*` 更新为 `/api/devops/pipeline/*`
- [ ] 7.2 更新前端 API 调用
  - [ ] 更新所有 API 服务中的路径
  - [ ] 更新 API_BASE_URL 配置
- [ ] 7.3 实现 API 兼容性（可选）
  - [ ] 通过 API Gateway 或反向代理保持向后兼容
  - [ ] 或提供迁移期支持

## 8. 从 Admin 项目移除 DevOps 代码并集成

- [ ] 8.1 从 `admin/backend` 移除 DevOps Controller
- [ ] 8.2 从 `admin/backend` 移除 DevOps Service
- [ ] 8.3 从 `admin/backend` 移除 DevOps Entity
- [ ] 8.4 从 `admin/backend` 移除 DevOps Repository
- [ ] 8.5 从 `admin/backend` 移除 DevOps DTO
- [ ] 8.6 从 `admin/frontend` 移除 DevOps 组件（不再使用组件方式）
- [ ] 8.7 从 `admin/frontend` 移除 DevOps API 服务（改为调用 DevOps 后端 API）
- [ ] 8.8 在 `admin/frontend` 添加 DevOps iframe 集成组件
- [ ] 8.9 更新 Admin 主内容区域，支持显示 DevOps iframe
- [ ] 8.10 保留 Admin 左侧边栏的 DevOps 菜单（已存在，无需修改）
- [ ] 8.11 更新 `admin/backend/pom.xml`，移除 DevOps 相关依赖
- [ ] 8.12 更新 `admin/frontend/package.json`，移除 DevOps 相关依赖（如果需要）

## 9. 构建和部署

- [ ] 9.1 验证 DevOps 后端可以独立构建
  - [ ] 运行 `mvn clean install`
  - [ ] 验证构建成功
- [ ] 9.2 验证 DevOps 前端可以独立构建
  - [ ] 运行 `npm install`
  - [ ] 运行 `npm run build`
  - [ ] 验证构建成功
- [ ] 9.3 测试 DevOps 后端启动
  - [ ] 配置数据库连接
  - [ ] 启动后端服务（独立端口，如 8086）
  - [ ] 验证服务正常运行
  - [ ] 验证 API 可以访问
- [ ] 9.4 测试 DevOps 前端启动
  - [ ] 配置 API 地址（指向 DevOps 后端）
  - [ ] 启动前端服务（独立端口，如 3006）
  - [ ] 验证前端可以独立访问
  - [ ] 验证前端可以通过 URL 参数接收 Token
- [ ] 9.5 测试 Admin 前端集成 DevOps
  - [ ] 启动 Admin 前端
  - [ ] 点击 DevOps 菜单
  - [ ] 验证 DevOps iframe 正常显示
  - [ ] 验证 JWT Token 正确传递
  - [ ] 验证 DevOps 功能正常使用

## 10. 文档更新

- [ ] 10.1 创建 DevOps 项目 README
  - [ ] 项目介绍
  - [ ] 快速开始指南
  - [ ] API 文档
- [ ] 10.2 创建迁移文档
  - [ ] 迁移步骤说明
  - [ ] 配置说明
  - [ ] 常见问题
- [ ] 10.3 更新 `openspec/project.md`
  - [ ] 添加 `devops/` 项目说明
  - [ ] 更新项目结构图
- [ ] 10.4 更新部署文档
  - [ ] 更新 Nginx 配置说明
  - [ ] 更新部署脚本说明

## 11. 测试和验证

- [ ] 11.1 测试 DevOps API 功能
  - [ ] 测试脚本执行
  - [ ] 测试部署流程
  - [ ] 测试 CMDB 功能
- [ ] 11.2 测试其他项目调用 DevOps API
  - [ ] 测试 API Token 认证
  - [ ] 测试 API 调用功能
- [ ] 11.3 验证 Admin 项目功能不受影响
  - [ ] 验证 Admin 其他功能正常
  - [ ] 验证 Admin 不再包含 DevOps 功能
- [ ] 11.4 端到端测试
  - [ ] 测试完整的部署流程
  - [ ] 测试监控和告警功能

## 12. 清理和优化

- [ ] 12.1 清理未使用的代码和依赖
- [ ] 12.2 优化代码结构
- [ ] 12.3 更新代码注释和文档
- [ ] 12.4 运行代码格式化工具
