# 日志优化总结

## 问题描述
后台日志一直在重复打印 SharedModeInterceptor 和 SharedController 的 INFO 级别日志，特别是在频繁请求聊天消息历史接口时。

## 原因分析
1. **SharedModeInterceptor** 在每次请求时都打印详细的 INFO 级别日志
2. **SharedController** 的获取聊天消息历史接口被频繁调用（可能是前端轮询）
3. 这些接口的日志级别设置为 INFO，导致生产环境产生大量日志

## 优化方案
将频繁调用的接口的详细日志从 **INFO** 级别改为 **DEBUG** 级别：

### 1. SharedModeInterceptor.java
- ✅ 将请求处理的详细日志改为 DEBUG
- ✅ 将权限验证的详细日志改为 DEBUG
- ✅ 将成功设置上下文的日志改为 DEBUG
- ⚠️ 保留 WARN 和 ERROR 级别的日志（用于问题排查）

### 2. SharedController.java
- ✅ 将获取聊天消息历史的日志改为 DEBUG
- ⚠️ 保留其他重要操作的 INFO 日志（如保存消息、清空会话等）

## 修改内容

### SharedModeInterceptor.java
```java
// 修改前
log.info("========== [SharedModeInterceptor] 处理请求 ==========");
log.info("请求路径: {}", request.getRequestURI());
log.info("验证访问权限: shareConfigId={}, visitorId={}, accessPermission={}", ...);
log.info("✅ 设置共享模式上下文成功: ...");

// 修改后
log.debug("========== [SharedModeInterceptor] 处理请求 ==========");
log.debug("请求路径: {}", request.getRequestURI());
log.debug("验证访问权限: shareConfigId={}, visitorId={}, accessPermission={}", ...);
log.debug("✅ 设置共享模式上下文成功: ...");
```

### SharedController.java
```java
// 修改前
log.info("========== 共享模式：获取聊天消息历史 ==========");
log.info("sessionId: {}, limit: {}", sessionId, limit);
log.info("✅ 获取共享模式消息成功: sessionId={}, 消息数量={}", ...);

// 修改后
log.debug("========== 共享模式：获取聊天消息历史 ==========");
log.debug("sessionId: {}, limit: {}", sessionId, limit);
log.debug("✅ 获取共享模式消息成功: sessionId={}, 消息数量={}", ...);
```

## 效果
- ✅ 减少生产环境的日志量
- ✅ 保留 DEBUG 级别日志用于开发调试
- ✅ 保留 WARN 和 ERROR 级别日志用于问题排查
- ✅ 不影响功能，只是日志级别调整

## 如何查看详细日志
如果需要查看详细的调试日志，可以在 `application.yml` 或 `application.properties` 中设置：

```yaml
logging:
  level:
    com.heartsphere.heartconnect.interceptor.SharedModeInterceptor: DEBUG
    com.heartsphere.heartconnect.controller.SharedController: DEBUG
```

## 注意事项
- 这些修改需要重启后端服务才能生效
- 如果生产环境需要详细日志，可以通过配置文件调整日志级别
- 建议在开发环境使用 DEBUG 级别，生产环境使用 INFO 或更高级别
