## 1. 数据库验证模块

- [x] 1.1 创建 `scripts/db_verifier.py`，实现 MySQL 数据库连接与查询执行
- [x] 1.2 支持从测试计划的 `database` 字段读取数据库配置（host, port, database, username, password）
- [x] 1.3 支持从环境变量读取数据库配置（DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD）
- [x] 1.4 实现查询执行与结果解析（支持 SELECT 查询，返回结果集）
- [x] 1.5 实现查询结果与预期值的比较（如 COUNT(*) = 1, 字段值匹配等）
- [x] 1.6 添加查询超时机制（如 5 秒）

## 2. 页面内容采集

- [x] 2.1 在 test_executor 中，步骤失败时采集当前页面 URL、document.title
- [x] 2.2 采集可见文本摘要（body 内主要文本，长度上限可配置，如 2000 字符）
- [x] 2.3 若失败步骤涉及选择器，采集该选择器对应元素的 DOM 片段（outerHTML 或父节点，长度上限如 3000 字符）
- [x] 2.4 将截图路径、失败步骤描述、预期/实际错误信息一并写入该用例结果（如 page_context 或等价结构）

## 3. 数据库验证步骤集成

- [x] 3.1 在 test_executor 中支持 `verify database:` 或 `check database:` 步骤语法
- [x] 3.2 解析步骤中的 SQL 查询与预期值（如 `verify database: SELECT COUNT(*) FROM users WHERE name='test'` 期望 1）
- [x] 3.3 调用 db_verifier 执行查询并验证结果
- [x] 3.4 验证失败时记录查询 SQL、查询结果、预期值、实际值
- [x] 3.5 数据库验证失败时触发页面内容采集（与页面步骤失败同等处理）

## 4. Cursor 分析工件生成

- [x] 4.1 实现生成 Cursor 分析 Markdown 的逻辑（标题、测试用例名、失败步骤、预期/实际、页面摘要、DOM 片段、截图路径、使用说明）
- [x] 4.2 在 Cursor 分析工件中包含数据库验证失败信息（如 SQL、查询结果、预期/实际值）
- [x] 4.3 支持输出目录配置或命令行参数，默认与报告同目录或固定子目录（如 cursor_analysis/）
- [x] 4.4 文件名包含 case_id 与时间戳，如 cursor_analysis_<case_id>_<timestamp>.md
- [x] 4.5 可选：生成同内容的 JSON 工件，便于脚本消费
- [x] 4.6 在测试结果 JSON 中记录 Cursor 工件路径（如 cursor_analysis_path）

## 5. 报告与文档

- [x] 5.1 报告生成器可引用 Cursor 分析工件路径（如「详见 Cursor 分析：<path>」）
- [x] 5.2 在 SKILL.md 中说明：何时会生成 Cursor 分析、文件位置、如何在 Cursor 中使用（打开文件或粘贴内容）
- [x] 5.3 在 SKILL.md 中说明数据库验证步骤的用法（语法、配置、示例）
- [x] 5.4 在 references 中新增或更新「页面内容分析与 Cursor 分析」说明
- [x] 5.5 在 references 中新增「数据库验证步骤」说明文档

## 6. Task 分解与用例状态持久化

- [ ] 6.1 在测试计划结构中支持可选的 `tasks` 字段，每个 task 包含 id, name, description, test_cases（用例 ID 列表）
- [ ] 6.2 实现用例状态管理模块（如 `case_status_manager.py`），支持加载、保存、更新用例状态文件（`<plan_file>.status.json`）
- [ ] 6.3 状态文件格式：`{"case_id": {"status": "passed|failed|skipped", "executed_at": "ISO timestamp", "error": null, "execution_time_seconds": 5.2}}`
- [ ] 6.4 在 test_executor 中：启动时加载状态文件（如存在），对于状态为 `passed` 的用例，除非用户指定 `--force` 或 `--rerun`，否则跳过执行并标记为 `skipped`
- [ ] 6.5 用例执行完成后立即更新状态文件（追加或覆盖对应用例的状态）
- [ ] 6.6 支持命令行参数：`--force`（重置所有状态并重新执行所有用例）、`--rerun`（重新执行所有用例，不重置状态）、`--task <task_id>`（仅执行指定 task 的用例）
- [ ] 6.7 在 test_planner.py 中支持添加 task 的命令（如 `add-task`）
- [ ] 6.8 更新 SKILL.md：说明 task 分解的用法、用例状态持久化的机制、命令行参数说明

## 7. 验证

- [ ] 7.1 运行至少一个会失败的用例，确认生成 page_context 与 Cursor 分析工件
- [ ] 7.2 确认工件内容包含 URL、摘要、失败步骤、预期/实际、截图路径
- [ ] 7.3 运行包含数据库验证步骤的用例（增删改查操作后验证），确认数据库查询执行与结果验证
- [ ] 7.4 确认数据库验证失败时触发页面内容采集并包含在 Cursor 分析工件中
- [ ] 7.5 确认不破坏现有测试结果与报告格式（兼容性）
- [ ] 7.6 创建包含多个 task 的测试计划，确认 task 分解功能正常
- [ ] 7.7 执行用例后确认状态文件生成，再次执行时确认已成功用例被跳过
- [ ] 7.8 使用 `--force` 参数确认所有用例重新执行，使用 `--task` 参数确认仅执行指定 task 的用例
