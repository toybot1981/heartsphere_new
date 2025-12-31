# 客户端缓存和同步机制文档

## 概述

本系统实现了一套完整的客户端缓存和同步机制，确保数据在本地和服务器之间的可靠同步。该机制支持离线操作、自动同步、失败重试等功能。

**重要说明：日志（journal）已移除本地缓存同步机制，全部从后台直接获取。以下文档中的示例代码使用通用实体类型，不再包含日志相关的同步逻辑。**

## 核心概念

### 同步状态（SyncStatus）

每个可同步的实体都有一个 `syncStatus` 字段，表示其同步状态：

- **0 (待同步)**: 实体已创建或更新，但尚未同步到服务器
- **1 (同步成功)**: 实体已成功同步到服务器
- **-1 (同步失败)**: 同步到服务器时发生错误

### 可同步实体接口

所有需要同步的实体必须实现 `SyncableEntity` 接口：

```typescript
interface SyncableEntity {
  id: string;
  syncStatus: SyncStatus;
  lastSyncTime?: number;  // 最后同步时间
  syncError?: string;      // 同步错误信息
}
```

## 操作机制

### 一、添加操作（Create）

**流程：**

1. **本地缓存**：先将实体保存到本地缓存，设置 `syncStatus = 0`（待同步）
2. **立即更新UI**：更新本地状态，确保用户界面立即响应
3. **后台同步**：异步调用后台API进行创建
4. **更新状态**：
   - 成功：设置 `syncStatus = 1`（同步成功），更新 `lastSyncTime`
   - 失败：设置 `syncStatus = -1`（同步失败），记录 `syncError`

**代码示例：**

```typescript
// 1. 创建实体并标记为待同步
const newEntity: YourEntity = {
  id: `temp_${Date.now()}`,
  // ... 其他字段
  syncStatus: 0, // 待同步
};

// 标记为待同步并保存到本地
const entityWithSync = syncService.markEntityForSync('yourEntity', newEntity, 'create');

// 2. 立即更新UI
dispatch({ type: 'ADD_ENTITY', payload: entityWithSync });

// 3. 后台同步
try {
  const savedEntity = await yourApi.createEntity(apiRequestData, token);
  // 标记为同步成功
  const syncedEntity = syncService.markEntitySynced('yourEntity', entityWithSync, savedEntity);
  dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });
} catch (error) {
  // 标记为同步失败
  const failedEntity = syncService.markEntitySyncFailed('yourEntity', entityWithSync, error.message);
  dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });
}
```

### 二、更新操作（Update）

**流程：**

1. **本地缓存**：先将更新后的实体保存到本地缓存，设置 `syncStatus = 0`（待同步）
2. **立即更新UI**：更新本地状态，确保用户界面立即响应
3. **后台同步**：异步调用后台API进行更新
4. **更新状态**：
   - 成功：设置 `syncStatus = 1`（同步成功），更新 `lastSyncTime`
   - 失败：设置 `syncStatus = -1`（同步失败），记录 `syncError`

**代码示例：**

```typescript
// 1. 更新实体并标记为待同步
const updatedEntity: YourEntity = {
  ...existingEntity,
  // ... 更新的字段
  syncStatus: 0, // 待同步
};

// 标记为待同步并保存到本地
const markedEntity = syncService.markEntityForSync('yourEntity', updatedEntity, 'update');

// 2. 立即更新UI
dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });

// 3. 后台同步
try {
  const savedEntity = await yourApi.updateEntity(id, apiRequestData, token);
  // 标记为同步成功
  const syncedEntity = syncService.markEntitySynced('yourEntity', markedEntity, savedEntity);
  dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });
} catch (error) {
  // 标记为同步失败
  const failedEntity = syncService.markEntitySyncFailed('yourEntity', markedEntity, error.message);
  dispatch({ type: 'SET_ENTITIES', payload: updatedEntities });
}
```

### 三、删除操作（Delete）

**流程：**

1. **调用后台API**：先调用后台API进行删除
2. **删除本地缓存**：
   - 成功：删除本地缓存中的实体
   - 失败：保留本地缓存，不删除

**代码示例：**

