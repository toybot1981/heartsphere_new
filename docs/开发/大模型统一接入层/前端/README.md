# AI服务模块 - 前端实现

**文档版本**: v1.0  
**创建日期**: 2025-01-22  
**模块路径**: `frontend/services/ai/`

---

## 📚 文档索引

- [README.md](./README.md) - 使用指南和API文档（当前文档）
- [开发状态.md](./开发状态.md) - 开发进度和功能状态
- [架构设计.md](./架构设计.md) - 架构设计和实现细节

---

## 概述

AI服务模块实现了大模型统一接入层的前端部分，支持**双模式运行**：
- **统一接入模式**：调用后端统一API接口（待后端实现）
- **本地配置模式**：前端直接调用AI服务，用户自己配置API Key

## 模块结构

```
frontend/services/ai/
├── index.ts                 # 统一导出
├── types.ts                 # 类型定义
├── config.ts                # 配置管理
├── AIService.ts             # 统一AI服务（主服务类）
├── AdapterManager.ts        # 适配器管理器
├── base/
│   └── BaseAdapter.ts       # 基础适配器类
└── adapters/
    ├── index.ts             # 适配器导出
    ├── GeminiAdapter.ts     # Gemini适配器
    ├── OpenAIAdapter.ts     # OpenAI适配器
    ├── QwenAdapter.ts       # 通义千问适配器
    └── DoubaoAdapter.ts     # 豆包适配器
```

## 快速开始

### 1. 安装和导入

```typescript
import { aiService, AIConfigManager } from '@/services/ai';
```

### 2. 配置（本地配置模式）

```typescript
// 设置模式为本地配置
AIConfigManager.saveUserConfig({
  mode: 'local',
  textProvider: 'gemini',
  textModel: 'gemini-2.0-flash-exp',
  enableFallback: true,
});

// 配置API Key
AIConfigManager.setApiKey('gemini', 'your-api-key-here');
```

### 3. 使用

```typescript
// 生成文本
const response = await aiService.generateText({
  prompt: '你好，请介绍一下自己',
  systemInstruction: '你是一个友好的助手',
});

console.log(response.content);
```

## 使用示例

### 基本文本生成

```typescript
import { aiService } from '@/services/ai';

const response = await aiService.generateText({
  prompt: '解释一下量子计算',
  temperature: 0.7,
  maxTokens: 1000,
});

console.log(response.content);
console.log('使用的模型:', response.model);
console.log('Token使用量:', response.usage);
```

### 流式文本生成

```typescript
await aiService.generateTextStream(
  {
    prompt: '写一首关于春天的诗',
  },
  (chunk) => {
    if (chunk.done) {
      console.log('生成完成');
      console.log('Token使用量:', chunk.usage);
    } else {
      // 实时输出内容
      process.stdout.write(chunk.content);
    }
  }
);
```

### 指定Provider和Model

```typescript
const response = await aiService.generateText({
  provider: 'openai',
  model: 'gpt-4',
  prompt: '解释一下量子计算',
});
```

### 生成图片

```typescript
const response = await aiService.generateImage({
  prompt: '一只可爱的小猫在花园里',
  width: 1024,
  height: 1024,
  numberOfImages: 1,
});

console.log('生成的图片:', response.images[0].url);
```

### 文本转语音

```typescript
const response = await aiService.textToSpeech({
  text: '你好，这是一个测试',
  voice: 'zh-CN-Standard-A',
  speed: 1.0,
});

// 播放音频
const audio = new Audio(response.audioUrl);
audio.play();
```

### 语音转文本

```typescript
const audioFile = // ... 获取音频文件

const response = await aiService.speechToText({
  audioFile: audioFile,
  language: 'zh-CN',
});

console.log('识别的文本:', response.text);
console.log('置信度:', response.confidence);
```

## 配置管理

### 获取配置

```typescript
const config = AIConfigManager.getUserConfig();
console.log('当前模式:', config.mode);
console.log('文本提供商:', config.textProvider);
```

### 更新配置

```typescript
AIConfigManager.saveUserConfig({
  mode: 'local',
  textProvider: 'gemini',
  textModel: 'gemini-2.0-flash-exp',
  imageProvider: 'openai',
  imageModel: 'dall-e-3',
  enableFallback: true,
});
```

