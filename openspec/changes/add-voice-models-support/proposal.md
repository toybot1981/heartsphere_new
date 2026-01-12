# Change: 支持语音模型接入（DashScope 和 Doubao）

## Why

当前系统已经实现了基础的文本转语音（TTS）和语音转文本（STT）功能，但需要扩展支持：
1. **DashScope qwen3-tts-flash 模型**：这是一个新的快速 TTS 模型，提供更好的性能和音质
2. **Doubao 语音模型完善**：确保豆包的语音模型（CosyVoice、Fun-ASR）能够正确接入和使用

这些语音模型将增强系统的语音交互能力，为用户提供更丰富的交互体验。

## What Changes

- **BREAKING**: 无
- 扩展 `DashScopeAdapter` 以支持 `qwen3-tts-flash` 模型
- 完善 `DoubaoAdapter` 的语音模型支持，确保 CosyVoice 和 Fun-ASR 正确工作
- 添加数据库迁移脚本，配置新的语音模型
- 更新模型配置，支持新的语音模型参数（如音色选择）
- 添加测试用例验证语音模型功能

## Impact

- **Affected specs**: `ai-service` capability
- **Affected code**: 
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/DashScopeAdapter.java`
  - `main/backend/src/main/java/com/heartsphere/aiagent/adapter/DoubaoAdapter.java`
  - `main/backend/src/main/java/com/heartsphere/aiagent/dto/request/AudioRequest.java`
  - `main/backend/src/main/resources/db/migration/` (新增迁移脚本)
- **API changes**: 无破坏性变更，仅扩展功能
- **Frontend impact**: 无，前端接口保持不变
