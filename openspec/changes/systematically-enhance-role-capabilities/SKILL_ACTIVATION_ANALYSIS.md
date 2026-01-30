# 技能激活逻辑分析

## 当前实现：规则驱动

### 激活流程

```
用户消息
  ↓
SkillApplicationEngine.evaluateAndApplySkills()
  ↓
SkillScoringService.scoreSkill() - 多维度评分
  ├─ calculateSemanticScore() - 语义相似度得分（规则）
  ├─ calculateContextScore() - 上下文匹配得分（规则）
  └─ calculateMemoryScore() - 内存触发得分（规则）
  ↓
综合得分计算（加权平均）
  ↓
过滤（得分 >= 60）和排序
  ↓
选择 Top N 技能（最多5个）
  ↓
创建执行记录
```

### 评分维度详解

#### 1. 语义相似度得分 (`calculateSemanticScore`)

**实现方式：规则驱动（字符串匹配）**

```java
// 1. 技能名称完全匹配（+40分）
if (lowerMessage.contains(skillName)) {
    score += 40;
}

// 2. 技能描述关键词匹配（+30分）
if (skillDescription.length() > 0 && 
    Arrays.stream(skillDescription.split("\\s"))
        .anyMatch(lowerMessage::contains)) {
    score += 30;
}

// 3. 自动触发关键词匹配（+30分）
List<String> keywords = parseAutoTriggerKeywords(skill.getAutoTriggerKeywords());
long matchedKeywords = keywords.stream()
    .filter(kw -> lowerMessage.contains(kw.toLowerCase()))
    .count();
if (matchedKeywords > 0) {
    score += Math.min(30, (int)(matchedKeywords * 10));
}
```

**特点**：
- ✅ 使用字符串包含匹配（`contains`）
- ✅ 基于关键词列表（`autoTriggerKeywords`）
- ❌ **未使用 LLM 或 embedding**
- ❌ **未使用向量相似度计算**

#### 2. 上下文匹配得分 (`calculateContextScore`)

**实现方式：规则驱动（历史匹配）**

```java
// 1. 对话历史匹配（+40分）
long relevantTurns = context.getConversationHistory().stream()
    .filter(msg -> msg.toLowerCase().contains(skill.getName().toLowerCase()))
    .count();
if (relevantTurns > 0) {
    score += Math.min(40, (int)(relevantTurns * 10));
}

// 2. 主题匹配（+30分）
if (context.getContextTopic() != null && 
    context.getContextTopic().toLowerCase().contains(skill.getName().toLowerCase())) {
    score += 30;
}

// 3. 用户状态匹配（+30分）
if (context.getUserState() != null && 
    skill.getCategory() != null &&
    context.getUserState().contains(skill.getCategory())) {
    score += 30;
}
```

**特点**：
- ✅ 使用字符串匹配
- ✅ 基于对话历史、主题、用户状态
- ❌ **未使用 LLM 理解上下文语义**

#### 3. 内存触发得分 (`calculateMemoryScore`)

**实现方式：规则驱动（计数）**

```java
// 是否有相关内存
if (context.getRelatedMemoryIds() != null && !context.getRelatedMemoryIds().isEmpty()) {
    score += Math.min(50, context.getRelatedMemoryIds().size() * 10);
}
```

**特点**：
- ✅ 基于相关内存数量
- ❌ **未使用 LLM 分析内存内容**

### 综合得分计算

```java
compositeScore = (int) (
    semanticScore * 0.4 +      // 语义权重 40%
    contextScore * 0.35 +      // 上下文权重 35%
    memoryScore * 0.25         // 内存权重 25%
);
```

### 决策逻辑

```java
// 过滤：得分 >= 60
List<SkillScore> appliedSkills = skillScores.stream()
    .filter(s -> s.getCompositeScore() >= SCORE_THRESHOLD)  // 60分
    .sorted(Comparator.comparingInt(SkillScore::getCompositeScore).reversed())
    .limit(TOP_N_SKILLS)  // 最多5个
    .collect(Collectors.toList());
```

## 设计文档 vs 实际实现

### 设计文档中的描述

从 `design.md` 看，设计时考虑了：

```
- **语义相似度得分** (0-100): 基于技能描述与用户意图的语义相似度（使用 embeddings 或 LLM）
```

**备选方案**：
- 模型驱动方案：直接使用 LLM 评估技能适用性（成本高、延迟高，保留作为可选项）
- 规则驱动方案：基于人工配置的规则评估（不够灵活）

**选择理由**：多维度评分方案在准确性、性能和可调试性之间取得良好平衡

### 实际实现

**实际采用了规则驱动方案**：
- ✅ 使用关键词匹配（字符串包含）
- ✅ 使用对话历史匹配
- ❌ **未使用 LLM 或 embedding**
- ❌ **未使用向量相似度**

