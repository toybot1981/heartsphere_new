# 现实世界日记与记忆提取自动化测试 — 设计说明

## Context

- **被测对象**：main 工程前端「现实世界」日记（RealWorldScreen）及从日记中提取的记忆展示（JournalMemoryModal、日记保存后触发的记忆提取链路）。
- **测试手段**：使用项目内 web-automation-testing 技能，基于 Playwright 的 test plan → execute → fix → report 流程。
- **约束**：main 前端为 SPA，进入「现实世界」依赖应用内状态（如 `currentScreen === 'realWorld'`），由「进入现实」等入口点击触发，无独立 URL；记忆提取依赖后端/hsmem，测试可能需要在有后端与登录态的环境下运行。

## Goals / Non-Goals

- **Goals**:
  - 使用 web-automation-testing 技能对现实世界日记与记忆提取功能编写并执行可重复的自动化测试。
  - 在真实浏览器中覆盖：进入现实世界、新建/编辑/删除日记、写今日、打开并校验「查看从日记中提取的记忆」等关键路径。
  - 记录技能在实际心域页面上的表现，并据此完善技能文档、示例或脚本。
- **Non-Goals**:
  - 不在本阶段实现完整的 main 全量 e2e 覆盖（由 add-main-project-e2e-testing 等负责）；
  - 不修改记忆提取或日记的后端/算法逻辑，仅验证前端与既有集成行为。

## Decisions

### 1. 测试入口与前置条件

- **入口**：测试从 main 前端根地址开始（如 `http://localhost:3000`），通过「登录 → 进入现实」或「游客昵称 → 进入现实」进入现实世界；具体采用登录还是游客由环境与数据策略决定，在 test plan 与 tasks 中写明。
- **选择**：优先使用与 add-main-project-e2e-testing 一致的测试账号（如 tongyexin/123456），便于复用环境与账号数据。

### 2. 步骤与选择器策略

- **中文 UI**：步骤中使用 `text=进入现实`、`text=写今日`、`text=查看从日记中提取的记忆` 等中文文案进行点击与校验；若技能默认解析 `text=xxx` 时有编码或截断问题，则在验证阶段记录并在技能侧补充说明或修正。
- **SPA 导航**：不依赖 URL 变化，依赖「出现现实世界/日记相关特征内容」作为步骤中的 verify，例如 `verify text=写今日` 或 `verify text=新思维`（编辑区标题）等。
- **模态框**：打开「查看从日记中提取的记忆」后会弹出 JournalMemoryModal，步骤中需包含「等待模态框内特征文案出现」或「等待某 selector 出现」，避免过早断言。

### 3. 测试资产摆放与技能调用方式

- **摆放**：在 main 工程下约定目录（如 `main/frontend/e2e/realworld-journal-memory/`）存放 test plan JSON 及简短 README，说明如何调用 web-automation-testing 的 scripts（如 `python scripts/test_runner.py ...`）；技能本体仍位于 `.claude/skills/web-automation-testing/`，不复制一份到 main。
- **调用方式**：通过文档或小包装脚本指明「工作目录、plan 路径、app_url、端口」等，使 AI 或开发者能直接按技能文档执行测试。

### 4. 技能完善范围

- **验证产出**：运行上述测试后，产出「验证报告」或结论：哪些步骤稳定通过、哪些因选择器/等待/中文导致失败，以及是否需要对技能做改动。
- **完善内容**：在技能内可选增加——（1）references 中「中文 UI 与 SPA 场景」的步骤写法建议；（2）examples 中增加一例「现实世界日记 + 记忆」的 test plan 片段或完整示例；（3）若有脚本级 bug（如 `text=` 与中文解析），在 scripts 中做最小改动并注明。

### 5. 测试失败时的日志检查与服务重启（对齐更新后技能）

- **日志检查**：测试失败时，按 web-automation-testing 技能流程检查对应前后端日志。技能提供自动或文档化步骤：解析并检查 main 前端、main 后端（及可选 hsmem）的日志路径（可由 `scripts/start/` 内启动脚本或技能 service_config 推断），定位连接失败、5xx、未就绪等错误，并据此修复配置或代码。
- **服务重启**：若修复后需要重启服务，统一通过项目根目录下 `scripts/start/` 的脚本启动，例如：
  - 前端：`scripts/start/start-main-frontend.sh`（端口 3000）；
  - 后端：`scripts/start/start-main-backend.sh`（端口 8081）。
- **不 ad-hoc 启动**：不在此测试方案的文档或脚本中约定直接使用 `npm run dev`、`mvn spring-boot:run` 等命令作为「官方」重启方式，以便与技能的 service_manager / log 解析一致，并便于 CI 或统一环境复现。

## Risks / Trade-offs

- **环境依赖**：测试需 main 前端 + 后端（及可选 hsmem）运行，若仅前端 mock 则记忆提取相关用例可能无法完全验证；接受为「优先在本地完整环境跑通，CI 集成可后续补充」。
- **稳定性**：SPA 与异步加载可能带来偶发超时或元素未就绪；通过「显式 wait」「重试」与技能自带的 test_fixer 缓解，若仍不足再在技能或 test plan 中增加更保守的等待策略。

## Open Questions

- 记忆提取为异步，测试中「保存日记 → 打开记忆模态框」后，是否需要固定等待时间或轮询「记忆条数 > 0」再断言，由实施阶段在 test plan 中具体写法确定，并在验证报告中记录。
