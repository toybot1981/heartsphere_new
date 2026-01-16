# Design: 豆包实时语音识别支持

## Context

当前系统通过 `ModelAdapter` 接口统一不同提供商的模型调用。`DoubaoAdapter` 已经实现了批量语音转文本功能（`speechToText`），使用 HTTP POST 方式上传完整音频文件。

用户需要支持实时语音识别，这需要：
- 流式音频数据传输
- 实时返回部分识别结果
- 低延迟通信

根据火山引擎文档，实时语音识别通常使用 WebSocket 连接。

## Goals / Non-Goals

### Goals
- 支持豆包实时语音识别 API（realTimeRecognition）
- 支持流式音频输入和实时识别结果返回
- 提供 REST API 和 WebSocket 两种接入方式
- 保持与现有批量 STT API 的兼容性
- 支持音频格式：PCM、WAV、MP3 等

### Non-Goals
- 不修改现有的批量 STT 功能
- 不强制要求所有适配器都实现实时识别（仅 Doubao 实现）
- 不实现前端音频采集功能（由前端自行实现）

## Decisions

### Decision 1: 使用 WebSocket 作为主要通信方式
**What**: 实时语音识别使用 WebSocket 连接进行双向通信

**Why**: 
- 实时语音识别需要双向通信（客户端发送音频流，服务端返回识别结果）
- WebSocket 支持全双工通信，适合流式数据传输
- 火山引擎实时语音识别 API 使用 WebSocket

**Alternatives considered**:
- SSE (Server-Sent Events)：仅支持服务端到客户端的单向通信，不适合实时语音识别
- HTTP 长轮询：延迟较高，不适合实时场景
- gRPC Streaming：需要额外的依赖和配置

### Decision 2: 同时提供 REST API 包装
**What**: 除了 WebSocket 端点，还提供 REST API 端点，使用 SSE 返回实时结果

**Why**:
- 提供更灵活的接入方式
- 某些场景下 REST API 更容易集成
- 保持 API 风格的一致性

**Implementation**: REST API 接收音频流（chunked transfer encoding），使用 SSE 返回识别结果

### Decision 3: 扩展 ModelAdapter 接口
**What**: 在 `ModelAdapter` 接口中添加 `speechToTextStream` 方法

**Why**:
- 保持接口的一致性
- 允许其他适配器未来也实现实时识别
- 符合现有的设计模式

**Signature**:
```java
void speechToTextStream(AudioRequest request, 
                       StreamResponseHandler<AudioResponse> handler);
```

### Decision 4: 音频数据格式
**What**: 支持 Base64 编码的音频数据块（chunks）

**Why**:
- 与现有 `AudioRequest` 格式兼容
- 便于在 HTTP/WebSocket 中传输
- 支持多种音频格式

**Format**: 
- 每个 chunk 包含 Base64 编码的音频数据
- 支持 PCM、WAV、MP3 等格式
- 通过 `contentType` 字段指定音频格式

## Risks / Trade-offs

### Risk 1: WebSocket 连接管理复杂
**Risk**: WebSocket 连接需要管理生命周期、错误处理、重连等

**Mitigation**: 
- 使用 Spring WebSocket 框架简化连接管理
- 实现连接超时和自动清理机制
- 添加详细的日志记录

### Risk 2: 音频流格式兼容性
**Risk**: 不同客户端可能使用不同的音频格式和编码

**Mitigation**:
- 支持多种音频格式（PCM、WAV、MP3）
- 在文档中明确支持的格式
- 提供格式转换建议

### Risk 3: 火山引擎 API 格式变化
**Risk**: 实时语音识别 API 的具体格式可能与文档不一致

**Mitigation**:
- 严格按照官方文档 [https://www.volcengine.com/docs/6561/1594356?lang=zh](https://www.volcengine.com/docs/6561/1594356?lang=zh) 实现
- 实现灵活的响应解析
- 添加错误处理和日志记录
- 提供配置项允许调整 API 参数
- 在代码中引用官方文档链接，便于后续维护

### Risk 4: 性能影响
**Risk**: 实时语音识别可能增加服务器负载

**Mitigation**:
- 实现连接数限制
- 添加资源监控
- 考虑使用消息队列处理高并发场景

## Migration Plan

1. **Phase 1: 接口和 DTO 设计**
   - 扩展 `ModelAdapter` 接口
   - 创建流式音频请求/响应 DTO
   - 更新 `AIService` 接口

2. **Phase 2: DoubaoAdapter 实现**
   - 实现 WebSocket 客户端连接火山引擎 API
   - 实现音频流发送和结果接收
   - 处理连接错误和重连

3. **Phase 3: Controller 和 API**
   - 实现 WebSocket 端点
   - 实现 REST API + SSE 端点
   - 添加错误处理和日志

4. **Phase 4: 数据库配置**
   - 添加实时语音识别模型配置
   - 配置 API 端点和参数

5. **Phase 5: 测试和文档**
   - 编写单元测试和集成测试
   - 更新 API 文档
   - 提供使用示例

## 官方文档参考

**火山引擎实时语音识别 API 文档**: [https://www.volcengine.com/docs/6561/1594356?lang=zh](https://www.volcengine.com/docs/6561/1594356?lang=zh)

实施时请严格按照官方文档的协议格式和消息格式进行实现。

## Open Questions

1. ~~火山引擎实时语音识别 API 的具体 WebSocket 协议格式是什么？~~ → 参考官方文档
2. 是否需要支持音频格式自动转换？
3. 实时识别结果是否需要支持中间结果（partial results）和最终结果（final results）？
4. 是否需要支持说话人识别（speaker diarization）？
5. WebSocket 连接的超时时间应该设置为多少？
