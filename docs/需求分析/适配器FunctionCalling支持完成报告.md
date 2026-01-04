# 适配器 Function Calling 支持完成报告

## ✅ 已完成任务

### 1. QwenAdapter Function Calling 支持 ✅

**文件**：`frontend/services/ai/adapters/QwenAdapter.ts`

**主要改进**：
- ✅ 添加 `processStreamWithFunctionCalls` 递归方法
- ✅ 支持 Function Calling 的流式响应
- ✅ 支持多个 function call 的链式调用
- ✅ 完整的消息历史管理

### 2. DoubaoAdapter Function Calling 支持 ✅

**文件**：`frontend/services/ai/adapters/DoubaoAdapter.ts`

**主要改进**：
- ✅ 添加 `processStreamWithFunctionCalls` 递归方法
- ✅ 支持 Function Calling 的流式响应
- ✅ 支持多个 function call 的链式调用
- ✅ 完整的消息历史管理

---

## 二、实现细节

### 2.1 架构设计

**实现方式**：
- 与 OpenAIAdapter 保持一致的设计
- 使用相同的递归处理机制
- 支持 OpenAI 兼容的 Function Calling API

**关键特性**：
- ✅ 递归深度限制（默认 10 层）
- ✅ 错误处理机制
- ✅ 流式响应连续性
- ✅ 消息历史自动管理

### 2.2 工作流程

```
1. generateTextStream 初始化消息历史
   ↓
2. processStreamWithFunctionCalls 发送请求
   ↓
3. 流式接收响应
   ↓
4. 检测到 function_call？
   ├─ 是 → 执行 function call
   │        ↓
   │     将结果添加到消息历史
   │        ↓
   │     递归调用 processStreamWithFunctionCalls
   │        ↓
   │     继续流式响应
   │
   └─ 否 → 直接返回响应
```

### 2.3 API 兼容性

**QwenAdapter**：
- 使用 OpenAI 兼容的 API 格式
- 支持 `tools` 字段定义函数
- 支持 `function_call` 在流式响应中

**DoubaoAdapter**：
- 使用 OpenAI 兼容的 API 格式
- 支持 `tools` 字段定义函数
- 支持 `function_call` 在流式响应中

---

## 三、已支持的适配器

### 3.1 完整支持列表

1. ✅ **OpenAIAdapter** - 完整支持 Function Calling
2. ✅ **QwenAdapter** - 完整支持 Function Calling
3. ✅ **DoubaoAdapter** - 完整支持 Function Calling
4. ⚠️ **GeminiAdapter** - 待实现（使用不同的 API 格式）

### 3.2 功能对比

| 适配器 | Function Calling | 递归调用 | 流式响应 | 消息历史管理 |
|--------|-----------------|---------|---------|-------------|
| OpenAI | ✅ | ✅ | ✅ | ✅ |
| Qwen   | ✅ | ✅ | ✅ | ✅ |
| Doubao | ✅ | ✅ | ✅ | ✅ |
| Gemini | ⚠️ | ⚠️ | ✅ | ⚠️ |

---

## 四、代码示例

### 4.1 QwenAdapter Function Calling

```typescript
// 使用方式与 OpenAIAdapter 相同
await qwenAdapter.generateTextStream({
  prompt: "用户消息",
  systemInstruction: "系统指令",
  functionDefinitions: [
    {
      name: "skill-name",
      description: "技能描述",
      parameters: { /* JSON Schema */ }
    }
  ],
  onFunctionCall: async (functionCall) => {
    // 执行技能
    return skillResult;
  }
}, onChunk);
```

### 4.2 DoubaoAdapter Function Calling

```typescript
// 使用方式与 OpenAIAdapter 相同
await doubaoAdapter.generateTextStream({
  prompt: "用户消息",
  systemInstruction: "系统指令",
  functionDefinitions: [
    {
      name: "skill-name",
      description: "技能描述",
      parameters: { /* JSON Schema */ }
    }
  ],
  onFunctionCall: async (functionCall) => {
    // 执行技能
    return skillResult;
  }
}, onChunk);
```

---

## 五、技术细节

### 5.1 递归处理机制

