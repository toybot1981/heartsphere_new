# Design: 改造主项目前端记忆API

## Context

主项目后端已实现记忆API（`MemoryController`），提供以下接口：
- `POST /api/memory/v1/users/{userId}/memories` - 保存记忆
- `POST /api/memory/v1/users/{userId}/memories/batch` - 批量保存记忆
- `GET /api/memory/v1/users/{userId}/memories/search` - 搜索记忆
- `GET /api/memory/v1/users/{userId}/memories/{memoryId}` - 获取记忆
- `PUT /api/memory/v1/users/{userId}/memories/{memoryId}` - 更新记忆
- `DELETE /api/memory/v1/users/{userId}/memories/{memoryId}` - 删除记忆
- `POST /api/memory/v1/users/{userId}/sessions/{sessionId}/extract` - 从会话提取记忆

未来将集成HSMem服务，提供记忆化接口。

## Goals / Non-Goals

### Goals
- 确保前端API调用路径正确（`/api/memory/v1`）
- 统一响应格式处理（`ApiResponse<T>`）
- 改进错误处理
- 保持向后兼容性
- 为HSMem集成做准备

### Non-Goals
- 不改变现有的记忆系统架构
- 不改变组件的使用方式
- 不在本次改造中实现HSMem集成（待后端集成完成）

## Decisions

### Decision 1: API路径处理
**决策**：确保所有API调用使用正确的路径 `/api/memory/v1`

**理由**：
- 后端API路径为 `/api/memory/v1`
- 需要确保前端调用路径一致

**实现方式**：
- 检查并更新 `memoryApi` 中的所有API路径
- 确保路径前缀正确

### Decision 2: 响应格式处理
**决策**：统一处理 `ApiResponse<T>` 格式

**理由**：
- 后端统一使用 `ApiResponse<T>` 格式
- 需要确保前端正确处理

**响应格式**：
```typescript
{
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
```

**实现方式**：
- 在 `request` 函数中统一处理响应格式
- 提取 `data` 字段
- 处理错误情况（`code !== 200`）

### Decision 3: 错误处理
**决策**：改进错误处理，提供清晰的错误信息

**实现方式**：
- 检查响应中的 `code` 字段
- 如果 `code !== 200`，抛出包含错误信息的异常
- 在组件中提供用户友好的错误提示

### Decision 4: 类型定义
**决策**：确保TypeScript类型定义与后端一致

**实现方式**：
- 检查并更新类型定义
- 确保字段名称一致（如 `type` vs `memoryType`）
- 确保时间格式处理正确

## Risks / Trade-offs

### Risk 1: 破坏性变更
**风险**：API路径或响应格式变更可能导致现有功能失效

**缓解措施**：
- 保持向后兼容性
- 充分测试所有记忆相关功能
- 逐步迁移

### Risk 2: 类型不匹配
**风险**：前端类型定义与后端不一致

**缓解措施**：
- 仔细检查后端API响应格式
- 更新前端类型定义
- 使用类型断言确保类型安全

## Migration Plan

### Phase 1: API路径和响应格式
1. 检查并更新所有API路径
2. 统一响应格式处理
3. 测试基本功能

### Phase 2: 错误处理优化
1. 改进错误处理逻辑
2. 添加错误提示
3. 测试错误场景

### Phase 3: 类型定义更新
1. 更新TypeScript类型定义
2. 确保类型安全
3. 修复类型错误

### Phase 4: 组件验证
1. 验证所有记忆相关组件
2. 测试完整流程
3. 修复发现的问题

## Open Questions

1. **HSMem集成时机**：何时集成HSMem服务？是否在本次改造中实现？
2. **向后兼容性**：是否需要支持旧的API格式？
3. **错误处理策略**：如何处理网络错误和服务不可用？
