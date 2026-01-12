## ADDED Requirements

### Requirement: HSMem 服务集成
主项目后端 SHALL 提供统一的记忆服务接口，通过 HTTP 调用 hsmem Python 服务，供前端调用。

#### Scenario: 服务配置
- **WHEN** 主项目后端启动
- **THEN** 系统 SHALL 读取 hsmem 服务配置（地址、端口、超时等）
- **AND** 系统 SHALL 初始化 HSMemService 用于调用 hsmem API
- **AND** 系统 SHALL 提供健康检查机制验证 hsmem 服务可用性

#### Scenario: 服务调用
- **WHEN** 前端调用主项目的记忆服务接口
- **THEN** 主项目后端 SHALL 通过 HTTP 调用 hsmem Python 服务
- **AND** 主项目后端 SHALL 处理超时和错误重试
- **AND** 主项目后端 SHALL 将 hsmem 的响应转换为主项目的统一响应格式

### Requirement: 对话记忆化
系统 SHALL 提供对话记忆化接口，将对话内容提取为记忆项。

#### Scenario: 记忆化对话
- **WHEN** 前端发送对话记忆化请求（POST /api/v1/memory/memorize/conversation）
- **THEN** 系统 SHALL 接收对话消息列表
- **AND** 系统 SHALL 从 JWT Token 中提取 userId（如果未提供）
- **AND** 系统 SHALL 调用 hsmem 服务的对话记忆化接口
- **AND** 系统 SHALL 返回记忆化结果（resource_id、items_count、categories 等）

#### Scenario: 对话记忆化参数验证
- **WHEN** 前端发送无效的对话记忆化请求（缺少必需参数）
- **THEN** 系统 SHALL 返回 400 Bad Request 错误
- **AND** 错误信息 SHALL 明确指出缺少的参数

### Requirement: 文本记忆化
系统 SHALL 提供文本记忆化接口，将文本内容提取为记忆项。

#### Scenario: 记忆化文本
- **WHEN** 前端发送文本记忆化请求（POST /api/v1/memory/memorize/text）
- **THEN** 系统 SHALL 接收文本内容和可选的上下文信息
- **AND** 系统 SHALL 从 JWT Token 中提取 userId（如果未提供）
- **AND** 系统 SHALL 调用 hsmem 服务的文本记忆化接口
- **AND** 系统 SHALL 返回记忆化结果

### Requirement: 文档记忆化
系统 SHALL 提供文档记忆化接口，将文档内容提取为记忆项。

#### Scenario: 记忆化文档
- **WHEN** 前端发送文档记忆化请求（POST /api/v1/memory/memorize/document）
- **THEN** 系统 SHALL 接收文档标题、内容和可选的作者信息
- **AND** 系统 SHALL 从 JWT Token 中提取 userId（如果未提供）
- **AND** 系统 SHALL 调用 hsmem 服务的文档记忆化接口
- **AND** 系统 SHALL 返回记忆化结果

### Requirement: 记忆检索
系统 SHALL 提供记忆检索接口，根据查询条件检索相关记忆。

#### Scenario: 检索记忆
- **WHEN** 前端发送记忆检索请求（POST /api/v1/memory/retrieve）
- **THEN** 系统 SHALL 接收查询列表和可选的过滤条件
- **AND** 系统 SHALL 从 JWT Token 中提取 userId 并添加到过滤条件中（确保数据隔离）
- **AND** 系统 SHALL 调用 hsmem 服务的检索接口
- **AND** 系统 SHALL 返回检索结果（items、categories 等）

#### Scenario: 检索记忆带过滤条件
- **WHEN** 前端发送记忆检索请求并指定过滤条件（分类、时间范围等）
- **THEN** 系统 SHALL 将过滤条件传递给 hsmem 服务
- **AND** 系统 SHALL 确保用户只能检索自己的记忆数据
- **AND** 系统 SHALL 返回符合条件的记忆项

#### Scenario: 检索记忆带数量限制
- **WHEN** 前端发送记忆检索请求并指定 limit 参数
- **THEN** 系统 SHALL 将 limit 参数传递给 hsmem 服务
- **AND** 系统 SHALL 返回不超过指定数量的记忆项

