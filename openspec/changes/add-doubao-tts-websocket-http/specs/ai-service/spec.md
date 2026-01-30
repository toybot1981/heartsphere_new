# Spec Delta: AI Service Capability

## ADDED Requirements

### Requirement: 支持豆包 V1 WebSocket 接口进行文本转语音合成

系统 **SHALL** 支持通过豆包 V1 WebSocket 接口进行文本转语音（TTS）合成。

- 使用 WebSocket 二进制协议连接到 `wss://openspeech.bytedance.com/api/v1/tts/ws_binary`
- 支持流式返回音频数据（边合成边返回）
- 使用 Bearer Token 认证，格式为 `"Authorization": "Bearer; {token}"`
- 支持二进制协议解析（Header、Optional fields、Payload）
- 支持多种音色、语速、音量等参数配置

#### Scenario: 用户通过 V1 WebSocket 接口进行流式 TTS 合成
1. 用户发送 TTS 请求，指定使用豆包 V1 WebSocket 接口
2. 系统建立 WebSocket 连接到 V1 端点
3. 系统发送二进制协议请求消息，包含文本和参数
4. 系统接收流式音频数据（Audio-only server response）
5. 系统将音频数据通过 SSE 推送给前端
6. 合成完成后，系统关闭 WebSocket 连接

### Requirement: 支持豆包 V1 HTTP 接口进行文本转语音合成

系统 **SHALL** 支持通过豆包 V1 HTTP 接口进行文本转语音（TTS）合成。

- 使用 HTTP POST 请求到 `https://openspeech.bytedance.com/api/v1/tts`
- 支持非流式返回（文本全部合成完毕之后，一次性返回全部的音频数据）
- 使用 Bearer Token 认证，格式为 `"Authorization": "Bearer; {token}"`
- 请求和响应使用 JSON 格式
- 音频数据使用 Base64 编码

#### Scenario: 用户通过 V1 HTTP 接口进行非流式 TTS 合成
1. 用户发送 TTS 请求，指定使用豆包 V1 HTTP 接口
2. 系统构建 JSON 请求体，包含文本和参数
3. 系统发送 HTTP POST 请求到 V1 端点
4. 系统接收 JSON 响应，包含 Base64 编码的音频数据
5. 系统解析响应，返回音频数据给用户

### Requirement: 支持豆包 V3 WebSocket 接口进行文本转语音合成

系统 **SHALL** 支持通过豆包 V3 WebSocket 接口进行文本转语音（TTS）合成。

- 优先使用 V3 接口（性能更好，时延更低）
- 支持单向流式接口：`wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream`
- 可选支持双向流式接口：`wss://openspeech.bytedance.com/api/v3/tts/bidirection`
- 使用 Bearer Token 认证
- 支持更多功能和参数配置

#### Scenario: 用户通过 V3 WebSocket 接口进行流式 TTS 合成
1. 用户发送 TTS 请求，指定使用豆包 V3 WebSocket 接口（或系统默认使用 V3）
2. 系统建立 WebSocket 连接到 V3 端点
3. 系统发送请求消息，包含文本和参数
4. 系统接收流式音频数据
5. 系统将音频数据通过 SSE 推送给前端
6. 合成完成后，系统关闭 WebSocket 连接

### Requirement: 支持豆包 V3 HTTP 接口进行文本转语音合成

系统 **SHALL** 支持通过豆包 V3 HTTP 接口进行文本转语音（TTS）合成。

- 使用 HTTP POST 请求到 `https://openspeech.bytedance.com/api/v3/tts/unidirectional`
- 支持单向流式返回（HTTP 流式响应）
- 使用 Bearer Token 认证
- 请求和响应使用 JSON 格式

#### Scenario: 用户通过 V3 HTTP 接口进行流式 TTS 合成
1. 用户发送 TTS 请求，指定使用豆包 V3 HTTP 接口
2. 系统构建 JSON 请求体
3. 系统发送 HTTP POST 请求到 V3 端点
4. 系统接收流式 HTTP 响应，包含多个音频数据块
5. 系统将音频数据块通过 SSE 推送给前端

### Requirement: 提供流式 TTS API 端点

系统 **SHALL** 提供流式 TTS API 端点，支持 Server-Sent Events (SSE) 推送音频数据。

- API 端点：`POST /api/ai/audio/tts/stream`
- 使用 SSE 推送流式音频数据
- 支持 WebSocket 和 HTTP 两种后端实现
- 支持错误处理和超时管理

#### Scenario: 前端调用流式 TTS API
1. 前端发送 POST 请求到 `/api/ai/audio/tts/stream`
2. 后端建立 SSE 连接
3. 后端调用豆包 TTS 接口（WebSocket 或 HTTP）
4. 后端接收音频数据块
5. 后端通过 SSE 推送音频数据块给前端
6. 前端接收并播放音频数据
7. 合成完成后，SSE 连接关闭

### Requirement: 在数据库中配置豆包语音合成模型信息

系统 **SHALL** 在数据库中配置豆包语音合成模型信息。

- 在 `ai_model_config` 表中添加豆包 TTS 模型配置
- 配置包括：模型名称、接口版本、端点 URL、默认参数等
- 在 `ai_model_pricing` 表中添加定价信息
- 支持通过管理后台动态更新配置

#### Scenario: 系统管理员配置豆包 TTS 模型
1. 系统管理员在数据库中插入模型配置记录
2. 配置包括：provider="doubao", model_name="doubao-tts-v3-websocket", base_url="wss://...", model_params="..."
3. 系统管理员在数据库中插入定价配置记录
4. 系统在运行时从数据库读取配置
5. 系统使用配置的参数调用豆包 TTS 接口

### Requirement: 支持豆包 TTS 的丰富参数配置

系统 **SHALL** 支持豆包 TTS 的丰富参数配置。

- 支持音色类型（voice_type）
- 支持音色情感（emotion）
- 支持语速（speed_ratio，0.1-2.0）
- 支持音量（loudness_ratio，0.5-2.0）
- 支持音频编码格式（encoding：wav/pcm/ogg_opus/mp3）
- 支持采样率（rate：8000/16000/24000）
- 支持明确语种（explicit_language）
- 支持时间戳（with_timestamp）
- 支持 SSML 文本类型
- 支持其他扩展参数（extra_param）

#### Scenario: 用户使用自定义参数进行 TTS 合成
1. 用户发送 TTS 请求，指定音色、语速、音量等参数
2. 系统将参数传递给豆包 TTS 接口
3. 豆包根据参数合成音频
4. 系统返回合成的音频数据

### Requirement: 正确处理豆包 TTS 接口的错误响应

系统 **SHALL** 正确处理豆包 TTS 接口的错误响应。

- 解析豆包返回的错误码和错误信息
- 将豆包错误码映射到系统内部错误码
- 提供友好的错误提示
- 支持重试机制（对于可重试的错误）

#### Scenario: 豆包 TTS 接口返回错误
1. 系统调用豆包 TTS 接口
2. 豆包返回错误响应（如：3001 无效请求、3003 并发超限、3010 文本长度超限等）
3. 系统解析错误码和错误信息
4. 系统将错误信息返回给用户
5. 对于可重试的错误（如 3005 后端服务忙），系统自动重试
