# `entry_` 前缀 ID 说明

## ID 生成位置

`entry_` 开头的 ID 是在 **`frontend/hooks/useJournalHandlers.ts`** 的 `handleAddJournalEntry` 函数中生成的：

```typescript
const newEntry: JournalEntry = {
  id: `entry_${Date.now()}`,  // 例如: entry_1767054399590
  title,
  content,
  timestamp: Date.now(),
  // ...
  syncStatus: 0 as SyncStatus, // 待同步
};
```

## 设计目的

这是一个**临时 ID**，用于：
1. **立即更新 UI**：用户创建日志后，立即显示在界面上，不需要等待服务器响应
2. **本地标识**：在同步到服务器之前，用于在本地存储和状态管理中标识这个日志条目

## 同步流程

1. **创建阶段**：
   - 用户创建日志 → 生成临时 ID `entry_1767054399590`
   - 保存到本地存储，key 为 `sync_journal_entry_1767054399590`
   - `syncStatus = 0`（待同步）

2. **同步阶段**：
   - 调用 `syncService.syncEntity('journal', entryWithSync)`
   - 服务器创建成功，返回真实 ID（如 `a7f0ce04-03a6-4a78-be2e-97ada5c6e220`）
   - 调用 `markEntitySynced` 合并数据

3. **更新阶段**：
   - `markEntitySynced` 应该用服务器返回的 ID 覆盖临时 ID
   - 保存到本地存储时，应该使用新的真实 ID 作为 key
   - `syncStatus = 1`（已同步）

## 潜在问题

如果同步成功后，本地存储中仍然使用旧的临时 ID（`entry_1767054399590`）作为 key，那么：
- 下次同步时，可能会找不到已同步的实体
- 或者会创建重复的实体

## 解决方案

需要确保：
1. `markEntitySynced` 正确使用服务器返回的 ID
2. `saveEntityToLocal` 使用新的真实 ID 作为 key
3. 删除旧的临时 ID 对应的本地存储项



