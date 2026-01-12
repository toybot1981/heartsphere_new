## ADDED Requirements

### Requirement: 共享模块独立性
共享模块（shared）SHALL 是一个独立的模块，可以被所有子项目（client、edu、mentis、company、admin）依赖，但不依赖于任何子项目。

#### Scenario: 独立构建和发布
- **WHEN** 构建共享模块
- **THEN** 共享模块应该能够独立构建和发布
- **AND** 共享模块不应该依赖任何子项目的代码
- **AND** 共享模块应该提供明确的版本号

#### Scenario: 版本管理
- **WHEN** 更新共享模块的代码
- **THEN** 应该遵循语义化版本管理（Semantic Versioning）
- **AND** 应该保持向后兼容，或者明确标识破坏性变更
- **AND** 应该提供版本升级指南和迁移文档

#### Scenario: 依赖关系
- **WHEN** 查看共享模块的依赖关系
- **THEN** 共享模块应该只依赖基础框架和库（如 Spring Boot、React 等）
- **AND** 共享模块不应该依赖任何子项目的代码
- **AND** 各子项目应该依赖共享模块，而不是直接依赖其他子项目

### Requirement: 共享后端模块内容
共享后端模块（shared/backend）SHALL 包含所有子项目共用的后端代码，包括 DTO、异常类、工具类、配置类等。

#### Scenario: 公共 DTO
- **WHEN** 查看共享后端模块的 DTO
- **THEN** 应该包含：
  - ApiResponse - 统一 API 响应格式
  - PageResponse - 分页响应格式
  - 其他公共 DTO 类

#### Scenario: 公共异常类
- **WHEN** 查看共享后端模块的异常类
- **THEN** 应该包含：
  - BusinessException - 业务异常基类
  - ResourceNotFoundException - 资源未找到异常
  - UnauthorizedException - 未授权异常
  - ForbiddenException - 禁止访问异常
  - 其他公共异常类

#### Scenario: 公共工具类
- **WHEN** 查看共享后端模块的工具类
- **THEN** 应该包含：
  - JwtUtils - JWT 工具类
  - DateUtils - 日期工具类
  - StringUtils - 字符串工具类
  - 其他公共工具类

#### Scenario: 公共配置类
- **WHEN** 查看共享后端模块的配置类
- **THEN** 应该包含：
  - SecurityConfig - 安全配置类（基础配置）
  - CorsConfig - 跨域配置类
  - 全局异常处理器（GlobalExceptionHandler）
  - 其他公共配置类

### Requirement: 共享前端模块内容
共享前端模块（shared/frontend）SHALL 包含所有子项目共用的前端代码，包括类型定义、工具函数、组件、常量等。

#### Scenario: 公共类型定义
- **WHEN** 查看共享前端模块的类型定义
- **THEN** 应该包含：
  - ApiResponse - API 响应类型
  - PaginatedResponse - 分页响应类型
  - BaseEntity - 基础实体类型
  - CreateDTO、UpdateDTO - DTO 类型
  - 其他公共类型定义

#### Scenario: 公共工具函数
- **WHEN** 查看共享前端模块的工具函数
- **THEN** 应该包含：
  - tokenStorage - Token 存储工具
  - request - API 请求函数（如果简化后适合共享）
  - 其他公共工具函数

#### Scenario: 公共组件（可选）
- **WHEN** 查看共享前端模块的组件
- **THEN** 如果 UI 风格统一，应该包含公共组件（如 Button、Input、Card 等）
- **AND** 如果各产品的 UI 风格不同，则不应该包含公共组件，或者只包含基础组件

#### Scenario: 公共常量
- **WHEN** 查看共享前端模块的常量
- **THEN** 应该包含：
  - API_BASE_URL - API 基础 URL（如果适用）
  - STATUS_CODE - 状态码常量
  - 其他公共常量

### Requirement: 共享模块使用规范
所有子项目 SHALL 遵循共享模块的使用规范，包括依赖管理、版本控制、使用方式等。

#### Scenario: 依赖管理（后端）
- **WHEN** 子项目的后端需要使用共享模块
- **THEN** 应该在 pom.xml 中添加 shared-backend 依赖
- **AND** 应该使用明确的版本号（或使用父子项目统一版本管理）
- **AND** 应该遵循 Maven 多模块项目的依赖管理规范

#### Scenario: 依赖管理（前端）
- **WHEN** 子项目的前端需要使用共享模块
- **THEN** 应该使用 npm/yarn workspace 或者在 package.json 中添加依赖
- **AND** 应该使用明确的版本号（或使用 workspace 统一管理）
- **AND** 应该遵循 npm/yarn 的依赖管理规范

#### Scenario: 使用方式
- **WHEN** 子项目使用共享模块的代码
- **THEN** 应该通过导入（import）的方式使用，而不是复制代码
- **AND** 应该遵循共享模块的 API 设计和使用规范
- **AND** 如果共享模块的 API 变更，应该更新使用代码或遵循迁移指南

## MODIFIED Requirements

### Requirement: 共享代码库结构
系统 SHALL 提供共享代码库（shared），包含三个子项目共用的代码和配置。

#### Scenario: 共享后端模块
- **WHEN** 查看共享代码库的后端模块
- **THEN** 应该包含：
  - `shared/backend/src/main/java/com/heartsphere/shared/entity/` - 公共实体类
  - `shared/backend/src/main/java/com/heartsphere/shared/util/` - 公共工具类
  - `shared/backend/src/main/java/com/heartsphere/shared/config/` - 公共配置类
  - `shared/backend/src/main/java/com/heartsphere/shared/exception/` - 公共异常类
  - `shared/backend/src/main/java/com/heartsphere/shared/dto/` - 公共 DTO 类

#### Scenario: 共享前端模块
- **WHEN** 查看共享代码库的前端模块
- **THEN** 应该包含：
  - `shared/frontend/src/types/` - 公共 TypeScript 类型定义
  - `shared/frontend/src/utils/` - 公共工具函数
  - `shared/frontend/src/components/` - 公共组件（如果 UI 风格统一）
  - `shared/frontend/src/constants/` - 公共常量
