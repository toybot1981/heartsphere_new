# Design: 技能管理自动化测试方案

## Context

- **管理端**：Admin 前端（如 `http://localhost:3005/admin`）、Admin 后端（如 `http://localhost:8085`）。
- **技能管理功能**：专业创建器下的「AI 生成」「文件导入」「手动编辑」三种创建方式，以及方式间切换、从 AI/文件导入到手动编辑的流程。
- **测试框架**：web-automation-testing 技能（test_planner、test_executor、test_fixer、test_runner、report_generator），支持失败时检查前后端日志、使用 `scripts/start/` 重启服务、持续测试直到通过或中断。

## Goals / Non-Goals

- **Goals**：补充技能管理专用的结构化测试计划与执行流程；与 web-automation-testing 的日志检查、服务重启、持续测试能力集成；产出可复现的测试报告。
- **Non-Goals**：不替代现有 `test_skill_creator.py` 的短期使用；不强制修改 admin 业务代码；MCP 功能测试可后续补充，本方案先不覆盖。

## Decisions

1. **测试资产位置**：测试计划与 test plan JSON 放在项目约定目录（如 `admin/e2e/skill-management/` 或根目录下 `e2e/skill-management/`），与 realworld-journal-memory 等 e2e 资产组织方式一致；具体路径在 tasks 中确定。
2. **服务配置**：Admin 对应 web-automation-testing 的 service_config：`admin-backend`（8085）、`admin-frontend`（3005）；日志路径从 `scripts/start/start-admin-backend.sh`、`scripts/start/start-admin-frontend.sh` 解析或使用已有映射（如 `admin-backend.log`、`admin-frontend.log`）。
3. **执行方式**：从项目根目录或技能目录调用 `test_runner.py test_plan.json --report report.json`；可选 `--max-iterations` 限制迭代次数；失败时由 test_fixer 检查 admin 前后端日志并触发 `scripts/start/` 下对应脚本重启。
4. **测试范围**：登录 → 技能管理 → 专业创建器 → AI 生成（多种描述）→ 文件导入（上传、粘贴）→ 三种方式切换 → AI/文件导入到手动编辑流程；MCP 暂不纳入首版 test plan。

## Risks / Trade-offs

- **选择器与中文 UI**：Admin 为中文界面，test plan 中的步骤需使用稳定选择器（如 `text=专业创建器`、`role=button` 等）；若步骤不稳定，可依赖 test_fixer 自动修复或人工迭代。
- **AI 生成依赖 Main**：AI 生成场景依赖 Main 服务与 API Key 配置；若 Main 未启动或认证失败，对应用例会失败，需在 README 中说明前置条件。

## Migration Plan

- 无数据迁移；新增测试资产与文档即可。
- 若后续将 `test_skill_creator.py` 用例迁移到 test plan JSON，可逐步替换或保留两套并行。
