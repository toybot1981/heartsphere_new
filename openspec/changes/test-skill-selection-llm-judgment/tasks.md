# 测试任务清单

## 阶段 1：单元测试

- [x] 创建 `SkillPromptBuilderTest`
  - [x] 测试 `buildLevel1Prompt()` 方法
  - [x] 测试 `buildLevel2Prompt()` 方法
  - [x] 测试 `buildLevel3Prompt()` 方法
  - [x] 测试 `buildLevel2BatchPrompt()` 方法
  - [x] 测试 `buildLevel3BatchPrompt()` 方法
  - [x] 验证提示词格式和内容

- [x] 创建 `LLMSkillSelectorTest`
  - [x] Mock AIService
  - [x] 测试 `selectCandidatesLevel1()` 方法
  - [x] 测试 `evaluateCandidatesLevel2()` 方法
  - [x] 测试 `finalizeCandidatesLevel3()` 方法
  - [x] 测试 LLM 响应解析逻辑
  - [x] 测试错误处理（LLM 失败、解析失败）

- [x] 创建 `ProgressiveSkillLoaderTest`
  - [x] Mock Repository
  - [x] 测试 `loadLevel1()` 方法
  - [x] 测试 `loadLevel2()` 方法
  - [x] 测试 `loadLevel3()` 方法
  - [x] 测试 `loadLevel2Batch()` 方法
  - [x] 测试 `loadLevel3Batch()` 方法
  - [x] 验证缓存机制

- [x] 创建 `SkillSelectionCacheServiceTest`
  - [x] 测试缓存键生成
  - [x] 测试缓存存储和获取
  - [x] 测试缓存失效

- [x] 创建 `LLMSkillApplicationEngineTest`
  - [x] Mock 依赖组件
  - [x] 测试完整的三层渐进式流程
  - [x] 测试降级策略
  - [x] 测试错误处理

## 阶段 2：集成测试

- [x] 创建 `LLMSkillSelectionIntegrationTest`
  - [x] 测试完整的三层渐进式流程（Level 1 → Level 2 → Level 3）
  - [x] 使用真实数据库（Testcontainers 或 H2）
  - [x] Mock LLM 服务
  - [x] 验证技能选择结果
  - [x] 验证执行记录创建

- [x] 创建 `SkillSelectionCacheIntegrationTest`
  - [x] 测试缓存在实际场景中的工作
  - [x] 验证缓存命中率
  - [x] 测试缓存失效策略

- [x] 创建 `SkillSelectionFallbackIntegrationTest`
  - [x] 测试 LLM 失败时的降级策略
  - [x] 验证降级到规则驱动的流程
  - [ ] 测试部分失败场景

## 阶段 3：性能测试

- [x] 创建 `SkillSelectionPerformanceTest`
  - [x] 测试 Level 1 筛选性能
  - [x] 测试 Level 2 评估性能
  - [x] 测试 Level 3 决策性能
  - [x] 测试缓存对性能的影响
  - [x] 对比有缓存和无缓存的性能差异

- [ ] 创建 `SkillSelectionLoadTest`
  - [ ] 测试并发场景下的性能
  - [ ] 测试大量技能下的性能
  - [ ] 验证系统稳定性

## 阶段 4：对比测试

- [x] 创建 `SkillSelectionComparisonTest`
  - [x] 准备测试数据集（不同场景的用户消息）
  - [x] 对比 LLM 驱动和规则驱动的选择结果
  - [x] 计算准确率提升
  - [x] 分析选择差异
  - [x] 生成对比报告

- [ ] 创建 `SkillSelectionAccuracyTest`
  - [ ] 使用标准测试集
  - [ ] 验证 LLM 驱动的准确性
  - [ ] 验证规则驱动的准确性
  - [ ] 计算准确率指标

## 阶段 5：端到端测试

- [x] 创建 `SkillSelectionE2ETest`
  - [x] 测试真实对话场景
  - [x] 验证技能激活准确性
  - [x] 测试用户体验
  - [x] 验证技能执行结果

- [ ] 创建 `SkillSelectionScenarioTest`
  - [ ] 测试不同场景（工作助手、生活助手等）
  - [ ] 验证场景特定的技能选择
  - [ ] 测试多技能组合场景

## 阶段 6：测试工具和报告

- [x] 创建测试工具类
  - [x] `SkillTestUtils` - 测试辅助工具
  - [x] `MockLLMResponseBuilder` - Mock LLM 响应构建器
  - [ ] `TestDataFactory` - 测试数据工厂（可选）

- [ ] 配置测试报告
  - [ ] 配置 JUnit 测试报告
  - [ ] 配置覆盖率报告（JaCoCo）
  - [ ] 配置性能测试报告

- [ ] 创建测试文档
  - [ ] 测试用例文档
  - [ ] 测试执行指南
  - [ ] 测试结果分析报告
