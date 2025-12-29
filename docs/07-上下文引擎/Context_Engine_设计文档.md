# Context Engine 设计文档

**文档版本**: V1.0  
**编写日期**: 2025-12-22  
**系统名称**: Context Engine - 支持长记忆和短记忆的上下文管理引擎  
**目标**: 设计一个完整的上下文管理引擎，支持短期记忆和长期记忆，为AI Agent提供完整的上下文能力

---

## 一、需求概述

### 1.1 背景

Context Engine是AI Agent系统的核心组件，负责管理对话上下文、用户记忆和知识。一个完整的Context Engine需要支持：

1. **短期记忆（Short-term Memory）**：管理当前对话会话的上下文
2. **长期记忆（Long-term Memory）**：存储和检索用户的持久化信息

### 1.2 理论基础

参考认知科学的记忆理论，人类记忆系统具有以下特点：

**短期记忆（Short-term Memory）**：
- **容量限制**：7±2个信息块（Miller's Law）
- **保持时间**：几秒到几分钟
- **易遗忘**：如果不进行复述，会快速遗忘
- **工作记忆**：需要工作记忆参与处理和操作

**长期记忆（Long-term Memory）**：
- **容量**：几乎无限
- **保持时间**：从几天到终身
- **巩固过程**：需要从短期记忆经过巩固过程转为长期记忆
- **检索机制**：通过关联、上下文、线索进行检索

**记忆巩固（Memory Consolidation）**：
- 重要信息从短期记忆转移到长期记忆
- 需要重复、强化、关联
- 睡眠和休息有助于巩固

**记忆检索（Memory Retrieval）**：
- 通过线索（cue）触发
- 上下文相关检索（context-dependent retrieval）
- 关联检索（associative retrieval）

### 1.3 设计目标

- ✅ **双层记忆架构**：清晰区分短期记忆和长期记忆，符合认知科学原理
- ✅ **容量管理**：短期记忆遵循容量限制原则（类似7±2）
- ✅ **记忆巩固**：实现从短期记忆到长期记忆的巩固机制
- ✅ **高效检索**：基于上下文和关联的快速记忆检索
- ✅ **自动提取**：自动从对话中提取重要信息并存储
- ✅ **记忆关联**：建立记忆之间的关联关系，支持关联检索
- ✅ **记忆衰减**：实现记忆的时间衰减机制
- ✅ **工作记忆**：支持工作记忆（临时处理和操作信息）
- ✅ **可扩展性**：支持不同类型的记忆和存储方式

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Context Engine                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  Short Memory    │         │   Long Memory    │          │
│  │  (短期记忆)      │         │   (长期记忆)     │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ • Conversation   │         │ • User Facts     │          │
│  │ • Working Memory │         │ • Preferences    │          │
│  │ • Context Window │         │ • Episodes       │          │
│  │ • Session State  │         │ • Memories       │          │
│  └──────────────────┘         └──────────────────┘          │
│           │                              │                   │
│           └──────────┬───────────────────┘                   │
│                      │                                       │
│           ┌──────────▼───────────────────┐                   │
│           │    Memory Manager            │                   │
│           │  (记忆管理器)                │                   │
│           ├──────────────────────────────┤                   │
│           │ • Memory Retrieval           │                   │
│           │ • Memory Storage             │                   │
│           │ • Memory Consolidation       │                   │
│           │ • Memory Decay               │                   │
│           └──────────────────────────────┘                   │
│                      │                                       │
│           ┌──────────▼───────────────────┐                   │
│           │    Storage Layer             │                   │
│           │  (存储层)                    │                   │
│           ├──────────────────────────────┤                   │
│           │ • Redis (Short Memory)       │                   │
│           │ • MongoDB (Long Memory)      │                   │
│           │ • MySQL (Metadata)           │                   │
│           └──────────────────────────────┘                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 核心组件

1. **ShortMemory（短期记忆）**
   - 管理当前会话的上下文
   - 使用Redis等高速缓存存储
   - 自动清理过期数据

2. **LongMemory（长期记忆）**
   - 存储用户的持久化信息
   - 使用MongoDB等文档数据库存储
   - 支持复杂查询和关联

3. **MemoryManager（记忆管理器）**
   - 协调短期和长期记忆
   - 实现记忆检索、存储、整合
   - 处理记忆衰减和优先级

4. **StorageLayer（存储层）**
   - 抽象存储接口
   - 支持多种存储后端
   - 提供统一的数据访问接口

---

## 三、短期记忆（Short Memory）

### 3.1 功能定义

短期记忆用于管理当前对话会话的上下文信息，参考认知科学的短期记忆理论，具有以下特点：

