## MODIFIED Requirements

### Requirement: 记忆API路径正确性
前端记忆API客户端 SHALL 使用正确的API路径 `/api/memory/v1`，与后端API路径一致。

#### Scenario: API路径验证
- **WHEN** 前端调用记忆API
- **THEN** API路径 SHALL 使用 `/api/memory/v1` 前缀
- **AND** 路径格式 SHALL 与后端API一致（如 `/api/memory/v1/users/{userId}/memories`）
- **AND** 路径中 SHALL 不包含重复的 `/api` 前缀

#### Scenario: 保存记忆API路径
- **WHEN** 前端调用保存记忆接口
- **THEN** 请求路径 SHALL 为 `POST /api/memory/v1/users/{userId}/memories`
- **AND** userId SHALL 正确替换为实际用户ID

### Requirement: 统一响应格式处理
前端记忆API客户端 SHALL 正确处理后端的统一响应格式 `ApiResponse<T>`。

#### Scenario: 成功响应处理
- **WHEN** 后端返回成功响应（`code: 200`）
- **THEN** 前端 SHALL 提取响应中的 `data` 字段
- **AND** 前端 SHALL 返回 `data` 字段的内容
- **AND** 前端 SHALL 正确处理数据格式转换

#### Scenario: 错误响应处理
- **WHEN** 后端返回错误响应（`code !== 200`）
- **THEN** 前端 SHALL 检查响应中的 `code` 字段
- **AND** 前端 SHALL 抛出包含错误信息的异常
- **AND** 错误信息 SHALL 包含 `message` 字段的内容
- **AND** 前端 SHALL 提供用户友好的错误提示

#### Scenario: 响应格式兼容性
- **WHEN** 后端返回 `ApiResponse<T>` 格式
- **THEN** 前端 SHALL 兼容处理以下格式：
  - `{ code: 200, data: T, message: string }` - 标准格式
  - `{ data: T }` - 简化格式（向后兼容）
  - `T` - 直接数据格式（向后兼容）

### Requirement: 记忆API方法正确性
前端记忆API客户端 SHALL 提供所有必需的API方法，并确保调用正确。

#### Scenario: 保存记忆方法
- **WHEN** 前端调用 `saveMemory` 方法
- **THEN** 方法 SHALL 发送 `POST /api/memory/v1/users/{userId}/memories` 请求
- **AND** 请求体 SHALL 包含正确的记忆数据格式
- **AND** 方法 SHALL 返回保存后的记忆对象

#### Scenario: 搜索记忆方法
- **WHEN** 前端调用 `searchMemories` 方法
- **THEN** 方法 SHALL 发送 `GET /api/memory/v1/users/{userId}/memories/search` 请求
- **AND** 查询参数 SHALL 包含 `query` 和 `limit`
- **AND** 方法 SHALL 返回记忆列表

#### Scenario: 获取记忆方法
- **WHEN** 前端调用 `getMemoryById` 方法
- **THEN** 方法 SHALL 发送 `GET /api/memory/v1/users/{userId}/memories/{memoryId}` 请求
- **AND** 方法 SHALL 返回指定的记忆对象
- **AND** 如果记忆不存在，方法 SHALL 正确处理404错误

#### Scenario: 更新记忆方法
- **WHEN** 前端调用 `updateMemory` 方法
- **THEN** 方法 SHALL 发送 `PUT /api/memory/v1/users/{userId}/memories/{memoryId}` 请求
- **AND** 请求体 SHALL 包含要更新的字段
- **AND** 方法 SHALL 返回更新后的记忆对象

#### Scenario: 删除记忆方法
- **WHEN** 前端调用 `deleteMemory` 方法
- **THEN** 方法 SHALL 发送 `DELETE /api/memory/v1/users/{userId}/memories/{memoryId}` 请求
- **AND** 方法 SHALL 正确处理删除成功的情况

#### Scenario: 从会话提取记忆方法
- **WHEN** 前端调用 `extractMemoriesFromSession` 方法
- **THEN** 方法 SHALL 发送 `POST /api/memory/v1/users/{userId}/sessions/{sessionId}/extract` 请求
- **AND** 方法 SHALL 返回提取的记忆列表

### Requirement: 类型定义一致性
前端TypeScript类型定义 SHALL 与后端API响应格式一致。

#### Scenario: 记忆类型定义
- **WHEN** 前端定义记忆类型
- **THEN** 类型定义 SHALL 与后端 `UserMemory` 实体一致
- **AND** 字段名称 SHALL 正确映射（如 `type` → `memoryType`）
- **AND** 时间字段 SHALL 正确处理（`createdAt` → `timestamp`）

#### Scenario: API响应类型定义
- **WHEN** 前端定义API响应类型
- **THEN** 类型定义 SHALL 包含 `ApiResponse<T>` 格式
- **AND** 类型定义 SHALL 包含 `code`、`message`、`data` 字段
- **AND** 类型定义 SHALL 支持泛型

### Requirement: 错误处理完善性
前端记忆API客户端 SHALL 提供完善的错误处理。

#### Scenario: 网络错误处理
- **WHEN** 网络请求失败（超时、连接错误等）
- **THEN** 前端 SHALL 捕获网络错误
- **AND** 前端 SHALL 提供清晰的错误信息
- **AND** 前端 SHALL 记录错误日志

#### Scenario: 业务错误处理
- **WHEN** 后端返回业务错误（`code !== 200`）
- **THEN** 前端 SHALL 检查 `code` 字段
- **AND** 前端 SHALL 根据错误类型提供相应的处理
- **AND** 前端 SHALL 在组件中显示用户友好的错误提示

#### Scenario: 权限错误处理
- **WHEN** 后端返回权限错误（403 Forbidden）
- **THEN** 前端 SHALL 识别权限错误
- **AND** 前端 SHALL 提示用户无权限访问
- **AND** 前端 SHALL 可能需要重新登录

### Requirement: RemoteMemoryStorage适配
`RemoteMemoryStorage` 类 SHALL 正确使用更新后的记忆API。

#### Scenario: 保存记忆适配
- **WHEN** `RemoteMemoryStorage.save` 方法被调用
- **THEN** 方法 SHALL 调用更新后的 `memoryApi.saveMemory`
- **AND** 方法 SHALL 正确处理响应格式
- **AND** 方法 SHALL 处理错误情况

#### Scenario: 搜索记忆适配
- **WHEN** `RemoteMemoryStorage.search` 方法被调用
- **THEN** 方法 SHALL 调用更新后的 `memoryApi.searchMemories`
- **AND** 方法 SHALL 正确处理响应格式
- **AND** 方法 SHALL 返回记忆列表

#### Scenario: 错误处理适配
- **WHEN** API调用失败
- **THEN** `RemoteMemoryStorage` SHALL 正确处理错误
- **AND** 方法 SHALL 记录错误日志
- **AND** 方法 SHALL 抛出适当的异常
