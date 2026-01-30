## ADDED Requirements

### Requirement: 现实世界模块全面自动化测试覆盖

系统 SHALL 对 main 工程「现实世界」模块（日记与记忆提取）提供**全面**自动化测试：在需求分析基础上编写或扩展用例，覆盖模块内所有功能点，并通过 web-automation-testing 技能执行直至全部用例通过；测试方案资产存放于 `main/frontend/e2e/realworld-journal-memory/`。

#### Scenario: 需求分析先行
- **WHEN** 对现实世界模块编写或扩展自动化用例
- **THEN** 须先对模块/功能点进行需求分析（从提案、需求文档或页面实现中提取功能点与验收条件）
- **AND** 需求分析结果体现在 test plan 的 metadata、requirements 或等价结构中，且 test_suites、test_cases 与需求可追溯

#### Scenario: 模块内功能全覆盖
- **WHEN** 执行全面自动化测试
- **THEN** 用例覆盖现实世界模块所有功能：进入现实世界、日记 CRUD、写今日、日记列表与搜索、打开日记记忆模态框、记忆展示、记忆提取异步完成；并视需求补充排序、空状态、搜索无结果等场景
- **AND** 遵循测试覆盖原则：先核心路径，再按模块内步骤/入口逐项补充用例，每轮扩展后执行完整测试，失败交 Agent 修复再跑，直到该模块所有功能用例全部通过

#### Scenario: 测试方案存放于前端 e2e 目录
- **WHEN** 产出自动化测试方案
- **THEN** 测试资产（test_plan.json、REQUIREMENTS.md 或等价、README、报告、test_run_state 等）须保存在对应前端项目专有目录 `main/frontend/e2e/realworld-journal-memory/`
- **AND** 不放在项目根或与前端分离的通用 e2e 根目录，与 project.md 约定一致

### Requirement: 需求驱动测试设计（现实世界模块）

系统 SHALL 在现实世界模块的自动化测试中采用「需求分析 → 围绕需求编写用例」的流程，由 web-automation-testing 技能完成测试计划编写、执行与报告；执行时失败即终止并将结果交 Agent 分析修复，再由 Agent 发起下一轮测试，支持 --resume-from 从失败用例继续。

#### Scenario: 用例与需求对应
- **WHEN** 编写或评审现实世界模块的 test plan
- **THEN** 每个用例应能追溯到至少一个功能点或验收条件
- **AND** test_suites 的划分与功能模块或用户流程一致（如进入现实世界、日记 CRUD、写今日、记忆提取、列表与筛选）

#### Scenario: 执行与失败处理
- **WHEN** 使用 web-automation-testing 技能执行现实世界模块测试
- **THEN** 测试失败时立即终止，将 agent_failure_summary.md、cursor_analysis/、报告等交给 Agent 分析并修复
- **AND** 修复后由 Agent 再次发起测试；若为用例问题，可修改 test plan 后使用 --resume-from test_run_state.json 从失败用例继续执行，直至全部通过
