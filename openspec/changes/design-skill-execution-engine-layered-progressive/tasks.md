# Tasks: 设计技能执行引擎——分层渐进式执行

本变更仅包含设计与规格产出，实现置于 apply 阶段。

## 1. 设计文档与规格

- [ ] 1.1 完成 proposal.md（Why / What / Impact）
- [ ] 1.2 完成 design.md（Context / Goals / Decisions / Risks / Migration / Open Questions）
- [ ] 1.3 完成 specs/skill-execution-engine/spec.md（ADDED 需求与场景）
- [ ] 1.4 完成 tasks.md 并与 proposal 一致

## 2. 验收与归档

- [ ] 2.1 运行 `openspec validate design-skill-execution-engine-layered-progressive --strict` 并通过
- [ ] 2.2 提案评审通过后再进入 apply 阶段实现

## 3. 实现阶段（Apply 阶段，非本提案内）

以下为后续实现时的参考任务，不在本次「仅设计」范围内：

- [ ] 3.1 在 SkillExecutor 或新门面中实现 Phase 1（L1 解析与校验）
- [ ] 3.2 实现 Phase 2（L2 指令加载，复用 ProgressiveSkillLoader.loadLevel2）
- [ ] 3.3 实现 Phase 3（L3 资源加载，复用 ProgressiveSkillLoader.loadLevel3），并按执行类型注入 Handler
- [ ] 3.4 保持现有 Handler 契约与 execute(skillId, parameters, context) 对外行为不变
- [ ] 3.5 增加阶段级日志与可观测性（可选：指标/span）
- [ ] 3.6 单元测试与集成测试覆盖三阶段执行路径