```typescript
try {
  // 1. 先调用后台API删除
  await syncService.deleteEntity('yourEntity', entityId);
  
  // 2. 删除成功后，删除本地状态
  const remainingEntities = entities.filter(e => e.id !== entityId);
  dispatch({ type: 'SET_ENTITIES', payload: remainingEntities });
} catch (error) {
  // 删除失败，保留本地缓存
  console.error('删除失败:', error);
  showSyncErrorToast('删除失败，请重试');
}
```

### 四、查询操作（Query）

**流程：**

1. **立即返回本地缓存**：先返回本地缓存中的数据，确保用户界面立即响应
2. **后台查询**：异步调用后台API进行查询（不阻塞返回）
3. **更新本地缓存**：查询成功后，更新本地缓存，设置 `syncStatus = 1`（同步成功）
4. **清理已删除的实体**：如果服务器中不存在但本地存在且已同步的实体，从本地缓存中删除
5. **触发回调**：查询完成后触发 `onEntitiesQueried` 回调，更新UI

**代码示例：**

```typescript
// 1. 立即返回本地缓存数据（不等待后台查询）
const localEntities = await syncService.queryEntities('yourEntity', token);

// 2. 立即更新UI（使用本地缓存数据）
dispatch({ type: 'SET_ENTITIES', payload: localEntities });

// 3. 后台查询会自动进行，查询完成后会触发 onEntitiesQueried 回调更新UI
```

**配置查询：**

```typescript
syncService.registerSyncConfig<YourEntity>({
  entityType: 'yourEntity',
  // ... 其他配置
  queryApi: async (token: string) => {
    // 返回服务器原始数据
    return await yourApi.getAllEntities(token);
  },
  transformQueryResult: (serverEntity: any): YourEntity => {
    // 转换服务器数据为前端格式
    return {
      id: serverEntity.id.toString(),
      // ... 其他字段转换
    } as YourEntity;
  },
  onEntitiesQueried: (entities) => {
    // 查询完成后更新UI
    dispatch({ type: 'SET_ENTITIES', payload: entities });
  },
});
```

**查询机制的优势：**

- **快速响应**：用户界面立即显示本地缓存数据，无需等待网络请求
- **后台更新**：后台查询完成后自动更新本地缓存和UI
- **数据一致性**：自动清理服务器中已删除的实体
- **离线支持**：即使网络不可用，也能显示本地缓存的数据

## 自动同步机制

### 启动自动同步

系统会在应用启动时自动启动定期同步，默认每30秒同步一次：

```typescript
// 在 App.tsx 中
useEffect(() => {
  // 初始化同步配置
  initSyncConfigs();
  
  // 注意：日志已移除本地缓存同步机制，不再启动自动同步
  // 如果需要为其他实体类型启动自动同步，可以取消下面的注释
  // syncService.startAutoSync(30000);
  
  // 清理函数：停止自动同步
  return () => {
    syncService.stopAutoSync();
  };
}, []);
```

### 同步策略

自动同步只会同步 `syncStatus = 0`（待同步）或 `syncStatus = -1`（同步失败）的实体：

- **同步成功**：设置 `syncStatus = 1`，更新 `lastSyncTime`
- **同步失败**：设置 `syncStatus = -1`，记录 `syncError`

### 手动触发同步

```typescript
// 同步所有待同步的实体
await syncService.syncAllPendingEntities();

// 同步特定类型的实体
await syncService.syncAllPendingEntities('yourEntity');
```

## 配置同步服务

### 注册同步配置

在 `frontend/services/sync/syncConfig.ts` 中注册实体类型的同步配置：

**注意：日志已移除本地缓存同步机制，不再在此注册。**

```typescript
syncService.registerSyncConfig<YourEntity>({
  entityType: 'yourEntity',
  storageKey: 'your_entities',
  createApi: async (entity: YourEntity, token: string) => {
    // 创建API调用
    return await yourApi.createEntity(apiData, token);
  },
  updateApi: async (id: string, entity: Partial<YourEntity>, token: string) => {
    // 更新API调用
    return await yourApi.updateEntity(id, apiData, token);
  },
  deleteApi: async (id: string, token: string) => {
    // 删除API调用
    await yourApi.deleteEntity(id, token);
  },
  queryApi: async (token: string) => {
    // 查询API调用
    return await yourApi.getAllEntities(token);
  },
  onEntityUpdated: (entity) => {
    // 实体更新后的回调
  },
  onEntityDeleted: (id) => {
    // 实体删除后的回调
  },
  onEntitiesQueried: (entities) => {
    // 实体查询完成后的回调
  },
});
```

