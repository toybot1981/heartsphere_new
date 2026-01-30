# SSE使用指南

## 概述

SSE（Server-Sent Events）公共能力提供了统一的流式响应实现，减少代码重复，提高代码质量。

## 后端使用

### 1. 基础使用

```java
@RestController
@RequiredArgsConstructor
public class MyController {
    
    private final SseEmitterManager sseEmitterManager;
    
    @PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        SseEmitter emitter = sseEmitterManager.createEmitter();
        
        // 异步处理
        new Thread(() -> {
            try {
                // 发送消息
                SseUtils.sendMessage(emitter, "Hello");
                
                // 发送完成
                SseUtils.sendComplete(emitter, "Done");
            } catch (Exception e) {
                SseUtils.sendError(emitter, "Error: " + e.getMessage());
            }
        }).start();
        
        return emitter;
    }
}
```

### 2. 使用SseEventBuilder

```java
// 构建标准格式事件
SseEventBuilder event = SseEventBuilder.create()
    .type("message")
    .data(myData)
    .id("event-123");

sseEmitterManager.safeSend(emitter, em -> {
    em.send(event.build());
});
```

### 3. 使用SseStreamService基类

```java
@Service
@RequiredArgsConstructor
public class MyStreamService extends SseStreamService<MyRequest> {
    
    @Override
    protected void processStream(MyRequest request, StreamHandler<MyRequest> handler) {
        // 处理流式数据
        for (String chunk : getChunks(request)) {
            handler.handle(chunk, false);
        }
        handler.handle(null, true);
    }
}
```

## 前端使用

### 1. 使用useSseStream Hook

```typescript
import { useSseStream } from '@heartsphere/shared-frontend';

function MyComponent() {
  const { status, error, connect, disconnect } = useSseStream({
    url: '/api/my/stream',
    eventHandlers: {
      message: (data) => {
        console.log('Message:', data);
      },
      complete: (data) => {
        console.log('Complete:', data);
      },
      error: (data) => {
        console.error('Error:', data);
      },
    },
    enabled: true,
    autoReconnect: true,
  });

  return <div>Status: {status}</div>;
}
```

### 2. 手动处理SSE流

```typescript
import { createSseConnection, parseSseEvent } from '@heartsphere/shared-frontend';

const eventSource = createSseConnection('/api/my/stream');
eventSource.onmessage = (event) => {
  const sseEvent = parseSseEvent(event);
  if (sseEvent) {
    console.log('Event:', sseEvent);
  }
};
```

## 标准事件格式

所有SSE事件使用统一格式：

```json
{
  "type": "message",
  "timestamp": 1234567890,
  "data": { ... },
  "id": "event-123"  // 可选
}
```

## 最佳实践

1. **错误处理**：始终使用`safeSend`或`SseUtils`方法，避免直接操作emitter
2. **超时管理**：根据业务需求设置合适的超时时间
3. **资源清理**：确保在连接关闭时清理资源
4. **事件命名**：使用清晰的事件类型命名

## 常见问题

### Q: 如何处理连接断开？
A: 使用`autoReconnect`选项，Hook会自动重连。

### Q: 如何自定义超时时间？
A: 使用`sseEmitterManager.createEmitter(timeout)`指定超时时间。

### Q: 如何发送自定义事件类型？
A: 使用`SseEventBuilder.create().type("custom").data(data)`。