所有适配器使用相同的递归处理模式：

```typescript
private async processStreamWithFunctionCalls(
  model: string,
  messages: Array<any>,
  request: TextGenerationRequest,
  onChunk: (chunk: TextGenerationChunk) => void,
  depth: number,
  maxDepth: number
): Promise<void>
```

**参数说明**：
- `model`: AI 模型名称
- `messages`: 消息历史（动态更新）
- `request`: 原始请求
- `onChunk`: 流式响应回调
- `depth`: 当前递归深度
- `maxDepth`: 最大递归深度（默认 10）

### 5.2 Function Call 处理

```typescript
// 检测到 function_call
if (finishReason === 'function_call' && functionCallBuffer && request.onFunctionCall) {
  // 1. 将 assistant message 添加到历史
  messages.push(assistantMessage);
  
  // 2. 执行 function call
  const functionResult = await request.onFunctionCall(functionCallBuffer);
  
  // 3. 将 function call 结果添加到消息历史
  messages.push({
    role: 'function',
    name: functionCallBuffer.name,
    content: JSON.stringify(functionResult),
  });

  // 4. 递归调用以继续流式响应
  await this.processStreamWithFunctionCalls(
    model,
    messages,
    request,
    onChunk,
    depth + 1,
    maxDepth
  );
}
```

---

## 六、待实现功能

### 6.1 GeminiAdapter Function Calling ⚠️

**当前状态**：未实现

**原因**：
- Gemini 使用不同的 API 格式
- 需要使用 `tools` 字段，但格式不同
- Function Calling 响应格式也不同

**实现计划**：
1. 研究 Gemini Function Calling API
2. 实现 Gemini 特定的工具定义格式
3. 处理 Gemini 的 function call 响应格式
4. 实现递归调用机制

### 6.2 错误处理增强 ⚠️

**需要完善**：
- Function call 超时处理
- 网络错误重试机制
- 更详细的错误日志
- 适配器特定的错误处理

### 6.3 性能优化 ⚠️

**需要添加**：
- Function call 执行时间统计
- 递归深度监控
- 性能指标收集
- 缓存机制

---

## 七、文件清单

### 已修改的文件

1. ✅ `frontend/services/ai/adapters/QwenAdapter.ts` - 添加 Function Calling 支持
2. ✅ `frontend/services/ai/adapters/DoubaoAdapter.ts` - 添加 Function Calling 支持

---

## 八、验证清单

- [x] QwenAdapter Function Calling 已实现
- [x] DoubaoAdapter Function Calling 已实现
- [x] 递归处理方法已实现
- [x] Function call 检测和处理
- [x] 消息历史管理
- [x] 流式响应继续
- [x] 递归深度限制
- [x] 错误处理
- [x] 代码编译通过
- [ ] GeminiAdapter Function Calling（待实现）

---

## 九、注意事项

### 9.1 API 兼容性

⚠️ **OpenAI 兼容 API**
- Qwen 和 Doubao 使用 OpenAI 兼容的 API
- 实现方式与 OpenAIAdapter 相同
- 确保 API 版本兼容

### 9.2 递归深度

⚠️ **最大深度限制**
- 默认 10 层，可根据需要调整
- 超过深度时会记录警告并停止
- 建议根据实际使用场景调整

### 9.3 性能考虑

⚠️ **多次 Function Call**
- 多个 function call 会增加响应时间
- 建议优化技能执行速度
- 考虑并行执行（如果支持）

---

## 十、下一步计划

### 10.1 GeminiAdapter 支持

- [ ] 研究 Gemini Function Calling API
- [ ] 实现 Gemini 特定的工具定义
- [ ] 处理 Gemini function call 响应
- [ ] 实现递归调用机制

### 10.2 错误处理增强

- [ ] 添加超时处理
- [ ] 实现重试机制
- [ ] 完善错误日志
- [ ] 适配器特定错误处理

### 10.3 性能优化

- [ ] 添加性能监控
- [ ] 实现缓存机制
- [ ] 优化递归调用
- [ ] 减少不必要的请求

---

**完成时间**：2025-01-04  
**下一步**：实现 GeminiAdapter Function Calling 支持