- **临时性**：只在当前会话中有效，保持时间短（几秒到几小时）
- **快速访问**：需要高速读写，使用内存存储（Redis）
- **容量限制**：遵循"7±2"原则，限制上下文窗口大小（如最近10-20条消息）
- **自动清理**：会话结束后自动清理，或基于TTL自动过期
- **工作记忆**：支持临时处理和操作信息的工作记忆
- **注意力机制**：通过重要性评分筛选重要信息

**参考认知科学原理**：
- Miller's Law：人类短期记忆容量为7±2个信息块
- 我们限制短期记忆的消息数量（如20-50条），超过后触发摘要或转移到长期记忆
- 使用重要性评分筛选关键信息，模拟注意力机制

### 3.2 数据结构

```java
/**
 * 短期记忆接口
 */
public interface ShortMemory {
    
    /**
     * 保存对话消息
     */
    void saveMessage(String sessionId, ChatMessage message);
    
    /**
     * 获取对话历史
     */
    List<ChatMessage> getMessages(String sessionId, int limit);
    
    /**
     * 保存工作记忆（临时状态）
     */
    void saveWorkingMemory(String sessionId, String key, Object value);
    
    /**
     * 获取工作记忆
     */
    <T> T getWorkingMemory(String sessionId, String key, Class<T> type);
    
    /**
     * 清空会话记忆
     */
    void clearSession(String sessionId);
    
    /**
     * 获取会话摘要
     */
    String getSessionSummary(String sessionId);
}

/**
 * 对话消息
 */
@Data
@Builder
public class ChatMessage {
    private String id;
    private String sessionId;
    private MessageRole role; // USER, ASSISTANT, SYSTEM
    private String content;
    private Map<String, Object> metadata;
    private Long timestamp;
    private Double importance; // 重要性评分 (0.0-1.0)
    private List<String> extractedFacts; // 提取的事实ID列表
}

/**
 * 工作记忆
 */
@Data
@Builder
public class WorkingMemory {
    private String sessionId;
    private String key;
    private Object value;
    private Long timestamp;
    private Long ttl; // 过期时间（毫秒）
}
```

### 3.3 实现方案

#### 3.3.1 Redis实现

```java
@Component
@RequiredArgsConstructor
public class RedisShortMemory implements ShortMemory {
    
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String MESSAGE_KEY_PREFIX = "short:msg:";
    private static final String WORKING_MEMORY_PREFIX = "short:work:";
    private static final int DEFAULT_MESSAGE_TTL = 3600 * 24; // 24小时
    private static final int MAX_MESSAGES_PER_SESSION = 100;
    
    @Override
    public void saveMessage(String sessionId, ChatMessage message) {
        String key = MESSAGE_KEY_PREFIX + sessionId;
        
        // 使用List存储消息，按时间顺序
        redisTemplate.opsForList().rightPush(key, message);
        
        // 限制消息数量
        Long size = redisTemplate.opsForList().size(key);
        if (size != null && size > MAX_MESSAGES_PER_SESSION) {
            redisTemplate.opsForList().leftPop(key);
        }
        
        // 设置过期时间
        redisTemplate.expire(key, Duration.ofSeconds(DEFAULT_MESSAGE_TTL));
    }
    
    @Override
    public List<ChatMessage> getMessages(String sessionId, int limit) {
        String key = MESSAGE_KEY_PREFIX + sessionId;
        
        // 获取最新的limit条消息
        Long size = redisTemplate.opsForList().size(key);
        if (size == null || size == 0) {
            return Collections.emptyList();
        }
        
        int start = Math.max(0, (int)(size - limit));
        List<Object> messages = redisTemplate.opsForList().range(key, start, -1);
        
        return messages.stream()
            .map(msg -> (ChatMessage) msg)
            .collect(Collectors.toList());
    }
    
    @Override
    public void saveWorkingMemory(String sessionId, String key, Object value) {
        String redisKey = WORKING_MEMORY_PREFIX + sessionId + ":" + key;
        
        WorkingMemory workingMemory = WorkingMemory.builder()
            .sessionId(sessionId)
            .key(key)
            .value(value)
            .timestamp(System.currentTimeMillis())
            .ttl(DEFAULT_MESSAGE_TTL * 1000L)
            .build();
        
        redisTemplate.opsForValue().set(redisKey, workingMemory, 
            Duration.ofSeconds(DEFAULT_MESSAGE_TTL));
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public <T> T getWorkingMemory(String sessionId, String key, Class<T> type) {
        String redisKey = WORKING_MEMORY_PREFIX + sessionId + ":" + key;
        WorkingMemory workingMemory = (WorkingMemory) redisTemplate.opsForValue().get(redisKey);
        
        if (workingMemory == null) {
            return null;
        }
        
        return type.cast(workingMemory.getValue());
    }
    
    @Override
    public void clearSession(String sessionId) {
        // 删除所有会话相关的key
        String messageKey = MESSAGE_KEY_PREFIX + sessionId;
        String workingMemoryPattern = WORKING_MEMORY_PREFIX + sessionId + ":*";
        
        redisTemplate.delete(messageKey);
        
        Set<String> keys = redisTemplate.keys(workingMemoryPattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }
    
    @Override
    public String getSessionSummary(String sessionId) {
        List<ChatMessage> messages = getMessages(sessionId, 50);
        
        if (messages.isEmpty()) {
            return "";
        }
        
        // 使用AI生成会话摘要（可以异步处理）
        return generateSummary(messages);
    }
}
```

