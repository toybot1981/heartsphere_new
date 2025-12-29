# Context Engine 使用指南

## 概述

Context Engine 是 HeartSphere AI Studio 的核心组件，负责管理 AI Agent 的对话上下文，实现多轮对话记忆和上下文优化。

## 功能特性

- ✅ **对话记忆管理**：使用 Redis 存储短期对话历史
- ✅ **智能上下文优化**：多种优化策略（滚动窗口、摘要、混合等）
- ✅ **Token 管理**：自动估算和优化 token 使用
- ✅ **会话管理**：完整的会话生命周期管理
- ✅ **REST API**：完整的 REST API 接口

## 架构

```
Agent → ContextManager → ContextOptimizer → ChatMemory (Redis)
                     ↓
              OptimizedContext
```

## 核心组件

### 1. ContextManager
核心上下文管理器，提供以下功能：
- 会话初始化和管理
- 消息添加和检索
- 上下文优化
- 会话统计

### 2. ChatMemory
对话记忆接口，当前实现：
- **RedisChatMemory**：使用 Redis List 存储对话历史

### 3. ContextOptimizer
上下文优化器，支持多种策略：
- **ROLLING_WINDOW**：滚动窗口，保留最近 N 条消息
- **SUMMARIZATION**：摘要策略，压缩旧消息为摘要
- **SEMANTIC_SELECTION**：语义选择，保留相关消息
- **IMPORTANCE_BASED**：基于重要性评分
- **HYBRID**：混合策略（推荐）

## 使用方法

### 方法一：通过 REST API 使用

#### 1. 初始化会话

```bash
POST /api/context/sessions
Content-Type: application/json

{
  "sessionId": "session-123",
  "userId": "user-456",
  "agentId": "agent-789"
}
```

响应：
```json
{
  "sessionId": "session-123",
  "userId": "user-456",
  "agentId": "agent-789",
  "status": "ACTIVE",
  "createdAt": "2025-12-26T10:00:00Z"
}
```

#### 2. 添加消息

```bash
POST /api/context/sessions/session-123/messages
Content-Type: application/json

{
  "content": "你好，请介绍一下自己",
  "type": "USER",
  "userId": "user-456"
}
```

#### 3. 获取消息

```bash
GET /api/context/sessions/session-123/messages?limit=10
```

#### 4. 获取优化后的上下文

```bash
GET /api/context/sessions/session-123/optimized?maxTokens=8000&strategy=HYBRID
```

#### 5. 转换为 Spring AI Messages

```bash
POST /api/context/sessions/session-123/to-spring-ai
Content-Type: application/json

{
  "optimized": true,
  "maxTokens": 8000
}
```

### 方法二：直接在代码中使用

#### 基础使用

```java
@Service
@RequiredArgsConstructor
public class MyAgentService {

    private final ContextManager contextManager;
    private final ChatModel chatModel;

    public String chat(String sessionId, String userId, String userMessage) {
        // 1. 初始化会话（如果不存在）
        if (!contextManager.sessionExists(sessionId)) {
            contextManager.initializeSession(sessionId, userId, "my-agent");
        }

        // 2. 添加用户消息
        ContextMessage userMsg = ContextMessage.user(userMessage, sessionId, userId);
        contextManager.addMessage(sessionId, userMsg);

        // 3. 获取优化后的上下文
        List<ContextMessage> context =
            contextManager.getOptimizedContext(sessionId, 8000);

        // 4. 转换为 Spring AI Messages
        List<Message> springAIMessages = contextManager.toSpringAIMessages(context);

        // 5. 添加当前用户消息
        springAIMessages.add(new UserMessage(userMessage));

        // 6. 调用 LLM
        Prompt prompt = new Prompt(springAIMessages);
        String response = chatModel.call(prompt).getResult().getOutput().getContent();

        // 7. 保存助手回复
        ContextMessage assistantMsg = ContextMessage.assistant(response, sessionId);
        contextManager.addMessage(sessionId, assistantMsg);

        return response;
    }
}
```

#### 在现有 Agent 中集成

```java
@Service
@RequiredArgsConstructor
public class ContextAwareAgent {

    private final ContextManager contextManager;
    private final ChatModel chatModel;

    public ChatResponse chat(String sessionId, String userId, String message) {
        // 获取历史上下文
        List<ContextMessage> history =
            contextManager.getOptimizedContext(sessionId, 4000);

        // 构建 Prompt
        List<Message> messages = new ArrayList<>();

        // 添加系统提示词
        messages.add(new SystemMessage("你是一个友好的AI助手。"));

        // 添加历史消息
        messages.addAll(contextManager.toSpringAIMessages(history));

        // 添加当前消息
        messages.add(new UserMessage(message));

        // 调用模型
        Prompt prompt = new Prompt(messages);
        ChatResponse response = chatModel.call(prompt);

        // 保存对话
        contextManager.addMessage(sessionId,
            ContextMessage.user(message, sessionId, userId));
        contextManager.addMessage(sessionId,
            ContextMessage.assistant(
                response.getResult().getOutput().getContent(),
                sessionId
            )
        );

        return response;
    }
}
```