### Requirement: 记忆统计
系统 SHALL 提供记忆统计接口，获取记忆系统的统计信息。

#### Scenario: 获取统计信息
- **WHEN** 前端请求统计信息（GET /api/v1/memory/statistics）
- **THEN** 系统 SHALL 调用 hsmem 服务的统计接口
- **AND** 系统 SHALL 返回统计信息（resources_count、items_count、categories_count 等）

#### Scenario: 获取用户记忆统计
- **WHEN** 前端请求用户记忆统计（GET /api/v1/memory/statistics/user）
- **THEN** 系统 SHALL 从 JWT Token 中提取 userId
- **AND** 系统 SHALL 调用 hsmem 服务获取该用户的统计信息
- **AND** 系统 SHALL 返回用户相关的统计信息

### Requirement: 分类列表
系统 SHALL 提供分类列表接口，获取所有记忆分类。

#### Scenario: 获取分类列表
- **WHEN** 前端请求分类列表（GET /api/v1/memory/categories）
- **THEN** 系统 SHALL 调用 hsmem 服务的分类接口
- **AND** 系统 SHALL 返回分类列表（包含分类名称、记忆项数量等）
- **AND** 系统 SHALL 支持按用户过滤（从 JWT 中提取 userId）

### Requirement: 用户数据隔离
系统 SHALL 确保用户只能访问自己的记忆数据。

#### Scenario: 自动用户隔离
- **WHEN** 用户调用任何记忆服务接口
- **THEN** 系统 SHALL 从 JWT Token 中提取 userId
- **AND** 系统 SHALL 自动将 userId 添加到请求参数中
- **AND** hsmem 服务 SHALL 根据 userId 进行数据隔离
- **AND** 用户 SHALL 只能访问自己的记忆数据

#### Scenario: 管理员访问所有数据
- **WHEN** 管理员调用记忆服务接口
- **THEN** 系统 SHALL 识别管理员身份
- **AND** 系统 SHALL 允许管理员访问所有用户的记忆数据（如需要）

### Requirement: 错误处理
系统 SHALL 提供统一的错误处理，将 hsmem 的错误转换为主项目的错误格式。

#### Scenario: hsmem 服务不可用
- **WHEN** hsmem 服务不可用或超时
- **THEN** 系统 SHALL 返回 503 Service Unavailable 错误
- **AND** 错误信息 SHALL 明确指出 hsmem 服务不可用
- **AND** 系统 SHALL 记录详细的错误日志

#### Scenario: 请求参数错误
- **WHEN** 前端发送无效的请求参数
- **THEN** 系统 SHALL 返回 400 Bad Request 错误
- **AND** 错误信息 SHALL 明确指出参数错误的原因

#### Scenario: 记忆数据不存在
- **WHEN** 请求的记忆数据不存在
- **THEN** 系统 SHALL 返回 404 Not Found 错误
- **AND** 错误信息 SHALL 明确指出数据不存在

### Requirement: 前端 API 客户端
前端 SHALL 提供 TypeScript API 客户端，用于调用记忆服务。

#### Scenario: 调用记忆化接口
- **WHEN** 前端需要记忆化对话、文本或文档
- **THEN** 前端 SHALL 使用 API 客户端的方法（memorizeConversation、memorizeText、memorizeDocument）
- **AND** API 客户端 SHALL 自动添加认证 Token
- **AND** API 客户端 SHALL 处理响应和错误

#### Scenario: 调用检索接口
- **WHEN** 前端需要检索记忆
- **THEN** 前端 SHALL 使用 API 客户端的 retrieveMemory 方法
- **AND** API 客户端 SHALL 支持查询参数和过滤条件
- **AND** API 客户端 SHALL 返回类型化的响应数据

#### Scenario: 调用统计接口
- **WHEN** 前端需要获取统计信息
- **THEN** 前端 SHALL 使用 API 客户端的统计方法（getStatistics、getCategories、getUserStatistics）
- **AND** API 客户端 SHALL 返回类型化的统计数据
