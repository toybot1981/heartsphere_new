# Design: 集成 HSMem 服务到主项目后端

## Context

HSMem 是一个基于 memU 设计理念的 Python 记忆系统，提供：
- 三层架构：Resource Layer → Memory Item Layer → Memory Category Layer
- 记忆化功能：支持对话、文本、文档等多种模态
- 记忆检索功能：支持多种检索策略
- REST API：已提供 FastAPI 接口

主项目后端是 Spring Boot 应用，需要集成 hsmem 服务供前端调用。

## Goals / Non-Goals

### Goals
- 在主项目后端提供统一的记忆服务接口
- 前端通过主项目后端调用记忆功能，不直接调用 Python 服务
- 利用主项目的认证体系保护记忆数据
- 支持用户级别的数据隔离
- 提供完整的记忆化、检索、统计功能

### Non-Goals
- 不重写 hsmem 的 Python 实现
- 不改变 hsmem 的核心功能
- 不在主项目中直接嵌入 Python 代码（通过 HTTP 调用）

## Decisions

### Decision 1: 集成方式
**决策**：通过 HTTP 调用 hsmem 的 Python REST API 服务

**理由**：
- hsmem 已有完整的 REST API 实现
- 保持服务独立性，便于维护和升级
- 不需要在主项目中嵌入 Python 代码
- 可以独立部署和扩展

**实现方式**：
- 使用 Spring 的 `RestTemplate` 或 `WebClient` 调用 hsmem API
- 配置 hsmem 服务地址（如 `http://localhost:8000`）
- 处理超时和错误重试

**替代方案考虑**：
- 直接嵌入 Python 代码：需要 Jython 或 Python 进程调用，复杂度高
- 使用消息队列：过度设计，同步调用即可

### Decision 2: API 设计
**决策**：在主项目后端提供 RESTful API，遵循主项目的 API 规范

**API 路径设计**：
- `/api/v1/memory/memorize/conversation` - 对话记忆化
- `/api/v1/memory/memorize/text` - 文本记忆化
- `/api/v1/memory/memorize/document` - 文档记忆化
- `/api/v1/memory/retrieve` - 记忆检索
- `/api/v1/memory/statistics` - 统计信息
- `/api/v1/memory/categories` - 分类列表

**请求/响应格式**：
- 遵循主项目的统一响应格式（`ApiResponse<T>`）
- 请求参数使用 DTO 类
- 支持用户认证（从 JWT 中获取 userId）

**替代方案考虑**：
- 直接透传 hsmem API：不利于统一管理和认证
- GraphQL：当前 RESTful 已足够

### Decision 3: 用户数据隔离
**决策**：基于 JWT 中的 userId 进行数据隔离

**实现方式**：
- 从 JWT Token 中提取 userId
- 在调用 hsmem API 时自动添加 userId 参数
- hsmem 服务根据 userId 进行数据隔离

**安全性**：
- 用户只能访问自己的记忆数据
- 管理员可以访问所有数据（如需要）

**替代方案考虑**：
- 在请求中传递 userId：不安全，可能被篡改
- 使用独立的认证系统：增加复杂度

### Decision 4: 错误处理
**决策**：统一错误处理，将 hsmem 的错误转换为主项目的错误格式

**实现方式**：
- 捕获 hsmem API 调用异常
- 转换为主项目的 `BusinessException`
- 提供清晰的错误信息

**错误场景**：
- hsmem 服务不可用：返回 503 Service Unavailable
- 请求参数错误：返回 400 Bad Request
- 记忆数据不存在：返回 404 Not Found

## Risks / Trade-offs

### Risk 1: hsmem 服务可用性
**风险**：hsmem Python 服务不可用时，主项目后端无法提供记忆功能

**缓解措施**：
- 实现健康检查机制
- 提供降级策略（可选）
- 记录详细的错误日志
- 监控 hsmem 服务状态

### Risk 2: 性能问题
**风险**：通过 HTTP 调用可能比直接调用慢

**缓解措施**：
- 使用连接池
- 配置合理的超时时间
- 异步调用（如适用）
- 监控响应时间

### Risk 3: 数据一致性
**风险**：主项目和 hsmem 之间的数据可能不一致

**缓解措施**：
- hsmem 是单一数据源
- 主项目不缓存记忆数据
- 所有操作都通过 hsmem API

## Migration Plan

### Phase 1: 后端服务集成
1. 创建 `HSMemService` 类，封装 hsmem API 调用
2. 创建 DTO 类（请求和响应）
3. 创建 `MemoryController` 提供 REST API
4. 配置 hsmem 服务地址

### Phase 2: 前端 API 客户端
1. 创建前端 TypeScript API 客户端
2. 实现记忆化方法
3. 实现检索方法
4. 实现统计方法

### Phase 3: 测试和验证
1. 单元测试
2. 集成测试
3. 端到端测试

## Open Questions

1. **hsmem 服务部署**：hsmem 服务如何部署？是否与主项目后端部署在同一服务器？
2. **认证方式**：hsmem 服务是否需要独立的认证，还是信任主项目的认证？
3. **数据持久化**：hsmem 的数据存储位置，是否需要配置？
4. **性能优化**：是否需要缓存机制？
