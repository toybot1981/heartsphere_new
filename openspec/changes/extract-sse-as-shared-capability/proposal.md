# Change: 提取SSE流式响应能力为公共能力

## Why

当前项目中多个模块都实现了SSE（Server-Sent Events）流式响应功能，但实现方式存在重复代码和模式不一致的问题：

1. **mentis模块**：实现了聊天流式响应和会话实时更新
2. **main/backend**：实现了AI服务的流式文本生成
3. **admin模块**：实现了部署管道和日志的流式输出
4. **psychology-mentor模块**：计划实现治疗会话的流式响应

**存在的问题**：
- 每个模块都重复实现SSE的创建、错误处理、超时管理等逻辑
- 错误处理模式不统一（有的用AtomicBoolean，有的用try-catch）
- 前端Hook实现重复（mentis有useRealtimeUpdates，其他模块需要时也会重复实现）
- 缺乏统一的SSE事件格式和命名规范
- 难以维护和扩展（修改SSE逻辑需要在多个地方修改）

**提取为公共能力的优势**：
- 减少代码重复，提高代码复用性
- 统一SSE实现模式，提高代码质量
- 便于统一维护和优化（性能、错误处理等）
- 新模块可以快速集成SSE能力
- 统一的前端Hook，提供一致的开发体验

## What Changes

### 1. 后端公共能力（shared/backend）

- **ADDED**: `com.heartsphere.shared.sse` 包
  - `SseEmitterManager.java` - SSE连接管理器（统一管理emitter生命周期）
  - `SseEventBuilder.java` - SSE事件构建器（统一事件格式）
  - `SseStreamService.java` - SSE流式服务基类（提供通用流式处理逻辑）
  - `SseExceptionHandler.java` - SSE异常处理器（统一错误处理）

- **ADDED**: SSE配置类
  - `SseConfig.java` - SSE配置（超时时间、重试策略等）

- **ADDED**: SSE工具类
  - `SseUtils.java` - SSE工具方法（安全发送、格式化等）

### 2. 前端公共能力（shared/frontend）

- **ADDED**: `hooks/useSseStream.ts` - 通用SSE Hook
  - 支持自动重连
  - 支持事件类型映射
  - 支持错误处理和状态管理

- **ADDED**: `utils/sseClient.ts` - SSE客户端工具
  - 统一的SSE连接管理
  - 事件解析和格式化

- **ADDED**: `types/sse.ts` - SSE类型定义
  - 统一的事件类型定义
  - 标准的事件格式接口

### 3. 迁移现有实现

- **MODIFIED**: `mentis/backend` - 使用shared SSE能力
- **MODIFIED**: `main/backend` - 使用shared SSE能力
- **MODIFIED**: `admin/backend` - 使用shared SSE能力
- **MODIFIED**: `mentis/frontend` - 使用shared SSE Hook

### 4. 文档

- **ADDED**: `shared/backend/docs/SSE_GUIDE.md` - SSE使用指南
- **ADDED**: `shared/frontend/docs/SSE_HOOK_GUIDE.md` - SSE Hook使用指南

## Impact

- **Affected specs**: 
  - 新增 `sse-backend-utility` capability（后端SSE工具能力）
  - 新增 `sse-frontend-hook` capability（前端SSE Hook能力）
- **Affected code**: 
  - 新增 `shared/backend/src/main/java/com/heartsphere/shared/sse/` 包
  - 新增 `shared/frontend/src/hooks/useSseStream.ts`
  - 修改 `mentis/backend`、`main/backend`、`admin/backend` 中的SSE实现
  - 修改 `mentis/frontend` 中的SSE Hook
- **Database**: 
  - 无数据库变更
- **Ports**: 
  - 无端口变更
- **Dependencies**: 
  - 无新增外部依赖（使用Spring Boot内置的SseEmitter）

## Design Principles

1. **向后兼容**：现有SSE功能继续工作，逐步迁移
2. **易于使用**：提供简洁的API，降低使用门槛
3. **灵活扩展**：支持自定义事件类型和处理逻辑
4. **统一规范**：统一事件格式、错误处理、超时管理等
5. **性能优化**：统一管理连接，优化资源使用

## Implementation Strategy

采用渐进式迁移：
1. **Phase 1**: 在shared模块中实现SSE公共能力
2. **Phase 2**: 在新模块（psychology-mentor）中使用shared SSE能力
3. **Phase 3**: 逐步迁移现有模块（mentis、main、admin）
4. **Phase 4**: 废弃各模块中的重复实现

这样可以确保：
- 新功能立即受益
- 现有功能不受影响
- 迁移风险可控
