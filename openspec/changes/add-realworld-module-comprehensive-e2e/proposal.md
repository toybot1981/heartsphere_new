# Change: 现实世界模块（日记、记忆提取）全面自动化测试

## Why

main 工程的「现实世界」模块（日记与记忆提取）已有基础 e2e 用例（见 `add-realworld-journal-memory-automation-tests`），但尚未从**需求分析出发**系统化覆盖所有功能点，且未达成「全部用例通过」的全面测试目标。需要按项目规范（project.md：前端功能提案须提供自动化测试方案，由 web-automation-testing 技能完成；技能先做需求分析再编写用例）对现实世界模块进行**需求分析 → 围绕需求编写/扩展用例 → 执行直至全部通过**的全面自动化测试。

## What Changes

- **需求分析文档**：在 `main/frontend/e2e/realworld-journal-memory/` 下新增或补充**需求分析**产出（如 `REQUIREMENTS.md` 或 test plan 的 `metadata.requirements` 与功能点对应），从提案/需求文档/页面实现中提取现实世界日记与记忆提取的功能点与验收条件，使 test_suites、test_cases 可追溯到具体需求。
- **用例与覆盖**：在现有 test_plan.json 基础上，按需求查漏补缺（如日记排序、空状态、记忆空状态、错误分支等），确保「现实世界模块所有功能」均有对应用例；遵循测试覆盖原则：先核心路径，再按模块内步骤/入口逐项补充，每轮扩展后执行完整测试，失败交 Agent 修复再跑，直到全部通过。
- **执行与交付**：通过 web-automation-testing 技能执行测试；失败时终止并将结果交 Agent 分析修复，再由 Agent 发起下一轮测试；测试方案资产（test_plan.json、README、REQUIREMENTS.md、报告等）均保存在 `main/frontend/e2e/realworld-journal-memory/`，与 project.md 约定一致。
- **无业务代码变更**：不修改 main 前端/后端的业务实现，仅测试计划、需求文档与执行流程。

## Impact

- **Affected specs**: 本变更在 capability `realworld-journal-memory-e2e` 下以 ADDED 形式增加「全面覆盖」与「需求驱动测试设计」相关要求。
- **Affected code / 资产**:
  - `main/frontend/e2e/realworld-journal-memory/`：新增或更新 REQUIREMENTS.md（或等价需求分析）、test_plan.json 的扩展用例、README/执行说明；测试报告与现场状态文件可存放于同目录或子目录。
  - 不修改 `.claude/skills/web-automation-testing/` 的实现逻辑；技能已有「需求分析 → 围绕需求编写用例」的流程说明，本变更按该流程执行即可。
- **Breaking changes**: 无。
- **依赖与前置**:
  - 现有 `add-realworld-journal-memory-automation-tests` 已建立的 e2e 目录与 test_plan.json 可作为基线；
  - main 前端、后端（及可选 hsmem）可本地运行，测试账号可用；
  - web-automation-testing 技能（test_runner、test_executor、report_generator 等）可用。
