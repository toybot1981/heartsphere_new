## ADDED Requirements

### Requirement: 现实世界日记功能自动化测试

系统 SHALL 提供基于 web-automation-testing 技能的、针对 main 工程「现实世界」日记功能的自动化测试能力，使关键用户路径可在真实浏览器中可重复执行并产出报告。

#### Scenario: 进入现实世界并可识别日记界面
- **WHEN** 测试从 main 前端根地址（如 http://localhost:3000）开始，并完成登录或游客昵称前置
- **THEN** 测试步骤可通过点击「进入现实」或等价入口进入现实世界
- **AND** 步骤中可通过「verify text=写今日」或「verify text=新思维」等特征文案确认日记界面已展示

#### Scenario: 新建与保存日记
- **WHEN** 测试在执行「进入现实世界」之后执行新建日记的步骤（如点击「新思维」或「新建」、填写标题与内容、保存）
- **THEN** 步骤执行后可通过「verify」类步骤确认新日记出现在列表或编辑区
- **AND** 测试计划中对该流程的步骤、选择器与预期结果有明确描述

#### Scenario: 写今日与列表可见
- **WHEN** 测试在执行「进入现实世界」之后执行「写今日」相关步骤（如点击「写今日」、填写内容、保存）
- **THEN** 步骤执行后可通过 verify 确认今日条目或写今日入口状态符合预期
- **AND** 测试计划覆盖写今日创建今日日期的日记这一行为

#### Scenario: 日记编辑与删除（可选）
- **WHEN** 测试在执行新建或进入某条日记后，执行编辑或删除步骤
- **THEN** 步骤执行后可通过 verify 确认列表或详情中的内容已更新或已移除
- **AND** 测试计划中对该流程的步骤与预期有描述；若仅覆盖「新建 + 写今日」也可接受，删除/编辑为可选扩展

### Requirement: 记忆提取相关功能自动化测试

系统 SHALL 提供基于 web-automation-testing 技能的、针对「从日记中提取的记忆」展示与入口的自动化测试能力，使「保存日记 → 打开记忆模态框 → 校验展示」这一路径可被自动化验证。

#### Scenario: 打开「查看从日记中提取的记忆」入口
- **WHEN** 测试在现实世界日记界面下执行打开「查看从日记中提取的记忆」的步骤（如点击对应按钮或入口）
- **THEN** 步骤执行后 JournalMemoryModal 或等价「日记记忆」视图被打开
- **AND** 步骤中包含对模态框内特征内容的等待或校验（如「日记记忆」标题或「从日记中提取的记忆」类文案），避免过早断言

#### Scenario: 记忆展示校验（在异步就绪后）
- **WHEN** 测试在打开日记记忆视图后，需要校验「有记忆条目」或「无记忆时的空状态」等
- **THEN** 步骤中应包含适当的等待（如 wait for 某 selector 或固定秒数），以应对记忆提取异步完成
- **AND** 通过 verify 步骤对「有记忆时的展示」或「空状态提示」之一进行断言；若环境无法触发真实记忆提取，可仅校验「空状态」或「界面结构」以验证入口与模态框行为

### Requirement: web-automation-testing 技能验证与完善

系统 SHALL 在使用 web-automation-testing 技能对上述现实世界日记与记忆提取功能进行测试的过程中，验证技能在「中文 UI、SPA 无 URL 路由、模态框等待」等场景下的适用性，并依据验证结果对该技能进行文档或实现上的完善。

#### Scenario: 技能在现实世界页面上的执行验证
- **WHEN** 使用技能提供的 test_runner 或 test_executor 执行针对现实世界日记与记忆的 test plan
- **THEN** 记录通过率、失败用例及失败原因（选择器、超时、编码、步骤语法等）
- **AND** 产出简短验证报告，说明技能是否满足「进入现实世界 → 日记操作 → 记忆入口与展示」的自动化测试需求

#### Scenario: 技能文档与示例完善
- **WHEN** 验证报告指出技能在中文 UI、SPA 或模态框场景下存在不足
- **THEN** 在技能内（.claude/skills/web-automation-testing/）的 references 或 examples 中补充相应写法建议或示例（如「现实世界日记 + 记忆」类 test plan 片段）
- **AND** 在 SKILL.md 的 Troubleshooting 或 Best Practices 中增加针对心域 main 工程现实世界与记忆提取测试的用法与注意事项，或链接到 main 工程 e2e 目录的 README

#### Scenario: 脚本级修复（若需要）
- **WHEN** 验证中发现技能 scripts（如 test_executor、test_planner）存在对中文 `text=`、编码或等待逻辑的缺陷
- **THEN** 在 scripts 中进行最小必要修改以支持上述场景
- **AND** 在 SKILL.md 或 references 中更新对应说明，避免回归

### Requirement: 测试失败时的日志检查与服务重启（对齐更新后 web-automation-testing 技能）

系统 SHALL 在执行现实世界日记与记忆提取自动化测试时，遵循更新后 web-automation-testing 技能的工作流：测试失败时检查对应前后端日志，修复后如需重启服务则通过项目根目录下 `scripts/start/` 的脚本启动，与技能的 service 管理与日志解析一致。

#### Scenario: 测试失败时检查服务日志
- **WHEN** 自动化测试执行失败（如连接拒绝、超时、5xx）
- **THEN** 按技能提供的流程或文档检查 main 前端、main 后端（及可选 hsmem）的日志，定位服务端错误
- **AND** 修复配置或代码后，如需重启服务，仅通过项目根目录 `scripts/start/` 下脚本（如 `start-main-frontend.sh`、`start-main-backend.sh`）启动，不使用 ad-hoc 的 npm/mvn 命令作为官方约定

#### Scenario: 执行与修复流程与技能一致
- **WHEN** 使用 test_runner 或等效流程执行现实世界日记与记忆的 test plan
- **THEN** 流程包含：执行测试 → 失败时检查日志 → 修复服务或测试步骤 → 必要时通过 scripts/start/ 重启服务 → 重试
- **AND** 验证报告或报告中可包含服务修复与日志检查记录（若技能产出该信息）
