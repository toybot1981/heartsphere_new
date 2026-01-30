# Tasks: 增强记忆模块架构

## 阶段 1: Backend 服务实现

- [x] 1.1 在 `application.yml` 中添加 hsmem 服务配置
  - 添加 `heartsphere.memory.hsmem.base-url` 配置
  - 添加超时和重试配置
  - 添加慢请求阈值配置
  - 添加日志级别配置
  
- [x] 1.2 创建日志工具类
  - `LogSanitizer` - 敏感信息脱敏工具类
  - `PerformanceLogger` - 性能监控工具类
  - `HSMemLogHelper` - 日志记录辅助工具类

- [x] 1.3 创建 hsmem 相关的 DTO 类
  - `HSMemMessage` - 消息DTO
  - `HSMemConversationRequest` - 对话记忆化请求
  - `HSMemTextRequest` - 文本记忆化请求
  - `HSMemDocumentRequest` - 文档记忆化请求
  - `HSMemRetrieveRequest` - 检索请求
  - `HSMemResponse` - 通用响应DTO（包含各种数据类型）

- [x] 1.4 创建 `HSMemClientService` 服务类
  - 使用 `WebClient` 实现 HTTP 调用
  - 实现记忆化方法（`memorizeConversation`, `memorizeText`, `memorizeDocument`）
  - 实现检索方法（`retrieve`）
  - 实现统计方法（`getStatistics`, `getCategories`）
  - 实现资源查询方法（`getItems`, `getResources`）
  - 集成详细的日志记录（请求、响应、错误、性能）

- [x] 1.5 更新 `MemoryController`
  - 实现记忆化 REST API 端点（`/api/memory/v1/hsmem/memorize/*`）
  - 实现检索 REST API 端点（`/api/memory/v1/hsmem/retrieve`）
  - 实现统计和查询 REST API 端点（`/api/memory/v1/hsmem/statistics`, `/categories`, `/items`, `/resources`）
  - 从认证信息中自动提取 `user_id`
  - 实现统一的响应格式

- [ ] 1.6 编写 backend 单元测试
  - 测试 `HSMemClientService` 的各个方法
  - 测试错误处理逻辑
  - 测试超时和重试机制
  - 测试日志记录功能

## 阶段 2: Frontend 迁移

- [x] 2.1 创建或更新 frontend API 客户端
  - 在 `main/frontend/services/api/memory/memory.ts` 中实现 backend API 客户端
  - 提供记忆化方法（`memorizeConversation`, `memorizeText`, `memorizeDocument`）
  - 提供检索方法（`retrieve`）
  - 提供查询方法（`getStatistics`, `getCategories`, `getItems`, `getResources`）
  - 自动添加认证Token
  - 统一错误处理

- [x] 2.2 更新对话记忆提取调用
  - 修改 `components/chat/hooks/useSystemIntegration.ts`
  - 将 `hsmemApi.memorizeConversation()` 替换为 `memoryApi.memorizeConversation()`

- [x] 2.3 更新 AI 回复记忆提取调用
  - 修改 `components/chat/utils/generateAIResponse.ts`
  - 将 `hsmemApi.memorizeConversation()` 替换为 `memoryApi.memorizeConversation()`

- [x] 2.4 更新日志记忆提取调用
  - 修改 `services/journal-memory-integration/JournalMemoryIntegration.ts`
  - 将 `hsmemApi.memorizeDocument()` 替换为 `memoryApi.memorizeDocument()`

- [x] 2.5 标记废弃 `hsmemApi`
  - 标记 `main/frontend/services/api/hsmem/hsmemApi.ts` 为废弃
  - 添加迁移指南和说明
  - 保留文件（admin 项目仍可使用）

## 阶段 3: 配置和文档

- [ ] 3.1 更新配置文件
  - 确保 `application.yml` 中的 hsmem 配置正确
  - 添加环境变量支持（如果需要）

- [ ] 3.2 编写 API 文档
  - 更新 backend API 文档（Swagger）
  - 更新 frontend API 客户端使用文档

- [ ] 3.3 更新相关文档
  - 更新架构文档，说明新的调用流程
  - 更新开发指南，说明如何调用记忆服务

## 阶段 4: 测试和验证

- [ ] 4.1 端到端测试
  - 测试对话记忆提取功能
  - 测试 AI 回复记忆提取功能
  - 测试日志记忆提取功能
  - 测试记忆检索功能

- [ ] 4.2 集成测试
  - 测试 backend 与 hsmem 服务的集成
  - 测试前端与 backend 的集成

- [ ] 4.3 性能测试
  - 验证增加后端代理层后的性能影响
  - 如有需要，优化异步处理

- [ ] 4.4 兼容性测试
  - 验证与现有功能的兼容性
  - 确保没有破坏现有功能

## 阶段 5: 部署和监控

- [ ] 5.1 部署准备
  - 确保 hsmem 服务可用
  - 检查配置是否正确

- [ ] 5.2 监控设置
  - 添加 hsmem 调用监控
  - 添加错误日志监控

- [ ] 5.3 验证部署
  - 在生产环境中验证功能
  - 监控服务状态和性能
