# 多模型互备机制修复说明

## 问题描述

当默认的 Gemini API Key 缺失时，`sendMessageStream` 方法会抛出错误，导致无法自动切换到其他可用的模型（如 OpenAI、Qwen、Doubao）。

## 错误信息

```
Gemini Error: Error: gemini API Key missing.
    at GeminiService.sendMessageStream
```

## 修复方案

### 修复位置
`frontend/services/gemini.ts` - `sendMessageStream` 方法

### 修复内容

1. **移除了过早的错误抛出**
   - 之前：如果只有一个 provider 且 key 缺失，会直接抛出错误
   - 现在：无论有多少 provider，如果 key 缺失，都跳过并继续尝试下一个

2. **增强了 Gemini provider 的错误处理**
   - 在调用 `getSession` 之前，提前检查 Gemini API key
   - 如果 key 缺失，直接跳过，避免在 `getSession` 内部抛出错误

3. **改进了错误消息**
   - 所有 provider 都失败后，提供更清晰的错误消息
   - 包含最后尝试的 provider 的错误信息

### 修复后的逻辑流程

```
1. 获取所有可用的 providers（按优先级排序）
2. 遍历每个 provider：
   a. 检查配置和 API key
   b. 如果缺失，记录错误日志并跳过
   c. 如果存在，尝试使用该 provider
   d. 如果成功，返回结果
   e. 如果失败，捕获错误，记录日志，继续下一个
3. 如果所有 provider 都失败，抛出最后一个错误或通用错误
```

### 代码变更

#### 修改前
```typescript
if (!config || !effectiveKey) {
     if (providers.length === 1) throw new Error(`${provider} API Key missing.`);
     continue;
}
```

#### 修改后
```typescript
// 如果配置或 API key 缺失，跳过这个 provider，继续尝试下一个
if (!config || !effectiveKey) {
    console.error(`[GeminiService] ${provider} provider 配置缺失或 API key 不存在，跳过并尝试下一个 provider`);
    this.log('sendMessageStream', 'skip_provider', { provider, reason: 'missing_config_or_key' });
    continue;
}
```

#### 新增 Gemini provider 提前检查
```typescript
// 2. Gemini
else if (provider === 'gemini') {
     // 再次确认 Gemini API key 存在（getSession 内部也会检查，但提前检查可以避免不必要的操作）
     const geminiConfig = this.getConfigForProvider('gemini');
     const geminiKey = geminiConfig?.apiKey || process.env.API_KEY;
     if (!geminiKey) {
         console.error('[GeminiService] Gemini API Key 缺失，跳过并尝试下一个 provider');
         continue;
     }
     // ... 继续执行 Gemini 逻辑
}
```

### 支持的 Provider 优先级

根据 `getPrioritizedProviders('text')` 方法，支持的文本模型 provider 包括：

1. **Gemini** - 如果配置了 API key 或环境变量中有 `API_KEY`
2. **OpenAI** - 如果配置了 OpenAI API key
3. **Qwen** - 如果配置了 Qwen API key
4. **Doubao** - 如果配置了 Doubao API key

优先级顺序由用户设置中的配置决定。

## 测试建议

1. **测试场景 1：Gemini API Key 缺失**
   - 移除 Gemini API key 配置
   - 确保其他 provider（如 OpenAI）已配置
   - 发送消息，应该自动切换到 OpenAI

2. **测试场景 2：所有 Provider 都缺失**
   - 移除所有 API key 配置
   - 发送消息，应该显示友好的错误消息

3. **测试场景 3：Gemini 失败，但其他 Provider 可用**
   - 配置错误的 Gemini API key
   - 确保其他 provider（如 Qwen）已配置
   - 发送消息，应该自动切换到 Qwen

## 相关方法

### 已实现容错的方法

1. ✅ `sendMessageStream` - **已修复**
2. ✅ `generateDailyGreeting` - 已有容错机制
3. ✅ `generateText` - 已有容错机制
4. ✅ `generateImage` - 已有容错机制
5. ✅ `generateVideo` - 已有容错机制

### 其他可能需要类似修复的方法

以下方法可能需要类似的容错机制（如果它们也支持多 provider）：

- `generateCharacterFromPrompt` - 使用 `generateText`，已有容错
- `generateSceneDescription` - 使用 `generateText`，已有容错
- `generateWisdomEcho` - 使用 `generateText`，已有容错
- `generateMirrorInsight` - 使用 `generateText`，已有容错

## 注意事项

1. `getSession` 方法中仍然会检查 API key，如果缺失会抛出错误，但这个错误会被 `sendMessageStream` 的 catch 块捕获，然后继续尝试下一个 provider。

2. 错误日志会记录到 `console.error`，这是合理的，因为这是错误情况。

3. 如果所有 provider 都失败，最终会抛出一个包含所有失败信息的错误。

## 构建验证

✅ 构建成功，无编译错误
✅ 无 Linter 错误




