## ADDED Requirements

### Requirement: HSMem服务集成
Admin记忆管理模块SHALL集成hsmem服务（http://localhost:8000），通过REST API调用实现记忆的测试、查询、删除等操作。

#### Scenario: 服务健康检查
- **WHEN** admin用户访问记忆管理模块
- **THEN** 系统自动检查hsmem服务健康状态
- **AND** 在Dashboard显示服务状态（健康/不健康）

#### Scenario: 记忆模拟测试 - 对话类型
- **WHEN** admin用户在记忆测试页面输入对话消息（用户消息和助手回复）
- **AND** 选择用户ID和代理ID（可选）
- **AND** 点击"测试对话记忆"按钮
- **THEN** 系统调用hsmem API (`POST /api/v1/memory/memorize/conversation`)
- **AND** 显示测试结果：资源ID、记忆项数量、分类信息

#### Scenario: 记忆模拟测试 - 文本类型
- **WHEN** admin用户在记忆测试页面输入文本内容
- **AND** 输入上下文信息（可选）
- **AND** 选择用户ID（可选）
- **AND** 点击"测试文本记忆"按钮
- **THEN** 系统调用hsmem API (`POST /api/v1/memory/memorize/text`)
- **AND** 显示测试结果：资源ID、记忆项数量、分类信息

#### Scenario: 记忆模拟测试 - 文档类型
- **WHEN** admin用户在记忆测试页面输入文档标题和内容
- **AND** 输入作者信息（可选）
- **AND** 选择用户ID（可选）
- **AND** 点击"测试文档记忆"按钮
- **THEN** 系统调用hsmem API (`POST /api/v1/memory/memorize/document`)
- **AND** 显示测试结果：资源ID、记忆项数量、分类信息

#### Scenario: 记忆查询
- **WHEN** admin用户在记忆查询页面输入查询文本
- **AND** 设置过滤条件（用户ID、分类等，可选）
- **AND** 设置返回数量限制（可选）
- **AND** 点击"查询"按钮
- **THEN** 系统调用hsmem API (`POST /api/v1/memory/retrieve`)
- **AND** 显示检索结果列表：记忆项ID、摘要、类型、分类、重要性等

#### Scenario: 记忆删除
- **WHEN** admin用户在记忆列表中选择要删除的记忆项
- **AND** 点击"删除"按钮
- **AND** 确认删除操作
- **THEN** 系统调用hsmem删除接口（如果存在）或标记为已删除
- **AND** 从列表中移除该记忆项
- **AND** 显示删除成功提示

#### Scenario: 统计信息展示
- **WHEN** admin用户访问记忆Dashboard
- **THEN** 系统调用hsmem统计接口 (`GET /api/v1/memory/statistics`)
- **AND** 显示统计信息：资源总数、记忆项总数、分类总数
- **AND** 显示服务健康状态

#### Scenario: 分类列表展示
- **WHEN** admin用户访问记忆管理页面
- **THEN** 系统可以调用hsmem分类接口 (`GET /api/v1/memory/categories`)
- **AND** 显示所有记忆分类及其包含的记忆项数量

#### Scenario: 分类记忆项查询
- **WHEN** admin用户选择特定分类
- **AND** 点击"查看分类记忆"按钮
- **THEN** 系统调用hsmem分类接口 (`GET /api/v1/memory/categories/{category_name}`)
- **AND** 显示该分类下的所有记忆项

### Requirement: HSMem API客户端服务
系统SHALL提供hsmem API客户端服务，封装对http://localhost:8000的所有API调用。

#### Scenario: API调用封装
- **WHEN** 前端组件需要调用hsmem API
- **THEN** 通过统一的API客户端服务进行调用
- **AND** API客户端处理HTTP请求、响应解析、错误处理
- **AND** 返回TypeScript类型化的数据

#### Scenario: 错误处理
- **WHEN** hsmem API调用失败（网络错误、服务不可用等）
- **THEN** API客户端捕获错误
- **AND** 返回友好的错误信息
- **AND** 前端组件显示错误提示

## MODIFIED Requirements

### Requirement: Admin记忆管理Dashboard
Admin记忆管理Dashboard SHALL集成hsmem服务的统计信息，显示hsmem服务的资源数、记忆项数、分类数等统计数据。

#### Scenario: 显示HSMem统计信息
- **WHEN** admin用户访问记忆Dashboard
- **THEN** Dashboard显示hsmem服务的统计信息
- **AND** 包括资源总数、记忆项总数、分类总数
- **AND** 显示服务健康状态
- **AND** 提供刷新按钮更新统计数据

### Requirement: Admin用户记忆管理
Admin用户记忆管理功能SHALL支持通过hsmem API进行记忆查询和删除操作。

#### Scenario: 通过HSMem查询记忆
- **WHEN** admin用户在用户记忆管理页面
- **THEN** 可以输入查询条件
- **AND** 调用hsmem检索API查询记忆
- **AND** 显示查询结果列表

#### Scenario: 通过HSMem删除记忆
- **WHEN** admin用户在用户记忆管理页面选择记忆项
- **THEN** 可以删除选中的记忆项
- **AND** 调用hsmem删除接口（如果存在）或标记删除
- **AND** 更新列表显示
