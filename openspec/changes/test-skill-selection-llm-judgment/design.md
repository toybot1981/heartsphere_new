# 技能选择和激活机制测试设计

## 测试架构

### 测试分层

```
单元测试 (Unit Tests)
  ├─ SkillPromptBuilderTest
  ├─ LLMSkillSelectorTest
  ├─ ProgressiveSkillLoaderTest
  ├─ SkillSelectionCacheServiceTest
  └─ LLMSkillApplicationEngineTest

集成测试 (Integration Tests)
  ├─ LLMSkillSelectionIntegrationTest
  ├─ SkillSelectionCacheIntegrationTest
  └─ SkillSelectionFallbackIntegrationTest

性能测试 (Performance Tests)
  ├─ SkillSelectionPerformanceTest
  └─ SkillSelectionLoadTest

对比测试 (Comparison Tests)
  ├─ SkillSelectionComparisonTest
  └─ SkillSelectionAccuracyTest

端到端测试 (E2E Tests)
  ├─ SkillSelectionE2ETest
  └─ SkillSelectionScenarioTest
```

## 测试数据设计

### 测试技能数据

```java
// 测试技能定义
SkillDefinition testSkill1 = SkillDefinition.builder()
    .id(1L)
    .skillId("test_skill_1")
    .name("工作助手")
    .description("帮助处理工作任务")
    .category("work")
    .build();

SkillDefinition testSkill2 = SkillDefinition.builder()
    .id(2L)
    .skillId("test_skill_2")
    .name("生活助手")
    .description("帮助处理生活事务")
    .category("life")
    .build();
```

### Mock LLM 响应

```java
// Level 1 响应
String level1Response = """
{
  "selectedSkills": [
    {
      "skillId": "test_skill_1",
      "relevanceScore": 85,
      "reason": "用户消息与工作相关"
    }
  ]
}
""";

// Level 2 响应
String level2Response = """
{
  "evaluatedSkills": [
    {
      "skillId": "test_skill_1",
      "shouldActivate": true,
      "confidence": 90,
      "reason": "技能高度相关且适合当前上下文"
    }
  ]
}
""";

// Level 3 响应
String level3Response = """
{
  "finalSkills": [
    {
      "skillId": "test_skill_1",
      "priority": 1,
      "activationOrder": 1,
      "reason": "最高优先级，应首先激活"
    }
  ]
}
""";
```

## 测试场景设计

### 场景 1: 正常流程测试

**目标**：验证完整的三层渐进式流程

**步骤**：
1. 准备测试技能列表（10 个技能）
2. 准备用户消息："帮我安排今天的工作"
3. Mock LLM 响应（Level 1/2/3）
4. 执行技能选择
5. 验证结果：
   - Level 1 筛选出 5 个候选
   - Level 2 评估后 3 个激活
   - Level 3 最终确定 2 个技能
   - 执行记录正确创建

### 场景 2: 缓存测试

**目标**：验证缓存机制

**步骤**：
1. 第一次调用：验证 LLM 被调用
2. 第二次调用（相同输入）：验证使用缓存
3. 第三次调用（不同输入）：验证 LLM 再次被调用
4. 验证缓存命中率

### 场景 3: 降级测试

**目标**：验证 LLM 失败时的降级策略

**步骤**：
1. Mock LLM 服务抛出异常
2. 执行技能选择
3. 验证：
   - 降级到规则驱动
   - 规则驱动正常工作
   - 错误日志正确记录

### 场景 4: 性能测试

**目标**：验证性能优化效果

**步骤**：
1. 测试无缓存场景的响应时间
2. 测试有缓存场景的响应时间
3. 对比性能差异
4. 验证缓存命中率

### 场景 5: 准确性对比测试

**目标**：对比 LLM 驱动和规则驱动的准确性

**步骤**：
1. 准备标准测试集（100 条用户消息）
2. 使用 LLM 驱动进行选择
3. 使用规则驱动进行选择
4. 人工标注正确答案
5. 计算准确率：
   - LLM 驱动准确率
   - 规则驱动准确率
   - 准确率提升

## Mock 策略

### AIService Mock

```java
@Mock
private AIService aiService;

@BeforeEach
void setUp() {
    MockitoAnnotations.openMocks(this);
    
    // Mock Level 1 响应
    when(aiService.generateText(any(), any()))
        .thenReturn(createLevel1Response());
}
```

### Repository Mock

```java
@Mock
private SkillDefinitionRepository skillDefinitionRepository;

@Mock
private SkillInstructionRepository skillInstructionRepository;

@Mock
private SkillResourceRepository skillResourceRepository;

@BeforeEach
void setUp() {
    when(skillDefinitionRepository.findBySkillIdIn(any()))
        .thenReturn(testSkills);
}
```

## 测试工具类

### SkillTestUtils

```java
public class SkillTestUtils {
    public static SkillDefinition createTestSkill(String skillId, String name) {
        // 创建测试技能
    }
    
    public static SkillEvaluationContext createTestContext(String userMessage) {
        // 创建测试上下文
    }
    
    public static String createMockLLMResponse(String level, List<String> skillIds) {
        // 创建 Mock LLM 响应
    }
}
```

### MockLLMResponseBuilder

```java
public class MockLLMResponseBuilder {
    public static TextGenerationResponse buildLevel1Response(List<SelectedSkill> skills) {
        // 构建 Level 1 响应
    }
    
    public static TextGenerationResponse buildLevel2Response(List<EvaluatedSkill> skills) {
        // 构建 Level 2 响应
    }
    
    public static TextGenerationResponse buildLevel3Response(List<FinalSkill> skills) {
        // 构建 Level 3 响应
    }
}
```

## 测试配置

### application-test.yml

```yaml
skill:
  selection:
    llm-driven:
      enabled: true
      level1-candidates: 10
      level2-candidates: 5
      level3-candidates: 3
      enable-level3: true
    cache:
      level1-ttl: 60  # 测试环境使用较短的 TTL
      level2-ttl: 30
      level3-ttl: 10
      llm-result-ttl: 5
```

## 测试报告

### 覆盖率目标

- 单元测试覆盖率：80% 以上
- 集成测试覆盖率：核心流程 100%
- 性能测试：所有关键路径

### 报告格式

- JUnit 测试报告（HTML）
- JaCoCo 覆盖率报告（HTML）
- 性能测试报告（JSON + HTML）
- 对比测试报告（Markdown）
