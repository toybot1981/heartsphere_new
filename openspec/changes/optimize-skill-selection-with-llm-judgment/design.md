# 技能选择和激活机制优化设计

## 架构设计

### 整体流程

```
用户消息
  ↓
阶段1：Level 1 初步筛选（LLM）
  ├─ 加载所有技能的 Level 1（元数据）
  ├─ 构建 Level 1 提示词
  ├─ LLM 评估并筛选候选技能（Top N）
  └─ 返回候选技能列表
  ↓
阶段2：Level 2 深度评估（LLM）
  ├─ 加载候选技能的 Level 2（指令）
  ├─ 构建 Level 2 提示词
  ├─ LLM 深度评估候选技能
  └─ 返回最终候选技能（Top M）
  ↓
阶段3：Level 3 最终决策（LLM，可选）
  ├─ 加载最终候选技能的 Level 3（资源）
  ├─ 构建 Level 3 提示词
  ├─ LLM 进行最终决策
  └─ 返回最终激活的技能列表
  ↓
技能执行
```

### 核心组件

#### 1. SkillPromptBuilder（技能提示词构建器）

**职责**：构建不同层级的技能提示词

```java
public interface SkillPromptBuilder {
    /**
     * 构建 Level 1 提示词（元数据）
     */
    String buildLevel1Prompt(List<SkillDefinition> skills, SkillEvaluationContext context);
    
    /**
     * 构建 Level 2 提示词（指令）
     */
    String buildLevel2Prompt(SkillDefinition skill, List<SkillInstruction> instructions, SkillEvaluationContext context);
    
    /**
     * 构建 Level 3 提示词（资源）
     */
    String buildLevel3Prompt(SkillDefinition skill, List<SkillResource> resources, SkillEvaluationContext context);
}
```

#### 2. LLMSkillSelector（LLM 技能选择器）

**职责**：使用 LLM 进行技能选择

```java
public interface LLMSkillSelector {
    /**
     * Level 1 初步筛选
     */
    List<SkillCandidate> selectCandidatesLevel1(
        List<SkillDefinition> skills,
        SkillEvaluationContext context
    );
    
    /**
     * Level 2 深度评估
     */
    List<SkillCandidate> evaluateCandidatesLevel2(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    );
    
    /**
     * Level 3 最终决策（可选）
     */
    List<SkillCandidate> finalizeCandidatesLevel3(
        List<SkillCandidate> candidates,
        SkillEvaluationContext context
    );
}
```

#### 3. ProgressiveSkillLoader（渐进式技能加载器）

**职责**：按需加载不同层级的技能内容

```java
public interface ProgressiveSkillLoader {
    /**
     * 加载 Level 1（元数据）
     */
    List<SkillDefinition> loadLevel1(Long characterId);
    
    /**
     * 加载 Level 2（指令）
     */
    List<SkillInstruction> loadLevel2(String skillId);
    
    /**
     * 加载 Level 3（资源）
     */
    List<SkillResource> loadLevel3(String skillId);
}
```

### 提示词设计

#### Level 1 提示词模板

```
你是一个技能选择助手。根据用户消息和对话上下文，从以下技能中选择最相关的技能。

[用户消息]
{userMessage}

[对话上下文]
{conversationHistory}

[可用技能列表]
{skillList}

每个技能包含以下信息：
- 技能ID: {skillId}
- 技能名称: {name}
- 技能描述: {description}
- 技能分类: {category}

请分析用户消息，选择最相关的技能（最多选择 {maxCandidates} 个），并给出选择理由。

返回格式（JSON）：
{
  "selectedSkills": [
    {
      "skillId": "skill_id",
      "relevanceScore": 0-100,
      "reason": "选择理由"
    }
  ]
}
```

#### Level 2 提示词模板

```
对以下候选技能进行深度评估，确定是否应该激活。

[用户消息]
{userMessage}

[对话上下文]
{conversationHistory}

[候选技能详情]
{skillDetails}

每个技能包含：
- 技能元数据（Level 1）
- 技能指令（Level 2）：{instructions}

请评估每个技能：
1. 是否与用户消息高度相关
2. 是否适合当前对话上下文
3. 激活后是否能提供价值

返回格式（JSON）：
{
  "evaluatedSkills": [
    {
      "skillId": "skill_id",
      "shouldActivate": true/false,
      "confidence": 0-100,
      "reason": "评估理由"
    }
  ]
}
```

