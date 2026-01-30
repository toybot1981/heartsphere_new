## ADDED Requirements

### Requirement: 提案涉及前端页面功能时须提供自动化测试方案
创建 OpenSpec 提案时，若变更**涉及前端页面功能**，提案 SHALL 包含**自动化测试方案**；该方案由 **web-automation-testing** 技能完成；测试方案资产 SHALL 保存在**对应前端项目下的专有目录**（如 `admin/frontend/e2e/<feature>/`、`main/frontend/e2e/<feature>/`），不放在与前端分离的通用 e2e 根目录。

#### Scenario: 新提案涉及前端页面功能时包含测试方案任务
- **WHEN** 创建 OpenSpec 提案且变更涉及前端页面功能（如新增/修改管理端或主站页面、表单、向导、列表等）
- **THEN** 提案的 tasks.md 中 SHALL 包含「提供自动化测试方案」或等价任务
- **AND** 该任务 SHALL 明确由 web-automation-testing 技能完成（编写 test plan、执行、失败交 Agent 修复、扩展直至模块功能全覆盖）
- **AND** 任务 SHALL 明确测试方案资产存放于对应前端项目下的专有目录（如 `admin/frontend/e2e/<feature>/` 或 `main/frontend/e2e/<feature>/`）

#### Scenario: 测试方案资产存放于前端项目专有目录
- **WHEN** 为某前端功能模块提供自动化测试方案
- **THEN** test_plan.json、README、results、report 等资产 SHALL 存放在该前端项目下的专有目录
- **AND** Admin 前端对应目录示例：`admin/frontend/e2e/<feature>/`（如 `admin/frontend/e2e/skill-management/`）
- **AND** Main 前端对应目录示例：`main/frontend/e2e/<feature>/`
- **AND** README 中 SHALL 说明如何从项目根或技能目录调用 test_runner / test_executor 及报告生成方式

### Requirement: web-automation-testing 技能先需求分析再编写用例
使用 web-automation-testing 技能编写或扩展自动化用例时，SHALL 先对**待编写用例的模块或功能点**进行**需求分析**，再**围绕需求**开展用例编写；test plan 中的 requirements、test_suites、test_cases SHALL 与需求对应。

#### Scenario: 编写用例前进行需求分析
- **WHEN** Agent 或人工使用 web-automation-testing 技能为某模块/功能点编写或扩展测试用例
- **THEN** 须先进行需求分析：从提案、需求文档或页面实现中提取功能点与验收条件（如入口、步骤、预期结果）
- **AND** 需求分析结果 SHALL 体现在 test plan 的 metadata、requirements 或等价结构中
- **AND** 后续编写的 test_suites、test_cases SHALL 与上述需求对应（覆盖核心路径与关键分支）

#### Scenario: 用例与需求对应
- **WHEN** 完成需求分析并编写 test plan
- **THEN** test_cases 中的每个用例 SHALL 可追溯到至少一个功能点或验收条件
- **AND** test_suites 的划分 SHALL 与功能模块或用户流程一致（如登录与打开创建器、AI 生成、列表操作等）
- **AND** 执行与扩展流程遵循技能既有原则（失败交 Agent 修复、不断扩展直至模块功能全覆盖、支持 --resume-from 保留现场）
