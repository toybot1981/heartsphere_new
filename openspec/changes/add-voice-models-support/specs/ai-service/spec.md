## ADDED Requirements

### Requirement: DashScope qwen3-tts-flash 模型支持
系统 SHALL 支持 DashScope `qwen3-tts-flash` 模型的文本转语音功能。

#### Scenario: 使用 qwen3-tts-flash 进行文本转语音
- **WHEN** 用户请求文本转语音，指定 provider 为 `dashscope`，model 为 `qwen3-tts-flash`
- **THEN** 系统调用 DashScope API 的 `qwen3-tts-flash` 模型
- **AND** 返回生成的音频数据（Base64 编码或 URL）

#### Scenario: qwen3-tts-flash 音色选择
- **WHEN** 用户请求文本转语音，指定 provider 为 `dashscope`，model 为 `qwen3-tts-flash`，voice 为 `Cherry`
- **THEN** 系统使用指定的音色参数调用 API
- **AND** 返回使用指定音色生成的音频

### Requirement: Doubao 语音模型完善
系统 SHALL 确保 Doubao 的语音模型（CosyVoice TTS 和 Fun-ASR STT）能够正确接入和使用。

#### Scenario: 使用 CosyVoice 进行文本转语音
- **WHEN** 用户请求文本转语音，指定 provider 为 `doubao`，model 为 `CosyVoice`
- **THEN** 系统调用豆包 API 的 CosyVoice 模型
- **AND** 返回生成的音频数据

#### Scenario: 使用 Fun-ASR 进行语音转文本
- **WHEN** 用户请求语音转文本，指定 provider 为 `doubao`，model 为 `Fun-ASR`
- **THEN** 系统调用豆包 API 的 Fun-ASR 模型
- **AND** 返回识别出的文本内容

### Requirement: 语音模型配置管理
系统 SHALL 通过数据库配置管理新的语音模型，包括模型参数、API 端点、计费信息等。

#### Scenario: 添加 qwen3-tts-flash 模型配置
- **WHEN** 执行数据库迁移脚本
- **THEN** `qwen3-tts-flash` 模型配置被添加到 `ai_model_config` 表
- **AND** 模型参数（如默认音色、音频格式等）被正确配置
- **AND** 计费信息被添加到 `ai_model_pricing` 表

#### Scenario: 查询可用的语音模型
- **WHEN** 用户查询可用的语音模型列表
- **THEN** 系统返回包括 `qwen3-tts-flash`、`CosyVoice`、`Fun-ASR` 等所有已配置的语音模型
- **AND** 每个模型包含 provider、model_name、capability 等信息

## MODIFIED Requirements

### Requirement: DashScope 文本转语音支持
系统 SHALL 支持 DashScope 的文本转语音功能，包括 `sambert-zhichu-v1` 和 `qwen3-tts-flash` 模型。

#### Scenario: 使用 sambert-zhichu-v1 进行文本转语音
- **WHEN** 用户请求文本转语音，指定 provider 为 `dashscope`，model 为 `sambert-zhichu-v1`
- **THEN** 系统调用 DashScope API 的 `sambert-zhichu-v1` 模型
- **AND** 返回生成的音频数据

#### Scenario: 使用 qwen3-tts-flash 进行文本转语音
- **WHEN** 用户请求文本转语音，指定 provider 为 `dashscope`，model 为 `qwen3-tts-flash`
- **THEN** 系统调用 DashScope API 的 `qwen3-tts-flash` 模型
- **AND** 返回生成的音频数据

#### Scenario: DashScope 模型自动选择
- **WHEN** 用户请求文本转语音，指定 provider 为 `dashscope`，但未指定 model
- **THEN** 系统根据配置选择默认模型（优先使用 `qwen3-tts-flash` 如果可用，否则使用 `sambert-zhichu-v1`）
