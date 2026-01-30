# SSE公共能力迁移指南

## 概述

本文档指导如何将现有模块的SSE实现迁移到使用shared SSE公共能力。

## 迁移步骤

### 1. 添加依赖

确保模块的`pom.xml`中已包含shared backend模块依赖：

```xml
<dependency>
    <groupId>com.heartsphere</groupId>
    <artifactId>heartsphere-shared-backend</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

### 2. 注入SseEmitterManager

在Controller或Service中注入`SseEmitterManager`：

```java
@RequiredArgsConstructor
public class MyController {
    private final SseEmitterManager sseEmitterManager;
    // ...
}
```

### 3. 替换SseEmitter创建

**之前**：
```java
SseEmitter emitter = new SseEmitter(300000L);
```

**之后**：
```java
SseEmitter emitter = sseEmitterManager.createEmitter(300000L);
```

### 4. 替换安全发送逻辑

**之前**：
```java
AtomicBoolean completed = new AtomicBoolean(false);
Consumer<Consumer<SseEmitter>> safeSend = (sendAction) -> {
    if (!completed.get()) {
        try {
            sendAction.accept(emitter);
        } catch (Exception e) {
            // 错误处理...
        }
    }
};
```

**之后**：
```java
// 直接使用SseUtils，无需手动管理状态
SseUtils.sendEvent(emitter, "message", data);
SseUtils.sendComplete(emitter, "Done");
SseUtils.sendError(emitter, "Error message");
```

### 5. 替换事件发送

**之前**：
```java
emitter.send(SseEmitter.event()
    .name("message")
    .data(chunk));
```

**之后**：
```java
SseUtils.sendEvent(emitter, "message", chunk);
```

### 6. 替换完成逻辑

**之前**：
```java
emitter.send(SseEmitter.event()
    .name("complete")
    .data("Stream completed"));
emitter.complete();
```

**之后**：
```java
SseUtils.sendComplete(emitter, "Stream completed");
```

## 迁移示例

### Mentis模块 - chatStream方法

**迁移前**：
```java
@PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@RequestBody ChatRequestDTO request) {
    SseEmitter emitter = new SseEmitter(300000L);
    AtomicBoolean completed = new AtomicBoolean(false);
    
    // 自定义safeSend逻辑...
    
    new Thread(() -> {
        try {
            agentService.processMessageStream(userId, request, (chunk) -> {
                safeSend.accept((em) -> {
                    em.send(SseEmitter.event()
                        .name("message")
                        .data(chunk));
                });
            });
            safeSend.accept((em) -> {
                em.send(SseEmitter.event()
                    .name("complete")
                    .data("Stream completed"));
                em.complete();
            });
        } catch (Exception e) {
            // 错误处理...
        }
    }).start();
    
    return emitter;
}
```

**迁移后**：
```java
@PostMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter chatStream(@RequestBody ChatRequestDTO request) {
    // 使用shared SSE能力
    SseEmitter emitter = sseEmitterManager.createEmitter(300000L);
    
    new Thread(() -> {
        try {
            agentService.processMessageStream(userId, request, (chunk) -> {
                SseUtils.sendEvent(emitter, "message", chunk);
            });
            SseUtils.sendComplete(emitter, "Stream completed");
        } catch (Exception e) {
            SseUtils.sendError(emitter, "Error: " + e.getMessage());
            try {
                emitter.completeWithError(new IOException("Stream processing failed", e));
            } catch (Exception ex) {
                log.error("完成 SSE emitter 失败", ex);
            }
        }
    }).start();
    
    return emitter;
}
```

## 迁移检查清单

- [ ] 添加shared backend依赖
- [ ] 注入SseEmitterManager
- [ ] 替换SseEmitter创建
- [ ] 移除自定义safeSend逻辑
- [ ] 使用SseUtils发送事件
- [ ] 移除AtomicBoolean等状态管理
- [ ] 测试验证功能正常

## 注意事项

1. **向后兼容**：迁移后的API行为应该与迁移前一致
2. **事件格式**：确保事件格式符合前端期望
3. **错误处理**：使用SseUtils的错误处理机制
4. **测试验证**：迁移后务必进行完整测试

## 已迁移模块

- [x] psychology-mentor模块（新模块，直接使用）
- [ ] mentis模块（进行中）
- [ ] main/backend模块（待迁移）
- [ ] admin模块（待迁移）