#### Level 3 提示词模板

```
对以下最终候选技能进行最终决策，确定激活优先级。

[用户消息]
{userMessage}

[候选技能完整信息]
{fullSkillDetails}

每个技能包含：
- 技能元数据（Level 1）
- 技能指令（Level 2）
- 技能资源（Level 3）：{resources}

请进行最终决策：
1. 确定激活优先级
2. 评估技能组合的协同效果
3. 考虑技能执行的顺序

返回格式（JSON）：
{
  "finalSkills": [
    {
      "skillId": "skill_id",
      "priority": 1-N,
      "activationOrder": 1-N,
      "reason": "最终决策理由"
    }
  ]
}
```

### 性能优化策略

#### 1. 缓存机制

- **Level 1 缓存**：技能元数据缓存（长期）
- **Level 2 缓存**：技能指令缓存（中期）
- **Level 3 缓存**：技能资源缓存（短期）
- **LLM 结果缓存**：相同输入的 LLM 判断结果缓存

#### 2. 批量处理

- **批量加载**：一次性加载多个技能的同一层级
- **批量评估**：将多个技能合并到一个 LLM 调用中评估

#### 3. 降级策略

- **快速降级**：LLM 服务不可用时，自动降级到规则驱动
- **部分降级**：Level 2/3 加载失败时，仅使用 Level 1 进行判断

### 配置参数

```yaml
skill:
  selection:
    # LLM 驱动配置
    llm-driven:
      enabled: true
      # Level 1 筛选的候选数量
      level1-candidates: 10
      # Level 2 评估的候选数量
      level2-candidates: 5
      # Level 3 最终决策的候选数量
      level3-candidates: 3
      # 是否启用 Level 3
      enable-level3: false
      # LLM 模型配置
      model: "gpt-4"
      temperature: 0.3
      max-tokens: 1000
    # 规则驱动配置（降级方案）
    rule-driven:
      enabled: true
      fallback: true
    # 缓存配置
    cache:
      level1-ttl: 3600  # 1小时
      level2-ttl: 1800  # 30分钟
      level3-ttl: 600   # 10分钟
      llm-result-ttl: 300  # 5分钟
```

## 实现细节

### 1. 技能选择服务重构

**现有**：`SkillApplicationEngine` 使用规则驱动

**新设计**：`LLMSkillApplicationEngine` 使用 LLM 驱动

```java
@Component
@RequiredArgsConstructor
public class LLMSkillApplicationEngine {
    
    private final LLMSkillSelector llmSkillSelector;
    private final ProgressiveSkillLoader skillLoader;
    private final SkillPromptBuilder promptBuilder;
    private final AIService aiService;
    
    // 降级到规则驱动的引擎
    private final SkillApplicationEngine ruleBasedEngine;
    
    public SkillApplicationResult evaluateAndApplySkills(
        SkillEvaluationContext context,
        List<SkillDefinition> availableSkills,
        Long userId,
        Long conversationId
    ) {
        try {
            // 尝试 LLM 驱动
            return evaluateWithLLM(context, availableSkills, userId, conversationId);
        } catch (Exception e) {
            log.warn("LLM 驱动失败，降级到规则驱动", e);
            // 降级到规则驱动
            return ruleBasedEngine.evaluateAndApplySkills(
                context, availableSkills, userId, conversationId
            );
        }
    }
    
    private SkillApplicationResult evaluateWithLLM(...) {
        // Level 1 初步筛选
        List<SkillCandidate> level1Candidates = llmSkillSelector
            .selectCandidatesLevel1(availableSkills, context);
        
        // Level 2 深度评估
        List<SkillCandidate> level2Candidates = llmSkillSelector
            .evaluateCandidatesLevel2(level1Candidates, context);
        
        // Level 3 最终决策（可选）
        List<SkillCandidate> finalCandidates = llmSkillSelector
            .finalizeCandidatesLevel3(level2Candidates, context);
        
        // 转换为应用结果
        return convertToApplicationResult(finalCandidates, ...);
    }
}
```

### 2. 提示词构建实现

