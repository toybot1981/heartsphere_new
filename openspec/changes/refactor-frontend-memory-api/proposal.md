# Change: 改造主项目前端记忆API以适配新的后端API

## Why

主项目后端已实现记忆API（MemoryController），并且计划集成HSMem服务。当前前端记忆API实现需要：

1. **适配新的API路径**：后端API路径为 `/api/memory/v1`，需要确保前端调用正确
2. **支持HSMem集成**：未来将集成HSMem服务，前端需要支持新的记忆化接口（对话、文本、文档）
3. **统一响应格式**：确保前端正确处理后端的统一响应格式（`ApiResponse<T>`）
4. **错误处理优化**：改进错误处理，提供更好的用户体验
5. **类型安全**：确保TypeScript类型定义与后端API一致

## What Changes

- **MODIFIED**: 更新 `services/api/memory/memory.ts` 以适配新的后端API
  - 确保API路径正确（`/api/memory/v1`）
  - 统一响应格式处理
  - 改进错误处理
- **ADDED**: 创建HSMem服务API客户端（如果后端已集成）
  - 对话记忆化接口
  - 文本记忆化接口
  - 文档记忆化接口
  - 记忆检索接口（使用HSMem）
  - 统计信息接口
- **MODIFIED**: 更新 `services/memory-system/storage/RemoteMemoryStorage.ts`
  - 适配新的API响应格式
  - 改进错误处理
  - 支持新的记忆化方式
- **MODIFIED**: 更新相关组件和Hooks
  - 确保所有记忆相关组件使用新的API
  - 更新类型定义

## Impact

- **受影响的前端代码**：
  - `main/frontend/services/api/memory/memory.ts` - 记忆API客户端
  - `main/frontend/services/memory-system/storage/RemoteMemoryStorage.ts` - 远程存储实现
  - `main/frontend/services/memory-system/MemorySystem.ts` - 记忆系统核心类
  - `main/frontend/services/memory-system/hooks/useMemorySystem.ts` - 记忆系统Hook
  - `main/frontend/components/memory/` - 记忆相关组件
  - `main/frontend/hooks/useMemoryHandlers.ts` - 记忆处理Hook

- **需要验证**：
  - 所有记忆相关功能正常工作
  - API调用路径正确
  - 响应格式处理正确
  - 错误处理完善

- **需要创建的规范**：
  - 前端记忆API调用规范
  - 类型定义规范
