## 1. 后端SSE公共能力实现

- [x] 1.1 创建SSE工具类
  - [x] 1.1.1 创建 `SseEmitterManager.java` - SSE连接管理器
  - [x] 1.1.2 创建 `SseEventBuilder.java` - SSE事件构建器
  - [x] 1.1.3 创建 `SseUtils.java` - SSE工具方法
  - [ ] 1.1.4 创建 `SseExceptionHandler.java` - SSE异常处理器（可选，当前使用SseUtils统一处理）

- [x] 1.2 创建SSE流式服务基类
  - [x] 1.2.1 创建 `SseStreamService.java` - 流式服务基类
  - [x] 1.2.2 定义 `StreamHandler` 接口
  - [x] 1.2.3 实现通用流式处理模板

- [x] 1.3 创建SSE配置
  - [x] 1.3.1 创建 `SseConfig.java` - SSE配置类
  - [x] 1.3.2 配置超时时间、重试策略等

- [x] 1.4 编写使用文档
  - [x] 1.4.1 编写 `SSE_GUIDE.md` - 使用指南
  - [x] 1.4.2 提供使用示例

## 2. 前端SSE公共能力实现

- [x] 2.1 创建SSE Hook
  - [x] 2.1.1 创建 `useSseStream.ts` - 通用SSE Hook
  - [x] 2.1.2 实现自动重连机制
  - [x] 2.1.3 实现错误处理
  - [x] 2.1.4 实现状态管理

- [x] 2.2 创建SSE客户端工具
  - [x] 2.2.1 创建 `sseClient.ts` - SSE客户端工具
  - [x] 2.2.2 实现连接管理
  - [x] 2.2.3 实现事件解析

- [x] 2.3 创建类型定义
  - [x] 2.3.1 创建 `types/sse.ts` - SSE类型定义
  - [x] 2.3.2 定义标准事件格式接口

- [x] 2.4 编写使用文档
  - [x] 2.4.1 编写 `SSE_HOOK_GUIDE.md` - Hook使用指南
  - [x] 2.4.2 提供使用示例

## 3. psychology-mentor模块集成

- [x] 3.1 后端集成
  - [x] 3.1.1 修改 `TherapySessionController` 使用shared SSE能力
  - [x] 3.1.2 实现流式对话响应（基础版本）
  - [ ] 3.1.3 测试验证（待运行时测试）

- [x] 3.2 前端集成
  - [x] 3.2.1 实现流式消息显示（使用fetch处理SSE流）
  - [x] 3.2.2 实现流式内容实时更新
  - [ ] 3.2.3 测试验证（待运行时测试）

## 4. 现有模块迁移（可选，渐进式）

- [x] 4.1 mentis模块迁移
  - [x] 4.1.1 迁移 `MentisChatController.chatStream()`
  - [x] 4.1.2 迁移 `SessionRealtimeService`（registerSessionEmitter和sendEvent）
  - [x] 4.1.3 编译验证通过
  - [ ] 4.1.4 运行时测试验证（待进行）
  - [ ] 4.1.5 迁移前端 `useRealtimeUpdates` Hook（可选，前端Hook已存在）

- [x] 4.2 main/backend迁移
  - [x] 4.2.1 迁移 `AIServiceController.generateTextStream()`
  - [ ] 4.2.2 测试验证（待运行时测试）

- [x] 4.3 admin模块迁移
  - [x] 4.3.1 检查是否有SSE实现需要迁移（PipelineStreamService, LogStreamService）
  - [x] 4.3.2 迁移PipelineStreamService使用shared SSE能力
  - [x] 4.3.3 迁移LogStreamService使用shared SSE能力
  - [x] 4.3.4 编译验证通过
  - [ ] 4.3.5 运行时测试验证（待进行）

## 5. 测试和文档

- [x] 5.1 单元测试
  - [x] 5.1.1 测试 `SseEmitterManager` (11个测试)
  - [x] 5.1.2 测试 `SseEventBuilder` (14个测试)
  - [x] 5.1.3 测试 `SseUtils` (12个测试)
  - [x] 5.1.4 测试 `SseStreamService` (6个测试)
  - [x] 5.1.5 测试通过率：45/45 (100%)

- [ ] 5.2 集成测试
  - [ ] 5.2.1 测试SSE连接建立
  - [ ] 5.2.2 测试事件发送和接收
  - [ ] 5.2.3 测试错误处理和重连

- [x] 5.3 文档完善
  - [x] 5.3.1 完善使用指南 (`SSE_GUIDE.md`, `SSE_HOOK_GUIDE.md`)
  - [x] 5.3.2 添加迁移指南 (`MIGRATION_GUIDE.md`)
  - [x] 5.3.3 添加测试文档 (`TEST_SUMMARY.md`)
