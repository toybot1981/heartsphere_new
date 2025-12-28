# Context Engine v2 - 增强功能说明

## 概述

Context Engine v2 在原有基础上增加了长期记忆（LongMemory）能力，使 AI Agent 能够：
- 记住用户的重要信息（姓名、偏好、历史等）
- 从对话中自动提取和保存事实
- 基于历史经验改进决策
- 提供更个性化的对话体验

## 新增功能

### 1. 长期记忆存储

#### 用户偏好（UserPreference）
存储用户的个性化设置和偏好。

**数据模型：**
```java
{
  "userId": "user-001",
  "key": "language",
  "value": "zh-CN",
  "type": "STRING",
  "confidence": 0.9,
  "updatedAt": "2025-12-26T10:00:00Z"
}
```

**支持的类型：**
- STRING - 字符串
- NUMBER - 数字
- BOOLEAN - 布尔值
- JSON - JSON对象
- LIST - 列表
- RATING - 评分（1-5）

#### 重要事实（UserFact）
从对话中提取的重要信息。

**数据模型：**
```java
{
  "userId": "user-001",
  "fact": "名字: 张三",
  "category": "PERSONAL",
  "importance": 0.9,
  "confidence": 0.8,
  "sourceSessionId": "session-123",
  "createdAt": "2025-12-26T10:00:00Z"
}
```

**事实类别：**
- PERSONAL - 个人信息（姓名、年龄等）
- PREFERENCE - 偏好（喜好、厌恶等）
- HISTORY - 历史事件
- RELATIONSHIP - 人际关系
- WORK - 工作相关
- HEALTH - 健康信息
- FINANCE - 财务信息
- LOCATION - 位置信息
- CONTACT - 联系方式
- SKILL - 技能
- GOAL - 目标
- HABIT - 习惯

#### 决策记录（Episode）
记录 Agent 的重要决策和结果。

**数据模型：**
```java
{
  "userId": "user-001",
  "sessionId": "session-123",
  "type": "TASK_COMPLETION",
  "description": "帮助用户预订机票",
  "actions": ["搜索航班", "比较价格", "完成预订"],
  "outcome": "成功预订",
  "success": true,
  "reward": 0.8,
  "timestamp": "2025-12-26T10:00:00Z"
}
```

### 2. 自动事实提取

Context Engine v2 会自动从用户消息中提取重要事实：

```java
// 用户说："我叫张三，是一名软件工程师"
// 自动提取：
// - fact: "名字: 张三", category: PERSONAL
// - fact: "职业: 软件工程师", category: WORK
```

**提取规则：**
- 检测"我叫"、"我的名字是" → 提取姓名
- 检测"我喜欢"、"我不喜欢" → 提取偏好
- 检测"工作"、"公司" → 提取工作信息

*注：当前使用简化规则，生产环境建议使用 NLP 模型*

### 3. 智能上下文检索

增强的上下文检索会自动包含相关的长期记忆：

```java
List<ContextMessage> context = enhancedContextManager.getEnhancedContext(
    "session-123",
    8000
);

// 上下文包含：
// 1. 重要事实摘要（系统消息）
// 2. 相关的历史决策
// 3. 对话历史
// 4. 优化后的总 token 数在限制内
```

### 4. 事实衰减与重要性评分

系统会自动计算事实的衰减重要性：

```java
double decayedImportance = fact.getDecayedImportance();
// 考虑因素：
// - 原始重要性评分
// - 时间衰减（7天衰减一半）
// - 访问频率加成
```

**清理规则：**
- 30天未访问的偏好 → 自动删除
- 衰减重要性 < 0.2 的事实 → 自动删除

## REST API

### 用户偏好管理

#### 保存偏好
```bash
POST /api/memory/preferences
Content-Type: application/json

{
  "userId": "user-001",
  "key": "language",
  "value": "zh-CN",
  "type": "STRING",
  "confidence": 0.9
}
```