## 本地存储

### 存储格式

实体以以下格式存储在 `localStorage` 中：

```
key: sync_{entityType}_{entityId}
value: JSON.stringify(entity)
```

例如：
```
key: sync_yourEntity_6cc38b55-a177-4d18-ac36-618fd5e1bff1
value: {"id":"6cc38b55-a177-4d18-ac36-618fd5e1bff1","name":"名称","syncStatus":1,...}
```

### 加载实体

```typescript
// 从本地存储加载所有实体
const entities = syncService.loadAllEntitiesFromLocal<YourEntity>('yourEntity');
```

## 重要注意事项

### Insight 字段的处理

`insight` 字段是一个可选字段，需要特别注意处理逻辑，避免被错误地更新为 `null`。

#### 问题场景

当用户编辑日记但未修改 `insight` 字段时：
- 如果前端不传递 `insight` 字段，后端可能将其解析为 `null` 并覆盖原有值
- 如果前端传递 `undefined`，JSON 序列化时会省略该字段，后端也可能解析为 `null`

#### 解决方案

**前端处理（RealWorldScreen.tsx）：**

```typescript
// ✅ 正确：如果用户未修改，保留原有值
let insightValue: string | undefined;
if (mirrorInsight !== undefined) {
  if (mirrorInsight !== null) {
    // 有值，使用新值
    insightValue = mirrorInsight;
  } else {
    // mirrorInsight是null，表示用户没有修改，保留原有的insight
    insightValue = selectedEntry?.insight;
  }
} else {
  // mirrorInsight是undefined，表示用户没有修改，保留原有的insight
  insightValue = selectedEntry?.insight;
}
```

**前端API调用（useJournalHandlers.ts）：**

```typescript
// ✅ 正确：如果insight是undefined，从本地缓存获取原有值
let insightToSend = updatedEntry.insight;
if (insightToSend === undefined) {
  const originalEntry = journalEntriesRef.current.find(e => e.id === updatedEntry.id);
  insightToSend = originalEntry?.insight;
}

// 总是包含insight字段，即使为null（JSON序列化时undefined会被省略，null会被保留）
if (insightToSend !== undefined) {
  apiRequestData.insight = insightToSend !== null ? insightToSend : null;
}
```

**后端处理（JournalEntryController.java）：**

```java
// ✅ 正确：只在DTO中的insight不为null时才更新
if (journalEntryDTO.getInsight() != null) {
    journalEntry.setInsight(journalEntryDTO.getInsight());
} else {
    // 保留原有值，不更新
    // 注意：这里假设前端总是传递insight字段（即使是null）
    // 如果前端未传递字段，DTO中会是null，这里会保留原值
}
```

## 最佳实践

### 1. 处理可选字段（如 insight）

对于可选字段，需要明确区分"未修改"和"清空"：

```typescript
// ❌ 错误：如果字段是 undefined，不传递会导致后端解析为 null
if (updatedEntry.insight !== undefined && updatedEntry.insight !== null) {
  apiRequestData.insight = updatedEntry.insight;
}

// ✅ 正确：如果字段是 undefined，应该从本地缓存中获取原有值
let insightToSend = updatedEntry.insight;
if (insightToSend === undefined) {
  const originalEntry = journalEntriesRef.current.find(e => e.id === updatedEntry.id);
  insightToSend = originalEntry?.insight;
}
if (insightToSend !== undefined) {
  apiRequestData.insight = insightToSend !== null ? insightToSend : null;
}
```

### 2. 后端处理可选字段

后端应该只在字段明确存在时才更新：

```java
// ✅ 正确：只在DTO中的字段不为null时才更新
if (journalEntryDTO.getInsight() != null) {
    journalEntry.setInsight(journalEntryDTO.getInsight());
} else {
    // 保留原有值，不更新
}
```

### 3. 错误处理

```typescript
try {
  await syncService.syncEntity('yourEntity', entity);
} catch (error) {
  // 同步失败，实体会被标记为 syncStatus = -1
  // 可以在UI中显示错误提示
  showSyncErrorToast('同步失败，请检查网络连接');
}
```

