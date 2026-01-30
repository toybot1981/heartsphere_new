# 现实世界模块全面自动化测试 — 设计说明

## Context

- **基线**：`add-realworld-journal-memory-automation-tests` 已在 `main/frontend/e2e/realworld-journal-memory/` 建立 test_plan.json 与 10 个用例（进入现实世界、日记 CRUD、写今日、记忆模态框、记忆展示、记忆提取异步、列表、搜索），部分任务尚未完成（如全量执行通过、需求分析文档）。
- **项目规范**：project.md 要求涉及前端页面功能的提案须提供自动化测试方案，由 web-automation-testing 技能完成，测试资产存放于前端项目专有目录；AGENTS.md 与技能要求先对模块/功能点做需求分析，再围绕需求编写用例。
- **目标**：对现实世界模块（日记、记忆提取）做**全面**自动化测试：需求分析 → 用例与需求可追溯 → 扩展至模块内所有功能 → 执行直至全部通过。

## Goals / Non-Goals

- **Goals**:
  - 在 e2e 目录下产出需求分析文档（或等价结构），使 test_suites / test_cases 与功能点、验收条件可追溯。
  - 在现有用例基础上按需求查漏补缺（如排序、空状态、错误分支），达到「现实世界模块所有功能均有用例」的覆盖目标。
  - 通过 web-automation-testing 执行测试，失败交 Agent 修复、支持 --resume-from，直至全部通过并保存报告于 e2e 目录。
- **Non-Goals**:
  - 不修改 web-automation-testing 技能的脚本逻辑（仅按现有流程使用）；
  - 不改变 main 业务代码；
  - 不在此变更内实现 main 全站 e2e，仅聚焦现实世界日记与记忆提取。

## Decisions

### 1. 需求分析产出形式

- **首选**：在 `main/frontend/e2e/realworld-journal-memory/REQUIREMENTS.md` 中列出功能点与验收条件，并在 test_plan.json 的 `metadata` / `requirements` 中引用或复述，使每个 test_case 能在文档或 plan 中对应到至少一个功能点。
- **可接受**：若 test_plan.json 已包含足够详细的 `requirements` 数组且与 test_suites 对应，可在 README 中说明对应关系，不强制单独 REQUIREMENTS.md。

### 2. 覆盖范围与用例扩展

- **必须覆盖**：进入现实世界、新建/编辑/删除日记、写今日、日记列表与搜索、打开「查看从日记中提取的记忆」、记忆展示、记忆提取异步完成（与现有 test_plan 一致）。
- **建议补充**：日记列表排序（若产品有）、空状态（无日记时、无记忆时）、搜索无结果等；具体以需求分析结果为准，不强行增加产品未实现的功能。

### 3. 执行与失败处理

- **执行**：使用 `test_runner.py` 默认行为（失败即终止，不自动重试）；结果交 Agent 分析修复后由 Agent 再次发起测试。
- **现场恢复**：使用 `--resume-from test_run_state.json` 从失败用例继续，避免每次从头跑全量。
- **报告**：报告与 test_run_state 存放于 `main/frontend/e2e/realworld-journal-memory/`，便于与前端代码同仓维护。

### 4. 与现有变更的关系

- **add-realworld-journal-memory-automation-tests**：本变更在其建立的目录与 test_plan 基础上做需求分析、用例扩展与「全部通过」的交付，不替代该变更；完成后可考虑在文档中注明两变更的衔接关系。
- **require-frontend-e2e-test-plan-in-proposals**：本变更遵循其规定的「前端提案须提供自动化测试方案、由技能完成、存放于前端 e2e 目录」及「需求分析 → 围绕需求编写用例」流程。

## Risks / Trade-offs

- **环境与稳定性**：全量通过依赖 main 前端+后端（及可选 hsmem）稳定运行与网络；若环境不稳定，可先交付需求分析 + 扩展后的 test plan，将「全部通过」标为后续迭代目标。
- **需求来源**：若缺少成文需求文档，需求分析可从现有 UI 与 add-realworld-journal-memory-automation-tests / build-electron-desktop-and-optimize-realworld-journal 等提案中提取，并在 REQUIREMENTS.md 中注明来源。

## Open Questions

- 无阻塞项；实施中若发现与 add-main-project-e2e-testing 的端口或账号不一致，在收尾任务中记录并对齐即可。
