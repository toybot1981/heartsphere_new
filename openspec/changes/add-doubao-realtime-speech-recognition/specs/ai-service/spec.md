## ADDED Requirements

### Requirement: 实时语音识别接口
系统 SHALL 提供实时语音识别接口，支持流式音频输入和实时识别结果返回。

#### Scenario: 通过 WebSocket 进行实时语音识别
- **WHEN** 客户端通过 WebSocket 连接到实时语音识别端点
- **AND** 客户端发送音频数据流（Base64 编码的音频 chunks）
- **THEN** 系统实时返回识别结果（部分结果和最终结果）
- **AND** 识别结果通过 WebSocket 消息返回给客户端

#### Scenario: 通过 REST API + SSE 进行实时语音识别
- **WHEN** 客户端通过 POST 请求发送音频流（chunked transfer encoding）
- **THEN** 系统使用 SSE (Server-Sent Events) 返回实时识别结果
- **AND** 客户端可以实时接收识别结果流

#### Scenario: 实时识别结果格式
- **WHEN** 系统接收到音频数据并开始识别
- **THEN** 系统返回中间结果（partial results），包含已识别的部分文本
- **AND** 当识别完成时，系统返回最终结果（final result），包含完整的识别文本和置信度

### Requirement: 豆包实时语音识别实现
系统 SHALL 在 `DoubaoAdapter` 中实现实时语音识别功能，连接火山引擎实时语音识别 API。

#### Scenario: 连接火山引擎实时语音识别 API
- **WHEN** 系统接收到实时语音识别请求，provider 为 `doubao`
- **THEN** 系统建立 WebSocket 连接到火山引擎实时语音识别 API
- **AND** 系统发送音频数据流到 API
- **AND** 系统接收并转发识别结果给客户端

#### Scenario: 音频格式支持
- **WHEN** 客户端发送不同格式的音频数据（PCM、WAV、MP3）
- **THEN** 系统能够识别音频格式
- **AND** 系统将音频数据正确传递给火山引擎 API
- **AND** 系统返回识别结果

#### Scenario: 连接错误处理
- **WHEN** WebSocket 连接中断或发生错误
- **THEN** 系统记录错误日志
- **AND** 系统通知客户端连接错误
- **AND** 系统支持自动重连机制（可选）

### Requirement: 流式音频请求 DTO
系统 SHALL 提供流式音频请求 DTO，支持音频数据流传输。

#### Scenario: 发送音频数据块
- **WHEN** 客户端发送音频数据块请求
- **THEN** 请求包含音频数据（Base64 编码）、音频格式、采样率等信息
- **AND** 系统能够处理多个音频数据块，组成完整的音频流

#### Scenario: 音频流结束标记
- **WHEN** 客户端发送音频流结束标记
- **THEN** 系统识别结束标记
- **AND** 系统返回最终识别结果
- **AND** 系统关闭连接或准备接收新的音频流

### Requirement: 流式音频响应 DTO
系统 SHALL 提供流式音频响应 DTO，支持实时返回识别结果。

#### Scenario: 返回中间识别结果
- **WHEN** 系统接收到部分音频数据并完成部分识别
- **THEN** 响应包含 `isPartial: true` 标记
- **AND** 响应包含已识别的部分文本
- **AND** 响应可能包含置信度信息

#### Scenario: 返回最终识别结果
- **WHEN** 音频流结束，识别完成
- **THEN** 响应包含 `isPartial: false` 标记
- **AND** 响应包含完整的识别文本
- **AND** 响应包含最终置信度
- **AND** 响应可能包含说话人信息（如果支持）

### Requirement: 实时语音识别模型配置
系统 SHALL 通过数据库配置管理实时语音识别模型，包括 API 端点、连接参数等。

#### Scenario: 配置实时语音识别模型
- **WHEN** 执行数据库迁移脚本
- **THEN** 实时语音识别模型配置被添加到 `ai_model_config` 表
- **AND** 配置包含 WebSocket 端点 URL
- **AND** 配置包含音频格式要求、采样率等参数
- **AND** 配置包含连接超时、重试次数等连接参数

#### Scenario: 查询实时语音识别模型
- **WHEN** 用户查询可用的实时语音识别模型
- **THEN** 系统返回包括豆包实时语音识别模型在内的所有已配置模型
- **AND** 每个模型包含 provider、model_name、capability、api_endpoint 等信息

## MODIFIED Requirements

### Requirement: ModelAdapter 接口扩展
系统 SHALL 在 `ModelAdapter` 接口中添加实时语音识别方法支持。

#### Scenario: 适配器实现实时语音识别
- **WHEN** 适配器实现了 `speechToTextStream` 方法
- **THEN** 适配器可以通过流式方式处理音频数据
- **AND** 适配器可以通过 `StreamResponseHandler` 实时返回识别结果
- **AND** 适配器支持音频流的开始、传输和结束

#### Scenario: 适配器不支持实时识别
- **WHEN** 适配器未实现 `speechToTextStream` 方法
- **THEN** 系统返回适当的错误信息
- **AND** 系统建议使用批量 STT 方法（`speechToText`）

### Requirement: AIService 接口扩展
系统 SHALL 在 `AIService` 接口中添加实时语音识别方法。

#### Scenario: 调用实时语音识别服务
- **WHEN** 业务服务调用 `speechToTextStream` 方法
- **THEN** 系统根据 provider 选择相应的适配器
- **AND** 系统调用适配器的 `speechToTextStream` 方法
- **AND** 系统通过 `StreamResponseHandler` 返回实时识别结果
