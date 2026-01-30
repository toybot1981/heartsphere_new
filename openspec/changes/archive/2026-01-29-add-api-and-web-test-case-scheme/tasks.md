## 1. project.md 规范

- [x] 1.1 在 `openspec/project.md` 的 Testing Strategy 下、在「提案与前端自动化测试」之前，新增「API 和 web 测试用例方案」总览小节
- [x] 1.2 总览中明确：触发条件（前端页面功能 → Web 方案；关键 API 模块 → API 方案）、执行技能（web-automation-testing / api-automation-testing）、统一流程（需求分析优先、再编写用例）、资产存放位置（Web：前端 e2e/<feature>/；API：后端 api-tests/<feature>/）、API 失败处理（查看后台日志、交 Agent 修复、scripts/start/ 重启后再测）
- [x] 1.3 总览中引用「详见下方提案与前端自动化测试、关键 API 自动化测试资产位置」，保持与现有两段细则一致

## 2. Spec 与校验

- [x] 2.1 在 `openspec/changes/add-api-and-web-test-case-scheme/specs/automation-test-scheme/spec.md` 中编写 ADDED 需求，覆盖「API 和 web 测试用例方案」的触发条件、流程、存放位置、API 失败处理，且每条需求至少一个 Scenario
- [x] 2.2 运行 `openspec validate add-api-and-web-test-case-scheme --strict` 通过
