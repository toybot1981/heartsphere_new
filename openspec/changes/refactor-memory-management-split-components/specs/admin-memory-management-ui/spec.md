## ADDED Requirements

### Requirement: 记忆管理页面多组件实现与单文件行数上限

Admin 前端用户记忆管理页面（UserMemoryManagement）SHALL 以多组件方式实现：按 Tab 与共享能力拆分为多个文件，每个组件文件 SHALL 不超过 500 行；容器组件仅负责 Tabs 布局、activeTab 状态及子组件组合；共享工具函数与类型可置于独立 utils/types 文件，便于维护与测试。

#### Scenario: Tab 面板独立成文件且满足行数上限

- **WHEN** 开发或审查 Admin 记忆管理页面实现
- **THEN** 每个 Tab 面板（用户记忆、HSMem 查询、记忆提取追溯、资源管理、记忆项管理、类别管理）SHALL 对应独立组件文件（如 UserMemoryTab、HsmemQueryTab、MemoryTraceTab、ResourceLayerTab、ItemLayerTab、CategoryLayerTab）
- **AND** 每个此类文件 SHALL 不超过 500 行（以 wc -l 或 CI 检查为准）
- **AND** 容器文件 UserMemoryManagement.tsx 亦 SHALL 不超过 500 行

#### Scenario: 功能与交互与拆分前一致

- **WHEN** 用户访问记忆管理页面并切换各 Tab、执行检索与查看详情
- **THEN** 页面展示与交互（检索、列表、筛选、弹窗、错误提示等）SHALL 与拆分前行为一致
- **AND** 不改变对外路由、菜单入口或现有 API 调用方式

#### Scenario: 记忆管理模块具备 E2E 测试方案

- **WHEN** 本变更涉及的前端页面功能交付
- **THEN** 须有基于 web-automation-testing 技能的自动化测试方案：先对记忆管理模块/功能点做需求分析，再围绕需求编写用例
- **AND** 测试方案资产（如 test_plan.json、README、报告）SHALL 存放于 `admin/frontend/e2e/memory-management/`
- **AND** 测试覆盖原则适用：扩展用例直至该模块功能全覆盖，失败交 Agent 修复后继续测试直至通过
