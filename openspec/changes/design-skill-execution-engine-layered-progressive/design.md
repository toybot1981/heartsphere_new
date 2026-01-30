# Design: 技能执行引擎——分层渐进式执行

## Context

- **Claude Skill 执行逻辑**（来自 skill-creator）：采用 Progressive Disclosure——L1 元数据（name + description）常驻上下文；L2（SKILL.md 正文）在技能触发时加载；L3（Bundled Resources）按需加载或执行（如脚本可直接执行而不必读入上下文）。
- **当前实现**：技能选择侧已有分层渐进加载（ProgressiveSkillLoader：loadLevel1/2/3、loadLevel2Batch/loadLevel3Batch；LLMSkillSelector 的 Level1→Level2→Level3 筛选）。执行侧 SkillExecutor 则一次性加载 definition + instructions + resources，再调用 Handler，无分层阶段。
- **约束**：需保持与现有 SkillExecutionHandler 契约兼容（SCRIPT/API/GRAPH/DATABASE/RULE_BASED），执行结果形态与调用方（如 SkillExecutionController、对话/图谱节点）不变。

## Goals / Non-Goals

- **Goals**
  - 定义执行引擎的「分层渐进式」执行模型，与 Claude 三层披露概念对齐。
  - 明确各阶段职责：L1 解析与校验、L2 指令加载与应用、L3 资源按需加载与执行。
  - 为 Handler 提供清晰入参契约（可沿用当前「skill + instructions + resources + parameters + context」；可选扩展「按需 L3」回调），便于后续实现按需加载。
- **Non-Goals**
  - 不改变现有 API 对外行为（execute(skillId, parameters, context) 的输入输出契约保持不变）。
  - 不在本设计内实现「L3 完全懒加载」的具体代码，仅定义接口与阶段划分；实现放在 apply 阶段。

## Decisions

### 1. 执行阶段划分（三层渐进）

- **Phase 1（L1 — 解析与校验）**：根据 skillId 解析技能元数据（或使用选择侧已提供的 definition）；校验参数、权限与使用限制；决定是否继续执行。此阶段不加载指令正文与资源。
- **Phase 2（L2 — 指令加载与应用）**：加载该技能的 Level 2 指令（skill_instructions 或等效的 skill_content）；将指令作为「系统/上下文」交给执行逻辑（如 RULE_BASED 的系统提示、SCRIPT 的配置来源）。若执行类型不需要指令，可跳过加载。
- **Phase 3（L3 — 资源加载与执行）**：按执行类型与 Handler 需求加载 Level 3 资源（scripts/references/assets）。允许「按需加载」：Handler 可声明所需 resourceType 或通过回调在运行中请求某资源，引擎再加载并注入。脚本类资源可「执行而不必读入上下文」以节省 token。
- **Rationale**：与 Claude 的 L1→L2→L3 披露一致；选择侧已有 ProgressiveSkillLoader，执行侧复用同一层级概念，便于统一术语与后续优化（如执行时缓存 L2、L3 按需拉取）。

### 2. 与现有 SkillExecutor / Handler 的关系

- **保持入口不变**：`execute(skillId, parameters, context)` 仍由当前 SkillExecutor（或未来的「执行引擎」门面）提供；内部实现改为按 Phase 1 → 2 → 3 顺序执行。
- **Handler 契约**：现有 Handler 接口 `execute(skill, instructions, resources, parameters, context)` 保留；引擎在 Phase 2 后提供 instructions，在 Phase 3 后提供 resources（可为空或按需填充）。可选扩展：增加「资源按需加载」接口（如 `loadResource(skillId, resourceType, resourceName)`），由引擎实现并注入 Handler，实现阶段再定。
- **ProgressiveSkillLoader 复用**：执行引擎应复用 ProgressiveSkillLoader 的 loadLevel2(skillId)、loadLevel3(skillId)（或 batch 版本），避免重复实现加载逻辑。

### 3. 错误与短路

- Phase 1 失败（如技能不存在、参数不合法、权限不足）：直接返回失败，不加载 L2/L3。
- Phase 2 失败（如指令加载失败）：可配置为「降级执行」（仅用 definition 元数据）或直接失败，由实现与配置决定。
- Phase 3 失败（如某资源缺失）：由 Handler 决定是否降级或报错；引擎负责记录阶段与错误信息便于排查。

### 4. 与技能选择流水线的关系

- 选择侧：Level1 候选 → Level2 评估 → Level3 终选，输出最终要执行的 skillId（及可选已加载的 definition）。
- 执行侧：接收 skillId（及可选已缓存的 definition），按 L1→L2→L3 渐进执行。若调用方来自选择流水线且已持有 definition，可在 Phase 1 复用该 definition，避免重复查库。

## Risks / Trade-offs

- **复杂度**：引入明确阶段后，执行路径变长，需保证日志与监控能区分阶段失败。
- **兼容性**：现有 Handler 均接收「全量 instructions + resources」；若未来增加「L3 按需」接口，需为旧 Handler 保留「预先加载全部 L3」的默认行为。
- **性能**：按需加载 L3 可能增加单次执行的 IO 次数；可通过缓存、预加载策略在实现阶段平衡。

## Migration Plan

- 本提案仅产出设计与规格，无数据或 API 迁移。
- 实现时：在现有 SkillExecutor 内重构为三阶段调用，或新增 LayeredSkillExecutionEngine 门面并逐步将调用方从 SkillExecutor 迁移至该门面；保留 SkillExecutor.execute 对外签名并委托给新引擎即可。

## Open Questions

- 是否在首个实现中即支持「L3 按需加载」回调，还是先完成三阶段顺序加载再迭代按需接口？
- Phase 2 失败时默认策略：硬失败 vs 降级为仅用元数据执行，是否做成配置项？
