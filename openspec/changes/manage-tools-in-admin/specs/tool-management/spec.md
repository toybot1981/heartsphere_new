# 工具管理规范

**变更ID**: `manage-tools-in-admin`  
**能力**: `tool-management`

## ADDED Requirements

### Requirement: 工具列表管理

系统 **MUST** 在管理端提供工具列表管理功能，支持查看所有已注册的工具。

#### Scenario: 在管理端查看工具列表
- **Given** 管理员已登录管理端
- **When** 管理员访问工具管理页面
- **THEN** 系统 **SHALL** 显示所有已注册的工具列表
- **AND** 系统 **SHALL** 从 `ToolRegistry` 获取工具列表
- **AND** 系统 **SHALL** 显示工具的基本信息（名称、描述、分类）
- **AND** 系统 **SHALL** 支持按分类筛选工具（browser、terminal、filesystem、code、system）
- **AND** 系统 **SHALL** 支持搜索工具（按名称、描述）

#### Scenario: 工具分类显示
- **Given** 系统中有多个分类的工具
- **When** 管理员查看工具列表时
- **THEN** 系统 **SHALL** 按分类组织显示工具
- **AND** 系统 **SHALL** 支持按分类筛选工具
- **AND** 系统 **SHALL** 显示每个分类的工具数量

### Requirement: 工具详情管理

系统 **MUST** 在管理端提供工具详情查看和编辑功能。

#### Scenario: 查看工具详情
- **Given** 管理员已登录管理端
- **When** 管理员点击工具列表中的某个工具
- **THEN** 系统 **SHALL** 显示工具的详细信息
- **AND** 系统 **SHALL** 显示工具名称、描述、分类
- **AND** 系统 **SHALL** 显示工具的参数模式（JSON Schema 格式）
- **AND** 系统 **SHALL** 显示工具的配置信息（提示词、指令等）
- **AND** 系统 **SHALL** 显示工具的执行历史和使用统计（如果可用）

#### Scenario: 编辑工具描述和参数说明
- **Given** 管理员已登录管理端
- **When** 管理员编辑工具的描述或参数说明
- **THEN** 系统 **SHALL** 允许管理员编辑工具描述
- **AND** 系统 **SHALL** 允许管理员编辑工具的参数模式（JSON Schema）
- **AND** 系统 **SHALL** 验证参数模式的格式（确保是有效的 JSON Schema）
- **AND** 管理员保存后，系统 **SHALL** 更新工具配置
- **AND** 系统 **SHALL** 在下次工具执行时使用更新后的配置

### Requirement: 工具提示词管理

系统 **MUST** 在管理端提供工具提示词管理功能，支持为每个工具配置提示词模板。

#### Scenario: 从管理系统读取工具提示词
- **Given** 管理系统中已配置工具提示词模板
- **When** 工具选择器需要获取工具提示词时
- **THEN** 系统 **SHALL** 从管理系统读取提示词模板
- **AND** 系统 **SHALL** 使用分类代码 `mentis.tool.{toolName}.prompt` 查找提示词模板
- **AND** 如果管理系统中的模板不存在或读取失败，系统 **SHALL** 使用硬编码的提示词作为 fallback
- **AND** 系统 **SHALL** 支持提示词模板的变量替换

#### Scenario: 在管理端编辑工具提示词
- **Given** 管理员已登录管理端
- **When** 管理员编辑工具提示词模板
- **THEN** 系统 **SHALL** 显示当前的工具提示词模板
- **AND** 管理员 **SHALL** 能够编辑提示词内容
- **AND** 系统 **SHALL** 验证提示词格式（确保包含必要的变量占位符）
- **AND** 系统 **SHALL** 提供提示词预览功能（预览变量替换后的结果）
- **AND** 管理员保存后，系统 **SHALL** 更新提示词模板
- **AND** 系统 **SHALL** 在下次工具选择时使用更新后的提示词

#### Scenario: 工具提示词模板存储
- **Given** 工具提示词需要存储到管理系统
- **When** 系统存储工具提示词时
- **THEN** 系统 **SHALL** 使用 `PromptTemplate` 实体存储
- **AND** 系统 **SHALL** 使用分类代码 `mentis.tool.{toolName}.prompt`
- **AND** 系统 **SHALL** 在 `ToolConfig` 中记录提示词模板的分类代码

### Requirement: 工具指令管理

