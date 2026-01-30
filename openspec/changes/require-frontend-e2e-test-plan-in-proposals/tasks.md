## 1. 项目规范与文档

- [x] 1.1 在 `openspec/project.md` 中增加「提案与前端自动化测试」规范：创建提案时，若涉及前端页面功能，须提供自动化测试方案；方案由 web-automation-testing 技能完成；测试方案资产保存在对应前端项目下的专有目录（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`）
- [x] 1.2 在 `openspec/AGENTS.md` 的 Create tasks.md 或 Best Practices 中注明：涉及前端页面功能的提案，tasks.md 须包含提供自动化测试方案的任务，且方案由 web-automation-testing 完成、资产存放于前端项目专有目录

## 2. web-automation-testing 技能

- [x] 2.1 在 `.claude/skills/web-automation-testing/SKILL.md` 中增加「需求分析 → 围绕需求编写用例」的流程：先对编写用例的模块或功能点进行需求分析（从提案/需求/页面实现提取功能点与验收条件），再围绕需求编写 test plan（requirements、test_suites、test_cases 与需求对应）
- [x] 2.2 在技能中约定或说明：测试方案保存在前端项目下的专有目录（如 `admin/frontend/e2e/<feature>/`），并在 README 或 references 中给出目录示例与执行方式

## 3. 验证

- [x] 3.1 运行 `openspec validate require-frontend-e2e-test-plan-in-proposals --strict` 通过
- [x] 3.2 审阅 project.md、AGENTS.md、SKILL.md 修改，确认与现有测试覆盖原则、Create tasks 说明一致
