# HSMem API 客户端

## 概述

HSMem API 客户端用于在客户端中调用 hsmem 服务的 REST API，实现记忆提取功能。

## 配置

### 环境变量

```bash
# .env 或 .env.local
VITE_HSMEM_BASE_URL=http://localhost:8000
```

如果不设置，默认使用 `http://localhost:8000`。

## API 方法

### 记忆化对话
```typescript
await hsmemApi.memorizeConversation({
  messages: [
    { role: 'user', content: '用户消息' },
    { role: 'assistant', content: 'AI回复' }
  ],
  user_id: 'user_123',
  agent_id: 'character_456'
});
```

### 记忆化文本
```typescript
await hsmemApi.memorizeText({
  text: '文本内容',
  context: { /* 上下文信息 */ },
  user_id: 'user_123'
});
```

### 记忆化文档
```typescript
await hsmemApi.memorizeDocument({
  title: '文档标题',
  content: '文档内容',
  author: '作者',
  user_id: 'user_123'
});
```

### 检索记忆
```typescript
await hsmemApi.retrieve({
  queries: [
    { role: 'user', content: { text: '查询文本' } }
  ],
  where: { user_id: 'user_123' },
  limit: 10
});
```

## 集成位置

### 1. 对话记忆提取

**位置**: `components/chat/hooks/useSystemIntegration.ts`

在用户发送消息时，自动提取最近5条消息的对话上下文到 hsmem 系统。

### 2. AI回复记忆提取

**位置**: `components/chat/utils/generateAIResponse.ts`

在 AI 回复完成后，将用户消息和 AI 回复的完整对话提取到 hsmem 系统。

### 3. 日志记忆提取

**位置**: `services/journal-memory-integration/JournalMemoryIntegration.ts`

在保存日志条目时，将日志内容（标题、内容、洞察、标签）提取到 hsmem 系统。

## 使用示例

### 在组件中使用

```typescript
import { hsmemApi } from '../services/api/hsmem/hsmemApi';

// 提取对话记忆
const result = await hsmemApi.memorizeConversation({
  messages: [
    { role: 'user', content: '你好' },
    { role: 'assistant', content: '你好！很高兴认识你' }
  ],
  user_id: `user_${userProfile.id}`
});
```

## 错误处理

所有 API 调用都包含错误处理，失败时不会影响主流程，只记录错误日志。

## 注意事项

1. **异步处理**: 所有记忆提取都是异步的，不会阻塞主流程
2. **错误容忍**: 如果 hsmem 服务不可用，不会影响正常功能
3. **用户ID格式**: 使用 `user_{userId}` 格式作为 user_id
4. **角色ID格式**: 使用 `character_{characterId}` 格式作为 agent_id