### 3.4 使用场景

1. **对话上下文管理**
   - 保存当前会话的对话历史
   - 提供对话上下文给AI模型
   - 限制上下文窗口大小

2. **工作记忆**
   - 临时存储对话中的关键信息
   - 跨轮对话的状态保持
   - 临时变量和计算结果

3. **会话状态**
   - 当前对话的主题
   - 用户意图和任务状态
   - 对话流程控制状态

---

## 四、长期记忆（Long Memory）

### 4.1 功能定义

长期记忆用于存储用户的持久化信息，参考认知科学的长期记忆理论，具有以下特点：

- **持久性**：长期保存，不会自动删除（除非用户主动删除或重要性过低）
- **结构化**：支持复杂的数据结构（用户事实、偏好、决策记录等）
- **可检索**：支持丰富的查询和检索（语义搜索、关联检索、上下文检索）
- **可关联**：支持记忆之间的关联关系（标签、主题、时间等）
- **记忆巩固**：重要信息从短期记忆经过巩固过程转为长期记忆
- **记忆衰减**：实现基于时间的记忆衰减，但重要记忆会被强化

**参考认知科学原理**：
- **巩固机制（Consolidation）**：通过重复、强化、关联将重要信息从短期记忆转为长期记忆
- **检索机制（Retrieval）**：通过线索（关键词、上下文、关联）触发记忆检索
- **关联记忆（Associative Memory）**：通过标签、主题、时间等建立记忆之间的关联
- **记忆衰减（Memory Decay）**：不常访问的记忆会随时间衰减，但重要记忆会通过访问强化

### 4.2 数据结构

```java
/**
 * 长期记忆接口
 */
public interface LongMemory {
    
    // ========== 用户偏好 ==========
    void savePreference(UserPreference preference);
    UserPreference getPreference(String userId, String key);
    List<UserPreference> getAllPreferences(String userId);
    void deletePreference(String userId, String key);
    
    // ========== 用户事实 ==========
    void saveFact(UserFact fact);
    void saveFacts(List<UserFact> facts);
    List<UserFact> getAllFacts(String userId);
    List<UserFact> getFactsByCategory(String userId, UserFact.FactCategory category);
    List<UserFact> getImportantFacts(String userId, double minImportance);
    List<UserFact> searchFacts(String userId, String query);
    
    // ========== 决策记录 ==========
    void saveEpisode(Episode episode);
    List<Episode> getEpisodes(String userId, Episode.EpisodeType type, int limit);
    List<Episode> getSuccessfulEpisodes(String userId, int limit);
    
    // ========== 记忆检索 ==========
    List<Memory> retrieveRelevantMemories(String userId, String query, int limit);
    List<Memory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit);
}

/**
 * 用户偏好
 */
@Data
@Document(collection = "user_preferences")
public class UserPreference {
    @Id
    private String id;
    private String userId;
    private String key;
    private Object value;
    private PreferenceType type; // STRING, NUMBER, BOOLEAN, JSON, LIST, RATING
    private Double confidence; // 置信度 (0.0-1.0)
    private Instant updatedAt;
    private Integer accessCount;
    private Instant lastAccessedAt;
    private Map<String, Object> metadata;
    
    public void recordAccess() {
        this.lastAccessedAt = Instant.now();
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
    }
}

/**
 * 用户事实
 */
@Data
@Document(collection = "user_facts")
public class UserFact {
    @Id
    private String id;
    private String userId;
    private String fact; // 事实描述
    private FactCategory category; // PERSONAL, PREFERENCE, HISTORY, etc.
    private Double importance; // 重要性 (0.0-1.0)
    private Double confidence; // 置信度 (0.0-1.0)
    private String sourceSessionId; // 来源会话ID
    private Instant createdAt;
    private Instant lastAccessedAt;
    private Integer accessCount;
    private List<String> tags; // 标签
    private Map<String, Object> metadata;
    
    /**
     * 计算衰减后的重要性
     */
    public double getDecayedImportance() {
        if (lastAccessedAt == null) {
            return importance;
        }
        
        // 时间衰减（7天衰减一半）
        long daysSinceLastAccess = Duration.between(lastAccessedAt, Instant.now()).toDays();
        double timeDecay = Math.exp(-daysSinceLastAccess / 7.0);
        
        // 访问频率加成
        double accessBonus = Math.log(1 + (accessCount == null ? 0 : accessCount)) / 10.0;
        
        return importance * timeDecay + accessBonus;
    }
    
    public enum FactCategory {
        PERSONAL,      // 个人信息
        PREFERENCE,    // 偏好
        HISTORY,       // 历史事件
        RELATIONSHIP,  // 人际关系
        WORK,          // 工作相关
        HEALTH,        // 健康信息
        FINANCE,       // 财务信息
        LOCATION,      // 位置信息
        CONTACT,       // 联系方式
        SKILL,         // 技能
        GOAL,          // 目标
        HABIT,         // 习惯
        OTHER          // 其他
    }
}

/**
 * 决策记录（Episode）
 */
@Data
@Document(collection = "episodes")
public class Episode {
    @Id
    private String id;
    private String userId;
    private String sessionId;
    private EpisodeType type; // TASK_COMPLETION, DECISION, INTERACTION, etc.
    private String description;
    private List<String> actions;
    private String outcome;
    private Boolean success;
    private Double reward; // 奖励值 (0.0-1.0)
    private Instant timestamp;
    private Map<String, Object> context;
    private Map<String, Object> metadata;
    
    public enum EpisodeType {
        TASK_COMPLETION,  // 任务完成
        DECISION,         // 决策
        INTERACTION,      // 交互
        ERROR,            // 错误
        SUCCESS           // 成功
    }
}

/**
 * 通用记忆接口
 */
public interface Memory {
    String getId();
    String getUserId();
    String getContent();
    Double getImportance();
    Double getRelevance(String query);
    Instant getTimestamp();
}
```

