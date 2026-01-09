# Tasks: 系统大重构 - 拆分为三个子项目

## 1. 准备阶段

### 1.1 代码分析和规划
- [ ] 1.1.1 分析现有代码结构，识别各模块的代码位置
- [ ] 1.1.2 识别共享代码（Entity、Utils、Config、Exception、Types、Components 等）
- [ ] 1.1.3 分析各模块的依赖关系
- [ ] 1.1.4 制定详细的代码迁移清单
- [ ] 1.1.5 识别潜在的迁移风险和问题

### 1.2 创建新项目结构
- [ ] 1.2.1 创建新的根目录结构（client/、admin/、mentis/、shared/）
- [ ] 1.2.2 初始化客户端项目结构（frontend-pc/、frontend-mobile/、frontend-miniprogram/、backend/）
- [ ] 1.2.3 初始化管理端项目结构（frontend/、backend/）
- [ ] 1.2.4 初始化 Mentis 项目结构（frontend/、backend/）
- [ ] 1.2.5 初始化共享代码库结构（backend/、frontend/、config/）

### 1.3 建立开发规范
- [ ] 1.3.1 编写项目结构规范文档
- [ ] 1.3.2 编写共享代码使用规范文档
- [ ] 1.3.3 编写依赖管理规范文档
- [ ] 1.3.4 更新开发环境设置指南
- [ ] 1.3.5 创建项目模板和脚手架工具

## 2. 共享代码提取

### 2.1 提取共享后端代码
- [ ] 2.1.1 识别公共 Entity 类，迁移到 `shared/backend/src/main/java/com/heartsphere/shared/entity/`
- [ ] 2.1.2 识别公共 Utils 类，迁移到 `shared/backend/src/main/java/com/heartsphere/shared/util/`
- [ ] 2.1.3 识别公共 Config 类，迁移到 `shared/backend/src/main/java/com/heartsphere/shared/config/`
- [ ] 2.1.4 识别公共 Exception 类，迁移到 `shared/backend/src/main/java/com/heartsphere/shared/exception/`
- [ ] 2.1.5 识别公共 DTO 类，迁移到 `shared/backend/src/main/java/com/heartsphere/shared/dto/`
- [ ] 2.1.6 创建 `shared/backend/pom.xml`，配置为 Maven 模块
- [ ] 2.1.7 编写共享后端代码的单元测试
- [ ] 2.1.8 验证共享后端模块可以正常构建和发布

### 2.2 提取共享前端代码
- [ ] 2.2.1 识别公共 TypeScript 类型定义，迁移到 `shared/frontend/src/types/`
- [ ] 2.2.2 识别公共工具函数，迁移到 `shared/frontend/src/utils/`
- [ ] 2.2.3 识别公共 UI 组件，迁移到 `shared/frontend/src/components/`
- [ ] 2.2.4 识别公共 API 基础库，迁移到 `shared/frontend/src/services/api/base/`
- [ ] 2.2.5 识别公共常量定义，迁移到 `shared/frontend/src/constants/`
- [ ] 2.2.6 创建 `shared/frontend/package.json`，配置为 npm workspace
- [ ] 2.2.7 编写共享前端代码的单元测试
- [ ] 2.2.8 验证共享前端模块可以正常构建和发布

### 2.3 提取共享配置
- [ ] 2.3.1 识别公共数据库配置，迁移到 `shared/config/database/`
- [ ] 2.3.2 识别公共环境变量配置，迁移到 `shared/config/env/`
- [ ] 2.3.3 识别公共文档，迁移到 `shared/config/docs/`
- [ ] 2.3.4 创建共享配置的使用文档

## 3. 客户端项目迁移

### 3.1 迁移 PC Web 前端
- [ ] 3.1.1 分析现有 `frontend/` 目录中的 PC Web 相关代码
- [ ] 3.1.2 迁移 PC Web 组件到 `client/frontend-pc/src/components/`
- [ ] 3.1.3 迁移 PC Web 页面到 `client/frontend-pc/src/pages/`
- [ ] 3.1.4 迁移 PC Web 服务到 `client/frontend-pc/src/services/`
- [ ] 3.1.5 迁移 PC Web 配置（vite.config.ts、tsconfig.json 等）
- [ ] 3.1.6 更新 PC Web 的依赖配置，引用 `shared-frontend`
- [ ] 3.1.7 更新 PC Web 的构建脚本和部署配置
- [ ] 3.1.8 测试 PC Web 功能完整性

