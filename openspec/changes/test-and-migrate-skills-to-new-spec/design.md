# Design: 测试 Skill Creator 并迁移现有技能到新规范

## 设计决策

### Decision 1: 测试策略

**问题**: 如何全面测试 Skill Creator 工具？

**决策**: 采用分层测试策略
- **单元测试**: 测试各个服务类的独立功能
- **集成测试**: 测试服务之间的协作
- **E2E测试**: 测试完整的用户流程

**理由**:
- 分层测试可以快速定位问题
- 单元测试保证代码质量
- 集成测试保证系统协作正确
- E2E测试保证用户体验

**影响**:
- 需要编写大量测试代码
- 需要维护测试数据
- 测试执行时间可能较长

---

### Decision 2: 迁移策略

**问题**: 如何将现有技能从旧规范迁移到新规范？

**决策**: 采用渐进式迁移策略
1. **分析阶段**: 分析现有技能结构和缺失字段
2. **转换阶段**: 将旧格式转换为新格式
3. **验证阶段**: 验证转换后的数据
4. **修复阶段**: 修复不符合规范的问题
5. **测试阶段**: 测试迁移后的技能功能

**理由**:
- 渐进式迁移降低风险
- 可以分批次处理
- 便于回滚和修复

**影响**:
- 迁移过程需要时间
- 需要处理各种边界情况
- 需要保持向后兼容

---

### Decision 3: Function Schema 转换

**问题**: 如何将 `function_schema` 转换为 `mcp_tool_config`？

**决策**: 采用智能转换 + 降级方案
- **可转换情况**: 如果 `function_schema` 定义的函数可以在MCP工具中找到对应，则转换为 `mcp_tool_config`
- **不可转换情况**: 如果无法找到对应MCP工具，则保留 `function_schema`（标记为废弃），并在 `skill_content` 中使用描述方式

**理由**:
- 不是所有 Function Calling 都能转换为 MCP 工具
- 需要保持功能可用性
- 描述方式可以作为降级方案

**影响**:
- 需要维护转换映射表
- 需要处理无法转换的情况
- 过渡期需要支持两种格式

---

### Decision 4: Skill Content 生成

**问题**: 如何为现有技能生成 `skill_content`？

**决策**: 使用 `SkillContentBuilder` 服务生成
- 从 `skill_definitions` 表的字段生成 YAML 元数据
- 从 `skill_instructions` 表生成 Markdown 指令
- 组合生成完整的 SKILL.md 格式内容

**理由**:
- 复用现有代码
- 保证格式一致性
- 便于维护

**影响**:
- 需要确保数据完整性
- 需要处理缺失数据的情况

---

### Decision 5: 向后兼容

**问题**: 如何在迁移过程中保持向后兼容？

**决策**: 在技能执行器中支持新旧两种格式
- 优先使用新格式（`mcp_tool_config`, `skill_content`）
- 如果新格式不存在，降级使用旧格式（`function_schema`）
- 记录使用旧格式的技能，便于后续迁移

**理由**:
- 确保迁移过程中系统可用
- 降低迁移风险
- 允许分批次迁移

**影响**:
- 需要维护两套执行逻辑
- 代码复杂度增加
- 需要逐步淘汰旧格式

---

### Decision 6: 质量提升策略

**问题**: 如何提升现有技能的质量？

**决策**: 使用 `SkillQualityAnalyzer` 分析并自动修复
- 分析技能描述质量，提供改进建议
- 检查必填字段完整性
- 自动生成缺失的字段（如版本、作者等）
- 优化描述内容，提高质量评分

**理由**:
- 自动化提升效率
- 保证质量一致性
- 减少人工工作量

**影响**:
- 需要定义质量标准和修复规则
- 可能需要人工审核自动修复结果

---

## 架构设计

### 迁移服务架构

```
SkillMigrationService
├── SkillAnalyzer          # 分析现有技能
├── FunctionSchemaConverter # Function Schema 转换
├── SkillContentGenerator   # Skill Content 生成
├── MetadataEnricher        # 元数据补充
├── SkillValidator          # 迁移后验证
└── MigrationReporter       # 迁移报告生成
```

### 测试架构

```
Tests
├── Unit Tests
│   ├── SkillValidationServiceTest
│   ├── McpToolValidatorTest
│   ├── SkillQualityAnalyzerTest
│   ├── SkillTemplateServiceTest
│   ├── SkillCreatorServiceTest
│   └── SkillContentBuilderTest
├── Integration Tests
│   ├── SkillCreatorFlowTest
│   ├── McpToolValidationTest
│   └── ApiIntegrationTest
└── E2E Tests
    ├── SkillCreationE2ETest
    └── SkillMigrationE2ETest
```

---

## 数据迁移流程

### 迁移步骤

1. **分析阶段**
   - 扫描 `skill_definitions` 表
   - 识别缺失字段
   - 分析 `function_schema` 结构

2. **转换阶段**
   - 转换 `function_schema` 到 `mcp_tool_config`（如果适用）
   - 生成 `skill_content`
   - 补充元数据字段

3. **验证阶段**
   - 验证数据格式
   - 验证必填字段
   - 验证MCP工具可用性

4. **修复阶段**
   - 修复格式错误
   - 补充缺失字段
   - 优化描述内容

5. **测试阶段**
   - 测试技能执行
   - 验证功能正确性
   - 性能测试

---

## 风险和缓解

### 风险1: 迁移数据丢失

**风险**: 迁移过程中可能丢失数据

**缓解**:
- 迁移前备份数据
- 实现回滚机制
- 分批次迁移，逐步验证

### 风险2: 功能破坏

**风险**: 迁移后技能无法正常使用

**缓解**:
- 保持向后兼容
- 充分测试
- 灰度发布

### 风险3: 性能影响

**风险**: 迁移过程可能影响系统性能

**缓解**:
- 在低峰期执行迁移
- 批量处理优化
- 异步处理

---

## 迁移计划

### 阶段1: 测试开发（1-2周）
- 开发单元测试
- 开发集成测试
- 开发E2E测试

### 阶段2: 迁移工具开发（1-2周）
- 开发迁移服务
- 开发转换逻辑
- 开发验证工具

### 阶段3: 测试环境迁移（1周）
- 在测试环境执行迁移
- 验证迁移结果
- 修复问题

### 阶段4: 生产环境迁移（1周）
- 备份数据
- 执行迁移
- 验证功能
- 监控系统

---

## 成功标准

1. **测试覆盖率**: 单元测试覆盖率 > 80%
2. **迁移成功率**: 迁移成功率 > 95%
3. **功能正确性**: 迁移后的技能功能正常
4. **性能影响**: 迁移过程对系统性能影响 < 5%
5. **向后兼容**: 旧格式技能仍能正常使用（过渡期）
