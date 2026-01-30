# Design: 增强记忆模块架构

## Context

当前架构：
- **main/frontend** → 直接调用 → **hsmem Python 服务**
- **admin** → 直接调用 → **hsmem Python 服务**
- **main/backend** → 有自己的记忆服务（`ShortMemoryService`, `LongMemoryService`），但与 hsmem 无关联

目标架构：
- **main/frontend** → 调用 → **main/backend 记忆服务 API** → 调用 → **hsmem Python 服务**
- **admin** → 直接调用 → **hsmem Python 服务**（保持不变）
- **main/backend** → 通过 `HSMemClientService` 调用 hsmem

## Goals / Non-Goals

### Goals
1. **统一服务接口**：main 项目前端只与 backend 交互，不直接调用 hsmem
2. **后端代理 hsmem**：backend 作为 hsmem 的代理层，负责统一调用和管理
3. **保持管理端直接访问**：admin 继续直接调用 hsmem，这是合理的架构设计
4. **保持向后兼容**：尽可能减少对现有功能的影响

### Non-Goals
1. **不改变 hsmem 服务**：hsmem 服务本身不需要修改
2. **不改变 admin 架构**：admin 的调用方式保持不变
3. **不重写记忆服务**：不替换现有的 `ShortMemoryService` 和 `LongMemoryService`（它们可能用于其他场景）

## Decisions

### Decision 1: Backend 服务设计

**决策**：在 backend 中创建 `HSMemClientService`，通过 HTTP 调用 hsmem Python 服务

**理由**：
- 保持服务独立性，hsmem 可以独立部署和升级
- 使用标准的 HTTP 调用，无需嵌入 Python 代码
- 便于错误处理、重试、日志记录

**实现方式**：
- 使用 Spring 的 `WebClient`（推荐）或 `RestTemplate`
- 配置 hsmem 服务地址（如 `http://localhost:8000`）
- 实现统一的错误处理和超时控制

**API 设计**：
```
POST /api/v1/memory/memorize/conversation
POST /api/v1/memory/memorize/text
POST /api/v1/memory/memorize/document
POST /api/v1/memory/retrieve
GET  /api/v1/memory/statistics
GET  /api/v1/memory/categories
GET  /api/v1/memory/items
GET  /api/v1/memory/resources
```

### Decision 2: 前端迁移策略

**决策**：渐进式迁移，先创建新的 API 客户端，再逐步替换调用点

**理由**：
- 降低迁移风险，可以分阶段验证
- 便于回滚，如果出现问题可以快速恢复

**实现步骤**：
1. 创建新的 backend API 客户端（`memory.ts`）
2. 更新调用点，将 `hsmemApi` 替换为新客户端
3. 验证功能正常后，标记 `hsmemApi.ts` 为废弃或删除

### Decision 3: 用户ID处理

**决策**：backend 自动从认证信息中提取 `user_id`，前端不需要显式传递

**理由**：
- 增强安全性，防止用户伪造 user_id
- 简化前端调用，减少参数传递

**实现方式**：
- 使用 `@AuthenticationPrincipal` 获取当前用户
- 在调用 hsmem 前，将用户ID转换为 `user_{userId}` 格式
- 前端只需要传递业务数据（对话、文本、文档等）

### Decision 4: 错误处理

**决策**：backend 统一处理 hsmem 调用错误，转换为标准的 API 响应格式

**理由**：
- 统一错误格式，便于前端处理
- 可以添加重试、降级等机制

**实现方式**：
- 捕获 hsmem 调用异常
- 转换为统一的 `ApiResponse<T>` 格式
- 记录详细的错误日志

## Architecture

### 数据流

**记忆提取流程**：
```
Frontend (main)
    ↓ HTTP Request (带认证Token)
Backend MemoryController
    ↓ 提取 user_id, 构建请求
HSMemClientService
    ↓ HTTP Request
HSMem Python Service
    ↓ 处理并存储
HSMem 数据存储
```

**记忆检索流程**：
```
Frontend (main)
    ↓ HTTP Request (带认证Token, 查询参数)
Backend MemoryController
    ↓ 提取 user_id, 添加过滤条件
HSMemClientService
    ↓ HTTP Request (带 where 条件)
HSMem Python Service
    ↓ 检索并返回
Backend
    ↓ 格式化响应
Frontend
```

### 配置管理

**application.yml**:
```yaml
heartsphere:
  memory:
    hsmem:
      base-url: http://localhost:8000
      timeout: 30s
      retry:
        enabled: true
        max-attempts: 3
        backoff: 1s
```

## Implementation Notes

### Backend 实现要点

1. **HSMemClientService**:
   - 封装所有 hsmem API 调用
   - 实现统一的错误处理
   - 支持超时和重试配置

2. **MemoryController**:
   - 提供 RESTful API 接口
   - 从认证信息中提取用户ID
   - 调用 `HSMemClientService` 完成实际操作

3. **DTO 类**:
   - 定义与 hsmem API 对应的请求/响应 DTO
   - 处理数据格式转换

### Frontend 实现要点

1. **API 客户端**:
   - 使用统一的 API 基础URL
   - 自动添加认证Token
   - 处理标准错误响应

2. **调用点更新**:
   - `useSystemIntegration.ts` - 对话记忆提取
   - `generateAIResponse.ts` - AI回复记忆提取
   - `JournalMemoryIntegration.ts` - 日志记忆提取

## Testing Strategy

1. **单元测试**：
   - `HSMemClientService` 的 hsmem API 调用
   - DTO 转换逻辑
   - 错误处理逻辑

2. **集成测试**：
   - backend API 端到端测试
   - 前端 API 客户端测试

3. **验证测试**：
   - 记忆提取功能验证
   - 记忆检索功能验证
   - 与现有功能的兼容性验证
