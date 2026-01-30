# Python 执行配置管理规范

**变更ID**: `manage-task-scheduling-python-execution`  
**能力**: `python-execution-config`

## ADDED Requirements

### Requirement: Python 执行配置管理

系统 **MUST** 支持在管理端管理 Python 脚本执行的配置信息，包括依赖检测、命令构建等配置。

#### Scenario: 从管理系统读取 Python 执行配置
- **Given** 管理系统中已配置 Python 执行配置
- **When** Python 脚本执行器需要获取配置时
- **THEN** 系统 **SHALL** 从管理系统读取配置
- **AND** 如果管理系统中的配置不存在或读取失败，系统 **SHALL** 使用硬编码的配置作为 fallback
- **AND** 系统 **SHALL** 解析 JSON 格式的配置数据

#### Scenario: 在管理端编辑 Python 执行配置
- **Given** 管理员已登录管理端
- **When** 管理员访问 Python 执行配置管理页面
- **THEN** 系统 **SHALL** 显示当前的 Python 执行配置
- **AND** 管理员 **SHALL** 能够编辑配置项（如脚本文件路径、依赖库列表等）
- **AND** 系统 **SHALL** 验证配置格式（确保 JSON 格式正确）
- **AND** 管理员保存后，系统 **SHALL** 更新配置
- **AND** 系统 **SHALL** 在下次执行 Python 脚本时使用更新后的配置

#### Scenario: Python 执行配置项管理
- **Given** Python 执行配置包含多个配置项
- **When** 系统需要读取或更新配置时
- **THEN** 系统 **SHALL** 支持以下配置项：
  - `scriptFilePrefix`: 脚本文件路径前缀（如 `/tmp/mentis_script_`）
  - `scriptFileSuffix`: 脚本文件后缀（如 `.py`）
  - `useBase64Encoding`: 是否使用 base64 编码脚本
  - `autoDetectDependencies`: 是否自动检测 Python 依赖
  - `commonLibraries`: 常见 Python 库列表
  - `installCommandTemplate`: 依赖安装命令模板
  - `playwrightInstallCommand`: Playwright 特殊安装命令

### Requirement: Python 执行配置缓存机制

系统 **MUST** 实现 Python 执行配置的缓存机制，以提高读取性能。

#### Scenario: Python 执行配置缓存
- **Given** 系统已从管理系统读取 Python 执行配置
- **When** Python 脚本执行器再次需要获取配置时
- **THEN** 系统 **SHALL** 优先从缓存中读取
- **AND** 缓存过期时间 **SHALL** 为 5 分钟
- **AND** 当缓存过期或配置更新时，系统 **SHALL** 重新从数据库读取

### Requirement: Python 执行配置验证

系统 **MUST** 验证 Python 执行配置的格式和内容。

#### Scenario: 配置格式验证
- **Given** 管理员编辑 Python 执行配置
- **When** 管理员保存配置时
- **THEN** 系统 **SHALL** 验证配置格式
- **AND** 系统 **SHALL** 检查 JSON 格式是否正确
- **AND** 系统 **SHALL** 检查必需的配置项是否存在
- **AND** 如果验证失败，系统 **SHALL** 拒绝保存并提示错误信息

#### Scenario: 配置项类型验证
- **Given** Python 执行配置包含不同类型的配置项
- **When** 系统验证配置时
- **THEN** 系统 **SHALL** 验证每个配置项的类型
- **AND** `scriptFilePrefix` **SHALL** 为字符串类型
- **AND** `useBase64Encoding` **SHALL** 为布尔类型
- **AND** `commonLibraries` **SHALL** 为字符串数组类型
- **AND** 如果类型不匹配，系统 **SHALL** 拒绝保存并提示错误信息

### Requirement: Python 依赖检测配置化

系统 **MUST** 支持通过配置管理 Python 依赖检测逻辑。

#### Scenario: 从配置读取依赖库列表
- **Given** Python 执行配置中包含 `commonLibraries` 列表
- **When** 系统需要检测 Python 脚本的依赖时
- **THEN** 系统 **SHALL** 从配置中读取 `commonLibraries` 列表
- **AND** 系统 **SHALL** 使用配置的库列表进行依赖检测
- **AND** 如果配置不存在，系统 **SHALL** 使用硬编码的默认库列表

#### Scenario: 从配置读取安装命令模板
- **Given** Python 执行配置中包含 `installCommandTemplate`
- **When** 系统需要安装 Python 依赖时
- **THEN** 系统 **SHALL** 从配置中读取安装命令模板
- **AND** 系统 **SHALL** 使用模板替换库名称（如 `{library}`）
- **AND** 系统 **SHALL** 执行生成的安装命令
- **AND** 如果配置不存在，系统 **SHALL** 使用硬编码的默认命令模板
