# Tasks: 接入豆包语音合成 WebSocket/HTTP 接口

## 阶段 1: 接口和 DTO 设计

- [ ] 1.1 扩展 `AudioRequest` DTO，添加豆包 TTS 特定参数
  - [ ] 添加 `appId` 字段（可选，从配置获取）
  - [ ] 添加 `cluster` 字段（默认 "volcano_tts"）
  - [ ] 添加 `uid` 字段（可选，用于日志追溯）
  - [ ] 添加 `voiceType` 字段（音色类型）
  - [ ] 添加 `emotion` 字段（音色情感，可选）
  - [ ] 添加 `enableEmotion` 字段（是否开启情感）
  - [ ] 添加 `emotionScale` 字段（情绪值，1-5）
  - [ ] 添加 `encoding` 字段（音频编码格式：wav/pcm/ogg_opus/mp3）
  - [ ] 添加 `speedRatio` 字段（语速，0.1-2.0）
  - [ ] 添加 `rate` 字段（采样率：8000/16000/24000）
  - [ ] 添加 `bitrate` 字段（比特率，kb/s）
  - [ ] 添加 `explicitLanguage` 字段（明确语种）
  - [ ] 添加 `loudnessRatio` 字段（音量调节，0.5-2.0）
  - [ ] 添加 `reqId` 字段（请求标识，UUID）
  - [ ] 添加 `operation` 字段（操作类型：query/submit）
  - [ ] 添加 `model` 字段（模型版本，如 "seed-tts-1.1"）
  - [ ] 添加 `textType` 字段（文本类型，如 "ssml"）
  - [ ] 添加 `silenceDuration` 字段（句尾静音时长，ms）
  - [ ] 添加 `withTimestamp` 字段（是否返回时间戳）
  - [ ] 添加 `extraParam` 字段（附加参数，JSON 字符串）

- [ ] 1.2 扩展 `AudioResponse` DTO，添加豆包 TTS 响应字段
  - [ ] 添加 `reqId` 字段（请求 ID）
  - [ ] 添加 `code` 字段（状态码）
  - [ ] 添加 `message` 字段（状态信息）
  - [ ] 添加 `sequence` 字段（音频段序号）
  - [ ] 添加 `duration` 字段（音频时长，ms）
  - [ ] 添加 `timestamp` 字段（时间戳信息，如果启用）

- [ ] 1.3 扩展 `ModelAdapter` 接口，添加流式 TTS 方法
  - [ ] 添加 `textToSpeechStream(AudioRequest, StreamResponseHandler<AudioResponse>)` 方法
  - [ ] 更新 `supportsTextToSpeech()` 方法文档

## 阶段 2: WebSocket 客户端实现

- [ ] 2.1 创建 `DoubaoTtsWebSocketClient` 类
  - [ ] 实现 WebSocket 连接管理
  - [ ] 实现二进制协议解析（Header、Optional fields、Payload）
  - [ ] 实现请求消息构建（Full client request）
  - [ ] 实现响应消息解析（Audio-only server response）
  - [ ] 实现错误处理（Error message from server）
  - [ ] 实现连接重试机制
  - [ ] 实现超时处理

- [ ] 2.2 实现 V1 WebSocket 接口
  - [ ] 实现连接建立
  - [ ] 实现请求发送
  - [ ] 实现流式音频接收
  - [ ] 实现连接关闭

- [ ] 2.3 实现 V3 WebSocket 接口
  - [ ] 实现单向流式接口
  - [ ] 实现双向流式接口（可选，优先级较低）
  - [ ] 实现连接复用机制

## 阶段 3: HTTP 客户端实现

- [ ] 3.1 实现 V1 HTTP 接口
  - [ ] 实现请求构建（JSON 格式）
  - [ ] 实现响应解析（Base64 音频数据）
  - [ ] 实现错误处理

- [ ] 3.2 实现 V3 HTTP 接口
  - [ ] 实现单向流式接口（HTTP 流式响应）
  - [ ] 实现请求构建
  - [ ] 实现流式响应解析

