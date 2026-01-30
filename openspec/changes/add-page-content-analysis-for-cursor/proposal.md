# Change: 页面测试中分析页面返回内容并在结果异常时交给 Cursor 分析

## Why

当前 web-automation-testing 技能在测试失败时仅记录错误信息和截图路径，缺少对「页面返回内容」的结构化分析；当结果不正常时，开发者需要手动拼凑上下文再交给 Cursor 分析，效率低且容易遗漏。若在测试过程中对页面返回内容做一定分析，并在结果异常时自动生成可供 Cursor 消费的上下文，可让 AI 更快定位问题并给出修复建议。

## What Changes

- **新增**：在测试步骤失败时采集并分析页面返回内容（URL、可见文本摘要、失败步骤相关 DOM 片段、截图路径、预期 vs 实际）
- **新增**：将「结果不正常」时的分析结果输出为结构化 Cursor 分析工件（如 Markdown 或 JSON），便于在 Cursor 中打开或粘贴供 AI 分析
- **新增**：在涉及数据增删改查的页面操作完成后，支持数据库验证步骤，查询数据库以判断操作是否真正成功
- **新增**：测试计划支持 task 概念，可将测试过程分解成多个 task，每个 task 包含多个用例，便于分阶段执行和管理
- **新增**：用例执行状态持久化，执行成功后标记用例状态（passed/failed/skipped）并保存到状态文件，下次执行时自动跳过已成功的用例（除非用户指定 `--force` 或 `--rerun`）
- **修改**：测试执行器在断言/步骤失败时触发页面内容采集与摘要
- **修改**：测试执行器支持数据库验证步骤（如 `verify database: SELECT ...`），连接 MySQL 数据库执行查询并验证结果
- **修改**：测试执行器支持加载用例状态文件，跳过已成功的用例，仅执行待执行或失败的用例
- **可选**：在测试报告或报告中增加「Cursor 分析」章节或指向该工件的引用

## Impact

- **受影响的能力**：web-automation-testing 技能（`.claude/skills/web-automation-testing/`）
- **受影响的代码**：
  - `.claude/skills/web-automation-testing/scripts/test_executor.py`：失败时采集页面内容并写入结果；支持数据库验证步骤；支持加载用例状态并跳过已成功用例
  - 新增：数据库验证模块（如 `db_verifier.py`），支持 MySQL 连接与查询执行
  - 新增或扩展：生成 Cursor 分析工件的脚本或报告逻辑（如 `report_generator.py` 或新脚本）
  - 新增：用例状态管理模块（如 `case_status_manager.py`），支持用例状态持久化与加载
  - `.claude/skills/web-automation-testing/scripts/test_planner.py`：支持在测试计划中添加 task 结构
  - `.claude/skills/web-automation-testing/SKILL.md`：说明如何获取并使用 Cursor 分析工件；说明数据库验证步骤的用法；说明 task 分解与用例状态持久化的用法
- **依赖**：
  - Python MySQL 客户端库（如 `mysql-connector-python` 或 `pymysql`）
  - 数据库连接配置（可从测试计划或环境变量读取，参考项目 `application.yml` 的数据库配置）
  - Cursor 分析为人工或工作流侧「打开/粘贴」使用，不依赖 Cursor API
