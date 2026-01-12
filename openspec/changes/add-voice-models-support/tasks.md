## 1. 数据库配置

- [ ] 1.1 创建数据库迁移脚本，添加 `qwen3-tts-flash` 模型配置到 `ai_model_config` 表
- [ ] 1.2 配置 `qwen3-tts-flash` 的默认参数（音色、音频格式、采样率等）
- [ ] 1.3 添加 `qwen3-tts-flash` 的计费信息到 `ai_model_pricing` 表
- [ ] 1.4 验证 Doubao 语音模型（CosyVoice、Fun-ASR）的配置是否正确
- [ ] 1.5 执行迁移脚本并验证数据插入成功

## 2. DashScope 适配器扩展

- [ ] 2.1 在 `DashScopeAdapter` 中添加对 `qwen3-tts-flash` 模型的识别逻辑
- [ ] 2.2 实现 `qwen3-tts-flash` 的 API 调用逻辑（确认 API 端点）
- [ ] 2.3 实现音色参数映射（将 `AudioRequest.voice` 映射为 API 参数）
- [ ] 2.4 处理 `qwen3-tts-flash` 的响应格式（Base64 音频数据）
- [ ] 2.5 添加错误处理和日志记录
- [ ] 2.6 更新 `getSupportedModels` 方法，包含 `qwen3-tts-flash`

## 3. Doubao 适配器完善

- [ ] 3.1 验证 CosyVoice TTS API 端点是否正确
- [ ] 3.2 验证 Fun-ASR STT API 端点是否正确
- [ ] 3.3 修复 API 调用中的任何问题（如端点路径、请求格式等）
- [ ] 3.4 完善音色参数支持（CosyVoice 支持的音色列表）
- [ ] 3.5 添加错误处理和日志记录
- [ ] 3.6 更新 `getSupportedModels` 方法，确保包含所有语音模型

## 4. DTO 和参数支持

- [ ] 4.1 检查 `AudioRequest` 是否包含所有必要的字段（voice、speed、pitch 等）
- [ ] 4.2 如有需要，扩展 `AudioRequest` 以支持新的参数
- [ ] 4.3 确保 `AudioResponse` 能够正确返回音频数据（Base64 或 URL）
- [ ] 4.4 更新 API 文档注释，说明各模型支持的参数

## 5. 测试

- [ ] 5.1 编写单元测试：测试 `DashScopeAdapter.textToSpeech` 对 `qwen3-tts-flash` 的支持
- [ ] 5.2 编写单元测试：测试 `DoubaoAdapter.textToSpeech` 对 `CosyVoice` 的支持
- [ ] 5.3 编写单元测试：测试 `DoubaoAdapter.speechToText` 对 `Fun-ASR` 的支持
- [ ] 5.4 编写集成测试：测试完整的 TTS 流程（从 API 请求到音频返回）
- [ ] 5.5 编写集成测试：测试完整的 STT 流程（从音频上传到文本返回）
- [ ] 5.6 测试不同音色的选择功能
- [ ] 5.7 测试错误处理（如 API 调用失败、参数错误等）

## 6. 文档和配置

- [ ] 6.1 更新 `AIAgent服务接口文档.md`，添加新模型的说明
- [ ] 6.2 在文档中说明各模型支持的音色列表
- [ ] 6.3 在文档中说明各模型的 API 参数要求
- [ ] 6.4 更新 `application.yml` 配置示例（如有需要）
- [ ] 6.5 创建模型配置说明文档，指导如何配置新的语音模型

## 7. 验证

- [ ] 7.1 验证 `qwen3-tts-flash` 模型能够成功调用并返回音频
- [ ] 7.2 验证 CosyVoice 模型能够成功调用并返回音频
- [ ] 7.3 验证 Fun-ASR 模型能够成功识别语音并返回文本
- [ ] 7.4 验证音色参数能够正确传递和应用
- [ ] 7.5 验证错误情况能够被正确处理和报告
- [ ] 7.6 运行所有测试并确保通过
