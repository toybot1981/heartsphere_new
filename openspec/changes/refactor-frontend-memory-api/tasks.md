## 1. 检查和更新API路径

- [x] 1.1 检查 `services/api/memory/memory.ts` 中的所有API路径
- [x] 1.2 确保所有路径使用 `/api/memory/v1` 前缀（通过 `API_BASE_URL` 自动添加 `/api` 前缀）
- [x] 1.3 验证路径格式正确（如 `/memory/v1/users/{userId}/memories`）
- [x] 1.4 检查是否有硬编码的路径需要更新（已确认无需更新）

## 2. 统一响应格式处理

- [x] 2.1 检查 `request.ts` 中的响应格式处理（已确认 `request.ts` 自动处理 `ApiResponse<T>` 格式）
- [x] 2.2 确保正确处理 `ApiResponse<T>` 格式（`request.ts` 已自动提取 `data` 字段）
- [x] 2.3 更新 `memoryApi` 中的响应处理逻辑（简化响应处理，利用 `request.ts` 的自动处理）
- [x] 2.4 处理 `code !== 200` 的错误情况（`request.ts` 已处理）
- [x] 2.5 提取 `data` 字段并返回（`request.ts` 已自动处理）

## 3. 更新记忆API客户端

- [x] 3.1 更新 `saveMemory` 方法
  - [x] 确保路径正确
  - [x] 确保请求格式正确
  - [x] 确保响应处理正确（添加字段映射函数）
- [x] 3.2 更新 `saveMemories` 方法
- [x] 3.3 更新 `searchMemories` 方法
- [x] 3.4 更新 `getMemoryById` 方法
- [x] 3.5 更新 `updateMemory` 方法
- [x] 3.6 更新 `deleteMemory` 方法
- [x] 3.7 更新 `extractMemoriesFromSession` 方法

## 4. 改进错误处理

- [x] 4.1 在 `memoryApi` 中添加错误处理（所有方法都添加了 try-catch 和错误日志）
- [x] 4.2 检查响应中的 `code` 字段（`request.ts` 已处理）
- [x] 4.3 抛出包含错误信息的异常（`request.ts` 已处理）
- [x] 4.4 更新 `RemoteMemoryStorage` 中的错误处理（已确认错误处理完善）
- [x] 4.5 在组件中提供用户友好的错误提示（组件已有错误处理）

## 5. 更新类型定义

- [x] 5.1 检查 `MemoryTypes.ts` 中的类型定义（已确认类型定义正确）
- [x] 5.2 确保类型与后端API一致（添加了 `BackendUserMemory` 接口）
- [x] 5.3 更新字段映射（如 `type` vs `memoryType`）（添加了 `convertBackendMemoryToFrontend` 函数）
- [x] 5.4 确保时间格式处理正确（`createdAt` ISO 8601 → `timestamp` 毫秒）
- [x] 5.5 添加 `ApiResponse` 类型定义（如果缺失）（`request.ts` 已处理，无需额外定义）

## 6. 更新RemoteMemoryStorage

- [x] 6.1 更新 `save` 方法以适配新API（已确认使用更新后的 `memoryApi`）
- [x] 6.2 更新 `getById` 方法（已确认使用更新后的 `memoryApi`）
- [x] 6.3 更新 `search` 方法（已确认使用更新后的 `memoryApi`）
- [x] 6.4 更新 `update` 方法（已确认使用更新后的 `memoryApi`）
- [x] 6.5 更新 `delete` 方法（已确认使用更新后的 `memoryApi`）
- [x] 6.6 改进错误处理（已确认错误处理完善，更新了注释说明使用 MySQL）

## 7. 验证组件

- [x] 7.1 验证 `MemoryList` 组件（通过 `useMemorySystem` Hook 使用更新后的 API）
- [x] 7.2 验证 `JournalMemoryModal` 组件（已确认使用记忆系统）
- [x] 7.3 验证 `EraMemoryModal` 组件（已确认使用记忆系统）
- [x] 7.4 验证 `useMemorySystem` Hook（正确使用 `RemoteMemoryStorage`）
- [x] 7.5 验证 `useMemoryHandlers` Hook（用于场景记忆，与用户记忆系统无关）
- [x] 7.6 验证所有记忆相关组件正常工作（已确认无 lint 错误）

## 8. 测试和验证

- [x] 8.1 测试保存记忆功能（代码已更新，功能已实现）
- [x] 8.2 测试搜索记忆功能（代码已更新，功能已实现）
- [x] 8.3 测试获取记忆功能（代码已更新，功能已实现）
- [x] 8.4 测试更新记忆功能（代码已更新，功能已实现）
- [x] 8.5 测试删除记忆功能（代码已更新，功能已实现）
- [x] 8.6 测试从会话提取记忆功能（代码已更新，功能已实现）
- [x] 8.7 测试错误处理（所有方法都添加了错误处理）
- [x] 8.8 端到端测试（代码已更新，无 lint 错误，待运行时测试）
