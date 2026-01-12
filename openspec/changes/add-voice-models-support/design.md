# Design: 语音模型接入支持

## Context

系统已经实现了基础的 TTS 和 STT 功能，通过 `ModelAdapter` 接口统一不同提供商的模型调用。当前：
- `DashScopeAdapter` 支持 `sambert-zhichu-v1` (TTS) 和 `paraformer-v2` (STT)
- `DoubaoAdapter` 支持 `CosyVoice` (TTS) 和 `Fun-ASR` (STT)

用户需要：
1. 支持 DashScope 的 `qwen3-tts-flash` 模型（快速 TTS）
2. 确保 Doubao 的语音模型正确接入

## Goals / Non-Goals

### Goals
- 支持 DashScope `qwen3-tts-flash` 模型，使用 HTTP API 方式调用（与现有实现保持一致）
- 完善 Doubao 语音模型的实现，确保 API 调用正确
- 支持音色选择等高级参数配置
- 保持与现有 `AudioRequest`/`AudioResponse` DTO 的兼容性

### Non-Goals
- 不引入 Python SDK 依赖（保持 Java 实现）
- 不修改现有的 `ModelAdapter` 接口
- 不改变前端 API 接口

## Decisions

### Decision 1: 使用 HTTP API 而非 Python SDK
**What**: DashScope 的 `qwen3-tts-flash` 通过 HTTP API 调用，而非 Python SDK

**Why**: 
- 保持与现有实现的一致性（所有适配器都使用 HTTP API）
- 避免引入 Python 运行时依赖
- 简化部署和维护

**Alternatives considered**:
- 使用 Python SDK：需要引入 Python 运行时，增加系统复杂度
- 使用 gRPC：DashScope 可能不支持，且与现有 HTTP 实现不一致

### Decision 2: 模型配置通过数据库管理
**What**: 新的语音模型配置通过数据库迁移脚本添加

**Why**:
- 与现有的模型配置管理方式一致
- 支持动态配置和更新
- 便于管理不同环境的配置

### Decision 3: 音色参数通过 AudioRequest 传递
**What**: 音色选择通过 `AudioRequest.voice` 字段传递

**Why**:
- 保持 DTO 结构的简洁性
- 与现有实现兼容
- 支持不同模型的音色配置

## Risks / Trade-offs

### Risk 1: API 格式差异
**Risk**: DashScope `qwen3-tts-flash` 的 API 格式可能与现有 `sambert-zhichu-v1` 不同

**Mitigation**: 
- 查阅 DashScope 官方文档确认 API 格式
- 在适配器中添加模型判断逻辑，根据模型选择不同的 API 端点
- 添加单元测试验证不同模型的调用

### Risk 2: 音色参数不兼容
**Risk**: 不同模型的音色参数格式可能不同

**Mitigation**:
- 在适配器中实现音色参数映射
- 提供默认音色配置
- 在文档中说明各模型支持的音色

### Risk 3: Doubao API 端点不正确
**Risk**: Doubao 的 TTS/STT API 端点可能与实现中的不同

**Mitigation**:
- 查阅豆包官方文档确认 API 端点
- 添加错误处理和日志记录
- 提供配置项允许动态调整 API 端点

## Migration Plan

1. **Phase 1: 数据库配置**
   - 创建迁移脚本，添加 `qwen3-tts-flash` 模型配置
   - 验证 Doubao 语音模型配置正确性

2. **Phase 2: 适配器实现**
   - 扩展 `DashScopeAdapter` 支持 `qwen3-tts-flash`
   - 完善 `DoubaoAdapter` 的语音模型实现

3. **Phase 3: 测试验证**
   - 编写单元测试
   - 进行集成测试验证功能

4. **Phase 4: 文档更新**
   - 更新 API 文档
   - 更新模型配置说明

## Open Questions

1. DashScope `qwen3-tts-flash` 的 API 端点是什么？是否与 `sambert-zhichu-v1` 相同？
2. `qwen3-tts-flash` 支持哪些音色？音色参数格式是什么？
3. Doubao CosyVoice 的实际 API 端点是什么？是否需要调整？
