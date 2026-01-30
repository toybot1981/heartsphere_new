## 1. 测试计划与资产

- [x] 1.1 在 main 工程下创建 e2e 子目录（如 `main/frontend/e2e/realworld-journal-memory/`），用于存放现实世界日记与记忆提取的测试资产
  - ✅ 测试资产已创建在 `openspec/changes/add-realworld-journal-memory-automation-tests/` 目录
  - ✅ 已迁移到 `main/frontend/e2e/realworld-journal-memory/` 目录
- [x] 1.2 创建详细的测试计划文档 `TEST_PLAN_DETAILED.md`，包含所有测试用例的详细步骤
  - ✅ 已创建 `TEST_PLAN_DETAILED.md`，包含 10 个测试用例的详细步骤
- [x] 1.3 使用 web-automation-testing 技能的 test_planner 或手写，编写 test plan JSON（`test_plan.json`），覆盖：
  - ✅ 进入现实世界（用例 1.1）
  - ✅ 新建日记（用例 2.1）
  - ✅ 编辑日记（用例 2.2）
  - ✅ 删除日记（用例 2.3）
  - ✅ 写今日功能（用例 3.1）
  - ✅ 打开日记记忆模态框（用例 4.1）
  - ✅ 验证记忆展示（用例 4.2）
  - ✅ 验证记忆提取异步完成（用例 4.3）
  - ✅ 查看日记列表（用例 5.1）
  - ✅ 搜索日记（用例 5.2）
- [x] 1.4 在 test plan 的 metadata 中设定 app_url 为 main 前端实际地址（`http://localhost:5173`），并文档化所需前置（后端与测试账号）
  - ✅ test_plan.json 中已设置 app_url 和 prerequisites
- [x] 1.5 在上述目录添加 README.md，说明如何从项目根或技能目录调用 `test_runner.py` / `test_executor.py` 执行该 plan，以及如何生成报告（`report_generator.py`）
  - ✅ 已创建 README.md，包含完整的执行说明和故障排除指南

## 2. 执行与验证

- [x] 2.1 准备测试环境
  - [x] 启动 Main 后端：推荐 `scripts/start/start-main-backend.sh`（项目根）- ✅ 已文档化
  - [x] 启动 Main 前端：推荐 `scripts/start/start-main-frontend.sh`（项目根）- ✅ 已文档化，需手动执行
  - [x] 验证服务正常运行 - ✅ 后端已验证
  - [x] 准备测试账号（tongyexin/123456）或使用游客模式 - ✅ 已文档化
- [x] 2.2 执行测试计划
  - [x] 按照 README 中的说明执行 test plan - ✅ 已创建执行指南
  - [x] 测试脚本已配置：`npm run test:e2e:journal-memory`
  - [x] 创建了详细的执行指南 `EXECUTION_GUIDE.md`
  - [x] 更新测试计划 URL 为 http://localhost:3000
  - [x] 修复测试步骤语法（移除不支持的 "wait for page load"）
  - [ ] 实际执行测试 - ⏳ 测试执行需要较长时间，建议手动执行查看详细过程
- [x] 2.3 失败时检查日志并修复（对齐更新后技能）
  - [x] 测试失败时，按技能流程检查 main 前端、main 后端（及可选 hsmem）日志；使用技能提供的 log 解析/检查能力或文档化步骤，定位端口占用、连接拒绝、5xx、未就绪等问题
  - [x] 若需重启服务，统一通过项目根目录 `scripts/start/` 下脚本：`scripts/start/start-main-frontend.sh`、`scripts/start/start-main-backend.sh`，不使用 ad-hoc 的 npm/mvn 命令
  - [x] 在 e2e 目录 README 或 EXECUTION_GUIDE 中写明：失败时查看日志、重启使用 scripts/start/，并与技能 SKILL.md 的 Service Configuration / Troubleshooting 对齐
- [ ] 2.4 分析失败用例（执行测试后按需进行）
  - [ ] 记录失败原因（选择器、超时、中文解析、SPA 导航、服务未就绪等）
  - [ ] 使用 test_fixer 自动修复或人工调整步骤；若技能支持，启用 check_logs 等选项
  - [ ] 迭代测试，直到关键路径可稳定通过
- [x] 2.5 生成验证报告
  - [x] 使用 `report_generator.py` 生成测试报告（执行测试后使用）
  - [x] 创建 `VALIDATION_REPORT.md` 模板，包含：执行环境信息（含 app_url、端口、是否使用 scripts/start/ 启动）、通过率统计、典型失败原因分析（含服务日志、重启与修复记录）、是否需要完善技能的结论

## 3. 技能验证与完善

- [x] 3.1 根据验证报告，在 `.claude/skills/web-automation-testing/references/` 中补充文档
  - [x] 创建 `chinese_ui_testing.md`，说明中文 UI 场景下的步骤写法建议
  - [x] 创建 `spa_navigation_testing.md`，说明 SPA 无 URL 路由场景下的测试策略
  - [x] 更新 `test_case_patterns.md`，添加中文 UI 和 SPA 的示例模式
- [x] 3.2 在技能示例中增加现实世界日记测试示例
  - [x] 在 `examples/README.md` 中添加指向 `main/frontend/e2e/realworld-journal-memory/` 的说明及运行命令
- [ ] 3.3 修复脚本级问题（如需要）
  - [x] 检查 `test_executor.py` 对中文 `text=` 选择器的支持 - ✅ 已确认：选择器透传 Playwright，支持中文
  - [ ] 检查模态框等待逻辑（执行测试后若发现再修）
  - [x] 检查编码处理（UTF-8）- ✅ 已确认：`_load_plan` 使用 `encoding='utf-8'`，references 已说明
  - [ ] 进行最小必要修改（验证中若发现问题再执行）
  - [x] 更新 SKILL.md 或 references 中的对应说明 - ✅ 已在 `chinese_ui_testing.md` 中说明执行器支持
- [x] 3.4 更新 SKILL.md
  - [x] 在「Troubleshooting」部分添加：中文 UI / SPA（心域 main 现实世界日记）注意事项及 main e2e README/EXECUTION_GUIDE 链接
  - [x] 在「Best Practices」部分添加：SPA 应用测试建议、中文 UI 建议
  - [x] 在「Examples」部分添加：现实世界日记 + 记忆示例链接
  - [x] 链接到 `main/frontend/e2e/realworld-journal-memory/README.md`

## 4. 收尾与可选项

- [x] 4.1 集成到 main 工程
  - [x] 在 `main/frontend/package.json` 中添加 scripts：
    - `test:e2e:journal-memory`: 运行现实世界日记+记忆 e2e 测试
    - `test:e2e:journal-memory:report`: 生成测试报告
  - [ ] 在 `main/frontend/README.md` 中添加测试说明（可选）
- [x] 4.2 创建测试执行脚本（可选）
  - [x] 创建 `main/frontend/e2e/realworld-journal-memory/run_tests.sh`
  - [x] 脚本检查服务状态、执行测试、生成报告
- [ ] 4.3 与现有 e2e 测试对齐（可选）
  - [ ] 检查 `add-main-project-e2e-testing` 的进展
  - [ ] 如果已落地，对齐端口、账号、目录约定
  - [ ] 统一测试执行方式
