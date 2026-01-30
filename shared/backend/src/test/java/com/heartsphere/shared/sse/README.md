# SSE工具类单元测试

## 测试覆盖

### SseEmitterManagerTest
- ✅ 创建emitter（带超时和默认超时）
- ✅ 安全发送（null emitter、有效emitter、已完成emitter）
- ✅ 完成emitter（正常和null）
- ✅ 注册和获取emitter
- ✅ 移除emitter
- ✅ 获取活跃连接数
- ✅ 自动移除（完成时）

### SseEventBuilderTest
- ✅ 创建构建器
- ✅ 设置事件类型、数据、ID、时间戳
- ✅ 构建JSON（标准格式、默认类型、无ID）
- ✅ 构建SseEmitter.SseEventBuilder
- ✅ 快速创建方法（message、complete、error、progress）
- ✅ 复杂数据对象
- ✅ 错误处理

### SseUtilsTest
- ✅ 安全发送（null emitter、有效emitter、已完成emitter）
- ✅ 发送事件（标准格式、消息、完成、错误、进度）
- ✅ 特殊场景（null数据、空字符串、特殊字符、复杂数据）

### SseStreamServiceTest
- ✅ 流式处理（基本、空请求、单chunk、多chunks）
- ✅ 异常处理
- ✅ null请求处理

## 运行测试

```bash
# 运行所有SSE测试
mvn test -Dtest=SseEmitterManagerTest,SseEventBuilderTest,SseUtilsTest,SseStreamServiceTest

# 运行单个测试类
mvn test -Dtest=SseEmitterManagerTest

# 运行所有测试
mvn test
```

## 测试覆盖率目标

- **SseEmitterManager**: 90%+
- **SseEventBuilder**: 95%+
- **SseUtils**: 90%+
- **SseStreamService**: 85%+

## 注意事项

1. **异步测试**：SseStreamService使用异步处理，测试中需要等待
2. **异常处理**：测试覆盖了各种异常场景
3. **边界条件**：测试了null、空字符串等边界情况