### 4.3 实现方案

#### 4.3.1 MongoDB实现

```java
@Component
@RequiredArgsConstructor
public class MongoLongMemory implements LongMemory {
    
    private final MongoTemplate mongoTemplate;
    
    // ========== 用户偏好管理 ==========
    
    @Override
    public void savePreference(UserPreference preference) {
        preference.setUpdatedAt(Instant.now());
        mongoTemplate.save(preference);
    }
    
    @Override
    public UserPreference getPreference(String userId, String key) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId))
             .addCriteria(Criteria.where("key").is(key));
        
        UserPreference preference = mongoTemplate.findOne(query, UserPreference.class);
        if (preference != null) {
            preference.recordAccess();
            mongoTemplate.save(preference);
        }
        
        return preference;
    }
    
    @Override
    public List<UserPreference> getAllPreferences(String userId) {
        Query query = new Query(Criteria.where("userId").is(userId));
        return mongoTemplate.find(query, UserPreference.class);
    }
    
    // ========== 用户事实管理 ==========
    
    @Override
    public void saveFact(UserFact fact) {
        if (fact.getCreatedAt() == null) {
            fact.setCreatedAt(Instant.now());
        }
        mongoTemplate.save(fact);
    }
    
    @Override
    public void saveFacts(List<UserFact> facts) {
        facts.forEach(fact -> {
            if (fact.getCreatedAt() == null) {
                fact.setCreatedAt(Instant.now());
            }
        });
        mongoTemplate.insertAll(facts);
    }
    
    @Override
    public List<UserFact> getAllFacts(String userId) {
        Query query = new Query(Criteria.where("userId").is(userId));
        return mongoTemplate.find(query, UserFact.class);
    }
    
    @Override
    public List<UserFact> getFactsByCategory(String userId, UserFact.FactCategory category) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId))
             .addCriteria(Criteria.where("category").is(category));
        return mongoTemplate.find(query, UserFact.class);
    }
    
    @Override
    public List<UserFact> getImportantFacts(String userId, double minImportance) {
        Query query = new Query(Criteria.where("userId").is(userId));
        List<UserFact> allFacts = mongoTemplate.find(query, UserFact.class);
        
        return allFacts.stream()
            .filter(fact -> fact.getDecayedImportance() >= minImportance)
            .sorted(Comparator.comparing(UserFact::getDecayedImportance).reversed())
            .collect(Collectors.toList());
    }
    
    @Override
    public List<UserFact> searchFacts(String userId, String query) {
        // 使用MongoDB文本搜索
        TextCriteria criteria = TextCriteria.forDefaultLanguage()
            .matchingAny(query);
        
        Query mongoQuery = new Query(criteria)
            .addCriteria(Criteria.where("userId").is(userId));
        
        return mongoTemplate.find(mongoQuery, UserFact.class);
    }
    
    // ========== 决策记录管理 ==========
    
    @Override
    public void saveEpisode(Episode episode) {
        if (episode.getTimestamp() == null) {
            episode.setTimestamp(Instant.now());
        }
        mongoTemplate.save(episode);
    }
    
    @Override
    public List<Episode> getEpisodes(String userId, Episode.EpisodeType type, int limit) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId));
        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        query.with(Sort.by(Sort.Direction.DESC, "timestamp"))
             .limit(limit);
        
        return mongoTemplate.find(query, Episode.class);
    }
    
    @Override
    public List<Episode> getSuccessfulEpisodes(String userId, int limit) {
        Query query = new Query();
        query.addCriteria(Criteria.where("userId").is(userId))
             .addCriteria(Criteria.where("success").is(true))
             .with(Sort.by(Sort.Direction.DESC, "reward"))
             .limit(limit);
        
        return mongoTemplate.find(query, Episode.class);
    }
    
    // ========== 记忆检索 ==========
    
    @Override
    public List<Memory> retrieveRelevantMemories(String userId, String query, int limit) {
        // 1. 搜索用户事实
        List<UserFact> facts = searchFacts(userId, query);
        
        // 2. 搜索用户偏好
        List<UserPreference> preferences = getAllPreferences(userId);
        
        // 3. 计算相关性并排序
        List<Memory> memories = new ArrayList<>();
        
        facts.forEach(fact -> {
            double relevance = calculateRelevance(fact.getFact(), query);
            memories.add(new FactMemory(fact, relevance));
        });
        
        preferences.forEach(pref -> {
            double relevance = calculateRelevance(pref.getKey() + " " + pref.getValue().toString(), query);
            memories.add(new PreferenceMemory(pref, relevance));
        });
        
        // 4. 按相关性排序并返回top N
        return memories.stream()
            .sorted(Comparator.comparing(Memory::getRelevance).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<Memory> retrieveMemoriesByContext(String userId, Map<String, Object> context, int limit) {
        // 基于上下文检索记忆
        // 可以根据context中的键值对匹配记忆的metadata
        Query query = new Query(Criteria.where("userId").is(userId));
        
        if (context.containsKey("category")) {
            query.addCriteria(Criteria.where("category").is(context.get("category")));
        }
        
        if (context.containsKey("tags")) {
            query.addCriteria(Criteria.where("tags").in(context.get("tags")));
        }
        
        List<UserFact> facts = mongoTemplate.find(query, UserFact.class);
        
        return facts.stream()
            .map(fact -> new FactMemory(fact, 1.0))
            .limit(limit)
            .collect(Collectors.toList());
    }
    
    private double calculateRelevance(String text, String query) {
        // 简单的关键词匹配相关性计算
        // 实际可以使用更复杂的算法（如TF-IDF、语义相似度等）
        String[] queryWords = query.toLowerCase().split("\\s+");
        String lowerText = text.toLowerCase();
        
        int matches = 0;
        for (String word : queryWords) {
            if (lowerText.contains(word)) {
                matches++;
            }
        }
        
        return matches / (double) queryWords.length;
    }
}
```

