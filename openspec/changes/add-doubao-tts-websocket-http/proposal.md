# Change: 接入豆包语音合成 WebSocket/HTTP 接口

## Why

当前系统已经实现了基础的文本转语音（TTS）功能，但使用的是 OpenAPI 兼容格式。根据豆包官方文档，豆包提供了专门的 WebSocket 和 HTTP 接口用于语音合成，这些接口具有以下优势：

1. **更好的性能**：WebSocket 流式接口支持边合成边返回音频数据，降低延迟
2. **更丰富的功能**：支持更多音色、情感、语速等参数配置
3. **更符合官方规范**：使用官方推荐的接口格式，便于维护和升级
4. **支持多种接口版本**：V1 和 V3 接口，满足不同场景需求

同时，需要将豆包语音合成模型及计费信息加入到数据库，以便统一管理和配置。

**参考文档**：
- [豆包语音合成 WebSocket 接口文档](https://www.volcengine.com/docs/6561/1719100)
- [豆包语音合成 HTTP 接口文档](https://www.volcengine.com/docs/6561/1598757)

## What Changes

- **BREAKING**: 无（新增功能，不影响现有 API）
- 在 `DoubaoAdapter` 中实现基于 WebSocket 和 HTTP 的语音合成功能
- 支持 V1 和 V3 接口版本（优先使用 V3）
- 支持流式和非流式两种模式
- 支持二进制协议（WebSocket）和 JSON 协议（HTTP）
- 创建数据库迁移脚本，添加豆包语音合成模型配置
- 添加模型定价信息到数据库
- 更新 `AIService` 接口，支持流式 TTS
- 在 `AIServiceController` 中添加流式 TTS 端点（SSE）

## Impact

- **Affected specs**: `ai-service` capability
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/DoubaoAdapter.java`
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/ModelAdapter.java` (接口扩展)
  - `main/backend/src/main/java/com/heartsphere/aiagent/service/AIService.java` (接口扩展)
  - `main/backend/src/main/java/com/heartsphere/aiagent/service/AIServiceImpl.java` (实现)
  - `main/backend/src/main/java/com/heartsphere/aiagent/controller/AIServiceController.java` (API 端点)
  - `main/backend/src/main/java/com/heartsphere/aiagent/dto/request/AudioRequest.java` (可能需要扩展)
  - `main/backend/src/main/java/com/heartsphere/aiagent/dto/response/AudioResponse.java` (可能需要扩展)
  - `main/backend/src/main/resources/db/migration/` (新增迁移脚本)
- **API changes**: 新增流式 TTS API 端点，无破坏性变更
- **Frontend impact**: 前端可选择使用新的流式 TTS API，现有批量 TTS API 保持不变
- **Database changes**: 新增模型配置和定价记录