#### 获取偏好
```bash
GET /api/memory/preferences/user-001/language
```

#### 获取所有偏好
```bash
GET /api/memory/preferences/user-001
```

#### 删除偏好
```bash
DELETE /api/memory/preferences/user-001/language
```

### 事实管理

#### 保存事实
```bash
POST /api/memory/facts
Content-Type: application/json

{
  "userId": "user-001",
  "fact": "喜欢喝咖啡",
  "category": "PREFERENCE",
  "importance": 0.7,
  "confidence": 0.8,
  "sourceSessionId": "session-123"
}
```

#### 批量保存事实
```bash
POST /api/memory/facts/batch
Content-Type: application/json

[
  {
    "userId": "user-001",
    "fact": "名字: 张三",
    "category": "PERSONAL",
    "importance": 0.9
  },
  {
    "userId": "user-001",
    "fact": "职业: 软件工程师",
    "category": "WORK",
    "importance": 0.7
  }
]
```

#### 获取所有事实
```bash
GET /api/memory/facts/user-001
```

#### 按类别获取事实
```bash
GET /api/memory/facts/user-001/category/PERSONAL
```

#### 获取重要事实
```bash
GET /api/memory/facts/user-001/important?minImportance=0.7
```

#### 搜索事实
```bash
GET /api/memory/facts/user-001/search?query=咖啡&limit=5
```

### Episode 管理

#### 保存 Episode
```bash
POST /api/memory/episodes
Content-Type: application/json

{
  "userId": "user-001",
  "sessionId": "session-123",
  "type": "TASK_COMPLETION",
  "description": "帮助用户预订机票",
  "actions": ["搜索航班", "比较价格", "完成预订"],
  "outcome": "成功预订 CA1234 航班",
  "success": true,
  "reward": 0.8
}
```

#### 获取所有 Episodes
```bash
GET /api/memory/episodes/user-001
```

#### 获取成功的 Episodes
```bash
GET /api/memory/episodes/user-001/successful
```

#### 获取失败的 Episodes
```bash
GET /api/memory/episodes/user-001/failed
```

#### 搜索相似 Episodes
```bash
GET /api/memory/episodes/user-001/similar?query=预订机票&limit=5
```

### 增强上下文

#### 获取增强上下文（含长期记忆）
```bash
GET /api/memory/enhanced/session-123?maxTokens=8000
```

**响应示例：**
```json
{
  "sessionId": "session-123",
  "maxTokens": 8000,
  "messageCount": 15,
  "estimatedTokens": 2340,
  "messages": [
    {
      "messageType": "SYSTEM",
      "content": "[用户重要信息]\n- PERSONAL: 名字: 张三; 职业: 软件工程师\n- PREFERENCE: 喜欢喝咖啡; 喜欢编程",
      ...
    },
    // ... 历史对话消息
  ]
}
```

### 数据管理

#### 清理过期数据
```bash
POST /api/memory/cleanup/user-001
```

**响应：**
```json
{
  "status": "success",
  "deletedCount": 5
}
```

#### 清除所有长期记忆
```bash
DELETE /api/memory/user-001
```

## 使用示例

### 示例1：保存用户偏好

```java
// 用户选择语言
enhancedContextManager.saveUserPreference(
    "user-001",
    "language",
    "zh-CN",
    UserPreference.PreferenceType.STRING,
    0.9
);

// 用户设置主题
enhancedContextManager.saveUserPreference(
    "user-001",
    "theme",
    "dark",
    UserPreference.PreferenceType.STRING,
    0.8
);
```

### 示例2：记录决策

```java
// Agent 成功完成任务
enhancedContextManager.recordEpisode(
    "session-123",
    "帮助用户预订从北京到上海的机票",
    List.of("搜索航班", "比较价格", "完成预订"),
    "成功预订 CA1234，价格 ¥800",
    true,  // 成功
    0.8    // 奖励
);
```

### 示例3：使用增强上下文

