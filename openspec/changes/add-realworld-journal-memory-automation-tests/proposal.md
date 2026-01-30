# Change: 使用 web-automation-testing 技能对 main 工程现实世界日记与记忆提取功能进行自动化测试

## Why

Main 工程的「现实世界」日记功能（RealWorldScreen）与日记相关的记忆提取功能（JournalMemoryIntegration、JournalMemoryModal）是核心用户能力，目前缺乏基于真实浏览器行为的自动化测试。通过引入项目内已有的 **web-automation-testing** 技能（Test Planner / Executor / Fixer / Runner + Playwright），可以：

1. **可复现验证**：对日记的创建、编辑、删除、写今日、列表与筛选等真实用户路径做端到端验证。
2. **记忆提取可观测**：对「从日记中提取记忆」及其在前端的展示（如 JournalMemoryModal）做自动化校验，确保流程贯通。
3. **技能能力验证与完善**：在针对心域实际页面（中文 UI、SPA 导航、无 URL 路由）的执行过程中，验证 web-automation-testing 技能是否满足需求，并据此完善技能（步骤语法、选择器策略、报告与文档等）。

## What Changes

- **新增**：基于 web-automation-testing 技能的、针对 main 工程「现实世界日记」与「记忆提取」的自动化测试资产与执行流程。
  - 测试计划（test plan JSON）覆盖：进入现实世界、日记 CRUD、写今日、打开「查看从日记中提取的记忆」、校验记忆展示等场景。
  - 测试执行与报告：通过技能提供的 test_runner / test_executor / report_generator 在本地或 CI 中运行并产出报告。
- **新增**：对 web-automation-testing 技能的验证结论与完善项。
  - 在 main 工程实际页面（如 `http://localhost:3000` 或项目约定端口）上运行上述测试，记录技能在中文文案、SPA 状态导航、选择器稳定性等方面的表现。
  - 根据验证结果，在技能内增加或调整：参考资料（references）、示例（examples）、步骤语法说明或推荐实践，必要时在 scripts 中做小范围增强（如对 `text=` 与中文的兼容、可选「等待模态框」步骤等）。
- **对齐更新后技能**：执行与修复流程遵循 web-automation-testing 技能的完整工作流。
  - **测试失败时检查前后端日志**：使用技能提供的 log 检查能力，自动或按文档检查 main 前端、后端（及可选 hsmem）的日志，定位服务端错误并修复。
  - **服务重启**：若需重启服务，统一通过项目根目录下 `scripts/start/` 中的脚本启动（如 `scripts/start/start-main-frontend.sh`、`scripts/start/start-main-backend.sh`），不直接使用 `npm run dev` 或 `mvn spring-boot:run` 等 ad-hoc 命令，以与技能的 service_manager / service_config 一致。
  - **持续测试**：可使用技能的连续执行模式（execute → check logs → fix services → fix tests → retry），直至通过或手动中断；报告中将包含服务修复与日志检查记录。
- **不变更**：main 工程业务代码与现有 e2e 框架的职责划分保持现状；本变更仅新增基于该技能的测试用例与技能完善，不替代已有的 add-main-project-e2e-testing 规划，可与之并存或后续整合。

## Impact

- **Affected specs**: 新增 capability `realworld-journal-memory-e2e`（本变更内以 ADDED 形式出现）。
- **Affected code / 资产**:
  - 测试资产可置于：`main/frontend/e2e/` 或项目约定的 e2e 目录下，例如 `main/frontend/e2e/realworld-journal-memory/`，包含 test plan JSON、以及调用 web-automation-testing 技能的说明或脚本。
  - web-automation-testing 技能：`.claude/skills/web-automation-testing/` 下的 SKILL.md、references、examples 或 scripts 可能根据验证结果做完善。
- **Breaking changes**: 无。
- **依赖与前置**:
  - main 前端可在本地以约定端口（如 3000）运行，main 后端以约定端口（如 8081）运行；
  - 具备可用的测试账号或测试数据（与 add-main-project-e2e-testing 中约定的 tongyexin/123456 等保持一致或单独约定）；
  - web-automation-testing 技能所依赖的 Python 环境与 Playwright 可用；
  - 项目根目录下存在 `scripts/start/start-main-frontend.sh` 与 `scripts/start/start-main-backend.sh`，供技能在失败修复与重启时使用。
