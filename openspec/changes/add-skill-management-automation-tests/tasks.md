## 1. 测试计划与资产

- [x] 1.1 确定测试资产目录（如 `admin/e2e/skill-management/` 或 `e2e/skill-management/`），与项目 e2e 约定一致
- [x] 1.2 编写测试计划文档 `TEST_PLAN_DETAILED.md`，包含技能管理测试范围与用例步骤：
  - 登录管理端（账号/密码）
  - 进入技能管理 → 专业创建器
  - AI 生成：多种描述场景（简单描述、带工具描述等）
  - 文件导入：上传文件、粘贴内容
  - 三种创建方式之间的切换（AI 生成 ⇄ 文件导入 ⇄ 手动编辑）
  - 从 AI 生成结果到手动编辑的流程
  - 从文件导入结果到手动编辑的流程
- [x] 1.3 使用 web-automation-testing 的 test_planner 或手写，编写 `test_plan.json`，覆盖上述用例；metadata 中设置 app_url 为 Admin 前端地址（如 `http://localhost:3005/admin`），并注明前置条件（Admin/Main 服务、管理员账号、API Key）
- [x] 1.4 在测试资产目录添加 `README.md`，说明如何从项目根或技能目录调用 `test_runner.py` / `test_executor.py` 执行该 plan，以及如何生成报告（`report_generator.py`），并说明失败时日志检查与 `scripts/start/` 重启流程

## 2. 执行与验证

- [ ] 2.1 准备测试环境
  - [ ] 启动 Admin 后端（使用 `scripts/start/start-admin-backend.sh`）
  - [ ] 启动 Admin 前端（使用 `scripts/start/start-admin-frontend.sh`）
  - [ ] 如需 AI 生成，启动 Main 服务并配置 Admin 访问 Main 的 API Key
  - [ ] 验证 Admin 前端可访问且可登录
- [ ] 2.2 执行测试计划
  - [ ] 使用 `test_runner.py test_plan.json --report skill_management_report.json` 执行（可选 `--max-iterations`）
  - [ ] 确认失败时自动检查 admin 前后端日志；如需重启，确认使用 `scripts/start/` 下对应脚本
- [ ] 2.3 分析失败用例并迭代
  - [ ] 记录失败原因（选择器、超时、登录态、AI 服务等）
  - [ ] 使用 test_fixer 自动修复或人工调整步骤
  - [ ] 必要时根据前后端日志修复代码或配置，修复后通过 `scripts/start/` 重启服务
- [ ] 2.4 生成并归档报告
  - [ ] 使用 `report_generator.py` 生成 Markdown/HTML 报告
  - [ ] 在测试资产目录或文档中记录通过率与典型问题，便于回归

## 3. 技能与文档补充（可选）

- [x] 3.1 在 web-automation-testing 技能的 `references/` 或 `examples/` 中补充技能管理测试示例或说明（如 `admin_skill_management_example.json` 或 README 引用）
- [ ] 3.2 若测试步骤语法或选择器策略有通用经验，更新 `test_case_patterns.md` 或 `service_configuration.md` 中与 Admin 相关的说明
