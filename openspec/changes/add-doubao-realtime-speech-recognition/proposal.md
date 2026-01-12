# Change: 支持豆包实时语音识别

## Why

当前系统已经实现了基础的语音转文本（STT）功能，但仅支持批量处理（上传完整音频文件后返回结果）。用户需要支持**实时语音识别**功能，能够：
1. **流式音频输入**：支持实时接收音频流数据
2. **实时识别结果**：在音频输入过程中实时返回识别结果
3. **低延迟交互**：提供更自然的语音交互体验

豆包（火山引擎）提供了实时语音识别 API（realTimeRecognition），支持 WebSocket 连接和流式处理，适合实时对话场景。

## What Changes

- **BREAKING**: 无（新增功能，不影响现有 API）
- 扩展 `AIService` 接口，添加实时语音识别方法
- 在 `DoubaoAdapter` 中实现实时语音识别功能
- 创建新的 DTO 类支持流式音频请求和响应
- 在 `AIServiceController` 中添加实时语音识别的 REST API 端点
- 支持 WebSocket 或 SSE（Server-Sent Events）连接进行实时通信
- 添加数据库配置，支持实时语音识别模型
- 添加测试用例验证实时语音识别功能

## Impact

- **Affected specs**: `ai-service` capability
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/aiagent/service/AIService.java` (接口扩展)
  - `main/backend/src/main/java/com/heartsphere/aiagent/service/AIServiceImpl.java` (实现)
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/DoubaoAdapter.java` (实时识别实现)
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/ModelAdapter.java` (接口扩展)
  - `main/backend/src/main/java/com/heartsphere/aiagent/controller/AIServiceController.java` (API 端点)
  - `main/backend/src/main/java/com/heartsphere/aiagent/dto/request/` (新增 DTO)
  - `main/backend/src/main/java/com/heartsphere/aiagent/dto/response/` (新增 DTO)
  - `main/backend/src/main/resources/db/migration/` (新增迁移脚本)
- **API changes**: 新增 API 端点，无破坏性变更
- **Frontend impact**: 前端可选择使用新的实时语音识别 API，现有批量 STT API 保持不变