## 优缺点分析

### 优点

1. **性能优秀**
   - 字符串匹配速度快
   - 无 LLM 调用，延迟低
   - 可缓存结果（已有缓存机制）

2. **可调试性强**
   - 评分逻辑清晰
   - 每个维度得分可追踪
   - 匹配的关键词可记录

3. **成本低**
   - 无 LLM API 调用成本
   - 无 embedding 生成成本

4. **可预测**
   - 规则明确，行为可预测
   - 便于测试和验证

### 缺点

1. **语义理解有限**
   - 无法理解同义词（如"时间管理" vs "时间规划"）
   - 无法理解上下文语义（如"帮我安排一下"可能匹配多个技能）
   - 关键词匹配可能遗漏相关技能

2. **灵活性不足**
   - 需要人工配置关键词
   - 难以处理复杂语义场景
   - 无法自动学习用户意图

3. **准确性受限**
   - 可能误匹配（关键词重叠）
   - 可能漏匹配（未配置关键词）

## 改进建议

### 方案 1: 混合模式（推荐）

**保留规则驱动作为基础，增加 LLM 增强**：

```java
private int calculateSemanticScore(SkillDefinition skill, String userMessage) {
    // 1. 规则匹配（快速路径）
    int ruleScore = calculateRuleBasedScore(skill, userMessage);
    
    // 2. 如果规则得分较低但接近阈值，使用 LLM 二次评估
    if (ruleScore >= 40 && ruleScore < 60) {
        int llmScore = calculateLLMScore(skill, userMessage);
        return Math.max(ruleScore, llmScore);
    }
    
    return ruleScore;
}
```

**优点**：
- 性能：大部分情况使用快速规则
- 准确性：关键场景使用 LLM 提升准确性
- 成本：只在必要时调用 LLM

### 方案 2: Embedding 增强

**使用 embedding 计算语义相似度**：

```java
private int calculateSemanticScore(SkillDefinition skill, String userMessage) {
    // 1. 关键词匹配（快速）
    int keywordScore = calculateKeywordScore(skill, userMessage);
    
    // 2. Embedding 相似度（精确）
    float[] userEmbedding = embeddingService.generateEmbedding(userMessage);
    float[] skillEmbedding = getSkillEmbedding(skill);  // 缓存
    double similarity = cosineSimilarity(userEmbedding, skillEmbedding);
    int embeddingScore = (int)(similarity * 100);
    
    // 3. 综合得分
    return (int)(keywordScore * 0.5 + embeddingScore * 0.5);
}
```

**优点**：
- 语义理解更准确
- 可处理同义词和语义相似
- 性能优于 LLM（embedding 可缓存）

### 方案 3: LLM 驱动（可选）

**直接使用 LLM 评估技能适用性**：

```java
private int calculateSemanticScore(SkillDefinition skill, String userMessage) {
    String prompt = String.format(
        "评估以下技能是否适用于用户消息：\n" +
        "技能名称：%s\n" +
        "技能描述：%s\n" +
        "用户消息：%s\n" +
        "请给出0-100的适用性评分，并说明原因。",
        skill.getName(), skill.getDescription(), userMessage
    );
    
    String response = llmService.generateText(prompt);
    return parseScoreFromResponse(response);
}
```

**优点**：
- 语义理解最准确
- 可处理复杂场景

**缺点**：
- 成本高（每次评估都需要 LLM 调用）
- 延迟高
- 可调试性差（黑盒）

## 当前状态总结

| 维度 | 设计意图 | 实际实现 | 差距 |
|------|---------|---------|------|
| 语义相似度 | Embedding/LLM | 关键词匹配 | ⚠️ 未实现语义理解 |
| 上下文匹配 | 规则 + 语义 | 规则匹配 | ⚠️ 未实现语义理解 |
| 内存触发 | 规则 + 关联 | 计数规则 | ✅ 基本符合 |
| 综合评分 | 加权平均 | 加权平均 | ✅ 符合设计 |
| 决策逻辑 | 阈值过滤 | 阈值过滤 | ✅ 符合设计 |

## 建议

1. **短期**：保持当前规则驱动实现，优化关键词配置
2. **中期**：引入 embedding 增强语义相似度计算
3. **长期**：考虑混合模式，在关键场景使用 LLM

## 代码位置

- **评分服务**: `main/backend/src/main/java/com/heartsphere/ai/skill/engine/SkillScoringService.java`
- **应用引擎**: `main/backend/src/main/java/com/heartsphere/ai/skill/engine/SkillApplicationEngine.java`
- **配置**: `main/backend/src/main/java/com/heartsphere/ai/skill/config/SkillApplicationConfig.java`
