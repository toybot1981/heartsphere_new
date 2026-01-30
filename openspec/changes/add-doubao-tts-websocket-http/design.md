# Design: 豆包语音合成 WebSocket/HTTP 接口接入

## 架构决策

### 1. 接口选择

**决策**：优先使用 V3 接口，同时支持 V1 接口作为备选

**理由**：
- V3 接口性能更好，时延更低（官方推荐）
- V3 接口支持更多功能（如双向流式）
- V1 接口作为向后兼容的备选方案

**接口端点**：
- V1 WebSocket: `wss://openspeech.bytedance.com/api/v1/tts/ws_binary`
- V1 HTTP: `https://openspeech.bytedance.com/api/v1/tts`
- V3 WebSocket 单向流式: `wss://openspeech.bytedance.com/api/v3/tts/unidirectional/stream`
- V3 WebSocket 双向流式: `wss://openspeech.bytedance.com/api/v3/tts/bidirection`
- V3 HTTP 单向流式: `https://openspeech.bytedance.com/api/v3/tts/unidirectional`

### 2. 协议实现

**决策**：实现 WebSocket 二进制协议和 HTTP JSON 协议

**理由**：
- WebSocket 二进制协议支持流式返回，降低延迟
- HTTP JSON 协议实现简单，适合非流式场景
- 两种协议互补，满足不同需求

**实现方式**：
- WebSocket: 使用 `java-websocket` 库，实现二进制协议解析
- HTTP: 使用 Spring `RestTemplate` 或 `WebClient`，处理 JSON 请求/响应

### 3. 流式支持

**决策**：扩展 `ModelAdapter` 接口，添加 `textToSpeechStream` 方法

**理由**：
- 与现有的 `generateTextStream` 保持一致的设计模式
- 支持流式音频数据返回，提升用户体验
- 使用 `StreamResponseHandler` 统一流式响应处理

### 4. 认证方式

**决策**：使用 Bearer Token 认证，格式为 `"Authorization": "Bearer; {token}"`

**理由**：
- 符合官方文档要求
- 注意：Bearer 和 token 之间使用分号 `;` 分隔（不是空格）

### 5. 数据库配置

**决策**：在 `ai_model_config` 表中添加豆包语音合成模型配置

**理由**：
- 复用现有的模型配置表结构
- 统一管理模型参数和定价信息
- 支持动态配置和更新

**模型配置字段**：
- `provider`: `doubao`
- `model_name`: 如 `doubao-tts-v3-websocket`, `doubao-tts-v3-http`, `doubao-tts-v1-websocket`, `doubao-tts-v1-http`
- `capability`: `audio`
- `base_url`: WebSocket 或 HTTP 端点 URL
- `model_params`: JSON 格式，包含默认参数（如音色、编码格式等）

### 6. 错误处理

**决策**：实现完善的错误处理和重试机制

**理由**：
- 网络请求可能失败，需要优雅处理
- 官方文档提供了详细的错误码，需要正确解析和响应
- 支持重试机制，提高可靠性

## 实现细节

### WebSocket 二进制协议

根据官方文档，WebSocket 使用二进制协议，格式如下：

```
[Header (4 bytes)] [Optional fields] [Payload size (4 bytes)] [Payload]
```

**Header 格式**（大端序）：
- Protocol version (4 bits): `0b0001` (版本 1)
- Header size (4 bits): `0b0001` (4 bytes)
- Message type (4 bits): `0b0001` (full client request)
- Message type specific flags (4 bits): `0b0000`
- Serialization method (4 bits): `0b0001` (JSON)
- Compression method (4 bits): `0b0000` (无压缩)
- Reserved (8 bits): `0x00`

**请求体格式**（JSON）：
```json
{
  "app": {
    "appid": "appid123",
    "token": "access_token",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "uid123"
  },
  "audio": {
    "voice_type": "zh_male_M392_conversation_wvae_bigtts",
    "encoding": "mp3",
    "speed_ratio": 1.0
  },
  "request": {
    "reqid": "uuid",
    "text": "文本内容",
    "operation": "submit"  // submit 为流式，query 为非流式
  }
}
```

**响应格式**：
- Audio-only server response (Message type: `0b1011`)
- Payload 为二进制音频数据（Base64 编码）

### HTTP 协议

**请求格式**（JSON）：
```json
{
  "app": {
    "appid": "appid123",
    "token": "access_token",
    "cluster": "volcano_tts"
  },
  "user": {
    "uid": "uid123"
  },
  "audio": {
    "voice_type": "zh_male_M392_conversation_wvae_bigtts",
    "encoding": "mp3",
    "speed_ratio": 1.0
  },
  "request": {
    "reqid": "uuid",
    "text": "文本内容",
    "operation": "query"  // HTTP 只能使用 query
  }
}
```

**响应格式**（JSON）：
```json
{
  "reqid": "reqid",
  "code": 3000,
  "operation": "query",
  "message": "Success",
  "sequence": -1,
  "data": "base64 encoded binary data",
  "addition": {
    "duration": "1960"
  }
}
```

## 风险与缓解

### 风险 1: WebSocket 连接管理复杂

**风险**：WebSocket 连接需要管理生命周期，包括连接、重连、关闭等

**缓解**：
- 使用成熟的 WebSocket 客户端库（如 `java-websocket`）
- 实现连接池或连接复用机制
- 添加超时和重试机制

### 风险 2: 二进制协议解析错误

**风险**：二进制协议格式复杂，解析错误可能导致功能异常

**缓解**：
- 严格按照官方文档实现协议解析
- 添加单元测试验证协议解析正确性
- 参考官方示例代码

### 风险 3: 音色参数配置复杂

**风险**：豆包支持大量音色和参数，配置不当可能影响效果

**缓解**：
- 在数据库配置中提供常用音色的默认参数
- 支持通过请求参数覆盖默认配置
- 提供音色列表查询接口（可选）

## 迁移计划

### 阶段 1: 基础实现
1. 实现 WebSocket 客户端类
2. 实现 HTTP 客户端调用
3. 扩展 `DoubaoAdapter` 支持新接口

### 阶段 2: 流式支持
1. 扩展 `ModelAdapter` 接口
2. 实现流式 TTS 方法
3. 添加 Controller 端点

### 阶段 3: 数据库配置
1. 创建数据库迁移脚本
2. 添加模型配置
3. 添加定价信息

### 阶段 4: 测试与优化
1. 单元测试
2. 集成测试
3. 性能优化
