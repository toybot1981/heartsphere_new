# 技能管理自动化测试

本目录为管理端技能管理（专业创建器）的自动化测试资产，基于 **web-automation-testing** 技能，可与 test_runner、日志检查、服务重启流程集成。

## 前置条件

- **Admin 前端**：`http://localhost:3005/admin`
- **Admin 后端**：`http://localhost:8085`
- **管理员账号**：admin / 指定密码（如 Tyx@19811009）
- **AI 生成场景**：Main 服务（如 8081）已启动，且 Admin 已配置访问 Main 的 API Key（`app.ai-service.api-key`）
- **Python 3.8+**、**Playwright**、**web-automation-testing** 技能可用

## 测试资产

| 文件 | 说明 |
|------|------|
| `test_plan.json` | 结构化测试计划（登录、专业创建器全流程、技能列表：搜索/编辑/创建/编辑并更新/删除/分类筛选，共 23 用例） |
| `TEST_PLAN_DETAILED.md` | 详细用例步骤与范围说明 |
| `README.md` | 本说明与执行方式 |

## 确保测试不被打断

- **本脚本内**：test_runner / test_executor 不对整次测试设置总超时，仅对单步有超时（防止某一步无限卡住）。
- **通过 Cursor/Agent 执行命令时**：执行环境可能对单次命令设超时。为确保测试**无论何种情况都不被打断**，请为执行命令设置**至少 30 分钟**（1800000 ms）超时，或在本机终端直接运行上述命令（无执行环境超时）。

### 从项目根目录执行

1. **仅执行测试（不自动修复）**
   ```bash
   python .claude/skills/web-automation-testing/scripts/test_executor.py admin/e2e/skill-management/test_plan.json --output admin/e2e/skill-management/results.json
   ```

2. **推荐：失败即停，将结果交给 Agent 分析并修复后再重跑**
   - **test_runner 默认**：用例串行执行；某用例失败后**立即终止**，不自动修复、不重复测试。请将结果（agent_failure_summary.md、cursor_analysis/、报告）交给 **Agent 分析并修复**，修复完成后再重新运行测试。
   ```bash
   python .claude/skills/web-automation-testing/scripts/test_runner.py admin/e2e/skill-management/test_plan.json --report admin/e2e/skill-management/skill_management_report.json
   ```
   - 可选：`--no-headless` 显示浏览器。

3. **可选：自动修复并重试**
   - 需要「失败后由脚本自动修复并继续测试」时使用 `--auto-fix-retry`。
   ```bash
   python .claude/skills/web-automation-testing/scripts/test_runner.py admin/e2e/skill-management/test_plan.json --report admin/e2e/skill-management/skill_management_report.json --auto-fix-retry --max-iterations 10
   ```

4. **仅执行一轮（不生成 runner 报告）**
   ```bash
   python .claude/skills/web-automation-testing/scripts/test_executor.py admin/e2e/skill-management/test_plan.json --output admin/e2e/skill-management/results.json
   ```

5. **生成报告**
   ```bash
   python .claude/skills/web-automation-testing/scripts/report_generator.py admin/e2e/skill-management/skill_management_report.json markdown admin/e2e/skill-management/report.md
   python .claude/skills/web-automation-testing/scripts/report_generator.py admin/e2e/skill-management/skill_management_report.json html admin/e2e/skill-management/report.html
   ```

### 从 web-automation-testing 技能目录执行

若当前目录为 `.claude/skills/web-automation-testing/`，可将上述路径中的 `admin/e2e/skill-management/` 改为项目根到该目录的相对路径（如 `../../../../admin/e2e/skill-management/`），或使用绝对路径。

## 失败时：日志检查与服务重启

- **test_runner** 在测试失败时会自动检查相关前后端日志（Admin 对应 `admin-backend`、`admin-frontend`）。
- 日志路径由 `scripts/start/start-admin-backend.sh`、`scripts/start/start-admin-frontend.sh` 解析或使用服务配置映射（如 `admin-backend.log`、`admin-frontend.log`）。
- 当检测到可自动修复的服务问题（如端口占用、崩溃）时，会使用项目根目录下 **`scripts/start/`** 中的脚本重启服务：
  - Admin 后端：`scripts/start/start-admin-backend.sh`
  - Admin 前端：`scripts/start/start-admin-frontend.sh`
- 默认失败即停，将结果交给 Agent 分析并修复后再重跑；使用 `--auto-fix-retry` 时由脚本自动修复并重试。

## 故障排除

- **登录失败**：确认 Admin 前后端已启动，账号密码正确；若端口非 3005/8085，需修改 `test_plan.json` 中 `metadata.app_url` 及步骤中的 URL。
- **找不到「专业创建器」/「技能管理」**：技能管理在「AI 智能体」菜单下；若前端文案变化，可调整步骤中的 `text=` 或选择器；或先通过 `?section=skills` 直接进入技能管理。
- **AI 生成失败**：确认 Main 服务已启动且 Admin 已配置 API Key；可查看 Admin 后端日志（如 `admin-backend.log`）中的 AI 调用错误。
- **步骤超时**：适当增加 `wait for N seconds` 或使用更稳定的选择器；test_fixer 可自动尝试添加等待或更新选择器。
- **服务重启失败**：确认 `scripts/start/` 下对应脚本存在且可执行；检查脚本内日志路径与当前项目结构一致。

## 与现有脚本的关系

- 项目根目录下的 `test_skill_creator.py` 仍可独立运行，与本 test plan 并存。
- 本方案提供与 web-automation-testing 统一的 JSON 计划与持续测试流程，便于回归与 CI 集成。
