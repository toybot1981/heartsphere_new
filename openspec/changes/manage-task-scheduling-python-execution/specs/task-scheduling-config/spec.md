# 任务调度配置管理规范

**变更ID**: `manage-task-scheduling-python-execution`  
**能力**: `task-scheduling-config`

## ADDED Requirements

### Requirement: 任务调度提示词模板管理

系统 **MUST** 支持在管理端管理任务调度相关的提示词模板，包括多智能体任务分解提示词和单智能体任务分解提示词。

#### Scenario: 从管理系统读取任务调度提示词
- **Given** 管理系统中已配置任务调度提示词模板
- **When** 任务分解器需要获取提示词时
- **THEN** 系统 **SHALL** 从管理系统读取提示词模板
- **AND** 如果管理系统中的模板不存在或读取失败，系统 **SHALL** 使用硬编码的提示词作为 fallback
- **AND** 系统 **SHALL** 支持提示词模板的变量替换（如 `{userRequest}`）

#### Scenario: 在管理端编辑任务调度提示词
- **Given** 管理员已登录管理端
- **When** 管理员访问任务调度提示词管理页面
- **THEN** 系统 **SHALL** 显示当前的任务调度提示词模板
- **AND** 管理员 **SHALL** 能够编辑提示词内容
- **AND** 系统 **SHALL** 验证提示词格式（确保包含必要的变量占位符）
- **AND** 管理员保存后，系统 **SHALL** 更新提示词模板
- **AND** 系统 **SHALL** 在下次任务分解时使用更新后的提示词

#### Scenario: 任务调度提示词分类管理
- **Given** 系统中有多个任务调度提示词模板
- **When** 系统需要区分不同类型的提示词时
- **THEN** 系统 **SHALL** 使用 `categoryCode` 区分提示词类型
- **AND** 多智能体任务分解提示词 **SHALL** 使用分类代码 `mentis.task-decomposition.multi-agent`
- **AND** 单智能体任务分解提示词 **SHALL** 使用分类代码 `mentis.task-decomposition.single-agent`

### Requirement: 任务调度提示词缓存机制

系统 **MUST** 实现提示词模板的缓存机制，以提高读取性能。

#### Scenario: 提示词模板缓存
- **Given** 系统已从管理系统读取提示词模板
- **When** 任务分解器再次需要获取提示词时
- **THEN** 系统 **SHALL** 优先从缓存中读取
- **AND** 缓存过期时间 **SHALL** 为 5 分钟
- **AND** 当缓存过期或配置更新时，系统 **SHALL** 重新从数据库读取

### Requirement: 任务调度提示词配置验证

系统 **MUST** 验证任务调度提示词配置的格式和内容。

#### Scenario: 提示词格式验证
- **Given** 管理员编辑任务调度提示词
- **When** 管理员保存提示词时
- **THEN** 系统 **SHALL** 验证提示词格式
- **AND** 系统 **SHALL** 检查是否包含必要的变量占位符（如 `{userRequest}`）
- **AND** 如果验证失败，系统 **SHALL** 拒绝保存并提示错误信息