```java
@Service
@RequiredArgsConstructor
public class MyAgentService {

    private final EnhancedContextManager contextManager;
    private final ChatModel chatModel;

    public String chat(String sessionId, String userId, String message) {
        // 1. 初始化会话
        if (!contextManager.sessionExists(sessionId)) {
            contextManager.initializeSession(sessionId, userId, "my-agent");
        }

        // 2. 添加用户消息（自动提取事实）
        contextManager.addMessageWithFactExtraction(
            sessionId,
            ContextMessage.user(message, sessionId, userId)
        );

        // 3. 获取增强上下文（包含长期记忆）
        List<ContextMessage> context =
            contextManager.getEnhancedContext(sessionId, 8000);

        // 4. 转换为 Spring AI Messages
        List<Message> messages = contextManager.toSpringAIMessages(context);
        messages.add(new UserMessage(message));

        // 5. 调用 LLM
        String response = chatModel.call(new Prompt(messages))
            .getResult()
            .getOutput()
            .getText();

        // 6. 保存回复并记录决策
        contextManager.addMessage(sessionId,
            ContextMessage.assistant(response, sessionId));

        // 7. 记录决策（简化版）
        if (message.contains("预订") || message.contains("购买")) {
            contextManager.recordEpisode(
                sessionId,
                "处理用户请求: " + message.substring(0, 50),
                List.of("理解意图", "执行操作", "生成回复"),
                "生成回复: " + response.substring(0, 50),
                true,
                0.7
            );
        }

        return response;
    }
}
```

## MongoDB 集合结构

Context Engine v2 使用以下 MongoDB 集合：

### user_preferences
```javascript
{
  "_id": ObjectId("..."),
  "userId": "user-001",
  "key": "language",
  "value": "zh-CN",
  "type": "STRING",
  "confidence": 0.9,
  "updatedAt": ISODate("2025-12-26T10:00:00Z"),
  "accessCount": 5,
  "lastAccessedAt": ISODate("2025-12-26T12:00:00Z")
}
```

### user_facts
```javascript
{
  "_id": ObjectId("..."),
  "userId": "user-001",
  "fact": "名字: 张三",
  "category": "PERSONAL",
  "importance": 0.9,
  "confidence": 0.8,
  "createdAt": ISODate("2025-12-26T10:00:00Z"),
  "lastAccessedAt": ISODate("2025-12-26T12:00:00Z"),
  "accessCount": 3,
  "sourceSessionId": "session-123",
  "sourceMessageId": "msg-456",
  "entities": ["张三"],
  "embedding": [0.1, 0.2, ...]  // 可选，用于语义搜索
}
```

### episodes
```javascript
{
  "_id": ObjectId("..."),
  "userId": "user-001",
  "sessionId": "session-123",
  "type": "TASK_COMPLETION",
  "description": "帮助用户预订机票",
  "actions": ["搜索航班", "比较价格", "完成预订"],
  "observations": { "destination": "上海", "date": "2025-01-01" },
  "outcome": "成功预订 CA1234",
  "success": true,
  "reward": 0.8,
  "timestamp": ISODate("2025-12-26T10:00:00Z"),
  "agentId": "agent-001",
  "toolCalls": [...],
  "tokensUsed": 1500,
  "durationMs": 3000,
  "tags": ["travel", "booking"],
  "embedding": [0.1, 0.2, ...]
}
```

## 性能考虑

### MongoDB 索引建议

```javascript
// user_preferences 索引
db.user_preferences.createIndex({ userId: 1, key: 1 }, { unique: true })
db.user_preferences.createIndex({ userId: 1, updatedAt: -1 })

// user_facts 索引
db.user_facts.createIndex({ userId: 1, category: 1 })
db.user_facts.createIndex({ userId: 1, importance: -1 })
db.user_facts.createIndex({ userId: 1, "fact": "text" })  // 文本搜索

// episodes 索引
db.episodes.createIndex({ userId: 1, type: 1 })
db.episodes.createIndex({ userId: 1, success: 1 })
db.episodes.createIndex({ userId: 1, timestamp: -1 })
db.episodes.createIndex({ userId: 1, "description": "text" })  // 文本搜索
```