### 3.2 迁移 Mobile 前端
- [ ] 3.2.1 分析现有 `frontend/mobile/` 目录中的代码
- [ ] 3.2.2 迁移 Mobile 组件到 `client/frontend-mobile/src/components/`
- [ ] 3.2.3 迁移 Mobile 页面到 `client/frontend-mobile/src/pages/`
- [ ] 3.2.4 迁移 Mobile 服务到 `client/frontend-mobile/src/services/`
- [ ] 3.2.5 迁移 Mobile 配置（capacitor.config.ts 等）
- [ ] 3.2.6 更新 Mobile 的依赖配置，引用 `shared-frontend`
- [ ] 3.2.7 更新 Mobile 的构建脚本和部署配置
- [ ] 3.2.8 测试 Mobile 功能完整性（包括 Android/iOS 构建）

### 3.3 迁移小程序前端
- [ ] 3.3.1 分析现有 `frontend/wechat/` 和 `wechat-miniprogram/` 目录中的代码
- [ ] 3.3.2 迁移小程序代码到 `client/frontend-miniprogram/`
- [ ] 3.3.3 更新小程序的依赖配置（如果使用 npm 包）
- [ ] 3.3.4 更新小程序的构建脚本和部署配置
- [ ] 3.3.5 测试小程序功能完整性

### 3.4 迁移客户端后端
- [ ] 3.4.1 识别客户端相关的 Controller（非 admin、非 mentis）
- [ ] 3.4.2 迁移客户端 Controller 到 `client/backend/src/main/java/com/heartsphere/client/controller/`
- [ ] 3.4.3 识别客户端相关的 Service
- [ ] 3.4.4 迁移客户端 Service 到 `client/backend/src/main/java/com/heartsphere/client/service/`
- [ ] 3.4.5 迁移客户端 Repository 到 `client/backend/src/main/java/com/heartsphere/client/repository/`
- [ ] 3.4.6 更新客户端后端 API 路径前缀为 `/api/client/`
- [ ] 3.4.7 创建 `client/backend/pom.xml`，配置依赖 `shared-backend`
- [ ] 3.4.8 更新客户端后端的配置文件（application.yml）
- [ ] 3.4.9 测试客户端后端功能完整性

## 4. 管理端项目迁移

### 4.1 迁移管理端前端
- [ ] 4.1.1 分析现有 `frontend/admin/` 目录中的代码
- [ ] 4.1.2 迁移管理端组件到 `admin/frontend/src/components/`
- [ ] 4.1.3 迁移管理端页面到 `admin/frontend/src/pages/`
- [ ] 4.1.4 迁移管理端服务到 `admin/frontend/src/services/`
- [ ] 4.1.5 迁移管理端配置
- [ ] 4.1.6 更新管理端前端的依赖配置，引用 `shared-frontend`
- [ ] 4.1.7 更新管理端前端的构建脚本和部署配置
- [ ] 4.1.8 测试管理端前端功能完整性

### 4.2 迁移管理端后端
- [ ] 4.2.1 识别管理端相关的 Controller（包含 `/api/admin/` 路径的）
- [ ] 4.2.2 迁移管理端 Controller 到 `admin/backend/src/main/java/com/heartsphere/admin/controller/`
- [ ] 4.2.3 识别管理端相关的 Service
- [ ] 4.2.4 迁移管理端 Service 到 `admin/backend/src/main/java/com/heartsphere/admin/service/`
- [ ] 4.2.5 迁移管理端 Repository 到 `admin/backend/src/main/java/com/heartsphere/admin/repository/`
- [ ] 4.2.6 更新管理端后端 API 路径前缀为 `/api/admin/`（如果尚未统一）
- [ ] 4.2.7 创建 `admin/backend/pom.xml`，配置依赖 `shared-backend`
- [ ] 4.2.8 更新管理端后端的配置文件
- [ ] 4.2.9 测试管理端后端功能完整性