### 4. 显示同步状态

```typescript
// 检查实体同步状态
const entity = entities.find(e => e.id === entityId);
if (entity?.syncStatus === 0) {
  // 显示"同步中"状态
} else if (entity?.syncStatus === -1) {
  // 显示"同步失败"状态，可以显示错误信息
  console.error('同步错误:', entity.syncError);
}
```

## 扩展新实体类型

要为新实体类型添加同步支持：

1. **更新类型定义**：在实体接口中添加同步字段

```typescript
export interface YourEntity {
  id: string;
  // ... 其他字段
  syncStatus?: SyncStatus;
  lastSyncTime?: number;
  syncError?: string;
}
```

2. **注册同步配置**：在 `syncConfig.ts` 中添加配置

```typescript
syncService.registerSyncConfig<YourEntity>({
  entityType: 'yourEntity',
  storageKey: 'your_entities',
  createApi: async (entity, token) => { /* ... */ },
  updateApi: async (id, entity, token) => { /* ... */ },
  deleteApi: async (id, token) => { /* ... */ },
  queryApi: async (token) => { /* ... */ },
});
```

3. **更新Handlers**：在对应的 handler 中使用同步服务

```typescript
// 添加
const entityWithSync = syncService.markEntityForSync('yourEntity', newEntity, 'create');

// 更新
const markedEntity = syncService.markEntityForSync('yourEntity', updatedEntity, 'update');

// 删除
await syncService.deleteEntity('yourEntity', entityId);

// 查询
const localEntities = await syncService.queryEntities('yourEntity', token);
```

## 故障排查

### 问题：实体一直处于待同步状态

**可能原因：**
1. 网络连接问题
2. 后台API错误
3. 认证token失效

**解决方案：**
1. 检查网络连接
2. 查看浏览器控制台的错误日志
3. 检查 `syncError` 字段获取详细错误信息
4. 手动触发同步：`await syncService.syncAllPendingEntities()`

### 问题：查询时数据不一致

**可能原因：**
1. 本地缓存未及时更新
2. 后台查询失败但未报错

**解决方案：**
1. 检查 `onEntitiesQueried` 回调是否正确触发
2. 查看浏览器控制台的日志
3. 手动触发查询：`await syncService.queryEntities('yourEntity', token)`

### 问题：删除后实体仍然存在

**可能原因：**
1. 删除API调用失败
2. 本地缓存未正确清理

**解决方案：**
1. 检查删除API的响应
2. 查看 `syncService.deleteEntity` 的错误日志
3. 手动清理本地缓存（如果需要）

## API 参考

### SyncService 类

#### 方法

- `registerSyncConfig<T>(config: SyncConfig<T>): void` - 注册同步配置
- `markEntityForSync<T>(entityType: string, entity: T, operation: 'create' | 'update'): T` - 标记实体为待同步
- `markEntitySynced<T>(entityType: string, entity: T, serverEntity?: T): T` - 标记实体同步成功
- `markEntitySyncFailed<T>(entityType: string, entity: T, error: string): T` - 标记实体同步失败
- `syncEntity<T>(entityType: string, entity: T): Promise<T>` - 执行同步操作
- `deleteEntity(entityType: string, entityId: string): Promise<void>` - 执行删除操作
- `queryEntities<T>(entityType: string, token: string): Promise<T[]>` - 查询实体（先返回本地缓存，后台查询并更新）
- `syncAllPendingEntities(entityType?: string): Promise<void>` - 同步所有待同步的实体
- `startAutoSync(intervalMs: number): void` - 启动自动同步
- `stopAutoSync(): void` - 停止自动同步
- `getPendingCount(entityType?: string): number` - 获取待同步实体数量
- `loadAllEntitiesFromLocal<T>(entityType: string): T[]` - 从本地存储加载所有实体

## 总结

本同步机制提供了：

1. **离线支持**：支持离线操作，数据先保存到本地
2. **自动同步**：定期自动同步待同步的实体
3. **失败重试**：同步失败的实体会在下次自动同步时重试
4. **快速响应**：查询时先返回本地缓存，后台更新
5. **数据一致性**：确保本地和服务器数据的一致性

通过这套机制，用户可以享受流畅的离线体验，同时保证数据的可靠同步。

