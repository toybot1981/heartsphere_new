## ADDED Requirements

### Requirement: 共享代码识别原则
系统 SHALL 遵循明确的共享代码识别原则，只共享真正需要共享的代码。

#### Scenario: 必须共享的代码
- **WHEN** 识别共享代码
- **THEN** 以下类型的代码必须共享：
  - 数据库实体类（Entity）- 因为三个项目共享同一个数据库
  - 公共工具类（Utils）- 避免代码重复
  - 公共配置类（Config）- 统一配置管理
  - 公共异常类（Exception）- 统一异常处理
  - 公共类型定义（TypeScript types）- 保持类型一致性
  - 公共 API 基础库（Request/Response 处理）- 统一 API 调用方式

#### Scenario: 可选共享的代码
- **WHEN** 识别共享代码
- **THEN** 以下类型的代码可选共享：
  - 公共 UI 组件（如果三个项目 UI 风格统一）
  - 公共业务逻辑（如果业务逻辑确实相同）

#### Scenario: 不共享的代码
- **WHEN** 识别共享代码
- **THEN** 以下类型的代码不共享：
  - 项目特定的业务逻辑
  - 项目特定的 UI 组件
  - 项目特定的配置

### Requirement: 共享代码依赖管理
系统 SHALL 通过依赖管理工具引用共享代码，确保代码统一管理和版本控制。

#### Scenario: 后端共享代码依赖
- **WHEN** 子项目的后端需要引用共享代码
- **THEN** 应该通过 Maven 依赖引用 `shared-backend` 模块：
  - 在 `pom.xml` 中添加对 `shared-backend` 的依赖
  - 使用 Maven 多模块项目或 Git Submodule 管理

#### Scenario: 前端共享代码依赖
- **WHEN** 子项目的前端需要引用共享代码
- **THEN** 应该通过 npm/yarn workspace 引用 `shared-frontend` 模块：
  - 在 `package.json` 中配置 workspace
  - 或者使用 Git Submodule 管理

#### Scenario: 共享代码版本管理
- **WHEN** 共享代码发生变更
- **THEN** 应该：
  - 使用语义化版本管理（Semantic Versioning）
  - 保持向后兼容，或明确标注破坏性变更
  - 更新共享代码的版本号
  - 通知各子项目更新依赖

### Requirement: 共享代码使用规范
系统 SHALL 定义清晰的共享代码使用规范，确保代码质量和一致性。

#### Scenario: 共享代码的修改流程
- **WHEN** 需要修改共享代码
- **THEN** 应该：
  - 创建共享代码的修改提案
  - 评估对各个子项目的影响
  - 获得所有受影响项目的批准
  - 进行充分的测试
  - 更新共享代码的版本号

#### Scenario: 共享代码的测试要求
- **WHEN** 共享代码发生变更
- **THEN** 应该：
  - 编写完整的单元测试
  - 在共享代码库中运行测试
  - 在各子项目中运行集成测试，验证共享代码的兼容性

#### Scenario: 共享代码的文档要求
- **WHEN** 共享代码被使用
- **THEN** 应该：
  - 提供清晰的 API 文档
  - 提供使用示例
  - 标注破坏性变更和迁移指南

### Requirement: 共享代码的构建和发布
系统 SHALL 支持共享代码的独立构建和发布。

#### Scenario: 共享后端模块构建
- **WHEN** 构建共享后端模块
- **THEN** 应该：
  - 可以独立构建 `shared-backend` 模块
  - 生成可被其他模块引用的 JAR 包
  - 支持发布到 Maven 仓库（本地或远程）

#### Scenario: 共享前端模块构建
- **WHEN** 构建共享前端模块
- **THEN** 应该：
  - 可以独立构建 `shared-frontend` 模块
  - 生成可被其他项目引用的 npm 包
  - 支持发布到 npm 仓库（本地或远程）

#### Scenario: 共享代码的发布流程
- **WHEN** 发布共享代码的新版本
- **THEN** 应该：
  - 更新版本号
  - 生成变更日志（CHANGELOG）
  - 发布到仓库
  - 通知各子项目更新依赖
