## ADDED Requirements

### Requirement: 完整项目结构规范
系统 SHALL 按照业务域将代码组织为完全独立的子项目：主客户端（client）、教育版（edu）、Mentis（mentis）、公司官网（company）、统一管理后台（admin），以及共享代码库（shared）。每个子项目包含独立的前端和后端代码。

#### Scenario: 项目根目录结构
- **WHEN** 查看项目根目录
- **THEN** 应该看到以下结构：
  - `client/` - 主客户端项目目录
  - `edu/` - 教育版项目目录
  - `mentis/` - Mentis 项目目录
  - `company/` - 公司官网项目目录
  - `admin/` - 统一管理后台项目目录
  - `shared/` - 共享代码库目录

#### Scenario: 主客户端项目结构
- **WHEN** 查看主客户端项目目录
- **THEN** 应该包含：
  - `client/frontend/` - PC Web 前端
  - `client/frontend-mobile/` - Mobile 前端（Capacitor）
  - `client/frontend-miniprogram/` - 微信小程序前端
  - `client/backend/` - 客户端后端服务

#### Scenario: 教育版项目结构
- **WHEN** 查看教育版项目目录
- **THEN** 应该包含：
  - `edu/frontend/` - 教育版前端
  - `edu/backend/` - 教育版后端服务

#### Scenario: Mentis 项目结构
- **WHEN** 查看 Mentis 项目目录
- **THEN** 应该包含：
  - `mentis/frontend/` - Mentis 前端
  - `mentis/backend/` - Mentis 后端服务

#### Scenario: 公司官网项目结构
- **WHEN** 查看公司官网项目目录
- **THEN** 应该包含：
  - `company/frontend/` - 公司官网前端
  - `company/backend/` - 公司官网后端服务

#### Scenario: 统一管理后台项目结构
- **WHEN** 查看统一管理后台项目目录
- **THEN** 应该包含：
  - `admin/frontend/` - 管理后台前端
  - `admin/backend/` - 管理后台后端服务

#### Scenario: 共享代码库结构
- **WHEN** 查看共享代码库目录
- **THEN** 应该包含：
  - `shared/backend/` - 共享后端模块
  - `shared/frontend/` - 共享前端模块
  - `shared/config/` - 共享配置

### Requirement: 子项目独立性
每个子项目 SHALL 能够独立开发、构建、部署和运行，不依赖于其他子项目的源代码。

#### Scenario: 独立构建
- **WHEN** 构建任意子项目（client、edu、mentis、company、admin）
- **THEN** 该子项目应该能够独立完成构建，不需要其他子项目的源代码
- **AND** 该子项目可以依赖 shared 模块，但不能直接依赖其他子项目

#### Scenario: 独立部署
- **WHEN** 部署任意子项目
- **THEN** 该子项目应该能够独立部署和运行
- **AND** 该子项目可以调用其他子项目的 API，但不能直接访问其他子项目的数据库或内部状态

#### Scenario: 独立开发
- **WHEN** 开发任意子项目
- **THEN** 开发者应该能够独立开发和测试该子项目
- **AND** 该子项目的代码变更不应该影响其他子项目（除非通过 API 或共享模块）

### Requirement: 共享代码库职责
共享代码库（shared）SHALL 包含所有子项目共用的代码和配置，并提供清晰的职责边界和使用规范。

#### Scenario: 共享后端模块职责
- **WHEN** 查看共享后端模块
- **THEN** 应该包含：
  - 公共 DTO（ApiResponse、PageResponse 等）
  - 公共异常类（BusinessException、ResourceNotFoundException 等）
  - 公共工具类（JwtUtils、DateUtils、StringUtils 等）
  - 公共配置类（SecurityConfig、CorsConfig 等）
  - 全局异常处理器（GlobalExceptionHandler）

#### Scenario: 共享前端模块职责
- **WHEN** 查看共享前端模块
- **THEN** 应该包含：
  - 公共类型定义（ApiResponse、BaseEntity 等）
  - 公共工具函数（tokenStorage、request 等）
  - 公共组件（如果 UI 风格统一，如 Button、Input、Card 等）
  - 公共常量（API_BASE_URL、STATUS_CODE 等）

#### Scenario: 共享配置职责
- **WHEN** 查看共享配置目录
- **THEN** 应该包含：
  - 数据库配置模板
  - 环境变量配置模板
  - 构建和部署配置模板

## MODIFIED Requirements

### Requirement: 项目结构规范
系统 SHALL 按照业务域将代码组织为三个独立的子项目：客户端（client）、管理端（admin）、Mentis（mentis），每个子项目包含独立的前端和后端代码。

#### Scenario: 项目根目录结构
- **WHEN** 查看项目根目录
- **THEN** 应该看到以下结构：
  - `client/` - 客户端项目目录
  - `admin/` - 管理端项目目录
  - `mentis/` - Mentis 项目目录
  - `shared/` - 共享代码库目录
