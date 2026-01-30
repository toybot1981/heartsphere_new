# Change: 设计技能执行引擎——分层渐进式执行

## Why

当前技能执行器（SkillExecutor）在单次调用中一次性加载技能定义、Level 2 指令与 Level 3 资源，再交给具体 Handler 执行。这与 Claude Skill 的「渐进式披露」（Progressive Disclosure）逻辑不一致：Claude 侧是「L1 元数据常驻 → L2 指令在触发时加载 → L3 资源按需加载/执行」。若执行引擎也采用分层渐进式设计，可更好控制上下文与 IO（按需加载指令与资源）、便于与选择侧已有的 ProgressiveSkillLoader/Level1–3 流程对齐，并为后续「执行阶段按需拉取资源」留出扩展空间。

## What Changes

- 定义**技能执行引擎**的分层渐进式执行模型：L1 解析/校验（元数据）、L2 加载并应用指令、L3 按需加载/使用资源并执行。
- 在现有 SkillExecutor 与 ProgressiveSkillLoader 基础上，引入**执行阶段**的分层契约（何时加载 L2/L3、Handler 入参与按需资源接口）。
- 设计文档与规范：执行引擎的职责边界、与技能选择流水线的关系、Handler 接口的可选扩展（如 L3 按需加载回调）。
- **不**在本提案内实现具体代码，仅产出设计文档与规格（proposal、design、tasks、spec delta）；实现留在 apply 阶段。

## Impact

- Affected specs: 新增能力 `skill-execution-engine`（spec delta 仅 ADDED）。
- Affected code: 无代码变更于本提案阶段；后续实现将涉及 `main/backend` 的 `SkillExecutor`、`ProgressiveSkillLoader`、各 `SkillExecutionHandler` 及可能的执行引擎门面/编排类。
- 与现有能力关系：技能选择侧已有 Level1/2/3 渐进加载（ProgressiveSkillLoader、LLMSkillSelector）；本提案仅规范**执行侧**的渐进式执行模型，与之对齐概念并避免重复加载。
