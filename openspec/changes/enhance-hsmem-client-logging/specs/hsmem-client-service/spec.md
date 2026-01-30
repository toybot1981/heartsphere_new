# Spec: HSMem Client Service Logging

## ADDED Requirements

### REQ-LOG-001: Request Logging

**Description**: `HSMemClientService` 必须在每个方法调用开始时记录请求日志，包含请求的关键信息。

**Rationale**: 便于追踪每个 hsmem 调用，记录操作上下文，便于问题排查。

#### Scenario: Log memorizeConversation request

**Given**: `memorizeConversation()` 方法被调用  
**When**: 方法开始执行  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] memorizeConversation - 请求开始`
- 记录请求关键信息：用户ID、消息数量、请求URL等
- 记录请求ID，用于后续追踪
- 记录请求开始时间（DEBUG级别）

**Log Example**:
```
INFO  [HSMemClient] memorizeConversation - 请求开始 | requestId=hsmem-20260116-123456, userId=user_123, messageCount=3, url=/api/v1/memory/memorize/conversation
DEBUG [HSMemClient] memorizeConversation - 请求详情 | requestId=hsmem-20260116-123456, agentId=character_456, startTime=2026-01-16T12:34:56.789
```

#### Scenario: Log memorizeText request

**Given**: `memorizeText()` 方法被调用  
**When**: 方法开始执行  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] memorizeText - 请求开始`
- 记录请求关键信息：用户ID、文本长度摘要（不是完整文本）等
- 记录请求ID和请求开始时间

#### Scenario: Log memorizeDocument request

**Given**: `memorizeDocument()` 方法被调用  
**When**: 方法开始执行  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] memorizeDocument - 请求开始`
- 记录请求关键信息：用户ID、文档标题、内容长度摘要等
- 记录请求ID和请求开始时间

#### Scenario: Log retrieve request

**Given**: `retrieve()` 方法被调用  
**When**: 方法开始执行  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] retrieve - 请求开始`
- 记录请求关键信息：查询内容摘要、过滤条件、限制数量等
- 记录请求ID和请求开始时间

### REQ-LOG-002: Response Logging

**Description**: `HSMemClientService` 必须在每个方法调用成功完成时记录响应日志，包含响应的关键信息。

**Rationale**: 便于追踪操作结果，确认操作是否成功，便于问题排查。

#### Scenario: Log memorizeConversation response

