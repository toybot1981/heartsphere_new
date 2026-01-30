# Design: API 和 web 测试用例方案

## Context

- project.md 已有「提案与前端自动化测试」（Web 方案由 web-automation-testing 完成，需求分析优先，资产存前端 e2e）与「关键 API 自动化测试资产位置」（API 方案由 api-automation-testing 完成，需求分析优先，资产存后端 api-tests；失败时查日志、修复、scripts/start/ 重启再测）。
- 两段内容分散，创建提案或编写用例时缺少单一入口的「方案」总览，易忽略其一或混淆流程。

## Goals / Non-Goals

- **Goals**
  - 在 project.md 中提供统一的「API 和 web 测试用例方案」总览，明确何时用 Web 方案、何时用 API 方案，以及统一流程与存放位置、API 失败处理。
  - 在 OpenSpec 中新增 capability automation-test-scheme，将上述方案固化为可追溯的 ADDED 需求。
- **Non-Goals**
  - 不修改 web-automation-testing、api-automation-testing 技能的脚本或 SKILL.md 内容。
  - 不删除或改写现有「提案与前端自动化测试」「关键 API 自动化测试资产位置」细则，仅增加总览与引用。

## Decisions

- **总览与细则关系**：新增「API 和 web 测试用例方案」总览小节，用列表或表格归纳「Web 方案 / API 方案」的触发条件、执行技能、流程要点、资产位置、API 失败处理；正文中引用「详见下方提案与前端自动化测试、关键 API 自动化测试资产位置」。
- **Spec 与 project.md 一致**：automation-test-scheme 的 ADDED 需求与 project.md 总览一一对应，Scenario 覆盖「创建提案时选择 Web/API 方案」「需求分析优先」「资产存放」「API 失败后重启再测」等，便于校验与追溯。
- **不引入新技能或脚本**：本变更为规范与文档层面的整合，无新仓库或新执行器。

## Risks / Trade-offs

- 若未来 project.md 中两段细则有修订，需同步更新总览与 automation-test-scheme spec，避免三者不一致；建议在细则段落旁加简短注释「与 automation-test-scheme 及上方总览保持一致」。

## Open Questions

- 无。
