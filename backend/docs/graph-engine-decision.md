# Graph引擎技术决策确认

**决策日期**: 2025-12-31  
**决策人**: 开发团队  
**状态**: ✅ 已确认

---

## 一、决策内容

**确认使用CustomGraphEngine作为Graph引擎的基础实现**

---

## 二、决策依据

### 2.1 技术预研结果

1. **Spring AI Graph不可用**
   - 所有可能的类路径都未找到
   - `pom.xml`中未找到Graph相关依赖
   - Spring AI Alibaba可能未提供Graph功能

2. **自定义Graph引擎可用**
   - 代码可以正常编译
   - 核心功能已实现
   - 可以作为替代方案使用

### 2.2 优势分析

1. **已有基础实现**
   - 核心功能已实现（节点、边、状态、路由）
   - 代码结构清晰，易于扩展

2. **灵活性和可控性**
   - 可以根据需求定制
   - 不依赖外部库，减少风险
   - 完全控制实现细节

3. **时间成本合理**
   - 已有基础实现
   - 只需扩展功能（估计3-5周）
   - 比研究Spring AI Graph更高效

---

## 三、实施计划

### 3.1 代码迁移

- ✅ 将`CustomGraphEngine`从`research`目录迁移到`core`目录
- ✅ 重命名为`GraphEngine`（更规范的命名）
- ✅ 添加异常处理
- ✅ 改进代码结构和文档

### 3.2 后续开发

1. **节点类型实现**（优先级：高）
   - 对话节点（DialogueNode）
   - 选择节点（ChoiceNode）
   - 条件判断节点（ConditionNode）
   - 技能检查节点（SkillCheckNode）
   - 状态变更节点（StateChangeNode）

2. **高级功能**（优先级：中）
   - 并行节点执行（ParallelNode）
   - 循环节点（LoopNode）
   - 错误处理和回滚

3. **状态持久化**（优先级：中）
   - 状态保存到数据库
   - 支持恢复执行

4. **性能优化**（优先级：低）
   - 执行性能优化
   - 缓存机制

### 3.3 时间估算

- **基础功能**：已完成 ✅
- **节点类型实现**：2-3周
- **高级功能**：1-2周
- **测试和优化**：1周
- **总计**：4-6周

---

## 四、代码位置

### 4.1 核心代码

- **正式实现**：`backend/src/main/java/com/heartsphere/aiagent/graph/core/GraphEngine.java`
- **预研代码**：`backend/src/main/java/com/heartsphere/aiagent/graph/research/CustomGraphEngine.java`（保留作为参考）

### 4.2 文档

- 技术预研报告：`backend/docs/graph-research-final-report.md`
- 本决策文档：`backend/docs/graph-engine-decision.md`
- 核心实现README：`backend/src/main/java/com/heartsphere/aiagent/graph/core/README.md`

---

## 五、风险评估

### 5.1 风险

- ⚠️ 需要自己实现和维护
- ⚠️ 可能需要更多测试
- ⚠️ 功能扩展需要时间

### 5.2 缓解措施

- ✅ 已有基础实现，风险可控
- ✅ 代码结构清晰，易于维护
- ✅ 可以逐步扩展功能
- ✅ 充分测试和文档化

---

## 六、后续行动

1. ✅ **代码迁移**：将CustomGraphEngine迁移到core目录
2. ⏳ **制定详细开发计划**：基于GraphEngine扩展功能
3. ⏳ **开始节点类型实现**：实现各种节点类型
4. ⏳ **集成到剧本系统**：将Graph引擎集成到剧本执行中

---

**决策状态**: ✅ 已确认  
**下一步**: 开始基于GraphEngine进行实际开发
