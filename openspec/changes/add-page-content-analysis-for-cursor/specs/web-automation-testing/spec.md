## ADDED Requirements

### Requirement: 失败时采集页面返回内容并分析
系统 SHALL 在页面测试步骤失败时采集并分析当前页面的返回内容，用于后续诊断与 Cursor 分析。

#### Scenario: 步骤失败时采集页面 URL 与标题
- **WHEN** 任一测试步骤执行失败（如 verify 未通过、元素未找到、超时）
- **THEN** 系统采集当前页面的 URL 与 document.title
- **AND** 将上述信息与该步骤的预期结果、实际错误信息一并记录到该用例结果中

#### Scenario: 步骤失败时采集可见文本摘要
- **WHEN** 任一测试步骤执行失败
- **THEN** 系统采集页面 body 内主要可见文本的摘要（长度上限可配置，如 2000 字符）
- **AND** 将摘要写入该用例的页面上下文（如 page_context）或等价结构

#### Scenario: 步骤涉及选择器时采集相关 DOM 片段
- **WHEN** 失败的步骤涉及元素选择器（如 click、verify、type 等）
- **THEN** 系统尝试获取该选择器对应元素的 DOM 片段（如 outerHTML 或父节点，长度上限可配置，如 3000 字符）
- **AND** 若无法获取或超长则截断并注明，将结果写入该用例的页面上下文

#### Scenario: 记录截图路径与失败描述
- **WHEN** 测试步骤失败且已拍摄截图
- **THEN** 系统将截图路径、失败步骤序号与描述、预期结果、实际错误信息一并写入该用例结果
- **AND** 上述内容可供 Cursor 分析工件使用

### Requirement: 结果异常时生成 Cursor 分析工件
系统 SHALL 在测试结果异常（存在失败步骤）时，生成可供 Cursor 使用的结构化分析工件，便于将结果交给 Cursor 进行分析。

#### Scenario: 生成 Markdown 格式的 Cursor 分析工件
- **WHEN** 至少有一个测试用例存在失败步骤
- **THEN** 系统为每个失败用例生成一份 Markdown 格式的 Cursor 分析工件
- **AND** 工件内容包含：测试用例名称与 ID、失败步骤描述、预期结果、实际错误信息、页面 URL、页面标题、可见文本摘要、相关 DOM 片段、截图路径
- **AND** 文件末尾包含简短使用说明（如在 Cursor 中打开或粘贴以请求 AI 分析）

#### Scenario: Cursor 工件输出路径可配置
- **WHEN** 生成 Cursor 分析工件
- **THEN** 输出目录可通过配置或命令行参数指定
- **AND** 默认可与测试报告同目录或使用固定子目录（如 cursor_analysis/）
- **AND** 文件名包含用例标识与时间戳，如 cursor_analysis_<case_id>_<timestamp>.md

#### Scenario: 在测试结果中记录 Cursor 工件路径
- **WHEN** 已为某失败用例生成 Cursor 分析工件
- **THEN** 系统在该用例结果中记录工件路径（如 cursor_analysis_path）
- **AND** 报告生成器可引用该路径（如「详见 Cursor 分析：<path>」）

#### Scenario: 无失败时不强制生成 Cursor 工件
- **WHEN** 当次运行所有测试用例均通过
- **THEN** 系统可不生成 Cursor 分析工件
- **AND** 不要求必须创建空目录或占位文件

### Requirement: 数据增删改查操作的数据库验证
系统 SHALL 在涉及数据增删改查的页面操作完成后，支持通过数据库验证步骤查询数据库，以判断操作是否真正成功。

#### Scenario: 支持数据库验证步骤语法
- **WHEN** 测试计划中包含数据库验证步骤（如 `verify database: SELECT COUNT(*) FROM users WHERE name='test'`）
- **THEN** 系统识别并执行该步骤
- **AND** 解析步骤中的 SQL 查询语句
- **AND** 解析预期值（如 COUNT(*) 期望返回 1，或某字段值期望为特定值）

#### Scenario: 从测试计划读取数据库配置
- **WHEN** 测试计划中包含 `database` 配置字段（host, port, database, username, password）
- **THEN** 系统使用该配置连接 MySQL 数据库
- **AND** 若测试计划中无数据库配置，则从环境变量读取（DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD）
- **AND** 若环境变量也不存在，则使用默认值（localhost:3306, heartsphere, root, 123456）

#### Scenario: 执行数据库查询并验证结果
- **WHEN** 执行数据库验证步骤
- **THEN** 系统连接 MySQL 数据库并执行 SELECT 查询
- **AND** 将查询结果与预期值进行比较（如 COUNT(*) = 1, 某字段 = 'expected_value'）
- **AND** 若查询结果与预期值匹配，步骤标记为通过
- **AND** 若查询结果与预期值不匹配，步骤标记为失败，记录查询 SQL、查询结果、预期值、实际值

#### Scenario: 数据库验证失败时触发页面内容采集
- **WHEN** 数据库验证步骤失败
- **THEN** 系统触发页面内容采集（如采集 URL、可见文本摘要、DOM 片段等）
- **AND** 在 Cursor 分析工件中包含数据库验证失败信息（SQL、查询结果、预期/实际值）
- **AND** 测试步骤标记为失败，继续后续步骤或停止（取决于测试计划配置）

#### Scenario: 数据库连接失败处理
- **WHEN** 数据库连接失败（如数据库不可用、配置错误）
- **THEN** 系统记录连接错误信息
- **AND** 数据库验证步骤标记为失败
- **AND** 不阻塞其他测试步骤的执行
- **AND** 在测试结果中记录数据库连接错误

#### Scenario: 数据库查询超时处理
- **WHEN** 数据库查询执行时间超过超时限制（如 5 秒）
- **THEN** 系统终止查询并记录超时错误
- **AND** 数据库验证步骤标记为失败
- **AND** 在测试结果中记录查询超时信息
