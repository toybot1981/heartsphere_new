# Change: 根据更新后的 web-automation-testing 技能补充技能管理测试方案

## Why

管理端技能创建功能（专业创建器：AI 生成、文件导入、手动编辑及三种方式间的切换）是核心管理能力，目前主要依赖项目根目录下的 Playwright 脚本（如 `test_skill_creator.py`）进行手工或半自动验证，缺乏与 **web-automation-testing** 技能统一的测试计划与持续测试流程。更新后的 web-automation-testing 技能已支持：

1. **测试失败时检查前后端日志**，并可根据日志定位服务问题；
2. **使用项目标准启动脚本**（`scripts/start/`）进行服务重启；
3. **持续测试循环**（执行 → 失败 → 检查日志/修复 → 重试），直到通过或人为中断。

在此基础上，需要补充一套**技能管理专用的自动化测试方案**：以结构化测试计划（test plan JSON）为核心，覆盖技能创建、AI 生成、文件导入、方式切换与流程贯通，并能够通过 test_runner 与日志检查、服务重启能力形成闭环，便于回归与问题定位。

## What Changes

- **新增**：技能管理自动化测试方案与测试资产
  - 测试计划文档（如 `TEST_PLAN_DETAILED.md`）明确技能管理测试范围与用例步骤；
  - 结构化 test plan JSON（`test_plan.json`），覆盖：登录、进入专业创建器、AI 生成（多种描述）、文件导入（上传与粘贴）、三种创建方式切换、从 AI 生成/文件导入到手动编辑的流程；
  - 测试资产存放于约定目录（如 `admin/e2e/skill-management/` 或项目根下 `e2e/skill-management/`），与 web-automation-testing 技能的使用方式一致。
- **新增**：与 web-automation-testing 技能的执行与修复流程集成
  - 使用 `test_runner.py` 执行技能管理测试计划，支持失败时自动检查 admin 前后端日志；
  - 当检测到服务问题（如端口占用、崩溃）时，使用 `scripts/start/` 下对应脚本（如 `start-admin-backend.sh`、`start-admin-frontend.sh`）进行重启；
  - 测试报告（`report_generator.py`）中可体现技能管理用例通过率与修复/重试历史。
- **可选**：对 web-automation-testing 技能或参考文档的补充
  - 在技能 `references/` 或 `examples/` 中增加技能管理测试示例或说明，便于后续扩展（如 MCP 相关用例）。
- **不变更**：现有 `test_skill_creator.py` 的职责与运行方式可保留，本方案与之并存或逐步迁移；不要求修改 admin 业务代码逻辑。

## Impact

- **受影响的能力**：新增 capability `skill-management-testing`（本变更内以 ADDED 形式出现在 `specs/skill-management-testing/spec.md`）。
- **受影响的代码/资产**：
  - 新增测试资产目录及其中的 `test_plan.json`、`TEST_PLAN_DETAILED.md`、`README.md`（执行说明与故障排除）；
  - 可选：`.claude/skills/web-automation-testing/references/` 或 `examples/` 下补充技能管理相关示例或文档。
- **依赖与前置**：
  - Admin 前端（如 `http://localhost:3005/admin`）、Admin 后端（如 `http://localhost:8085`）可本地启动；
  - 具备可用管理员账号（如 admin / 指定密码）；
  - Main 服务（如 8081）在需要 AI 生成时可用，且已配置 Admin 访问 Main 的 API Key；
  - 项目根目录下 `scripts/start/` 中 admin 相关启动脚本可用；
  - web-automation-testing 技能所依赖的 Python 环境与 Playwright 可用。
