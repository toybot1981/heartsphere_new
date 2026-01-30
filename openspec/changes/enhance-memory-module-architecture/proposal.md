# Change: 增强记忆模块架构

## Why

当前记忆系统的架构存在以下问题：

1. **架构不统一**：main 项目的 frontend 直接调用 hsmem Python 服务，绕过了后端，导致：
   - 前端需要直接配置 hsmem 服务地址
   - 无法利用后端的安全认证机制
   - 无法在后端层面对记忆数据进行统一处理和增强
   - 前后端架构不一致，增加维护成本

2. **服务职责不清晰**：main 项目后端已有自己的记忆服务（`ShortMemoryService`, `LongMemoryService`），但前端直接调用 hsmem，导致：
   - 后端记忆服务功能未充分利用
   - hsmem 和本地记忆服务之间的职责边界不清
   - 难以实现统一的记忆数据管理

3. **管理界面分离**：admin 直接调用 hsmem 管理记忆数据，这是合理的（因为管理端需要直接访问底层数据），但与 main 项目的架构不一致。

为了建立清晰的架构分层和统一的记忆服务接口，需要：

1. **统一服务层**：main 项目的 backend 作为记忆服务的统一入口，前端只与 backend 交互
2. **后端调用 hsmem**：backend 通过调用 hsmem Python 服务完成记忆的最终操作，实现与 hsmem 的解耦
3. **保留管理端直接访问**：admin 继续直接调用 hsmem 管理记忆数据，这是合理的架构设计

## What Changes

### 架构调整

- **MODIFIED**: main 项目 backend 记忆服务架构
  - backend 提供统一的记忆服务 REST API 接口
  - backend 内部通过 HTTP 调用 hsmem Python 服务完成实际记忆操作
  - backend 可以在此过程中添加业务逻辑、数据验证、缓存等

- **MODIFIED**: main 项目 frontend 记忆服务调用
  - 移除 frontend 对 hsmem 的直接调用
  - frontend 改为调用 backend 提供的记忆服务 API
  - 更新所有使用 `hsmemApi` 的代码

- **UNCHANGED**: admin 记忆管理
  - admin 继续直接调用 hsmem 管理记忆数据（合理的架构设计）

### 新增功能

- **ADDED**: backend HSMem 服务集成
  - 创建 `HSMemClientService` 用于调用 hsmem Python API
  - 在 `MemoryController` 或新控制器中提供 REST API 接口
  - 实现记忆化（memorize）和检索（retrieve）功能的代理

- **ADDED**: 前端记忆服务 API 客户端
  - 创建或更新 `main/frontend/services/api/memory/` 下的 API 客户端
  - 提供与 backend 记忆服务交互的方法
  - 移除对 `hsmemApi` 的直接调用

- **ADDED**: 配置管理
  - 在 `application.yml` 中配置 hsmem 服务地址和连接参数
  - 支持环境变量配置

## Impact

### 受影响的后端代码

- `main/backend/src/main/java/com/heartsphere/memory/service/` - 新增或修改服务类
  - 新增 `HSMemClientService` 用于调用 hsmem API
  - 可能修改现有的 `MemoryController` 或创建新的控制器
- `main/backend/src/main/java/com/heartsphere/memory/dto/` - 新增或修改 DTO 类
  - 新增 hsmem 相关的请求/响应 DTO
- `main/backend/src/main/resources/application.yml` - 新增 hsmem 服务配置

### 受影响的前端代码

- `main/frontend/services/api/hsmem/hsmemApi.ts` - **标记为废弃**或移除
- `main/frontend/services/api/memory/memory.ts` - 更新或新增 backend API 客户端
- `main/frontend/components/chat/hooks/useSystemIntegration.ts` - 修改记忆提取调用
- `main/frontend/components/chat/utils/generateAIResponse.ts` - 修改记忆提取调用
- `main/frontend/services/journal-memory-integration/JournalMemoryIntegration.ts` - 修改记忆提取调用

### 需要创建的规范

- backend 记忆服务 API 规范
- 前端记忆服务调用规范
- hsmem 服务配置规范

## Benefits

1. **架构统一**：main 项目前后端遵循统一的服务调用模式
2. **安全增强**：记忆操作通过后端，可以利用认证和授权机制
3. **易于维护**：集中管理 hsmem 服务调用，便于统一处理错误、重试、日志等
4. **扩展性强**：后端可以在调用 hsmem 前后添加业务逻辑、缓存、数据转换等
5. **职责清晰**：backend 负责记忆服务统一接口，hsmem 负责底层存储和检索

## Risks

1. **性能影响**：增加一层后端代理，可能带来少量延迟（可通过异步处理缓解）
2. **迁移成本**：需要修改多处前端代码，确保所有调用点都已更新
3. **兼容性**：需要确保 backend API 与前端调用方式兼容

## Dependencies

- hsmem Python 服务必须可用
- backend 需要能够访问 hsmem 服务地址
- 前端需要能够访问 backend API
