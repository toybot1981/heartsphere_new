# Spec: Memory Service

## ADDED Requirements

### REQ-MEM-001: Backend Memory Service API

**Description**: Main 项目后端必须提供统一的记忆服务 REST API，作为前端调用 hsmem 服务的唯一入口。

**Rationale**: 统一服务接口，增强安全性，便于统一管理和扩展。

#### Scenario: Frontend calls backend memory API

**Given**: 前端需要提取对话记忆  
**When**: 前端调用 `/api/v1/memory/memorize/conversation` API  
**Then**: 
- 后端从认证信息中提取 `user_id`
- 后端通过 `HSMemClientService` 调用 hsmem 服务
- 后端返回标准化的 API 响应

#### Scenario: Backend extracts user ID from authentication

**Given**: 前端请求包含有效的认证Token  
**When**: 后端处理记忆服务请求  
**Then**: 
- 后端从 `@AuthenticationPrincipal` 提取当前用户ID
- 用户ID自动转换为 `user_{userId}` 格式
- 前端不需要显式传递 `user_id` 参数

### REQ-MEM-002: HSMem Client Service

**Description**: Backend 必须提供 `HSMemClientService`，用于通过 HTTP 调用 hsmem Python 服务。

**Rationale**: 封装 hsmem 服务调用，统一错误处理和配置管理。

#### Scenario: Backend calls hsmem service

**Given**: Backend 需要调用 hsmem 服务  
**When**: `HSMemClientService` 发送 HTTP 请求到 hsmem  
**Then**:
- 使用配置的 hsmem 服务地址
- 实现超时和重试机制
- 统一处理错误和异常

#### Scenario: HSMem service unavailable

**Given**: hsmem 服务不可用  
**When**: Backend 尝试调用 hsmem 服务  
**Then**:
- 记录错误日志
- 返回标准化的错误响应
- 不影响主业务流程（异步调用）

### REQ-MEM-003: Memory API Endpoints

**Description**: Backend 必须提供以下记忆服务 REST API 端点。

**Rationale**: 覆盖所有记忆操作需求，提供完整的 API 接口。

#### Scenario: Memorize conversation

**Given**: 前端发送对话记忆化请求  
**When**: 调用 `POST /api/v1/memory/memorize/conversation`  
**Then**:
- 后端接收对话消息列表
- 自动添加当前用户的 `user_id`
- 调用 hsmem 服务完成记忆化
- 返回记忆化结果（resource_id, items_count, categories）

#### Scenario: Memorize text

**Given**: 前端发送文本记忆化请求  
**When**: 调用 `POST /api/v1/memory/memorize/text`  
**Then**:
- 后端接收文本内容和上下文
- 自动添加当前用户的 `user_id`
- 调用 hsmem 服务完成记忆化
- 返回记忆化结果

#### Scenario: Memorize document

**Given**: 前端发送文档记忆化请求  
**When**: 调用 `POST /api/v1/memory/memorize/document`  
**Then**:
- 后端接收文档标题、内容和作者
- 自动添加当前用户的 `user_id`
- 调用 hsmem 服务完成记忆化
- 返回记忆化结果

#### Scenario: Retrieve memories

**Given**: 前端发送记忆检索请求  
**When**: 调用 `POST /api/v1/memory/retrieve`  
**Then**:
- 后端接收查询内容和过滤条件
- 自动添加当前用户的 `user_id` 到过滤条件
- 调用 hsmem 服务检索记忆
- 返回检索结果（方法、记忆项列表）

#### Scenario: Get memory statistics

**Given**: 前端请求记忆统计信息  
**When**: 调用 `GET /api/v1/memory/statistics`  
**Then**:
- 后端调用 hsmem 服务获取统计信息
- 返回资源数量、记忆项数量、分类数量等

#### Scenario: Get memory categories

**Given**: 前端请求记忆分类列表  
**When**: 调用 `GET /api/v1/memory/categories`  
**Then**:
- 后端调用 hsmem 服务获取分类列表
- 返回所有分类信息

#### Scenario: Get memory items

**Given**: 前端请求记忆项列表  
**When**: 调用 `GET /api/v1/memory/items?user_id={userId}`  
**Then**:
- 后端从认证信息验证用户权限
- 如果提供了 `user_id`，验证是否为当前用户
- 调用 hsmem 服务获取记忆项列表
- 返回记忆项列表

#### Scenario: Get resources

**Given**: 前端请求资源列表  
**When**: 调用 `GET /api/v1/memory/resources`  
**Then**:
- 后端调用 hsmem 服务获取资源列表
- 返回所有资源信息（仅管理员可访问，或添加权限控制）

### REQ-MEM-004: Frontend Memory API Client

**Description**: Main 项目前端必须使用 backend 提供的记忆服务 API，不得直接调用 hsmem 服务。

**Rationale**: 统一服务调用模式，增强安全性，便于维护。

#### Scenario: Frontend uses backend API client

**Given**: 前端需要调用记忆服务  
**When**: 前端使用记忆服务 API 客户端  
**Then**:
- 调用 backend API，而不是直接调用 hsmem
- 自动添加认证Token
- 处理标准化的错误响应

#### Scenario: Frontend removes hsmem direct calls

**Given**: 前端代码中存在对 `hsmemApi` 的直接调用  
**When**: 迁移到新的架构  
**Then**:
- 所有调用点已更新为使用 backend API
- `hsmemApi` 已标记为废弃或删除
- 功能验证通过

### REQ-MEM-005: Configuration Management

**Description**: hsmem 服务配置必须在 backend `application.yml` 中集中管理。

**Rationale**: 统一配置管理，便于环境切换和维护。

#### Scenario: Configure hsmem service

**Given**: 需要配置 hsmem 服务地址  
**When**: 在 `application.yml` 中配置  
**Then**:
- 配置项位于 `heartsphere.memory.hsmem.base-url`
- 支持环境变量覆盖
- 包含超时和重试配置

## MODIFIED Requirements

### REQ-MEM-MOD-001: Frontend Memory Integration

**Description**: 前端记忆提取集成必须改为调用 backend API，而不是直接调用 hsmem。

**Changes**:
- **Before**: 前端直接调用 `hsmemApi.memorizeConversation()` 等
- **After**: 前端调用 backend API `/api/v1/memory/memorize/conversation` 等

#### Scenario: Conversation memory extraction

**Given**: 用户发送对话消息  
**When**: 前端需要提取对话记忆  
**Then**:
- 前端调用 backend API，传递对话消息
- Backend 自动添加 `user_id` 并调用 hsmem
- 功能保持不变，调用路径改变

## Notes

- Admin 项目继续直接调用 hsmem 服务，这是合理的架构设计，不需要修改。
- 现有的 `ShortMemoryService` 和 `LongMemoryService` 保持不变，它们可能用于其他场景。
- 迁移过程中需要确保向后兼容，避免影响现有功能。
