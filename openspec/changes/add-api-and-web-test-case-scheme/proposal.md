# Change: 编写 API 和 web 测试用例方案

## Why

当前 `openspec/project.md` 中「提案与前端自动化测试」与「关键 API 自动化测试资产位置」分属两段，缺少统一的「API 和 web 测试用例方案」表述。创建提案或编写测试时，需要明确：何时提供 Web 测试方案、何时提供 API 测试方案；两者统一的流程（需求分析优先、资产存放位置）；以及 API 测试失败时的处理（查看后台日志、修复、使用 `scripts/start/` 重启、再测）。本变更将上述内容整合为**统一的 API 和 web 测试用例方案**，便于在创建提案与执行测试时一致遵循。

## What Changes

- **project.md 增加「API 和 web 测试用例方案」总览**
  - 在 Testing Strategy 下增加一小节「API 和 web 测试用例方案」，作为 Web 与 API 自动化测试的统一入口说明。
  - 明确**触发条件**：提案涉及前端页面功能 → 须提供 Web 测试方案；关键 API 模块 → 须提供/维护 API 测试方案。
  - 明确**执行技能**：Web 方案由 **web-automation-testing** 完成；API 方案由 **api-automation-testing** 完成。
  - 明确**统一流程**：先对目标模块/功能点进行需求分析，再围绕需求编写用例；测试方案资产存放位置（Web：对应前端项目 `e2e/<feature>/`；API：对应后端项目 `api-tests/<feature>/`）。
  - 明确**API 失败处理**：API 测试不通过时，查看后台日志、将结果交 Agent 修复、使用 `scripts/start/` 下对应脚本重启后台、再由 Agent 再次发起测试直至通过。
  - 现有「提案与前端自动化测试」「关键 API 自动化测试资产位置」两段保留，作为细则；总览小节引用并归纳上述内容，避免重复表述冲突。

- **新增 capability：automation-test-scheme**
  - 在 `specs/automation-test-scheme/spec.md` 中以 ADDED 形式固化「API 和 web 测试用例方案」的可追溯需求（何时提供哪种方案、流程、存放位置、API 失败处理），与 project.md 规范一致，便于 OpenSpec 校验与后续引用。

## Impact

- **受影响的能力**：新增 capability `automation-test-scheme`（本变更内以 ADDED 形式出现在 `specs/automation-test-scheme/spec.md`）。
- **受影响的文档**：
  - `openspec/project.md`：在 Testing Strategy 下新增「API 和 web 测试用例方案」总览小节；现有「提案与前端自动化测试」「关键 API 自动化测试资产位置」段落不变，仅被总览引用。
- **依赖与前置**：
  - 依赖现有 `require-frontend-e2e-test-plan-in-proposals`、`add-api-automation-testing-skill` 已落地的 project.md 细则与技能实现。
  - 不修改 web-automation-testing、api-automation-testing 技能实现，仅在 project.md 与 spec 中做规范整合。