### API Key管理

```typescript
// 设置API Key
AIConfigManager.setApiKey('gemini', 'your-gemini-key');
AIConfigManager.setApiKey('openai', 'your-openai-key');
AIConfigManager.setApiKey('qwen', 'your-qwen-key');
AIConfigManager.setApiKey('doubao', 'your-doubao-key');

// 获取API Key
const geminiKey = AIConfigManager.getApiKey('gemini');

// 检查是否已配置
const isConfigured = AIConfigManager.isLocalModeConfigured();
```

### 切换模式

```typescript
// 切换到本地配置模式
aiService.updateUserConfig({
  mode: 'local',
});

// 切换到统一接入模式（需要后端支持）
aiService.updateUserConfig({
  mode: 'unified',
});
```

## 错误处理

```typescript
import { 
  AIServiceException, 
  APIKeyNotConfiguredException,
  UnsupportedModelException 
} from '@/services/ai';

try {
  const response = await aiService.generateText({
    prompt: '测试',
  });
} catch (error) {
  if (error instanceof APIKeyNotConfiguredException) {
    console.error('API Key未配置，请先配置API Key');
    // 引导用户配置API Key
  } else if (error instanceof UnsupportedModelException) {
    console.error('不支持的模型:', error.model);
    // 提示用户选择其他模型
  } else if (error instanceof AIServiceException) {
    console.error('AI服务错误:', error.message);
    console.error('提供商:', error.provider);
    // 显示错误信息
  } else {
    console.error('未知错误:', error);
  }
}
```

## 降级机制

如果启用了降级（`enableFallback: true`），当指定的provider失败时，会自动尝试其他可用的provider：

```typescript
// 配置启用降级
AIConfigManager.saveUserConfig({
  mode: 'local',
  textProvider: 'gemini',
  enableFallback: true,
});

// 如果gemini失败，会自动尝试openai、qwen、doubao
try {
  const response = await aiService.generateText({
    prompt: '测试',
  });
} catch (error) {
  // 如果所有provider都失败，才会抛出异常
  console.error('所有provider都失败了');
}
```

**注意**：流式生成不支持降级，如果失败会直接抛出错误。

## 支持的模型

### Gemini
- **文本**: gemini-2.0-flash-exp, gemini-1.5-pro, gemini-1.5-flash, gemini-pro
- **图片**: imagen-3.0-generate-001, imagen-2
- **音频**: gemini-2.0-flash-exp
- **视频**: veo-2

### OpenAI
- **文本**: gpt-4, gpt-4-turbo, gpt-3.5-turbo, gpt-4o
- **图片**: dall-e-3, dall-e-2
- **音频**: tts-1, tts-1-hd, whisper-1
- **视频**: 不支持

### 通义千问
- **文本**: qwen-max, qwen-plus, qwen-turbo
- **图片**: wanx-v1
- **音频**: paraformer-zh
- **视频**: 不支持

### 豆包
- **文本**: doubao-pro-4k, doubao-lite-4k
- **图片**: doubao-image
- **音频**: doubao-tts
- **视频**: 不支持

## 注意事项

1. **统一接入模式**：当前版本未实现，需要等待后端API
2. **API Key安全**：本地配置模式下，API Key存储在localStorage，请注意安全
3. **流式生成**：流式生成不支持降级，如果失败会直接抛出错误
4. **模型支持**：不同provider支持的模型不同，请查看各适配器的`getSupportedModels`方法
5. **CORS问题**：本地配置模式下直接调用AI服务，可能遇到CORS问题，需要配置代理

## 后续开发

1. ✅ 实现统一接入模式的后端API调用（等待后端接口）
2. ⚠️ 添加更多模型的适配器
3. ⚠️ 实现缓存机制
4. ⚠️ 添加使用量统计
5. ⚠️ 实现配额管理
6. ⚠️ 完善多模态支持（图片、音频、视频）

## 相关文档

- [开发状态.md](./开发状态.md) - 查看开发进度和功能状态
- [架构设计.md](./架构设计.md) - 了解架构设计和实现细节
- [后端需求文档](../../需求分析/大模型统一接入层需求分析.md) - 后端API需求

---

**最后更新**: 2025-01-22
