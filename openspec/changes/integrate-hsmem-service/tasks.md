## 1. 后端服务集成

- [ ] 1.1 创建 HSMem 服务配置类（HSMemConfig）
- [ ] 1.2 创建 HSMemService 类，封装 hsmem API 调用
- [ ] 1.3 创建记忆化相关的 DTO 类
  - [ ] 1.3.1 ConversationMemoryRequest
  - [ ] 1.3.2 TextMemoryRequest
  - [ ] 1.3.3 DocumentMemoryRequest
  - [ ] 1.3.4 MemoryResponse
- [ ] 1.4 创建检索相关的 DTO 类
  - [ ] 1.4.1 RetrieveRequest
  - [ ] 1.4.2 RetrieveResponse
- [ ] 1.5 创建统计相关的 DTO 类
  - [ ] 1.5.1 MemoryStatisticsResponse
  - [ ] 1.5.2 CategoryResponse
- [ ] 1.6 创建 MemoryController 提供 REST API
- [ ] 1.7 配置 application.yml 添加 hsmem 服务配置
- [ ] 1.8 实现错误处理和异常转换

## 2. 记忆化功能实现

- [ ] 2.1 实现对话记忆化接口（POST /api/v1/memory/memorize/conversation）
- [ ] 2.2 实现文本记忆化接口（POST /api/v1/memory/memorize/text）
- [ ] 2.3 实现文档记忆化接口（POST /api/v1/memory/memorize/document）
- [ ] 2.4 实现用户ID自动注入（从JWT中提取）
- [ ] 2.5 添加请求验证和参数校验

## 3. 记忆检索功能实现

- [ ] 3.1 实现记忆检索接口（POST /api/v1/memory/retrieve）
- [ ] 3.2 实现过滤条件支持（用户ID、分类等）
- [ ] 3.3 实现数量限制支持
- [ ] 3.4 实现查询参数验证

## 4. 统计功能实现

- [ ] 4.1 实现统计信息接口（GET /api/v1/memory/statistics）
- [ ] 4.2 实现分类列表接口（GET /api/v1/memory/categories）
- [ ] 4.3 实现用户记忆统计接口（GET /api/v1/memory/statistics/user）

## 5. 前端 API 客户端

- [ ] 5.1 创建前端 TypeScript API 客户端（services/api/memory/）
- [ ] 5.2 实现记忆化方法
  - [ ] 5.2.1 memorizeConversation
  - [ ] 5.2.2 memorizeText
  - [ ] 5.2.3 memorizeDocument
- [ ] 5.3 实现检索方法（retrieveMemory）
- [ ] 5.4 实现统计方法
  - [ ] 5.4.1 getStatistics
  - [ ] 5.4.2 getCategories
  - [ ] 5.4.3 getUserStatistics
- [ ] 5.5 创建 TypeScript 类型定义

## 6. 测试和验证

- [ ] 6.1 编写 HSMemService 单元测试
- [ ] 6.2 编写 MemoryController 单元测试
- [ ] 6.3 编写集成测试（需要 hsmem 服务运行）
- [ ] 6.4 测试前端 API 客户端
- [ ] 6.5 端到端测试（前端 → 后端 → hsmem）

## 7. 文档和配置

- [ ] 7.1 更新 API 文档（Swagger）
- [ ] 7.2 创建使用示例
- [ ] 7.3 更新部署文档（hsmem 服务启动说明）
- [ ] 7.4 更新开发指南