### 4.4 记忆检索优化

#### 4.4.1 向量检索（可选）

如果需要对记忆进行语义检索，可以集成向量数据库：

```java
/**
 * 向量记忆检索（使用向量数据库，如Milvus、Pinecone等）
 */
public interface VectorMemoryRetrieval {
    /**
     * 添加记忆向量
     */
    void addMemoryVector(String memoryId, float[] vector);
    
    /**
     * 向量检索
     */
    List<String> searchSimilarMemories(float[] queryVector, int topK);
}
```

#### 4.4.2 记忆索引

```java
/**
 * 记忆索引服务
 */
@Service
public class MemoryIndexService {
    
    /**
     * 为记忆建立索引
     */
    public void indexMemory(Memory memory) {
        // 1. 提取关键词
        List<String> keywords = extractKeywords(memory.getContent());
        
        // 2. 建立倒排索引
        for (String keyword : keywords) {
            indexKeyword(keyword, memory.getId());
        }
        
        // 3. 建立向量索引（如果支持）
        if (vectorRetrieval != null) {
            float[] vector = embedMemory(memory);
            vectorRetrieval.addMemoryVector(memory.getId(), vector);
        }
    }
    
    /**
     * 关键词检索
     */
    public List<String> searchByKeywords(String query) {
        List<String> keywords = extractKeywords(query);
        return findMemoriesByKeywords(keywords);
    }
}
```

---

## 五、记忆管理器（Memory Manager）

### 5.1 功能定义

Memory Manager是Context Engine的核心协调器，负责：

1. **记忆协调**：协调短期和长期记忆的交互
2. **记忆整合**：将短期记忆中的重要信息整合到长期记忆
3. **记忆检索**：智能检索相关记忆
4. **记忆衰减**：处理记忆的时间衰减
5. **记忆优先级**：管理记忆的优先级和重要性

### 5.2 接口设计