## 配置说明

在 `application.yml` 中配置：

```yaml
aistudio:
  context:
    # 默认最大 token 数量
    default-max-tokens: 8000
    # 默认优化策略
    default-strategy: HYBRID

    # ChatMemory 配置
    chat-memory:
      # Redis 存储的最大消息数
      max-messages: 100
      # 消息过期时间（天）
      ttl-days: 7
      # 压缩阈值
      compression-threshold: 0.7

    # 优化器配置
    optimizer:
      # 启用摘要生成
      summarization-enabled: true
      # 摘要最大 token 数
      max-summary-tokens: 500
```

## 优化策略选择建议

| 场景 | 推荐策略 | 说明 |
|------|---------|------|
| 普通对话 | HYBRID | 平衡历史摘要和最近消息 |
| 任务执行 | IMPORTANCE_BASED | 保留重要的任务相关消息 |
| 长对话 | SUMMARIZATION | 压缩旧消息为摘要 |
| 简单聊天 | ROLLING_WINDOW | 简单高效，只保留最近消息 |

## Token 估算

Context Engine 使用简单的 token 估算：

- **中文**：约 1.5 字符/token
- **英文**：约 4 字符/token
- **默认估算**：1 token ≈ 3 字符

```java
ContextMessage message = ContextMessage.user("你好世界", "session-1", "user-1");
int estimatedTokens = message.estimateTokens();
// 结果：约 2 tokens
```

## 会话管理

### 获取会话统计

```bash
GET /api/context/sessions/session-123/stats
```

响应：
```json
{
  "sessionId": "session-123",
  "userId": "user-456",
  "agentId": "agent-789",
  "messageCount": 42,
  "totalTokens": 12345,
  "maxTokens": 8000,
  "tokenUsageRate": 1.54,
  "status": "ACTIVE",
  "createdAt": "2025-12-26T10:00:00Z",
  "lastActiveAt": "2025-12-26T11:30:00Z"
}
```

### 归档会话

```bash
POST /api/context/sessions/session-123/archive
```

### 删除会话

```bash
DELETE /api/context/sessions/session-123
```

## 高级用法

### 自定义优化策略

```java
public List<ContextMessage> customOptimization(String sessionId) {
    List<ContextMessage> allMessages = contextManager.getAllMessages(sessionId);

    // 自定义逻辑：只保留包含特定关键词的消息
    List<ContextMessage> filtered = allMessages.stream()
        .filter(msg -> msg.getText().contains("重要"))
        .collect(Collectors.toList());

    return filtered;
}
```

### 消息重要性评分

```java
ContextMessage message = ContextMessage.builder()
    .messageType(MessageType.USER)
    .content("这是一个重要的问题")
    .sessionId("session-1")
    .userId("user-1")
    .importance(0.9) // 设置重要性为 0.9
    .build();

contextManager.addMessage("session-1", message);
```

## 性能优化建议

1. **合理设置 maxMessages**：Redis 存储上限建议 100-200 条
2. **选择合适的优化策略**：普通对话用 HYBRID，简单场景用 ROLLING_WINDOW
3. **定期归档旧会话**：避免 Redis 内存占用过大
4. **监控 token 使用率**：当 tokenUsageRate > 1.5 时考虑优化

## 故障排查

### Redis 连接失败

检查 Redis 配置：
```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
```

### Token 估算不准

Context Engine 使用简化估算，如需精确值：
1. 使用实际的 tokenizer（如 tiktoken）
2. 或在消息中手动设置 `tokenCount`

### 摘要生成失败

检查：
1. ChatModel 是否正确配置
2. API Key 是否有效
3. 模型是否支持摘要生成

## 下一步

- [ ] 实现 LongMemory（长期记忆）
- [ ] 集成向量数据库实现语义检索
- [ ] 实现跨会话上下文迁移
- [ ] 添加更多优化策略

## 参考资料

- [Spring AI Alibaba Chat Memory](https://java2ai.com/en/ecosystem/spring-ai/reference/memory)
- [Redis 作为 ChatMemory 实现](https://www.codefather.cn/post/1946572806644772865)
- [Anthropic: Effective Context Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