## 阶段 4: DoubaoAdapter 实现

- [ ] 4.1 实现 `textToSpeech` 方法（非流式）
  - [ ] 支持 V1 HTTP 接口
  - [ ] 支持 V3 HTTP 接口
  - [ ] 从数据库配置获取模型参数
  - [ ] 处理认证（Bearer Token）
  - [ ] 处理错误响应

- [ ] 4.2 实现 `textToSpeechStream` 方法（流式）
  - [ ] 支持 V1 WebSocket 接口
  - [ ] 支持 V3 WebSocket 接口
  - [ ] 从数据库配置获取模型参数
  - [ ] 处理认证（Bearer Token）
  - [ ] 处理流式音频数据
  - [ ] 处理错误响应

- [ ] 4.3 实现配置获取方法
  - [ ] 从数据库获取 APP ID 和 Access Token
  - [ ] 从配置文件获取默认值（向后兼容）
  - [ ] 实现配置缓存机制（可选）

## 阶段 5: AIService 实现

- [ ] 5.1 扩展 `AIService` 接口
  - [ ] 添加 `textToSpeechStream(Long userId, AudioRequest request, StreamResponseHandler<AudioResponse> handler)` 方法

- [ ] 5.2 实现 `AIServiceImpl.textToSpeechStream`
  - [ ] 获取适配器
  - [ ] 调用适配器流式 TTS 方法
  - [ ] 处理错误和异常

## 阶段 6: Controller 和 API 端点

- [ ] 6.1 添加流式 TTS API 端点
  - [ ] 在 `AIServiceController` 中添加 `/api/ai/audio/tts/stream` 端点
  - [ ] 使用 SSE (Server-Sent Events) 推送流式音频数据
  - [ ] 实现请求参数验证
  - [ ] 实现错误处理
  - [ ] 添加 Swagger 文档注解

- [ ] 6.2 更新现有 TTS API 端点（可选）
  - [ ] 确保现有端点兼容新实现
  - [ ] 更新 Swagger 文档

## 阶段 7: 数据库配置

- [ ] 7.1 创建数据库迁移脚本
  - [ ] 创建 `V10022__add_doubao_tts_websocket_http_models.sql`
  - [ ] 添加 V1 WebSocket 模型配置
  - [ ] 添加 V1 HTTP 模型配置
  - [ ] 添加 V3 WebSocket 单向流式模型配置
  - [ ] 添加 V3 WebSocket 双向流式模型配置（可选）
  - [ ] 添加 V3 HTTP 单向流式模型配置

- [ ] 7.2 添加模型定价信息
  - [ ] 为每个模型添加定价配置
  - [ ] 设置合理的默认价格
  - [ ] 支持后续价格调整

- [ ] 7.3 验证数据库配置
  - [ ] 检查模型配置完整性
  - [ ] 检查定价配置完整性
  - [ ] 测试配置读取功能

## 阶段 8: 测试

- [ ] 8.1 单元测试
  - [ ] 测试 WebSocket 客户端协议解析
  - [ ] 测试 HTTP 客户端请求构建
  - [ ] 测试 `DoubaoAdapter` 方法
  - [ ] 测试错误处理

- [ ] 8.2 集成测试
  - [ ] 测试 V1 WebSocket 接口（需要真实 API key）
  - [ ] 测试 V1 HTTP 接口
  - [ ] 测试 V3 WebSocket 接口
  - [ ] 测试 V3 HTTP 接口
  - [ ] 测试流式 TTS API 端点
  - [ ] 测试非流式 TTS API 端点

- [ ] 8.3 性能测试
  - [ ] 测试 WebSocket 连接性能
  - [ ] 测试流式响应延迟
  - [ ] 测试并发请求处理

## 阶段 9: 文档

- [ ] 9.1 更新 API 文档
  - [ ] 更新 Swagger 文档
  - [ ] 添加流式 TTS API 使用示例

- [ ] 9.2 更新开发文档
  - [ ] 添加豆包 TTS 接入说明
  - [ ] 添加配置说明
  - [ ] 添加故障排查指南