系统 **MUST** 在管理端提供工具指令管理功能，支持为每个工具配置执行指令模板。

#### Scenario: 从管理系统读取工具指令
- **Given** 管理系统中已配置工具指令模板
- **When** 工具执行器需要获取工具指令时
- **THEN** 系统 **SHALL** 从管理系统读取指令模板
- **AND** 系统 **SHALL** 从 `ToolConfig` 实体的 `instructionTemplate` 字段读取
- **AND** 如果管理系统中的模板不存在或读取失败，系统 **SHALL** 使用硬编码的指令作为 fallback
- **AND** 系统 **SHALL** 解析 JSON 格式的指令模板
- **AND** 系统 **SHALL** 支持指令模板的变量替换

#### Scenario: 在管理端编辑工具指令
- **Given** 管理员已登录管理端
- **When** 管理员编辑工具指令模板
- **THEN** 系统 **SHALL** 显示当前的工具指令模板
- **AND** 管理员 **SHALL** 能够编辑指令内容
- **AND** 系统 **SHALL** 验证指令格式（确保是有效的 JSON 格式）
- **AND** 系统 **SHALL** 提供指令预览功能（预览变量替换后的结果）
- **AND** 管理员保存后，系统 **SHALL** 更新指令模板
- **AND** 系统 **SHALL** 在下次工具执行时使用更新后的指令

#### Scenario: 工具脚本模板管理
- **Given** 工具需要执行脚本（如 Python 脚本）
- **When** 管理员编辑工具的脚本模板时
- **THEN** 系统 **SHALL** 显示当前的脚本模板
- **AND** 管理员 **SHALL** 能够编辑脚本内容
- **AND** 系统 **SHALL** 支持脚本模板的变量替换（如 `{url}`, `{waitSelector}`）
- **AND** 系统 **SHALL** 提供脚本语法高亮（如果可能）
- **AND** 管理员保存后，系统 **SHALL** 更新脚本模板

### Requirement: 工具测试功能

系统 **MUST** 在管理端提供工具测试功能，支持在管理界面中测试工具的执行。

#### Scenario: 在管理端测试工具执行
- **Given** 管理员已登录管理端
- **When** 管理员点击工具测试按钮
- **THEN** 系统 **SHALL** 显示工具测试界面
- **AND** 系统 **SHALL** 显示工具参数输入表单（根据工具的参数模式生成）
- **AND** 管理员 **SHALL** 能够输入工具参数
- **AND** 管理员点击执行按钮后，系统 **SHALL** 创建测试会话
- **AND** 系统 **SHALL** 在测试会话中执行工具
- **AND** 系统 **SHALL** 显示工具执行结果
- **AND** 系统 **SHALL** 显示工具执行日志和错误信息（如果有）

#### Scenario: 工具执行结果展示
- **Given** 工具测试执行完成
- **When** 系统显示工具执行结果时
- **THEN** 系统 **SHALL** 显示工具执行是否成功
- **AND** 系统 **SHALL** 显示工具执行返回的结果数据
- **AND** 系统 **SHALL** 显示工具执行的元数据（执行时间、资源使用等）
- **AND** 如果执行失败，系统 **SHALL** 显示错误信息

### Requirement: 工具配置缓存机制

系统 **MUST** 实现工具配置的缓存机制，以提高读取性能。

#### Scenario: 工具配置缓存
- **Given** 系统已从管理系统读取工具配置
- **When** 工具执行器再次需要获取配置时
- **THEN** 系统 **SHALL** 优先从缓存中读取
- **AND** 缓存过期时间 **SHALL** 为 5 分钟
- **AND** 当缓存过期或配置更新时，系统 **SHALL** 重新从数据库读取

### Requirement: 工具配置验证

系统 **MUST** 验证工具配置的格式和内容。

#### Scenario: 工具配置格式验证
- **Given** 管理员编辑工具配置
- **When** 管理员保存配置时
- **THEN** 系统 **SHALL** 验证配置格式
- **AND** 系统 **SHALL** 检查参数模式是否是有效的 JSON Schema
- **AND** 系统 **SHALL** 检查指令模板是否是有效的 JSON 格式
- **AND** 系统 **SHALL** 检查提示词模板是否包含必要的变量占位符
- **AND** 如果验证失败，系统 **SHALL** 拒绝保存并提示错误信息