```java
/**
 * 记忆管理器
 */
public interface MemoryManager {
    
    /**
     * 保存消息到短期记忆
     */
    void saveMessage(String userId, String sessionId, ChatMessage message);
    
    /**
     * 获取对话上下文（短期记忆 + 相关长期记忆）
     */
    ConversationContext getConversationContext(String userId, String sessionId, int messageLimit);
    
    /**
     * 从对话中提取重要信息到长期记忆
     */
    void extractAndSaveMemories(String userId, String sessionId);
    
    /**
     * 检索相关记忆
     */
    List<Memory> retrieveRelevantMemories(String userId, String query, int limit);
    
    /**
     * 获取用户画像（基于长期记忆）
     */
    UserProfile getUserProfile(String userId);
    
    /**
     * 清理过期记忆
     */
    void cleanupExpiredMemories(String userId);
}
```

### 5.3 实现方案

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class DefaultMemoryManager implements MemoryManager {
    
    private final ShortMemory shortMemory;
    private final LongMemory longMemory;
    private final MemoryExtractor memoryExtractor;
    private final AIService aiService;
    
    @Override
    public void saveMessage(String userId, String sessionId, ChatMessage message) {
        // 1. 保存到短期记忆
        shortMemory.saveMessage(sessionId, message);
        
        // 2. 异步提取重要信息（如果消息重要性高）
        if (message.getImportance() != null && message.getImportance() > 0.7) {
            extractAndSaveMemories(userId, sessionId);
        }
    }
    
    @Override
    public ConversationContext getConversationContext(String userId, String sessionId, int messageLimit) {
        // 1. 获取短期记忆（对话历史）
        List<ChatMessage> messages = shortMemory.getMessages(sessionId, messageLimit);
        
        // 2. 获取相关长期记忆
        String conversationSummary = buildConversationSummary(messages);
        List<Memory> relevantMemories = longMemory.retrieveRelevantMemories(userId, conversationSummary, 10);
        
        // 3. 获取用户偏好
        List<UserPreference> preferences = longMemory.getAllPreferences(userId);
        
        // 4. 构建上下文
        return ConversationContext.builder()
            .userId(userId)
            .sessionId(sessionId)
            .messages(messages)
            .relevantMemories(relevantMemories)
            .userPreferences(preferences)
            .build();
    }
    
    @Override
    @Async
    public void extractAndSaveMemories(String userId, String sessionId) {
        try {
            // 1. 获取对话历史
            List<ChatMessage> messages = shortMemory.getMessages(sessionId, 50);
            
            // 2. 使用AI提取重要信息
            List<UserFact> facts = memoryExtractor.extractFacts(userId, messages);
            List<UserPreference> preferences = memoryExtractor.extractPreferences(userId, messages);
            
            // 3. 保存到长期记忆
            if (!facts.isEmpty()) {
                longMemory.saveFacts(facts);
            }
            
            if (!preferences.isEmpty()) {
                preferences.forEach(longMemory::savePreference);
            }
            
            // 4. 记录提取的事实ID到消息中
            updateMessagesWithExtractedFacts(sessionId, facts);
            
        } catch (Exception e) {
            log.error("提取记忆失败: userId={}, sessionId={}", userId, sessionId, e);
        }
    }
    
    @Override
    public List<Memory> retrieveRelevantMemories(String userId, String query, int limit) {
        return longMemory.retrieveRelevantMemories(userId, query, limit);
    }
    
    @Override
    public UserProfile getUserProfile(String userId) {
        // 基于长期记忆构建用户画像
        List<UserFact> facts = longMemory.getAllFacts(userId);
        List<UserPreference> preferences = longMemory.getAllPreferences(userId);
        List<Episode> episodes = longMemory.getEpisodes(userId, null, 100);
        
        return UserProfile.builder()
            .userId(userId)
            .facts(facts)
            .preferences(preferences)
            .episodes(episodes)
            .build();
    }
    
    @Override
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点执行
    public void cleanupExpiredMemories(String userId) {
        // 清理过期的短期记忆（由Redis的TTL自动处理）
        // 这里可以处理长期记忆的衰减和归档
        log.info("清理过期记忆: userId={}", userId);
    }
    
    private String buildConversationSummary(List<ChatMessage> messages) {
        // 构建对话摘要用于记忆检索
        return messages.stream()
            .map(ChatMessage::getContent)
            .collect(Collectors.joining(" "));
    }
    
    private void updateMessagesWithExtractedFacts(String sessionId, List<UserFact> facts) {
        // 更新消息中的extractedFacts字段
        // 这个需要在消息保存时就支持更新
    }
}
```

### 5.4 记忆提取器（Memory Extractor）

```java
/**
 * 记忆提取器
 */
@Service
@RequiredArgsConstructor
public class MemoryExtractor {
    
