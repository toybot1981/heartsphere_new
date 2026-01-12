## 1. 接口和 DTO 设计

- [ ] 1.1 在 `ModelAdapter` 接口中添加 `speechToTextStream` 方法签名
- [ ] 1.2 创建 `RealtimeAudioRequest` DTO 类，包含音频数据、格式、采样率等字段
- [ ] 1.3 创建 `RealtimeAudioResponse` DTO 类，包含识别文本、是否部分结果、置信度等字段
- [ ] 1.4 在 `AIService` 接口中添加 `speechToTextStream` 方法
- [ ] 1.5 更新 `AudioRequest` 和 `AudioResponse`，添加实时识别相关字段（如 `isPartial`、`streamId` 等）

## 2. DoubaoAdapter 实时识别实现

- [ ] 2.1 查阅火山引擎实时语音识别 API 文档，确认 WebSocket 协议格式
- [ ] 2.2 实现 WebSocket 客户端连接逻辑（使用 Spring WebSocket 或 Java-WebSocket 库）
- [ ] 2.3 实现音频数据流发送逻辑（将 Base64 音频数据转换为二进制发送）
- [ ] 2.4 实现识别结果接收和解析逻辑
- [ ] 2.5 实现中间结果（partial）和最终结果（final）的区分
- [ ] 2.6 实现连接错误处理和重连机制
- [ ] 2.7 实现连接超时和自动清理
- [ ] 2.8 添加详细的日志记录

## 3. AIServiceImpl 实现

- [ ] 3.1 在 `AIServiceImpl` 中实现 `speechToTextStream` 方法
- [ ] 3.2 实现适配器选择逻辑（根据 provider 选择 DoubaoAdapter）
- [ ] 3.3 实现 `StreamResponseHandler` 包装，添加日志和错误处理
- [ ] 3.4 实现用户认证和权限检查
- [ ] 3.5 实现计费统计（如需要）

## 4. Controller 和 API 端点

- [ ] 4.1 实现 WebSocket 端点 `/api/ai/audio/realtime/websocket`
- [ ] 4.2 实现 WebSocket 消息处理（接收音频数据，发送识别结果）
- [ ] 4.3 实现 REST API + SSE 端点 `/api/ai/audio/realtime/stream`
- [ ] 4.4 实现音频流接收（chunked transfer encoding）
- [ ] 4.5 实现 SSE 响应发送（实时返回识别结果）
- [ ] 4.6 添加 API 文档注释（Swagger/OpenAPI）
- [ ] 4.7 实现错误处理和异常响应

## 5. 数据库配置

- [ ] 5.1 创建数据库迁移脚本，添加实时语音识别模型配置
- [ ] 5.2 配置 WebSocket 端点 URL
- [ ] 5.3 配置音频格式要求（PCM、WAV、MP3 等）
- [ ] 5.4 配置采样率、声道数等音频参数
- [ ] 5.5 配置连接超时、重试次数等连接参数
- [ ] 5.6 添加计费信息配置（如需要）
- [ ] 5.7 执行迁移脚本并验证配置

## 6. WebSocket 配置

- [ ] 6.1 配置 Spring WebSocket（如未配置）
- [ ] 6.2 配置 WebSocket 拦截器，处理认证
- [ ] 6.3 配置 WebSocket 消息转换器
- [ ] 6.4 配置连接数限制和资源管理
- [ ] 6.5 配置 CORS（如需要）

## 7. 测试

- [ ] 7.1 编写单元测试：测试 `DoubaoAdapter.speechToTextStream` 方法
- [ ] 7.2 编写单元测试：测试 WebSocket 连接建立和消息发送
- [ ] 7.3 编写单元测试：测试识别结果解析（partial 和 final）
- [ ] 7.4 编写单元测试：测试错误处理和重连机制
- [ ] 7.5 编写集成测试：测试完整的实时识别流程（WebSocket）
- [ ] 7.6 编写集成测试：测试完整的实时识别流程（REST + SSE）
- [ ] 7.7 测试不同音频格式的支持
- [ ] 7.8 测试连接中断和恢复
- [ ] 7.9 测试并发连接处理

## 8. 文档和示例

- [ ] 8.1 更新 `AIAgent服务接口文档.md`，添加实时语音识别 API 说明
- [ ] 8.2 在文档中说明 WebSocket 协议格式和消息格式
- [ ] 8.3 在文档中说明 REST API + SSE 的使用方式
- [ ] 8.4 在文档中说明支持的音频格式和参数要求
- [ ] 8.5 提供 WebSocket 客户端示例代码
- [ ] 8.6 提供 REST API + SSE 客户端示例代码
- [ ] 8.7 创建实时语音识别使用指南

## 9. 验证

- [ ] 9.1 验证 WebSocket 连接能够成功建立
- [ ] 9.2 验证音频数据能够正确发送和接收
- [ ] 9.3 验证识别结果能够实时返回（partial 和 final）
- [ ] 9.4 验证不同音频格式能够正确处理
- [ ] 9.5 验证错误情况能够被正确处理
- [ ] 9.6 验证连接超时和自动清理功能
- [ ] 9.7 验证并发连接的处理能力
- [ ] 9.8 运行所有测试并确保通过