```java
@Component
@RequiredArgsConstructor
public class SkillPromptBuilderImpl implements SkillPromptBuilder {
    
    private final ObjectMapper objectMapper;
    
    @Override
    public String buildLevel1Prompt(
        List<SkillDefinition> skills,
        SkillEvaluationContext context
    ) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("你是一个技能选择助手。根据用户消息和对话上下文，从以下技能中选择最相关的技能。\n\n");
        prompt.append("[用户消息]\n").append(context.getUserMessage()).append("\n\n");
        
        if (context.getConversationHistory() != null && !context.getConversationHistory().isEmpty()) {
            prompt.append("[对话上下文]\n");
            context.getConversationHistory().forEach(msg -> 
                prompt.append("- ").append(msg).append("\n")
            );
            prompt.append("\n");
        }
        
        prompt.append("[可用技能列表]\n");
        skills.forEach(skill -> {
            prompt.append(String.format(
                "- 技能ID: %s\n  技能名称: %s\n  技能描述: %s\n  技能分类: %s\n\n",
                skill.getSkillId(),
                skill.getName(),
                skill.getDescription() != null ? skill.getDescription() : "无描述",
                skill.getCategory() != null ? skill.getCategory() : "未分类"
            ));
        });
        
        prompt.append("请分析用户消息，选择最相关的技能（最多选择 10 个），并给出选择理由。\n\n");
        prompt.append("返回格式（JSON）：\n");
        prompt.append("{\n");
        prompt.append("  \"selectedSkills\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"skillId\": \"skill_id\",\n");
        prompt.append("      \"relevanceScore\": 0-100,\n");
        prompt.append("      \"reason\": \"选择理由\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
    
    // Level 2 和 Level 3 的构建方法类似...
}
```

### 3. LLM 选择器实现

```java
@Component
@RequiredArgsConstructor
public class LLMSkillSelectorImpl implements LLMSkillSelector {
    
    private final AIService aiService;
    private final SkillPromptBuilder promptBuilder;
    private final ProgressiveSkillLoader skillLoader;
    private final ObjectMapper objectMapper;
    
    @Override
    public List<SkillCandidate> selectCandidatesLevel1(
        List<SkillDefinition> skills,
        SkillEvaluationContext context
    ) {
        // 构建 Level 1 提示词
        String prompt = promptBuilder.buildLevel1Prompt(skills, context);
        
        // 调用 LLM
        String response = aiService.generateText(prompt);
        
        // 解析响应
        SkillSelectionResponse selectionResponse = parseResponse(response);
        
        // 转换为候选列表
        return selectionResponse.getSelectedSkills().stream()
            .map(selected -> {
                SkillDefinition skill = skills.stream()
                    .filter(s -> s.getSkillId().equals(selected.getSkillId()))
                    .findFirst()
                    .orElse(null);
                return SkillCandidate.builder()
                    .skill(skill)
                    .relevanceScore(selected.getRelevanceScore())
                    .reason(selected.getReason())
                    .level(1)
                    .build();
            })
            .collect(Collectors.toList());
    }
    
    // Level 2 和 Level 3 的实现类似...
}
```

## 数据流

### 技能选择数据流

```
SkillDefinition (Level 1)
  ↓
SkillPromptBuilder.buildLevel1Prompt()
  ↓
LLMSkillSelector.selectCandidatesLevel1()
  ↓
SkillCandidate (Level 1 结果)
  ↓
SkillInstruction (Level 2)
  ↓
SkillPromptBuilder.buildLevel2Prompt()
  ↓
LLMSkillSelector.evaluateCandidatesLevel2()
  ↓
SkillCandidate (Level 2 结果)
  ↓
SkillResource (Level 3，可选)
  ↓
SkillPromptBuilder.buildLevel3Prompt()
  ↓
LLMSkillSelector.finalizeCandidatesLevel3()
  ↓
SkillApplicationResult
```

## 测试策略

### 1. 单元测试

- 提示词构建测试
- LLM 响应解析测试
- 技能加载测试

### 2. 集成测试

- 完整的三层渐进式选择流程
- 降级策略测试
- 性能测试

### 3. 对比测试

- LLM 驱动 vs 规则驱动的准确性对比
- 性能对比
- 成本对比

## 迁移策略

### 阶段 1：并行运行

- LLM 驱动和规则驱动并行运行
- 对比结果，收集数据
- 逐步切换到 LLM 驱动

### 阶段 2：灰度发布

- 部分角色使用 LLM 驱动
- 监控性能和准确性
- 逐步扩大范围

### 阶段 3：全面切换

- 所有角色使用 LLM 驱动
- 保留规则驱动作为降级方案