    private final AIService aiService;
    
    /**
     * 从对话中提取事实
     */
    public List<UserFact> extractFacts(String userId, List<ChatMessage> messages) {
        String conversationText = messages.stream()
            .map(ChatMessage::getContent)
            .collect(Collectors.joining("\n"));
        
        String prompt = buildFactExtractionPrompt(conversationText);
        String response = aiService.generateText(prompt, FACT_EXTRACTION_INSTRUCTION);
        
        return parseExtractedFacts(userId, response);
    }
    
    /**
     * 从对话中提取偏好
     */
    public List<UserPreference> extractPreferences(String userId, List<ChatMessage> messages) {
        String conversationText = messages.stream()
            .map(ChatMessage::getContent)
            .collect(Collectors.joining("\n"));
        
        String prompt = buildPreferenceExtractionPrompt(conversationText);
        String response = aiService.generateText(prompt, PREFERENCE_EXTRACTION_INSTRUCTION);
        
        return parseExtractedPreferences(userId, response);
    }
    
    private String buildFactExtractionPrompt(String conversation) {
        return String.format("""
            请从以下对话中提取用户的重要事实信息。
            
            对话内容：
            %s
            
            请提取：
            1. 个人信息（姓名、年龄、职业等）
            2. 重要事件
            3. 关系信息
            4. 偏好信息
            
            返回JSON格式，包含：
            - fact: 事实描述
            - category: 事实类别
            - importance: 重要性评分 (0.0-1.0)
            - confidence: 置信度 (0.0-1.0)
            """, conversation);
    }
    
    private static final String FACT_EXTRACTION_INSTRUCTION = """
        你是一个专业的记忆提取专家。
        你的任务是从对话中提取用户的重要事实。
        只提取明确的、重要的信息。
        返回JSON数组格式。
        """;
    
