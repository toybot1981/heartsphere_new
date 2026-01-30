# 技能选择和激活机制测试方案

## Why

技能选择和激活机制已实现 LLM 驱动的三层渐进式加载功能，但缺乏完整的测试覆盖。没有测试，无法确保：

1. **功能正确性**：三层渐进式流程是否正常工作
2. **性能优化**：缓存机制是否有效
3. **可靠性**：降级策略是否可靠
4. **准确性**：LLM 驱动是否比规则驱动更准确
5. **用户体验**：真实场景中的技能激活是否准确

通过全面的测试，可以：
- 验证系统正确性和可靠性
- 防止回归问题
- 提供使用示例和文档
- 建立对系统的信心

## Context

技能选择和激活机制已实现 LLM 驱动的三层渐进式加载功能（`optimize-skill-selection-with-llm-judgment`），包括：

1. **LLM 驱动的技能选择**：使用大模型进行语义理解，替代规则驱动
2. **三层渐进式提示词加载**：Level 1（元数据）→ Level 2（指令）→ Level 3（资源）
3. **降级策略**：LLM 失败时自动回退到规则驱动
4. **缓存机制**：优化性能，减少 LLM 调用

目前缺乏完整的测试覆盖，需要：
- 单元测试：验证各个组件的功能
- 集成测试：验证完整的三层渐进式流程
- 性能测试：验证缓存和性能优化
- 对比测试：LLM 驱动 vs 规则驱动的准确性对比
- 端到端测试：验证真实对话场景

## Goals

### Goals

1. **完整的测试覆盖**：为技能选择和激活机制提供全面的测试
2. **验证三层渐进式流程**：确保 Level 1/2/3 的完整流程正常工作
3. **性能验证**：验证缓存机制和性能优化效果
4. **准确性对比**：对比 LLM 驱动和规则驱动的准确性
5. **降级策略验证**：确保 LLM 失败时能正确降级
6. **端到端验证**：验证真实对话场景中的技能激活

### Non-Goals

- **修改现有功能**：只进行测试，不修改业务逻辑
- **性能优化**：测试阶段不进行性能优化，只验证现有性能
- **UI 测试**：不包含前端 UI 的自动化测试

## Decisions

### Decision 1: 测试框架选择

**使用 JUnit 5 + Mockito + Spring Boot Test**：
- JUnit 5：单元测试和集成测试框架
- Mockito：Mock LLM 服务和其他依赖
- Spring Boot Test：集成测试支持
- Testcontainers（可选）：数据库集成测试

**优势**：
- 与现有测试框架一致
- 支持 Spring Boot 集成测试
- 易于 Mock 外部依赖（LLM 服务）

### Decision 2: 测试分层

**采用三层测试结构**：
1. **单元测试**：测试单个组件（SkillPromptBuilder, LLMSkillSelector, ProgressiveSkillLoader）
2. **集成测试**：测试完整流程（三层渐进式选择）
3. **端到端测试**：测试真实对话场景

**优势**：
- 快速定位问题
- 测试覆盖全面
- 易于维护

### Decision 3: Mock 策略

**Mock LLM 服务**：
- 使用 Mockito Mock AIService
- 返回预定义的 JSON 响应
- 支持不同的测试场景（成功、失败、超时）

**优势**：
- 不依赖外部 LLM 服务
- 测试速度快
- 可重复性强

## Impact

### 正面影响

1. **质量保证**：确保技能选择机制的正确性
2. **回归测试**：防止后续修改破坏现有功能
3. **文档作用**：测试用例作为使用示例
4. **信心提升**：通过测试验证系统可靠性

### 潜在风险

1. **测试维护成本**：需要随着功能变化更新测试
2. **测试执行时间**：集成测试可能较慢
3. **Mock 复杂性**：Mock LLM 响应需要维护

## Success Criteria

1. **测试覆盖**：核心功能测试覆盖率达到 80% 以上
2. **测试通过率**：所有测试用例通过
3. **性能验证**：缓存命中率、响应时间符合预期
4. **准确性对比**：LLM 驱动比规则驱动准确率提升 20% 以上
5. **降级验证**：LLM 失败时能正确降级到规则驱动

## Related Changes

- `optimize-skill-selection-with-llm-judgment` - 技能选择和激活机制优化（已实现）

## References

- `main/backend/src/test/java/com/heartsphere/ai/skill/engine/SkillApplicationEngineTest.java` - 现有测试示例
- `main/backend/src/test/java/com/heartsphere/ai/skill/integration/SkillApplicationIntegrationTest.java` - 现有集成测试示例