**Given**: `memorizeConversation()` 方法成功返回  
**When**: 方法执行完成  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] memorizeConversation - 请求成功`
- 记录响应关键信息：resourceId、itemsCount、categories等
- 记录请求耗时（DEBUG级别）
- 使用相同的请求ID关联请求和响应日志

**Log Example**:
```
INFO  [HSMemClient] memorizeConversation - 请求成功 | requestId=hsmem-20260116-123456, resourceId=abc123, itemsCount=5, categories=[preferences, personal_info]
DEBUG [HSMemClient] memorizeConversation - 性能指标 | requestId=hsmem-20260116-123456, duration=245ms
```

#### Scenario: Log retrieve response

**Given**: `retrieve()` 方法成功返回  
**When**: 方法执行完成  
**Then**: 
- 记录 INFO 级别日志：`[HSMemClient] retrieve - 请求成功`
- 记录响应关键信息：检索方法、结果数量等
- 记录请求耗时
- 使用相同的请求ID关联请求和响应日志

#### Scenario: Log slow request

**Given**: 请求处理耗时超过配置的慢请求阈值（如 1 秒）  
**When**: 方法执行完成  
**Then**: 
- 记录 WARN 级别日志：`[HSMemClient] {operation} - 慢请求`
- 记录请求耗时和阈值
- 包含请求ID和请求关键信息

### REQ-LOG-003: Error Logging

**Description**: `HSMemClientService` 必须在方法调用发生异常时记录详细的错误日志，包含异常信息和请求上下文。

**Rationale**: 便于快速定位问题根源，记录完整的错误上下文，便于问题排查和修复。

#### Scenario: Log connection error

**Given**: hsmem 服务连接失败  
**When**: 异常发生时  
**Then**: 
- 记录 ERROR 级别日志：`[HSMemClient] {operation} - 请求失败`
- 记录异常类型和消息：`ConnectionException: Connection refused`
- 记录请求上下文：请求ID、URL、方法、参数摘要等
- 记录请求耗时（如果已开始计时）
- DEBUG 级别记录完整异常堆栈

**Log Example**:
```
ERROR [HSMemClient] memorizeConversation - 请求失败 | requestId=hsmem-20260116-123456, error=ConnectionException: Connection refused, url=/api/v1/memory/memorize/conversation, userId=user_123
DEBUG [HSMemClient] memorizeConversation - 异常堆栈 | requestId=hsmem-20260116-123456, stackTrace=...
```

#### Scenario: Log timeout error

**Given**: hsmem 服务请求超时  
**When**: 超时异常发生时  
**Then**: 
- 记录 ERROR 级别日志：`[HSMemClient] {operation} - 请求超时`
- 记录超时信息：超时时间、实际耗时等
- 记录请求上下文
- DEBUG 级别记录完整异常堆栈

#### Scenario: Log business error

**Given**: hsmem 服务返回业务错误（如 4xx、5xx 状态码）  
**When**: 错误响应返回时  
**Then**: 
- 记录 ERROR 级别日志：`[HSMemClient] {operation} - 业务错误`
- 记录错误状态码和错误消息
- 记录请求上下文
- 如果响应包含错误详情，记录错误详情摘要

### REQ-LOG-004: Performance Logging

**Description**: `HSMemClientService` 必须记录每个请求的处理耗时，并支持识别慢请求。

**Rationale**: 便于性能监控和优化，识别性能瓶颈，支持运维监控。

#### Scenario: Log request duration

**Given**: 方法调用完成（成功或失败）  
**When**: 记录性能日志时  
**Then**: 
- DEBUG 级别记录请求耗时（毫秒）
- 使用请求ID关联性能日志和请求/响应日志
- 格式：`[HSMemClient] {operation} - 性能指标 | requestId={id}, duration={ms}ms`

#### Scenario: Identify slow requests

**Given**: 请求处理耗时超过配置的阈值（如 1 秒）  
**When**: 方法执行完成  
**Then**: 
- 记录 WARN 级别日志：`[HSMemClient] {operation} - 慢请求`
- 记录请求耗时和阈值
- 包含请求ID和请求关键信息，便于分析

### REQ-LOG-005: Sensitive Information Sanitization

**Description**: `HSMemClientService` 在记录日志时必须对敏感信息进行脱敏处理。

**Rationale**: 保护用户隐私和系统安全，防止敏感信息泄露。

#### Scenario: Sanitize API key in log

**Given**: 日志中包含 API 密钥  
**When**: 记录日志时  
**Then**: 
- API 密钥只显示前4位和后4位，中间用 `***` 代替
- 格式：`sk-1234***5678`
- 完整密钥不得出现在日志中

#### Scenario: Sanitize long text in log

**Given**: 日志中包含长文本内容（如对话内容、文档内容）  
**When**: 记录日志时  
**Then**: 
- 只记录文本长度和前100字符摘要
- 格式：`textLength=1024, preview="前100字符..."`
- 完整文本不得出现在日志中（除非 TRACE 级别）

#### Scenario: Sanitize request body in log

**Given**: 日志中包含请求体内容  
**When**: 记录日志时  
**Then**: 
- INFO 级别：只记录关键字段摘要（如消息数量、文本长度等）
- DEBUG 级别：记录请求体摘要（不包含完整内容）
- TRACE 级别：可以记录完整请求体（仅开发环境）

### REQ-LOG-006: Request ID Tracking

**Description**: `HSMemClientService` 必须为每个请求生成唯一的请求ID，并在该请求的所有日志中使用相同的请求ID。

**Rationale**: 便于追踪单个请求的完整流程，关联请求、响应、错误和性能日志。

#### Scenario: Generate and use request ID

**Given**: 方法调用开始  
**When**: 记录请求日志时  
**Then**: 
- 生成唯一的请求ID（格式：`hsmem-{timestamp}-{random}`）
- 在请求日志中记录请求ID
- 在响应日志中使用相同的请求ID
- 在错误日志中使用相同的请求ID
- 在性能日志中使用相同的请求ID

**Request ID Format**:
- 示例：`hsmem-20260116123456-abc123`
- 确保在同一请求的所有日志中保持一致

### REQ-LOG-007: Log Level Configuration

**Description**: `HSMemClientService` 的日志级别必须可配置，支持根据环境调整日志详细程度。

**Rationale**: 平衡日志详细程度和日志量，生产环境减少日志量，开发环境提供详细日志。

#### Scenario: Configure log level in production

**Given**: 生产环境配置  
**When**: 应用启动时  
**Then**: 
- 默认使用 INFO 级别
- 记录关键操作和错误
- 不记录详细的请求/响应内容
- 日志量适中，便于运维监控

#### Scenario: Configure log level in development

**Given**: 开发环境配置  
**When**: 应用启动时  
**Then**: 
- 使用 DEBUG 级别
- 记录详细的请求/响应信息
- 记录异常堆栈
- 便于开发和调试

#### Scenario: Configure log level for troubleshooting

**Given**: 需要排查问题时  
**When**: 调整日志级别到 TRACE  
**Then**: 
- 记录最详细的信息（包括完整请求体和响应体）
- 可以通过配置文件或环境变量动态调整
- 问题解决后恢复原级别

**Configuration Example**:
```yaml
logging:
  level:
    com.heartsphere.memory.service.HSMemClientService: DEBUG  # 开发环境
    # com.heartsphere.memory.service.HSMemClientService: INFO   # 生产环境
```

## Notes

- 日志记录不应影响主要业务流程，考虑使用异步日志（如 logback-async）来减少性能影响
- 敏感信息脱敏策略应该定期审查和更新，确保符合安全和隐私要求
- 请求ID应该在整个请求链路中传递，便于分布式追踪（如果后续实现分布式追踪）
