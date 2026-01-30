# Design: Extract SSE as Shared Capability

## Context

当前项目中SSE（Server-Sent Events）流式响应在多个模块中重复实现：

1. **mentis模块**：
   - `MentisChatController.chatStream()` - 聊天流式响应
   - `MentisSessionController.streamSessionUpdates()` - 会话实时更新
   - 使用`SseEmitter`，有错误处理和超时管理

2. **main/backend**：
   - `AIServiceController.generateTextStream()` - AI流式文本生成
   - 使用`SseEmitter`，有OpenAPI兼容格式

3. **admin模块**：
   - `PipelineStreamService` - 部署管道流式输出
   - `LogStreamService` - 日志流式输出
   - 使用`SseEmitter`，有连接管理

4. **前端**：
   - `mentis/frontend/src/hooks/useRealtimeUpdates.ts` - 实时更新Hook
   - 使用`EventSource`，有自动重连机制

**共同模式**：
- 都使用Spring Boot的`SseEmitter`
- 都需要错误处理和超时管理
- 都需要连接生命周期管理
- 前端都需要自动重连和事件处理

## Goals / Non-Goals

### Goals

**代码复用**：
- 提取SSE的通用实现到shared模块
- 减少重复代码，提高维护性
- 统一SSE使用模式

**统一规范**：
- 统一事件格式和命名
- 统一错误处理机制
- 统一超时和重试策略

**易于使用**：
- 提供简洁的API
- 提供完整的前端Hook
- 提供使用文档和示例

### Non-Goals

- 不改变现有SSE功能的行为（向后兼容）
- 不强制所有模块立即迁移（渐进式迁移）
- 不支持WebSocket（仅支持SSE）

## Decisions

### Decision 1: 后端SSE工具类设计
**What**: 创建`SseEmitterManager`和`SseStreamService`基类

**Rationale**:
- `SseEmitterManager`：统一管理emitter生命周期，避免重复的连接管理代码
- `SseStreamService`：提供通用的流式处理模板方法，子类只需实现业务逻辑

**Alternatives considered**:
- 仅提供工具类：不够灵活，难以处理复杂场景
- 仅提供基类：不够通用，难以满足不同需求

**Implementation**:
```java
// SseEmitterManager - 管理连接
public class SseEmitterManager {
    public SseEmitter createEmitter(long timeout);
    public void safeSend(SseEmitter emitter, Consumer<SseEmitter> action);
    public void complete(SseEmitter emitter);
}

// SseStreamService - 流式处理基类
public abstract class SseStreamService<T> {
    public SseEmitter stream(T request, StreamHandler<T> handler);
    protected abstract void processStream(T request, StreamHandler<T> handler);
}
```

### Decision 2: 前端SSE Hook设计
**What**: 创建通用的`useSseStream` Hook

**Rationale**:
- 统一SSE连接管理
- 统一自动重连机制
- 统一事件处理模式

**Implementation**:
```typescript
// useSseStream Hook
export function useSseStream<T>(options: {
  url: string;
  eventHandlers: Record<string, (data: T) => void>;
  enabled?: boolean;
  autoReconnect?: boolean;
}) {
  // 自动重连、错误处理、状态管理
}
```

### Decision 3: 事件格式标准化
**What**: 定义统一的SSE事件格式

**Rationale**:
- 便于前端统一处理
- 便于跨模块集成
- 便于调试和监控

**Implementation**:
```typescript
interface SseEvent<T = any> {
  type: string;        // 事件类型
  timestamp: number;   // 时间戳
  data: T;            // 事件数据
  id?: string;        // 事件ID（可选）
}
```

### Decision 4: 迁移策略
**What**: 渐进式迁移，新模块优先使用

**Rationale**:
- 降低迁移风险
- 不影响现有功能
- 新功能立即受益

**Implementation**:
1. 先在shared模块实现公共能力
2. psychology-mentor模块直接使用
3. 逐步迁移mentis、main、admin模块
4. 最后废弃重复实现

## Risks / Trade-offs

### Risk 1: 过度抽象
**风险**: 抽象过度可能导致使用复杂

**缓解措施**:
- 提供简洁的API
- 提供完整的使用示例
- 保持灵活性，支持自定义

### Risk 2: 性能影响
**风险**: 统一管理可能带来性能开销

**缓解措施**:
- 使用轻量级实现
- 避免不必要的包装
- 性能测试和优化

### Risk 3: 迁移成本
**风险**: 迁移现有代码需要时间

**缓解措施**:
- 渐进式迁移，不强制
- 保持向后兼容
- 提供迁移指南

## Migration Plan

### Phase 1: 实现公共能力（1-2天）
1. 在shared/backend实现SSE工具类
2. 在shared/frontend实现SSE Hook
3. 编写使用文档

### Phase 2: 新模块使用（1天）
1. psychology-mentor模块使用shared SSE能力
2. 验证功能正常

### Phase 3: 迁移现有模块（3-5天）
1. 迁移mentis模块
2. 迁移main/backend
3. 迁移admin模块
4. 测试验证

### Phase 4: 清理（1天）
1. 删除重复实现
2. 更新文档

## Open Questions

1. **事件格式**：是否需要完全统一，还是允许模块自定义？
2. **错误处理**：是否需要统一的错误事件格式？
3. **监控和日志**：是否需要统一的SSE监控和日志？
