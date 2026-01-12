# Change: 集成 HSMem 服务到主项目后端

## Why

HSMem（HeartSphere Memory System）是一个基于 memU 设计理念的记忆系统，提供持久化记忆能力。当前 hsmem 是一个独立的 Python 服务，需要通过 REST API 调用。为了在主项目中更好地使用记忆功能，需要：

1. **统一服务接口**：在主项目后端（Spring Boot）中提供统一的记忆服务接口，供前端调用
2. **简化集成**：前端不需要直接调用 Python 服务，通过主项目后端统一管理
3. **统一认证**：利用主项目的认证体系，确保记忆数据的安全性
4. **数据隔离**：基于用户ID进行记忆数据的隔离和管理

## What Changes

- **ADDED**: 在主项目后端创建 HSMem 服务集成模块
  - 创建 `HSMemService` 用于调用 hsmem Python API
  - 创建 `MemoryController` 提供 REST API 接口
  - 创建相关的 DTO 类用于请求和响应
- **ADDED**: 实现记忆化功能（memorize）
  - 对话记忆化接口
  - 文本记忆化接口
  - 文档记忆化接口
- **ADDED**: 实现记忆检索功能（retrieve）
  - 基于查询的记忆检索
  - 支持过滤条件（用户ID、分类等）
  - 支持数量限制
- **ADDED**: 实现记忆统计功能
  - 获取记忆系统统计信息
  - 获取分类列表
  - 获取用户记忆统计
- **ADDED**: 前端 API 服务
  - 创建前端 TypeScript API 客户端
  - 提供记忆服务的调用方法

## Impact

- **受影响的后端代码**：
  - `main/backend/src/main/java/com/heartsphere/memory/` - 新增记忆服务模块
  - `main/backend/src/main/java/com/heartsphere/controller/MemoryController.java` - 新增控制器
  - `main/backend/src/main/java/com/heartsphere/dto/memory/` - 新增 DTO 类
  - `main/backend/src/main/resources/application.yml` - 新增 hsmem 服务配置

- **受影响的前端代码**：
  - `main/frontend/services/api/memory/` - 新增记忆服务 API 客户端

- **需要配置**：
  - hsmem Python 服务的地址和端口
  - 超时配置
  - 重试策略

- **需要创建的规范**：
  - 记忆服务 API 规范
  - 前端调用规范
