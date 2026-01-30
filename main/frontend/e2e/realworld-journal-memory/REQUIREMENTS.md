# 现实世界模块（日记、记忆提取）需求分析

本文档从提案与页面实现中提取功能点与验收条件，供自动化用例编写与追溯使用。  
**来源**：add-realworld-journal-memory-automation-tests、build-electron-desktop-and-optimize-realworld-journal、openspec/changes/add-realworld-module-comprehensive-e2e。

---

## 功能点与验收条件

| 需求 ID | 功能点 | 验收条件（入口 / 步骤 / 预期） |
|--------|--------|-------------------------------|
| REQ-1 | 进入现实世界 | 从入口（登录或游客）点击「进入现实」→ 进入现实世界界面 → 可见「写今日」等特征文案 |
| REQ-2 | 日记 CRUD | 新建：点击「新记录」、填写标题与内容、保存 → 列表中出现新日记；编辑：点击日记、修改、保存 → 列表更新；删除：点击日记、删除、确认 → 从列表移除 |
| REQ-3 | 写今日 | 点击「写今日」、填写内容、保存 → 创建今日日期的日记，标题默认为今日 |
| REQ-4 | 记忆提取与展示 | 保存日记后系统异步从日记中提取记忆；用户可点击「查看从日记中提取的记忆」→ 打开 JournalMemoryModal（日记记忆）→ 展示已提取记忆 |
| REQ-5 | 日记列表与搜索 | 列表展示所有日记条目；搜索框输入关键词 → 列表仅显示匹配条目 |
| REQ-6 | 日记列表排序（可选） | 支持按日记日期、按更新时间排序，默认按日期倒序（见 build-electron-desktop-and-optimize-realworld-journal） |
| REQ-7 | 记忆模态框空状态（可选） | 无记忆时打开「查看从日记中提取的记忆」→ 显示空状态或「暂无记忆」类提示 |
| REQ-8 | 搜索无结果（可选） | 输入不存在的关键词 → 显示空状态或无结果提示 |

---

## 用例与需求对应关系

| 测试套件 | 用例 ID | 用例名称 | 对应需求 |
|----------|---------|----------|----------|
| suite_1 进入现实世界 | case_1_1 | 进入现实世界 | REQ-1 |
| suite_2 日记 CRUD | case_2_1 | 新建日记 | REQ-2 |
| suite_2 日记 CRUD | case_2_2 | 编辑日记 | REQ-2 |
| suite_2 日记 CRUD | case_2_3 | 删除日记 | REQ-2 |
| suite_3 写今日 | case_3_1 | 写今日功能 | REQ-3 |
| suite_4 记忆提取 | case_4_1 | 打开日记记忆模态框 | REQ-4 |
| suite_4 记忆提取 | case_4_2 | 验证记忆展示 | REQ-4 |
| suite_4 记忆提取 | case_4_3 | 验证记忆提取异步完成 | REQ-4 |
| suite_4 记忆提取 | case_4_4 | 记忆模态框空状态 | REQ-7 |
| suite_5 日记列表和筛选 | case_5_1 | 查看日记列表 | REQ-5 |
| suite_5 日记列表和筛选 | case_5_2 | 搜索日记 | REQ-5 |
| suite_5 日记列表和筛选 | case_5_3 | 搜索无结果 | REQ-8 |

test_plan.json 中的 `requirements` 数组与上述 REQ-1～REQ-5（及可选 REQ-6～REQ-8）对应；每个 test_case 至少对应一个需求。

---

## 执行与报告

- **执行**：使用 web-automation-testing 技能的 test_runner 或 test_executor，见 README「执行测试」。
- **失败处理**：失败即终止，将 agent_failure_summary.md、cursor_analysis/、报告交 Agent 分析修复；修改用例后可使用 `--resume-from test_run_state.json` 从失败用例继续。
- **报告位置**：report.json、report.md 等保存于本目录（main/frontend/e2e/realworld-journal-memory/）。
