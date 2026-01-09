## ADDED Requirements

### Requirement: 项目结构规范
系统 SHALL 按照业务域将代码组织为三个独立的子项目：客户端（client）、管理端（admin）、Mentis（mentis），每个子项目包含独立的前端和后端代码。

#### Scenario: 项目根目录结构
- **WHEN** 查看项目根目录
- **THEN** 应该看到以下结构：
  - `client/` - 客户端项目目录
  - `admin/` - 管理端项目目录
  - `mentis/` - Mentis 项目目录
  - `shared/` - 共享代码库目录

#### Scenario: 客户端项目结构
- **WHEN** 查看客户端项目目录
- **THEN** 应该包含：
  - `client/frontend-pc/` - PC Web 前端
  - `client/frontend-mobile/` - Mobile 前端
  - `client/frontend-miniprogram/` - 微信小程序前端
  - `client/backend/` - 客户端后端服务

#### Scenario: 管理端项目结构
- **WHEN** 查看管理端项目目录
- **THEN** 应该包含：
  - `admin/frontend/` - 管理端前端
  - `admin/backend/` - 管理端后端服务

#### Scenario: Mentis 项目结构
- **WHEN** 查看 Mentis 项目目录
- **THEN** 应该包含：
  - `mentis/frontend/` - Mentis 前端
  - `mentis/backend/` - Mentis 后端服务

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
  - `shared/frontend/src/components/` - 公共 UI 组件
  - `shared/frontend/src/services/api/base/` - 公共 API 基础库
  - `shared/frontend/src/constants/` - 公共常量定义

#### Scenario: 共享配置
- **WHEN** 查看共享代码库的配置
- **THEN** 应该包含：
  - `shared/config/database/` - 公共数据库配置
  - `shared/config/env/` - 公共环境变量配置
  - `shared/config/docs/` - 公共文档

### Requirement: API 路径规范
系统 SHALL 通过路径前缀区分不同子项目的 API。

#### Scenario: 客户端 API 路径
- **WHEN** 客户端后端提供 API 接口
- **THEN** 所有接口路径应该以 `/api/client/` 开头

#### Scenario: 管理端 API 路径
- **WHEN** 管理端后端提供 API 接口
- **THEN** 所有接口路径应该以 `/api/admin/` 开头

#### Scenario: Mentis API 路径
- **WHEN** Mentis 后端提供 API 接口
- **THEN** 所有接口路径应该以 `/api/mentis/` 开头

#### Scenario: 共享 API 路径
- **WHEN** 提供跨子项目的共享 API（如认证、文件上传）
- **THEN** 接口路径应该以 `/api/shared/` 开头，或者放在客户端后端（如果主要是客户端使用）