### 查询优化

1. **限制返回数量** - 所有查询都应使用 limit
2. **分页** - 对于大量数据使用 skip + limit
3. **投影** - 只返回需要的字段
4. **索引覆盖** - 确保查询使用索引

## 最佳实践

### 1. 事实提取

**当前实现（简化版）：**
```java
private List<UserFact> extractFactsFromText(String text, String userId, String sessionId) {
    // 基于规则匹配
}
```

**生产环境建议：**
```java
// 使用 LLM 提取事实
String prompt = """
从以下对话中提取重要事实，返回 JSON 格式：
{text}

请提取：姓名、偏好、工作、重要事件等
""";

ChatResponse response = chatModel.call(new Prompt(prompt));
String json = response.getResult().getOutput().getText();
List<UserFact> facts = parseFactsFromJson(json);
```

### 2. 重要性评分

```java
// 基于多个因素计算重要性
double importance = calculateImportance(fact);
// - 用户明确提及 → +0.3
// - 重复提及 → +0.2
// - 高置信度 → +0.1
// - 敏感信息 → +0.2
```

### 3. 定期清理

```java
// 每天清理过期数据
@Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
public void scheduledCleanup() {
    List<String> userIds = getAllActiveUsers();
    for (String userId : userIds) {
        int deleted = cleanupExpiredData(userId);
        log.info("Cleaned {} expired records for user {}", deleted, userId);
    }
}
```

## 迁移指南

### 从 v1 升级到 v2

1. **保持向后兼容**
```java
// v1 API 仍然可用
@Autowired
private ContextManager contextManager;  // v1

// v2 API 提供增强功能
@Autowired
private EnhancedContextManager enhancedContextManager;  // v2
```

2. **逐步迁移**
```java
// 第一阶段：使用 v1 + 手动保存事实
contextManager.addMessage(sessionId, message);
longMemory.saveFact(manuallyExtractedFact);

// 第二阶段：使用 v2 自动提取
enhancedContextManager.addMessageWithFactExtraction(sessionId, message);
```

3. **数据迁移**
```java
// 从 Redis ChatMemory 提取历史对话
List<ContextMessage> history = chatMemory.getAll(sessionId);

// 批量提取事实
List<UserFact> facts = extractFactsBatch(history);
longMemory.saveFacts(facts);
```

## 故障排查

### MongoDB 连接失败

```yaml
# application.yml
spring:
  data:
    mongodb:
      host: localhost
      port: 27017
      database: aistudio
```

检查：
```bash
# 测试连接
mongo aistudio --eval "db.user_preferences.count()"

# 检查日志
tail -f /tmp/aistudio-test.log | grep -i mongo
```

### 事实未提取

检查日志：
```bash
grep "Extracted and saved" /tmp/aistudio-test.log
```

确保：
1. 使用 `addMessageWithFactExtraction()` 而不是 `addMessage()`
2. 消息类型是 USER
3. 文本包含触发词（"我叫"、"我喜欢"等）

### 上下文不包含事实

检查：
```bash
GET /api/memory/facts/user-001
GET /api/memory/enhanced/session-123
```

确保：
1. 事实已被提取并保存
2. 事实重要性 > 0.5
3. 事实未过期

## 总结

Context Engine v2 提供了：

✅ **长期记忆存储** - MongoDB 持久化
✅ **自动事实提取** - 从对话中学习
✅ **智能上下文检索** - 结合短期和长期记忆
✅ **决策记录** - 从历史中学习
✅ **数据管理** - 自动清理过期数据
✅ **完整 REST API** - 18 个新端点

这些功能使 AI Agent 能够提供更个性化、更智能的对话体验！