## 5. Mentis 项目迁移

### 5.1 迁移 Mentis 前端
- [ ] 5.1.1 分析现有 Mentis 前端代码位置
- [ ] 5.1.2 迁移 Mentis 组件到 `mentis/frontend/src/components/`
- [ ] 5.1.3 迁移 Mentis 页面到 `mentis/frontend/src/pages/`
- [ ] 5.1.4 迁移 Mentis 服务到 `mentis/frontend/src/services/`
- [ ] 5.1.5 迁移 Mentis 配置
- [ ] 5.1.6 更新 Mentis 前端的依赖配置，引用 `shared-frontend`
- [ ] 5.1.7 更新 Mentis 前端的构建脚本和部署配置
- [ ] 5.1.8 测试 Mentis 前端功能完整性

### 5.2 迁移 Mentis 后端
- [ ] 5.2.1 识别 Mentis 相关的代码（已在 `backend/src/main/java/com/heartsphere/mentis/`）
- [ ] 5.2.2 迁移 Mentis Controller 到 `mentis/backend/src/main/java/com/heartsphere/mentis/controller/`
- [ ] 5.2.3 迁移 Mentis Service 到 `mentis/backend/src/main/java/com/heartsphere/mentis/service/`
- [ ] 5.2.4 迁移 Mentis Repository 到 `mentis/backend/src/main/java/com/heartsphere/mentis/repository/`
- [ ] 5.2.5 迁移 Mentis Entity 到 `mentis/backend/src/main/java/com/heartsphere/mentis/entity/`
- [ ] 5.2.6 迁移 Mentis 其他模块（executor、agent、vm 等）
- [ ] 5.2.7 更新 Mentis 后端 API 路径前缀为 `/api/mentis/`（如果尚未统一）
- [ ] 5.2.8 创建 `mentis/backend/pom.xml`，配置依赖 `shared-backend`
- [ ] 5.2.9 更新 Mentis 后端的配置文件
- [ ] 5.2.10 测试 Mentis 后端功能完整性

## 6. 清理和优化

### 6.1 清理旧代码
- [ ] 6.1.1 删除旧的 `frontend/` 目录（保留备份）
- [ ] 6.1.2 删除旧的 `backend/` 目录（保留备份）
- [ ] 6.1.3 清理无用的配置文件
- [ ] 6.1.4 清理无用的构建产物
- [ ] 6.1.5 更新 .gitignore 文件

### 6.2 优化构建配置
- [ ] 6.2.1 优化各子项目的构建配置
- [ ] 6.2.2 创建统一的构建脚本（支持单独构建和联合构建）
- [ ] 6.2.3 优化依赖管理，减少重复依赖
- [ ] 6.2.4 优化构建性能（并行构建、缓存等）

### 6.3 更新文档和脚本
- [ ] 6.3.1 更新开发文档（README、开发指南等）
- [ ] 6.3.2 更新部署文档（部署脚本、部署指南等）
- [ ] 6.3.3 更新 API 文档
- [ ] 6.3.4 更新 CI/CD 配置
- [ ] 6.3.5 创建迁移总结文档

### 6.4 测试和验证
- [ ] 6.4.1 运行所有单元测试
- [ ] 6.4.2 运行集成测试
- [ ] 6.4.3 运行端到端测试
- [ ] 6.4.4 性能测试
- [ ] 6.4.5 安全测试
- [ ] 6.4.6 用户验收测试

## 7. 验证和发布

### 7.1 代码审查
- [ ] 7.1.1 代码结构审查
- [ ] 7.1.2 代码质量审查
- [ ] 7.1.3 共享代码使用审查
- [ ] 7.1.4 依赖管理审查

### 7.2 部署验证
- [ ] 7.2.1 开发环境部署验证
- [ ] 7.2.2 测试环境部署验证
- [ ] 7.2.3 生产环境部署验证（灰度发布）

### 7.3 监控和回滚准备
- [ ] 7.3.1 设置监控和告警
- [ ] 7.3.2 准备回滚方案
- [ ] 7.3.3 准备应急响应预案
