# SSE 日志流连接调试指南

## 问题症状

前端显示"未连接"状态，无法接收实时日志。

## 根本原因

SSE 日志流有两个问题：

1. **异常未被正确处理**：`SseUtils.sendEvent()` 直接抛出 `IOException`，但在 `LogStreamService` 中没有被捕获，导致推送失败
2. **未使用统一的错误处理**：`DevOpsWorkbenchController` 创建 `SseEmitter` 时没有使用 `SseEmitterManager`，缺少统一的生命周期管理

## 修复方案

### 1. LogStreamService 错误处理修复

**文件**：`admin/backend/src/main/java/com/heartsphere/admin/service/LogStreamService.java`

**修改内容**：
```java
// pushLog() 方法
for (SseEmitter emitter : executionEmitters) {
    sseEmitterManager.safeSend(emitter, em -> {
        try {
            SseUtils.sendEvent(em, "log", jsonMessage);
        } catch (Exception e) {
            logger.debug("Failed to send log event: {}", e.getMessage());
        }
    });
}

// pushStatus() 方法
for (SseEmitter emitter : executionEmitters) {
    sseEmitterManager.safeSend(emitter, em -> {
        try {
            SseUtils.sendEvent(em, "status", jsonMessage);
        } catch (Exception e) {
            logger.debug("Failed to send status event: {}", e.getMessage());
        }
    });
}
```

**原理**：
- 使用 `SseEmitterManager.safeSend()` 包装推送操作
- 捕获异常并记录为 DEBUG 级别
- 客户端断开时不会影响其他日志推送

### 2. DevOpsWorkbenchController 统一管理修复

**文件**：`admin/backend/src/main/java/com/heartsphere/admin/controller/DevOpsWorkbenchController.java`

**修改内容**：
```java
// 添加导入
import com.heartsphere.shared.sse.SseEmitterManager;

// 注入依赖
@Autowired
private SseEmitterManager sseEmitterManager;

// streamLogs() 方法
@GetMapping(value = "/executions/{executionId}/logs/stream", 
            produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public SseEmitter streamLogs(
        @RequestHeader("Authorization") String authHeader,
        @PathVariable Long executionId) {
    SystemAdmin admin = validateAdminToken(authHeader);
    
    ScriptExecution execution = scriptExecutionRepository.findById(executionId)
        .orElseThrow(() -> new RuntimeException("执行记录不存在"));
    
    // 使用 SseEmitterManager 创建 emitter
    SseEmitter emitter = sseEmitterManager.createEmitter(Long.MAX_VALUE);
    logStreamService.addEmitter(executionId, emitter);
    
    // ... 其他代码
}
```

**原理**：
- 使用 `SseEmitterManager.createEmitter()` 确保一致的生命周期管理
- 统一的 onError 回调处理客户端断开
- 支持自动清理和资源释放

## 调试步骤

### 1. 检查后端日志

```bash
# 查看后端日志
tail -f logs/spring.log | grep -E "SSE|LogStream|log event|status event"

# 应该看到的日志
# DEBUG: Added SSE emitter for execution: 48
# DEBUG: Failed to send log event: ... (客户端断开时)
# DEBUG: Cleaned up 1 emitters for execution: 48
```

### 2. 检查浏览器控制台

```javascript
// 打开浏览器开发者工具，查看网络请求
// Network tab 中应该看到：
// GET /api/admin/devops/executions/48/logs/stream
// Status: 200
// Type: event-stream

// 如果状态是 200 但显示"未连接"，检查：
// 1. Authorization header 是否正确
// 2. Response 是否返回了日志数据
```

### 3. 检查前端连接状态

在 React 开发者工具中查看 `useLogStream` 的状态：
```
{
  logs: [...],        // 已接收的日志
  status: "RUNNING",  // 执行状态
  connected: true,    // 连接状态
  error: null,        // 错误信息
}
```

### 4. 完整的调试流程

1. **执行脚本**
   - 前端发送执行请求
   - 后端返回 executionId

2. **建立 SSE 连接**
   - 前端调用 `useLogStream(executionId)`
   - 发起 GET 请求到 `/api/admin/devops/executions/{executionId}/logs/stream`
   - 后端返回 200 并保持连接

3. **实时日志推送**
   - 后端脚本执行
   - 每行输出都推送到 SSE
   - 前端接收并显示

4. **连接关闭**
   - 脚本完成
   - 推送最终状态
   - SSE 连接关闭

## 常见问题

### Q: 显示"未连接"但没有错误信息

**A**: 这通常表示连接建立了但没有接收到数据。检查：
1. 脚本是否确实在执行
2. 后端是否在推送日志（查看后端日志）
3. 前端是否正确处理 SSE 数据

### Q: 连接经常断开

**A**: 这通常是由于客户端异常或网络问题。修复后：
- 客户端断开不再导致服务器错误
- 其他客户端的连接不受影响
- 可自动重连

### Q: 日志在浏览器中显示但无法下载

**A**: 这是不同的问题，与实时日志流无关。需要检查日志下载端点：
- `/api/admin/devops/executions/{executionId}/log/download`
- 需要 Authorization header
- 需要日志文件存在

## 性能优化建议

1. **日志行数限制**
   - 前端限制最多 10000 条日志（防止内存溢出）
   - 不影响文件存储

2. **连接超时**
   - 使用 `Long.MAX_VALUE` 避免长时间脚本的超时
   - 客户端自动重连机制

3. **错误恢复**
   - 客户端自动重连（指数退避）
   - 最多 5 次重连
   - 可手动重新连接

## 总结

✅ **修复内容**：
- 统一 SSE 错误处理
- 确保客户端断开不影响服务器
- 提高日志流的稳定性和可靠性

🎯 **预期结果**：
- 前端显示"已连接"
- 实时接收日志
- 日志完整性得到保证
- 服务器日志不再报错

