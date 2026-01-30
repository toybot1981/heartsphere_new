# Design: 增强 HSMemClientService 日志记录

## Context

`HSMemClientService` 是 backend 调用 hsmem Python 服务的核心服务类，负责：
- 记忆化操作（memorizeConversation, memorizeText, memorizeDocument）
- 记忆检索操作（retrieve）
- 统计查询操作（getStatistics, getCategories, getItems, getResources）

当前需要增强日志记录，以便于问题排查、性能监控和运维支持。

## Goals / Non-Goals

### Goals

1. **详细记录操作信息**：记录每个 hsmem 调用的详细信息
2. **性能监控**：记录请求耗时，识别性能瓶颈
3. **错误追踪**：完整记录错误信息和上下文
4. **便于查询**：使用结构化日志格式，便于日志分析工具查询
5. **安全合规**：对敏感信息进行脱敏处理

### Non-Goals

1. **不记录完整请求体**：对于大型请求体（如长文本），只记录摘要信息，避免日志文件过大
2. **不改变日志框架**：继续使用现有的 SLF4J + Logback 框架
3. **不实现日志聚合**：日志聚合由运维层面的工具处理，不在代码中实现

## Decisions

### Decision 1: 日志级别设计

**决策**：使用多级日志级别，根据环境配置

**日志级别**：
- **INFO**：记录关键操作（请求开始、请求完成、错误）
- **DEBUG**：记录详细信息（请求参数、响应摘要、性能指标）
- **TRACE**：记录最详细信息（完整请求体、完整响应体，仅开发环境）

**理由**：
- 生产环境使用 INFO 级别，减少日志量
- 开发环境使用 DEBUG 级别，便于调试
- 问题排查时可以临时调整到 TRACE 级别

**实现方式**：
- 在 `application.yml` 中配置日志级别
- 支持通过环境变量或配置中心动态调整

### Decision 2: 日志格式设计

**决策**：使用统一的日志前缀和结构化格式

**日志格式**：
```
[HSMemClient] {operation} - {message} | {context}
```

**示例**：
```
[HSMemClient] memorizeConversation - 请求开始 | userId=user_123, messageCount=3, url=/api/v1/memory/memorize/conversation
[HSMemClient] memorizeConversation - 请求成功 | userId=user_123, duration=245ms, resourceId=abc123, itemsCount=5
[HSMemClient] memorizeConversation - 请求失败 | userId=user_123, error=Connection timeout, duration=30000ms
```

**理由**：
- 统一的日志前缀便于过滤和查询
- 结构化格式便于日志分析工具解析
- 包含关键上下文信息，便于问题定位

### Decision 3: 请求ID设计

**决策**：为每个请求生成唯一的请求ID，用于追踪完整流程

**请求ID格式**：
- UUID 或时间戳 + 随机数
- 格式：`hsmem-{timestamp}-{random}`

**使用场景**：
- 在同一请求的多个日志中记录相同的请求ID
- 便于在日志中追踪单个请求的完整流程

**理由**：
- 分布式系统中，请求可能涉及多个服务，请求ID有助于关联
- 便于日志分析和问题排查

### Decision 4: 敏感信息脱敏

**决策**：对敏感信息进行脱敏处理

**脱敏策略**：
- **API密钥/Token**：只显示前4位和后4位，中间用`***`代替
- **用户ID**：如果是敏感信息，可以使用哈希值或脱敏后的格式
- **长文本内容**：只记录长度和前100字符摘要
- **请求体/响应体**：大型内容只记录摘要信息

**实现方式**：
- 创建工具类 `LogSanitizer` 用于脱敏处理
- 在记录日志前自动脱敏

### Decision 5: 性能日志设计

**决策**：记录每个请求的处理耗时，并标识慢请求

**性能指标**：
- **请求耗时**：记录总耗时（从请求开始到响应返回）
- **慢请求阈值**：配置慢请求阈值（如 1 秒），超过阈值的请求单独记录
- **统计信息**：定期（如每小时）记录统计信息（请求总数、成功数、失败数、平均耗时、P95/P99耗时等）

**实现方式**：
- 使用 `@Around` 切面或手动计时记录耗时
- 在方法执行前后记录时间戳
- 计算耗时并记录到日志

### Decision 6: 错误日志设计

**决策**：详细记录错误信息和上下文

**错误日志内容**：
- **异常类型和消息**：记录异常类名和消息
- **异常堆栈**：仅在 DEBUG 或 TRACE 级别记录完整堆栈
- **请求上下文**：记录请求URL、方法、参数摘要、用户ID等
- **重试信息**：如果实现重试，记录重试次数和重试原因
- **错误分类**：区分连接错误、超时错误、业务错误等

**实现方式**：
- 在 catch 块中记录详细错误信息
- 使用 `log.error()` 记录错误日志，包含请求上下文

## Implementation Notes

### 日志记录点

1. **方法入口**：
   - 记录请求开始日志（INFO级别）
   - 生成请求ID
   - 记录请求参数摘要（DEBUG级别）

2. **方法返回前**：
   - 记录请求成功日志（INFO级别）
   - 记录响应摘要（DEBUG级别）
   - 记录请求耗时（DEBUG级别）

3. **异常捕获**：
   - 记录错误日志（ERROR级别）
   - 记录异常信息和堆栈（DEBUG级别）
   - 记录请求上下文

4. **重试时**（如果实现）：
   - 记录重试日志（WARN级别）
   - 记录重试原因和次数

### 日志工具类

创建 `HSMemLogHelper` 工具类，提供：
- `logRequest()` - 记录请求日志
- `logResponse()` - 记录响应日志
- `logError()` - 记录错误日志
- `logPerformance()` - 记录性能日志
- `sanitize()` - 敏感信息脱敏

### 配置示例

**application.yml**:
```yaml
logging:
  level:
    com.heartsphere.memory.service.HSMemClientService: DEBUG
```

**开发环境**：使用 DEBUG 级别
**生产环境**：使用 INFO 级别
**问题排查**：临时调整到 TRACE 级别

## Testing Strategy

1. **单元测试**：
   - 测试日志记录是否正确
   - 测试敏感信息脱敏是否正确
   - 测试请求ID生成是否唯一

2. **集成测试**：
   - 验证日志输出格式是否正确
   - 验证日志级别配置是否生效

3. **性能测试**：
   - 验证日志记录对性能的影响
   - 如需要，考虑使用异步日志