    private List<UserFact> parseExtractedFacts(String userId, String response) {
        // 解析AI返回的JSON，转换为UserFact列表
        try {
            ObjectMapper mapper = new ObjectMapper();
            List<Map<String, Object>> factsJson = mapper.readValue(response, List.class);
            
            return factsJson.stream()
                .map(json -> {
                    UserFact fact = new UserFact();
                    fact.setUserId(userId);
                    fact.setFact((String) json.get("fact"));
                    fact.setCategory(UserFact.FactCategory.valueOf((String) json.get("category")));
                    fact.setImportance(((Number) json.get("importance")).doubleValue());
                    fact.setConfidence(((Number) json.get("confidence")).doubleValue());
                    fact.setCreatedAt(Instant.now());
                    return fact;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("解析提取的事实失败", e);
            return Collections.emptyList();
        }
    }
}
```

---

## 六、存储层设计

### 6.1 存储抽象

```java
/**
 * 存储接口抽象
 */
public interface StorageAdapter<T> {
    void save(String key, T value);
    T get(String key);
    void delete(String key);
    boolean exists(String key);
    void saveWithTTL(String key, T value, long ttlSeconds);
}
```

### 6.2 多存储支持

```java
/**
 * 存储工厂
 */
@Component
public class StorageFactory {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    public StorageAdapter<ChatMessage> createShortMemoryStorage() {
        return new RedisStorageAdapter<>(redisTemplate);
    }
    
    public StorageAdapter<UserFact> createLongMemoryStorage() {
        return new MongoStorageAdapter<>(mongoTemplate);
    }
}
```

---

## 七、使用示例

### 7.1 基本使用

```java
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final MemoryManager memoryManager;
    
    public ChatResponse chat(String userId, String sessionId, String userMessage) {
        // 1. 保存用户消息
        ChatMessage message = ChatMessage.builder()
            .id(UUID.randomUUID().toString())
            .sessionId(sessionId)
            .role(MessageRole.USER)
            .content(userMessage)
            .timestamp(System.currentTimeMillis())
            .build();
        
        memoryManager.saveMessage(userId, sessionId, message);
        
        // 2. 获取对话上下文
        ConversationContext context = memoryManager.getConversationContext(
            userId, sessionId, 20);
        
        // 3. 构建AI提示词（包含上下文）
        String prompt = buildPrompt(context, userMessage);
        
        // 4. 调用AI生成回复
        String response = aiService.generateText(prompt);
        
        // 5. 保存AI回复
        ChatMessage aiMessage = ChatMessage.builder()
            .id(UUID.randomUUID().toString())
            .sessionId(sessionId)
            .role(MessageRole.ASSISTANT)
            .content(response)
            .timestamp(System.currentTimeMillis())
            .build();
        
        memoryManager.saveMessage(userId, sessionId, aiMessage);
        
        return ChatResponse.builder()
            .message(response)
            .context(context)
            .build();
    }
    
    private String buildPrompt(ConversationContext context, String userMessage) {
        StringBuilder prompt = new StringBuilder();
        
        // 添加用户偏好
        if (!context.getUserPreferences().isEmpty()) {
            prompt.append("用户偏好：\n");
            context.getUserPreferences().forEach(pref -> {
                prompt.append(String.format("- %s: %s\n", pref.getKey(), pref.getValue()));
            });
            prompt.append("\n");
        }
        
        // 添加相关记忆
        if (!context.getRelevantMemories().isEmpty()) {
            prompt.append("相关记忆：\n");
            context.getRelevantMemories().forEach(memory -> {
                prompt.append(String.format("- %s\n", memory.getContent()));
            });
            prompt.append("\n");
        }
        
        // 添加对话历史
        prompt.append("对话历史：\n");
        context.getMessages().forEach(msg -> {
            prompt.append(String.format("%s: %s\n", msg.getRole(), msg.getContent()));
        });
        prompt.append("\n");
        
        // 添加当前消息
        prompt.append("用户: ").append(userMessage).append("\n");
        prompt.append("助手: ");
        
        return prompt.toString();
    }
}
```

---

## 八、数据库设计

### 8.1 MongoDB集合设计

```javascript
// user_preferences 集合
{
  _id: ObjectId,
  userId: String,
  key: String,
  value: Object,
  type: String, // STRING, NUMBER, BOOLEAN, JSON, LIST, RATING
  confidence: Number,
  updatedAt: Date,
  accessCount: Number,
  lastAccessedAt: Date,
  metadata: Object
}

// user_facts 集合
{
  _id: ObjectId,
  userId: String,
  fact: String,
  category: String, // PERSONAL, PREFERENCE, HISTORY, etc.
  importance: Number, // 0.0-1.0
  confidence: Number, // 0.0-1.0
  sourceSessionId: String,
  createdAt: Date,
  lastAccessedAt: Date,
  accessCount: Number,
  tags: [String],
  metadata: Object
}

// episodes 集合
{
  _id: ObjectId,
  userId: String,
  sessionId: String,
  type: String, // TASK_COMPLETION, DECISION, etc.
  description: String,
  actions: [String],
  outcome: String,
  success: Boolean,
  reward: Number, // 0.0-1.0
  timestamp: Date,
  context: Object,
  metadata: Object
}

// 索引
db.user_preferences.createIndex({ userId: 1, key: 1 }, { unique: true });
db.user_facts.createIndex({ userId: 1, category: 1 });
db.user_facts.createIndex({ userId: 1, importance: -1 });
db.user_facts.createIndex({ fact: "text" }); // 文本搜索索引
db.episodes.createIndex({ userId: 1, timestamp: -1 });
```

### 8.2 Redis键设计

```
# 对话消息
short:msg:{sessionId} -> List<ChatMessage>

# 工作记忆
short:work:{sessionId}:{key} -> WorkingMemory

# 会话摘要
short:summary:{sessionId} -> String

# TTL设置
- 消息：24小时
- 工作记忆：24小时
- 会话摘要：24小时
```

---

## 九、性能优化

### 9.1 缓存策略

1. **长期记忆缓存**：将常用的长期记忆缓存到Redis
2. **用户画像缓存**：缓存用户画像，定期更新
3. **记忆检索结果缓存**：缓存记忆检索结果

### 9.2 异步处理

1. **记忆提取异步化**：异步提取和保存记忆
2. **记忆索引异步化**：异步建立记忆索引
3. **记忆衰减异步化**：异步处理记忆衰减

### 9.3 批量操作

1. **批量保存记忆**：批量保存提取的记忆
2. **批量检索**：支持批量检索多个用户的记忆
3. **批量更新**：批量更新记忆的访问时间

---

## 十、扩展性设计

### 10.1 插件化架构

```java
/**
 * 记忆提取插件接口
 */
public interface MemoryExtractionPlugin {
    boolean canExtract(ChatMessage message);
    List<Memory> extract(String userId, ChatMessage message);
}

/**
 * 记忆检索插件接口
 */
public interface MemoryRetrievalPlugin {
    List<Memory> retrieve(String userId, String query, int limit);
}
```

### 10.2 存储后端扩展

支持多种存储后端：
- Redis（短期记忆）
- MongoDB（长期记忆）
- MySQL（元数据）
- 向量数据库（语义检索，可选）

---

## 十一、总结

本设计文档提供了一个完整的Context Engine架构，支持：

1. **双层记忆架构**：短期记忆和长期记忆清晰分离
2. **高效检索**：支持关键词检索和向量检索（可选）
3. **自动提取**：从对话中自动提取重要信息
4. **记忆管理**：完整的记忆生命周期管理
5. **可扩展性**：支持插件化和多种存储后端

该设计可以作为实现Context Engine的参考指南。

